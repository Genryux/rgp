import { ref } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper function to format price with masking (e.g. 25000 -> 2?,???)
export function formatMaskedPrice(price) {
  if (!price && price !== 0) return '0';
  const numStr = Number(price).toLocaleString('en-PH');
  let foundFirst = false;
  return numStr.replace(/\d/g, (match) => {
    if (!foundFirst) {
      foundFirst = true;
      return match;
    }
    return '?';
  });
}

// Initial default packages with hide_price support
const DEFAULT_PACKAGES = [
  {
    id: 'pkg_1',
    category: 'Weddings',
    title: 'Silver Wedding Package',
    price: 15000,
    promo_price: null,
    badge: null,
    features: [
      '1 Professional Photographer',
      '4 Hours Continuous Coverage',
      '150 Enhanced Digital High-Res Photos',
      'Online Private Gallery Access',
      'USB Flash Drive with all RAW + JPEG files',
    ],
    is_featured: false,
    is_active: true,
    hide_price: false,
    sort_order: 1,
  },
  {
    id: 'pkg_2',
    category: 'Weddings',
    title: 'Gold Cinematic Wedding Package',
    price: 25000,
    promo_price: 22000,
    badge: 'Most Popular',
    features: [
      '2 Photographers + 1 Videographer',
      'Full Day Coverage (Prep to Reception)',
      '300+ Enhanced High-Res Photos',
      '3-5 Minute 4K Cinematic Highlight Reel',
      'Same Day Edit (SDE) Teaser',
      '12x12 Premium Leather Photo Album',
    ],
    is_featured: true,
    is_active: true,
    hide_price: false,
    sort_order: 2,
  },
  {
    id: 'pkg_3',
    category: 'Birthdays & Debuts',
    title: 'Grand Debut Celebration',
    price: 18000,
    promo_price: null,
    badge: 'Best Value',
    features: [
      '2 Photographers',
      'Pre-Debut Creative Photoshoot included',
      'Full Event Photo Coverage',
      '200+ Enhanced Photos',
      'Soft copies delivered in high resolution',
    ],
    is_featured: false,
    is_active: true,
    hide_price: false,
    sort_order: 3,
  },
  {
    id: 'pkg_4',
    category: 'Portraits & Studio',
    title: 'Studio Creative & Portrait Session',
    price: 5000,
    promo_price: null,
    badge: null,
    features: [
      '1.5 Hours Studio Time',
      'Up to 3 Wardrobe Changes',
      '15 Fully Retouched Magazine-Quality Photos',
      'High-Resolution Digital Downloads',
    ],
    is_featured: false,
    is_active: true,
    hide_price: false,
    sort_order: 4,
  },
];

const PACKAGES_STORAGE_KEY = 'rgp_packages';

function getInitialPackages() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(PACKAGES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('[Packages] Error loading from localStorage:', e);
    }
  }
  return DEFAULT_PACKAGES;
}

const packages = ref(getInitialPackages());
const isGlobalPriceMasked = ref(localStorage.getItem('rgp_mask_prices') === 'true');
const loading = ref(false);

function persistPackages() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages.value));
    } catch (e) {
      console.error('[Packages] Error saving to localStorage:', e);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === PACKAGES_STORAGE_KEY && e.newValue) {
      try {
        packages.value = JSON.parse(e.newValue);
      } catch (err) {
        console.error('[Packages] Error synchronizing packages across tabs:', err);
      }
    }
  });
}

export function usePackages() {
  function toggleGlobalPriceMask() {
    isGlobalPriceMasked.value = !isGlobalPriceMasked.value;
    localStorage.setItem('rgp_mask_prices', String(isGlobalPriceMasked.value));
  }

  async function fetchPackages() {
    if (!isSupabaseConfigured || !supabase) return;
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        packages.value = data;
        persistPackages();
      }
    } catch (err) {
      console.error('[Packages] Error fetching packages:', err);
    } finally {
      loading.value = false;
    }
  }

  async function savePackage(pkg) {
    const isNew = !pkg.id || pkg.id.startsWith('pkg_temp_');
    const targetPkg = {
      ...pkg,
      id: isNew ? undefined : pkg.id,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      targetPkg.sort_order = packages.value.length + 1;
      targetPkg.created_at = new Date().toISOString();
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('packages')
          .upsert(targetPkg)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const idx = packages.value.findIndex((p) => p.id === pkg.id);
          if (idx !== -1) {
            packages.value[idx] = data;
          } else {
            packages.value.push(data);
          }
          persistPackages();
          return { data, error: null };
        }
      } catch (err) {
        console.error('[Packages] Error saving package:', err);
        return { data: null, error: err };
      }
    } else {
      // Local state update
      if (isNew) {
        targetPkg.id = `pkg_${Date.now()}`;
        packages.value.push(targetPkg);
      } else {
        const idx = packages.value.findIndex((p) => p.id === pkg.id);
        if (idx !== -1) packages.value[idx] = targetPkg;
      }
      persistPackages();
      return { data: targetPkg, error: null };
    }
  }

  async function deletePackage(id) {
    packages.value = packages.value.filter((p) => p.id !== id);
    persistPackages();
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('packages').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('[Packages] Error deleting package:', err);
      }
    }
  }

  async function togglePackageActive(id) {
    const pkg = packages.value.find((p) => p.id === id);
    if (!pkg) return;
    pkg.is_active = !pkg.is_active;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('packages')
          .update({ is_active: pkg.is_active })
          .eq('id', id);
      } catch (err) {
        console.error('[Packages] Error updating active status:', err);
      }
    }
  }

  async function togglePackagePriceMask(id) {
    const pkg = packages.value.find((p) => p.id === id);
    if (!pkg) return;
    pkg.hide_price = !pkg.hide_price;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('packages')
          .update({ hide_price: pkg.hide_price })
          .eq('id', id);
      } catch (err) {
        console.error('[Packages] Error updating hide_price status:', err);
      }
    }
  }

  return {
    packages,
    isGlobalPriceMasked,
    loading,
    toggleGlobalPriceMask,
    togglePackagePriceMask,
    formatMaskedPrice,
    fetchPackages,
    savePackage,
    deletePackage,
    togglePackageActive,
  };
}
