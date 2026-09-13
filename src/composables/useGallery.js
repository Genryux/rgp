import { ref } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Default gallery showcase items
const DEFAULT_GALLERY = [
  {
    id: 'gal_1',
    media_type: 'image',
    category: 'Weddings',
    title: 'Sunset Nuptials',
    image_url: '/images/1.jpg',
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 'gal_2',
    media_type: 'image',
    category: 'Portraits',
    title: 'Moody Studio Portrait',
    image_url: '/images/2.jpg',
    is_featured: true,
    sort_order: 2,
  },
  {
    id: 'gal_3',
    media_type: 'image',
    category: 'Birthdays',
    title: 'Celebration of Life',
    image_url: '/images/3.jpg',
    is_featured: true,
    sort_order: 3,
  },
  {
    id: 'gal_4',
    media_type: 'image',
    category: 'Graduation',
    title: 'Academic Milestone',
    image_url: '/images/4.jpg',
    is_featured: true,
    sort_order: 4,
  },
  {
    id: 'gal_5',
    media_type: 'image',
    category: 'Landscapes',
    title: 'Golden Horizon',
    image_url: '/images/5.jpg',
    is_featured: true,
    sort_order: 5,
  },
  {
    id: 'gal_6',
    media_type: 'image',
    category: 'Commercial',
    title: 'Product Aesthetics',
    image_url: '/images/6.jpg',
    is_featured: true,
    sort_order: 6,
  },
];

const gallery = ref(DEFAULT_GALLERY);
const loading = ref(false);

/**
 * Client-Side Image Compressor
 * Converts any image file to high-quality WebP format on canvas before uploading
 */
export async function compressImageToWebP(file, maxWidth = 2560, quality = 0.85) {
  return new Promise((resolve, reject) => {
    // If it's not an image (e.g. video), return original file
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

      // Scale down if exceeds maxWidth while preserving aspect ratio
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
          // Create new file with .webp extension
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
    if (!isSupabaseConfigured || !supabase) {
      // Offline mock upload preview URL
      const mockUrl = URL.createObjectURL(file);
      const newItem = {
        id: `gal_${Date.now()}`,
        media_type: file.type.startsWith('video') ? 'video' : 'image',
        category,
        title: file.name.replace(/\.[^/.]+$/, ''),
        image_url: mockUrl,
        is_featured: false,
        sort_order: gallery.value.length + 1,
      };
      gallery.value.unshift(newItem);
      return { data: newItem, error: null };
    }

    try {
      // 1. Compress image before upload
      const compressedFile = await compressImageToWebP(file);

      // 2. Generate unique filename in storage
      const fileExt = compressedFile.name.split('.').pop();
      const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 3. Get Public CDN URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      // 4. Save to gallery database table
      const newItem = {
        media_type: file.type.startsWith('video') ? 'video' : 'image',
        category,
        title: file.name.replace(/\.[^/.]+$/, ''),
        image_url: publicUrl,
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
    fetchGallery,
    uploadMediaFile,
    deleteMedia,
    toggleFeatured,
  };
}
