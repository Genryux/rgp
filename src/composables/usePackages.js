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
    is_featured: false,
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

// Default master list of studio deliverables & inclusions
const DEFAULT_MASTER_INCLUSIONS = [
  '1 Professional Photographer',
  '2 Professional Photographers',
  '3 Professional Photographers',
  '1 Lead Cinematographer',
  '2 Cinematographers & Shooters',
  '4 Hours Continuous Coverage',
  '6-8 Hours Semi-Day Coverage',
  'Full Day Coverage (Prep to Reception)',
  'Unlimited Multi-Day Full Event Coverage',
  '150 Enhanced Digital High-Res Photos',
  '200+ Enhanced High-Res Photos',
  '300+ Enhanced High-Res Photos',
  'Unlimited High-Resolution Enhanced Photos',
  '3-5 Minute 4K Cinematic Highlight Reel',
  '4K Same-Day-Edit (SDE) Video Reel for Reception',
  'Full 4K Extended Documentary Film (20-30 mins)',
  'Licensed 4K Aerial Drone Coverage',
  'Dual 5.1K Cinema Drones with Dual Operator Support',
  'Pre-Wedding / Prenup Visual Session Included',
  'Pre-Debut Creative Photoshoot Included',
  '10x10 Handcrafted Leather Heirloom Album (40 Pages)',
  '12x12 Master Album + 2 Matching Parent Heirloom Albums',
  'Online Private Cloud Gallery (1 Year Access)',
  'Lifetime Cloud Archive & Online Delivery',
  '48-Hour Sneak Peek Highlight Delivery',
  'Fast 14-Day Final Delivery Turnaround',
  'USB Flash Drive with all RAW + JPEG files',
  'Master SSD Box with RAW Uncompressed Media Archive',
  'Live Video Projection Feed for Reception Program',
  '1.5 Hours Studio Time',
  'Up to 3 Wardrobe Changes',
  '15 Fully Retouched Magazine-Quality Photos',
];

const PACKAGES_STORAGE_KEY = 'rgp_packages';
const INCLUSIONS_STORAGE_KEY = 'rgp_master_inclusions';

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

function getInitialMasterInclusions() {
  const set = new Set();
  const result = [];

  const addUnique = (item) => {
    if (!item) return;
    const trimmed = typeof item === 'string' ? item.trim() : String(item).trim();
    if (trimmed && !set.has(trimmed.toLowerCase())) {
      set.add(trimmed.toLowerCase());
      result.push(trimmed);
    }
  };

  // 1. From localStorage if exists
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(INCLUSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(addUnique);
        }
      }
    } catch (e) {
      console.error('[Packages] Error loading master inclusions from localStorage:', e);
    }
  }

  // 2. From default master inclusions
  DEFAULT_MASTER_INCLUSIONS.forEach(addUnique);

  // 3. From initial packages features
  DEFAULT_PACKAGES.forEach((pkg) => {
    if (Array.isArray(pkg.features)) {
      pkg.features.forEach(addUnique);
    }
  });

  return result;
}

const CONFIG_ROW_ID = '__master_config__';

const packages = ref(getInitialPackages());
const masterInclusions = ref(getInitialMasterInclusions());
const isGlobalPriceMasked = ref(typeof window !== 'undefined' ? localStorage.getItem('rgp_mask_prices') === 'true' : false);
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

function persistMasterInclusions() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(INCLUSIONS_STORAGE_KEY, JSON.stringify(masterInclusions.value));
    } catch (e) {
      console.error('[Packages] Error saving master inclusions to localStorage:', e);
    }
  }
}

function persistPriceMask() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('rgp_mask_prices', String(isGlobalPriceMasked.value));
    } catch (e) {
      console.error('[Packages] Error saving price mask to localStorage:', e);
    }
  }
}

