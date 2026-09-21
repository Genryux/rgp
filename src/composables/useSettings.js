import { ref } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEFAULT_SETTINGS = {
  id: 'global',
  studio_name: 'RGP Films & Studio',
  tagline: 'Turning Moments into Masterpiece.',
  contact_email: 'contact@rgpfilmsstudio.site',
  contact_phone: '+63 900 000 0000',
  address: 'Metro Manila, Philippines',
  facebook_url: 'https://www.facebook.com/profile.php?id=61586681783932',
  instagram_url: '',
  youtube_url: '',
  tiktok_url: '',
  theme_accent_color: '#FFD700',
  meta_title: 'RGP Films & Studio | Professional Photography & Videography Services',
  meta_description: 'Professional photography and videography services. Turning moments into masterpieces. Book your session today.',
};

const SETTINGS_STORAGE_KEY = 'rgp_settings';

function getInitialSettings() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('[Settings] Error loading from localStorage:', e);
    }
  }
  return DEFAULT_SETTINGS;
}

const settings = ref(getInitialSettings());
const loading = ref(false);

function persistSettings() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings.value));
    } catch (e) {
      console.error('[Settings] Error saving to localStorage:', e);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
      try {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) };
      } catch (err) {
        console.error('[Settings] Error synchronizing settings across tabs:', err);
      }
    }
  });
}

export function useSettings() {
  async function fetchSettings() {
    if (!isSupabaseConfigured || !supabase) return;
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        settings.value = { ...DEFAULT_SETTINGS, ...data };
        persistSettings();
      }
    } catch (err) {
      console.error('[Settings] Error fetching settings:', err);
    } finally {
      loading.value = false;
    }
  }

  async function updateSettings(newSettings) {
    const merged = { ...settings.value, ...newSettings };
    settings.value = merged;
    persistSettings();

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          id: 'global',
          studio_name: merged.studio_name || '',
          tagline: merged.tagline || '',
          contact_email: merged.contact_email || '',
          contact_phone: merged.contact_phone || '',
          address: merged.address || '',
          facebook_url: merged.facebook_url || null,
          instagram_url: merged.instagram_url || null,
          youtube_url: merged.youtube_url || null,
          tiktok_url: merged.tiktok_url || null,
          theme_accent_color: merged.theme_accent_color || '#FFD700',
          meta_title: merged.meta_title || '',
          meta_description: merged.meta_description || '',
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('site_settings')
          .upsert(payload);

        if (error) throw error;
        return { success: true, error: null };
      } catch (err) {
        console.error('[Settings] Error updating settings in Supabase:', err);
        return { success: false, error: err };
      }
    }
    return { success: true, error: null };
  }

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings,
  };
}
