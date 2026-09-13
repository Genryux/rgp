import { ref, computed } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Default initial sections (matching existing site layout)
const DEFAULT_SECTIONS = [
  {
    id: 'sec_hero',
    section_type: 'hero',
    label: 'Hero Banner',
    is_visible: true,
    sort_order: 1,
    content: {
      heading_line1: 'Turning',
      heading_accent1: 'Moments',
      heading_line2: 'into',
      heading_accent2: 'Masterpiece.',
      subheading: 'Professional photography and videography services. Book your session today.',
      bg_image: '/images/hero-bg.jpg',
      cta_text: 'Book a Session',
      cta_link: '#contact',
    },
  },
  {
    id: 'sec_carousel',
    section_type: 'carousel',
    label: 'Showcase Carousel',
    is_visible: true,
    sort_order: 2,
    content: {
      title: 'Featured Works',
      subtitle: 'Explore our latest wedding, portrait, and commercial highlights',
      show_dots: true,
      show_tabs: true,
    },
  },
  {
    id: 'sec_video',
    section_type: 'video',
    label: 'Cinematic Highlights',
    is_visible: true,
    sort_order: 3,
    content: {
      title: 'Cinematic Highlights',
      subtitle: 'Relive the most memorable moments captured on film',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
      caption: 'Wedding & Event Cinematic Highlight Reel',
    },
  },
  {
    id: 'sec_rates',
    section_type: 'rates',
    label: 'Services & Packages',
    is_visible: true,
    sort_order: 4,
    content: {
      title: 'Packages & Rates',
      subtitle: 'Transparent pricing crafted for every milestone and celebration',
    },
  },
  {
    id: 'sec_about',
    section_type: 'about',
    label: 'About Studio',
    is_visible: true,
    sort_order: 5,
    content: {
      title: 'Behind the Lens',
      subtitle: 'Passionate visual storytellers dedicated to preserving your moments forever.',
      experience_years: '5+',
      events_covered: '250+',
      satisfaction_rate: '100%',
      image_url: '/images/main-shot.jpg',
    },
  },
  {
    id: 'sec_contact',
    section_type: 'contact',
    label: 'Contact & Booking',
    is_visible: true,
    sort_order: 6,
    content: {
      title: 'Let’s Create Magic Together',
      subtitle: 'Have a date in mind? Send us an inquiry and we’ll get back to you within 24 hours.',
    },
  },
];

const sections = ref(DEFAULT_SECTIONS);
const loading = ref(false);

export function useSections() {
  const visibleSections = computed(() =>
    [...sections.value]
      .filter((s) => s.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order)
  );

  const allSections = computed(() =>
    [...sections.value].sort((a, b) => a.sort_order - b.sort_order)
  );

  async function fetchSections() {
    if (!isSupabaseConfigured || !supabase) return;
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        sections.value = data;
      }
    } catch (err) {
      console.error('[Sections] Error fetching sections:', err);
    } finally {
      loading.value = false;
    }
  }

  async function saveSection(section) {
    const index = sections.value.findIndex((s) => s.id === section.id);
    if (index !== -1) {
      sections.value[index] = { ...section, updated_at: new Date().toISOString() };
    } else {
      sections.value.push({
        ...section,
        id: section.id || `sec_${Date.now()}`,
        sort_order: sections.value.length + 1,
        created_at: new Date().toISOString(),
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('sections').upsert(section);
        if (error) throw error;
      } catch (err) {
        console.error('[Sections] Error saving section:', err);
      }
    }
  }

  async function reorderSections(orderedIds) {
    orderedIds.forEach((id, idx) => {
      const sec = sections.value.find((s) => s.id === id);
      if (sec) sec.sort_order = idx + 1;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const updates = sections.value.map((s) => ({
          id: s.id,
          sort_order: s.sort_order,
        }));
        await supabase.from('sections').upsert(updates);
      } catch (err) {
        console.error('[Sections] Error reordering sections:', err);
      }
    }
  }

  async function toggleSectionVisibility(id) {
    const sec = sections.value.find((s) => s.id === id);
    if (!sec) return;
    sec.is_visible = !sec.is_visible;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('sections')
          .update({ is_visible: sec.is_visible })
          .eq('id', id);
      } catch (err) {
        console.error('[Sections] Error toggling visibility:', err);
      }
    }
  }

  async function deleteSection(id) {
    sections.value = sections.value.filter((s) => s.id !== id);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sections').delete().eq('id', id);
      } catch (err) {
        console.error('[Sections] Error deleting section:', err);
      }
    }
  }

  return {
    sections,
    allSections,
    visibleSections,
    loading,
    fetchSections,
    saveSection,
    reorderSections,
    toggleSectionVisibility,
    deleteSection,
  };
}