async function persistConfigToSupabase() {
  persistMasterInclusions();
  persistPriceMask();
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { error } = await supabase.from('packages').upsert({
      id: CONFIG_ROW_ID,
      category: '__config__',
      title: 'Global Package Settings',
      price: 0,
      features: masterInclusions.value,
      hide_price: isGlobalPriceMasked.value,
      is_active: false,
      sort_order: 99999,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error('[Packages] Error persisting package config to Supabase:', error);
    }
  } catch (err) {
    console.error('[Packages] Exception persisting package config to Supabase:', err);
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
    if (e.key === INCLUSIONS_STORAGE_KEY && e.newValue) {
      try {
        masterInclusions.value = JSON.parse(e.newValue);
      } catch (err) {
        console.error('[Packages] Error synchronizing master inclusions across tabs:', err);
      }
    }
    if (e.key === 'rgp_mask_prices') {
      isGlobalPriceMasked.value = e.newValue === 'true';
    }
  });
}

export function usePackages() {
  async function toggleGlobalPriceMask() {
    isGlobalPriceMasked.value = !isGlobalPriceMasked.value;
    await persistConfigToSupabase();
    return isGlobalPriceMasked.value;
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
        // 1. Separate configuration record from user-facing packages
        const configRow = data.find((p) => p.id === CONFIG_ROW_ID);
        if (configRow) {
          if (Array.isArray(configRow.features) && configRow.features.length > 0) {
            masterInclusions.value = configRow.features;
            persistMasterInclusions();
          }
          isGlobalPriceMasked.value = Boolean(configRow.hide_price);
          persistPriceMask();
        }

        // 2. Set user-facing packages (excluding system config record)
        packages.value = data.filter((p) => p.id !== CONFIG_ROW_ID);
        persistPackages();
      }
    } catch (err) {
      console.error('[Packages] Error fetching packages from Supabase:', err);
    } finally {
      loading.value = false;
    }
  }

  async function savePackage(pkg) {
    const isNew = !pkg.id || pkg.id.startsWith('pkg_temp_');
    const cleanSortOrder = Math.round(Number(pkg.sort_order) || (packages.value.length + 1));
    const cleanPrice = Number(pkg.price) || 0;
    const cleanPromoPrice = pkg.promo_price ? Number(pkg.promo_price) : null;

    const targetPkg = {
      category: pkg.category || 'General',
      title: pkg.title || 'Untitled Package',
      price: cleanPrice,
      promo_price: cleanPromoPrice,
      badge: pkg.badge || null,
      features: Array.isArray(pkg.features) ? pkg.features : [],
      is_featured: Boolean(pkg.is_featured),
      is_active: pkg.is_active !== undefined ? Boolean(pkg.is_active) : true,
      hide_price: Boolean(pkg.hide_price),
      sort_order: cleanSortOrder,
      updated_at: new Date().toISOString(),
    };

    if (!isNew) {
      targetPkg.id = pkg.id;
    } else {
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
          const idx = packages.value.findIndex((p) => p.id === pkg.id || p.id === data.id);
          if (idx !== -1) {
            packages.value[idx] = data;
          } else {
            packages.value.push(data);
          }
          persistPackages();
          return { data, error: null };
        }
      } catch (err) {
        console.error('[Packages] Error saving package to Supabase:', err);
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
    const previousPackages = [...packages.value];
    packages.value = packages.value.filter((p) => p.id !== id);
    persistPackages();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('packages').delete().eq('id', id);
        if (error) {
          packages.value = previousPackages;
          persistPackages();
          throw error;
        }
        return { success: true, error: null };
      } catch (err) {
        console.error('[Packages] Error deleting package from Supabase:', err);
        return { success: false, error: err };
      }
    }
    return { success: true, error: null };
  }

  async function togglePackageActive(id) {
    const pkg = packages.value.find((p) => p.id === id);
    if (!pkg) return { success: false, error: 'Package not found' };
    const prev = pkg.is_active;
    pkg.is_active = !pkg.is_active;
    persistPackages();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('packages')
          .update({ is_active: pkg.is_active, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) {
          pkg.is_active = prev;
          persistPackages();
          throw error;
        }
        return { success: true, error: null };
      } catch (err) {
        console.error('[Packages] Error updating active status:', err);
        return { success: false, error: err };
      }
    }
    return { success: true, error: null };
  }

  async function togglePackagePriceMask(id) {
    const pkg = packages.value.find((p) => p.id === id);
    if (!pkg) return { success: false, error: 'Package not found' };
    const prev = pkg.hide_price;
    pkg.hide_price = !pkg.hide_price;
    persistPackages();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('packages')
          .update({ hide_price: pkg.hide_price, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) {
          pkg.hide_price = prev;
          persistPackages();
          throw error;
        }
        return { success: true, error: null };
      } catch (err) {
        console.error('[Packages] Error updating hide_price status:', err);
        return { success: false, error: err };
      }
    }
    return { success: true, error: null };
  }

  async function addMasterInclusion(item) {
    if (!item) return null;
    const trimmed = typeof item === 'string' ? item.trim() : String(item).trim();
    if (!trimmed) return null;
    const existing = masterInclusions.value.find(
      (i) => i.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;
    masterInclusions.value.push(trimmed);
    await persistConfigToSupabase();
    return trimmed;
  }

  async function removeMasterInclusion(item) {
    if (!item) return;
    const trimmed = typeof item === 'string' ? item.trim() : String(item).trim();
    masterInclusions.value = masterInclusions.value.filter(
      (i) => i.toLowerCase() !== trimmed.toLowerCase()
    );

    // Also remove from any packages that currently include this deliverable
    packages.value.forEach((pkg) => {
      if (Array.isArray(pkg.features)) {
        pkg.features = pkg.features.filter(
          (f) => f.toLowerCase() !== trimmed.toLowerCase()
        );
      }
    });

    persistPackages();
    await persistConfigToSupabase();
  }

  async function updateMasterInclusion(oldItem, newItem) {
    if (!oldItem || !newItem) return;
    const oldTrimmed = typeof oldItem === 'string' ? oldItem.trim() : String(oldItem).trim();
    const newTrimmed = typeof newItem === 'string' ? newItem.trim() : String(newItem).trim();
    if (!newTrimmed) return;

    const idx = masterInclusions.value.findIndex(
      (i) => i.toLowerCase() === oldTrimmed.toLowerCase()
    );
    if (idx !== -1) {
      masterInclusions.value[idx] = newTrimmed;
    }

    // Also update across all packages that use this inclusion
    packages.value.forEach((pkg) => {
      if (Array.isArray(pkg.features)) {
        const featIdx = pkg.features.findIndex(
          (f) => f.toLowerCase() === oldTrimmed.toLowerCase()
        );
        if (featIdx !== -1) {
          pkg.features[featIdx] = newTrimmed;
        }
      }
    });

    persistPackages();
    await persistConfigToSupabase();
  }

  async function resetMasterInclusions() {
    const set = new Set();
    const result = [];
    const addUnique = (item) => {
      if (!item) return;
      const trimmed = typeof item === 'string' ? item.trim() : String(item).trim();
      if (trimmed && !set.has(trimmed.toLowerCase())) {
        set.add(trimmed.toLowerCase());
        result.push(trimmed);
      }
    };
    DEFAULT_MASTER_INCLUSIONS.forEach(addUnique);
    masterInclusions.value = result;
    await persistConfigToSupabase();
  }

  return {
    packages,
    masterInclusions,
    isGlobalPriceMasked,
    loading,
    toggleGlobalPriceMask,
    togglePackagePriceMask,
    formatMaskedPrice,
    fetchPackages,
    savePackage,
    deletePackage,
    togglePackageActive,
    addMasterInclusion,
    removeMasterInclusion,
    updateMasterInclusion,
    resetMasterInclusions,
  };
}

