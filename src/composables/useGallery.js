import { ref, computed } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Default gallery showcase items with file sizes in bytes (~300-450 KB each)
const DEFAULT_GALLERY = [
  {
    id: 'gal_1',
    media_type: 'image',
    category: 'Weddings',
    title: 'Sunset Nuptials',
    image_url: '/images/1.jpg',
    file_size_bytes: 380000, // ~380 KB
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 'gal_2',
    media_type: 'image',
    category: 'Portraits',
    title: 'Moody Studio Portrait',
    image_url: '/images/2.jpg',
    file_size_bytes: 420000, // ~420 KB
    is_featured: true,
    sort_order: 2,
  },
  {
    id: 'gal_3',
    media_type: 'image',
    category: 'Birthdays',
    title: 'Celebration of Life',
    image_url: '/images/3.jpg',
    file_size_bytes: 350000, // ~350 KB
    is_featured: true,
    sort_order: 3,
  },
  {
    id: 'gal_4',
    media_type: 'image',
    category: 'Graduation',
    title: 'Academic Milestone',
    image_url: '/images/4.jpg',
    file_size_bytes: 310000, // ~310 KB
    is_featured: true,
    sort_order: 4,
  },
  {
    id: 'gal_5',
    media_type: 'image',
    category: 'Landscapes',
    title: 'Golden Horizon',
    image_url: '/images/5.jpg',
    file_size_bytes: 490000, // ~490 KB
    is_featured: true,
    sort_order: 5,
  },
  {
    id: 'gal_6',
    media_type: 'image',
    category: 'Commercial',
    title: 'Product Aesthetics',
    image_url: '/images/6.jpg',
    file_size_bytes: 290000, // ~290 KB
    is_featured: true,
    sort_order: 6,
  },
];

const gallery = ref(DEFAULT_GALLERY);
const loading = ref(false);

const MAX_QUOTA_BYTES = 1000 * 1024 * 1024; // 1 GB in bytes (1,048,576,000 bytes)

/**
 * Client-Side Image Compressor
 * Converts any image file to high-quality WebP format on canvas before uploading
 */
export async function compressImageToWebP(file, maxWidth = 2560, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }
          const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          const compressedFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function useGallery() {
  // Storage stats computed properties
  const totalStorageBytes = computed(() => {
    return gallery.value.reduce((acc, item) => acc + (item.file_size_bytes || 350000), 0);
  });

  const totalStorageMB = computed(() => {
    return (totalStorageBytes.value / (1024 * 1024)).toFixed(2);
  });

  const maxQuotaMB = 1000; // 1 GB free tier

  const usedPercentage = computed(() => {
    const pct = (totalStorageBytes.value / MAX_QUOTA_BYTES) * 100;
    return Math.min(100, Math.max(0.1, Number(pct.toFixed(2))));
  });

  const remainingMB = computed(() => {
    const rem = maxQuotaMB - Number(totalStorageMB.value);
    return Math.max(0, Number(rem.toFixed(2)));
  });

  const estimatedPhotosRemaining = computed(() => {
    const remainingBytes = Math.max(0, MAX_QUOTA_BYTES - totalStorageBytes.value);
    return Math.floor(remainingBytes / 350000); // Assuming avg ~350KB WebP photo
  });

  async function fetchGallery() {
    if (!isSupabaseConfigured || !supabase) return;
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        gallery.value = data;
      }
    } catch (err) {
      console.error('[Gallery] Error fetching gallery:', err);
    } finally {
      loading.value = false;
    }
  }

  async function uploadMediaFile(file, category = 'General') {
    // 1. Compress image before upload
    const compressedFile = await compressImageToWebP(file);
    const fileSize = compressedFile.size || file.size || 350000;

    if (!isSupabaseConfigured || !supabase) {
      // Offline mock upload preview URL
      const mockUrl = URL.createObjectURL(compressedFile);
      const newItem = {
        id: `gal_${Date.now()}`,
        media_type: file.type.startsWith('video') ? 'video' : 'image',
        category,
        title: file.name.replace(/\.[^/.]+$/, ''),
        image_url: mockUrl,
        file_size_bytes: fileSize,
        is_featured: false,
        sort_order: gallery.value.length + 1,
      };
      gallery.value.unshift(newItem);
      return { data: newItem, error: null };
    }

    try {
      const fileExt = compressedFile.name.split('.').pop();
      const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      const newItem = {
        media_type: file.type.startsWith('video') ? 'video' : 'image',
        category,
        title: file.name.replace(/\.[^/.]+$/, ''),
        image_url: publicUrl,
        file_size_bytes: fileSize,
        is_featured: false,
        sort_order: gallery.value.length + 1,
      };

      const { data, error: dbError } = await supabase
        .from('gallery')
        .insert(newItem)
        .select()
        .single();

      if (dbError) throw dbError;
      if (data) {
        gallery.value.unshift(data);
        return { data, error: null };
      }
    } catch (err) {
      console.error('[Gallery] Upload failed:', err);
      return { data: null, error: err };
    }
  }

  async function deleteMedia(id) {
    gallery.value = gallery.value.filter((item) => item.id !== id);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('gallery').delete().eq('id', id);
      } catch (err) {
        console.error('[Gallery] Delete failed:', err);
      }
    }
  }

  async function toggleFeatured(id) {
    const item = gallery.value.find((g) => g.id === id);
    if (!item) return;
    item.is_featured = !item.is_featured;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('gallery')
          .update({ is_featured: item.is_featured })
          .eq('id', id);
      } catch (err) {
        console.error('[Gallery] Update featured failed:', err);
      }
    }
  }

  return {
    gallery,
    loading,
    totalStorageBytes,
    totalStorageMB,
    maxQuotaMB,
    usedPercentage,
    remainingMB,
    estimatedPhotosRemaining,
    fetchGallery,
    uploadMediaFile,
    deleteMedia,
    toggleFeatured,
  };
}
