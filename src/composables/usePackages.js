import { ref } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Initial default packages
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
    sort_order: 4,
  },
];

const packages = ref(DEFAULT_PACKAGES);
const loading = ref(false);

export function usePackages() {
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
      return { data: targetPkg, error: null };
    }
  }

  async function deletePackage(id) {
    packages.value = packages.value.filter((p) => p.id !== id);
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

  return {
    packages,
    loading,
    fetchPackages,
    savePackage,
    deletePackage,
    togglePackageActive,
  };
}
