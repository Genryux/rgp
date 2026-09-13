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

const settings = ref(DEFAULT_SETTINGS);
const loading = ref(false);

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
      }
    } catch (err) {
      console.error('[Settings] Error fetching settings:', err);
    } finally {
      loading.value = false;
    }
  }

  async function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ ...settings.value, id: 'global', updated_at: new Date().toISOString() });

        if (error) throw error;
        return { success: true, error: null };
      } catch (err) {
        console.error('[Settings] Error updating settings:', err);
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
