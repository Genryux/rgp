import { ref, computed } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Default initial gallery showcase items with file sizes in bytes (~300-450 KB each)
const DEFAULT_GALLERY = [
  {
    id: 'gal_1',
    media_type: 'image',
    category: 'Weddings',
    title: '1.jpg',
    image_url: '/images/1.jpg',
    file_size_bytes: 380000, // ~380 KB
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 'gal_2',
    media_type: 'image',
    category: 'Portraits',
    title: '2.jpg',
    image_url: '/images/2.jpg',
    file_size_bytes: 420000, // ~420 KB
    is_featured: true,
    sort_order: 2,
  },
  {
    id: 'gal_3',
    media_type: 'image',
    category: 'Birthdays',
    title: '3.jpg',
    image_url: '/images/3.jpg',
    file_size_bytes: 350000, // ~350 KB
    is_featured: true,
    sort_order: 3,
  },
  {
    id: 'gal_4',
    media_type: 'image',
    category: 'Graduation',
    title: '4.jpg',
    image_url: '/images/4.jpg',
    file_size_bytes: 310000, // ~310 KB
    is_featured: true,
    sort_order: 4,
  },
  {
    id: 'gal_5',
    media_type: 'image',
    category: 'Landscapes',
    title: '5.jpg',
    image_url: '/images/5.jpg',
    file_size_bytes: 490000, // ~490 KB
    is_featured: true,
    sort_order: 5,
  },
  {
    id: 'gal_6',
    media_type: 'image',
    category: 'Commercial',
    title: '6.jpg',
    image_url: '/images/6.jpg',
    file_size_bytes: 290000, // ~290 KB
    is_featured: true,
    sort_order: 6,
  },
];

const DEFAULT_FOLDERS = [
  'Weddings',
  'Birthdays',
  'Debuts',
  'Portraits',
  'Graduation',
  'Landscapes',
  'Commercial',
  'General',
];

const storedFolders = localStorage.getItem('rgp_media_folders');
const folders = ref(storedFolders ? JSON.parse(storedFolders) : DEFAULT_FOLDERS);

const GALLERY_STORAGE_KEY = 'rgp_gallery';

function getInitialGallery() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('[Gallery] Error loading from localStorage:', e);
    }
  }
  return DEFAULT_GALLERY;
}

const gallery = ref(getInitialGallery());
const loading = ref(false);

const MAX_QUOTA_BYTES = 1000 * 1024 * 1024; // 1 GB in bytes (1,048,576,000 bytes)

function persistFolders() {
  localStorage.setItem('rgp_media_folders', JSON.stringify(folders.value));
}

function persistGallery() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(gallery.value));
    } catch (e) {
      console.error('[Gallery] Error saving to localStorage:', e);
    }
  }
}

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

    img.onerror = () => resolve(file);
    reader.onerror = () => resolve(file);
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

  // Folder item counts mapping
  const folderCounts = computed(() => {
    const counts = {};
    folders.value.forEach((f) => (counts[f] = 0));
    gallery.value.forEach((item) => {
      const cat = item.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  });

  async function fetchGallery() {
    if (!isSupabaseConfigured || !supabase) return;
    loading.value = true;
    try {
      // 1. Fetch folders from media_folders table
      const { data: folderData, error: folderErr } = await supabase
        .from('media_folders')
        .select('name')
        .order('created_at', { ascending: true });

      if (!folderErr && folderData && folderData.length > 0) {
        folders.value = folderData.map((f) => f.name);
        persistFolders();
      }

      // 2. Fetch gallery media
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) {
        gallery.value = data;
        // Merge any categories from items into folders
        data.forEach((item) => {
          if (item.category && !folders.value.includes(item.category)) {
            folders.value.push(item.category);
          }
        });
        persistFolders();
        persistGallery();
      }
    } catch (err) {
      console.error('[Gallery] Error fetching gallery:', err);
    } finally {
      loading.value = false;
    }
  }

  // ==========================================
  // FOLDER CRUD MANAGEMENT
  // ==========================================
  async function createFolder(folderName) {
    const trimmed = folderName.trim();
    if (!trimmed) return false;
    if (folders.value.includes(trimmed)) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('media_folders').insert({ name: trimmed });
        if (error) throw error;
      } catch (err) {
        console.error('[Gallery] Error creating folder in Supabase:', err);
        return false;
      }
    }

    folders.value.push(trimmed);
    persistFolders();
    return true;
  }

  async function updateFolder(oldName, newName) {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: folderErr } = await supabase
          .from('media_folders')
          .update({ name: trimmed })
          .eq('name', oldName);
        if (folderErr) throw folderErr;

        const { error: galleryErr } = await supabase
          .from('gallery')
          .update({ category: trimmed })
          .eq('category', oldName);
        if (galleryErr) throw galleryErr;
      } catch (err) {
        console.error('[Gallery] Error updating folder in Supabase:', err);
        return false;
      }
    }

    const index = folders.value.indexOf(oldName);
    if (index !== -1) {
      folders.value[index] = trimmed;
      persistFolders();
    }

    // Update all media items belonging to this folder locally
    gallery.value.forEach((item) => {
      if (item.category === oldName) {
        item.category = trimmed;
      }
    });
    persistGallery();

    return true;
  }

  async function deleteFolder(folderName, targetFallbackFolder = 'General') {
    if (folderName === targetFallbackFolder) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: updateErr } = await supabase
          .from('gallery')
          .update({ category: targetFallbackFolder })
          .eq('category', folderName);
        if (updateErr) throw updateErr;

        const { error: deleteErr } = await supabase
          .from('media_folders')
          .delete()
          .eq('name', folderName);
        if (deleteErr) throw deleteErr;
      } catch (err) {
        console.error('[Gallery] Error reassigning media upon folder delete in Supabase:', err);
        return false;
      }
    }

    // Ensure fallback folder exists
    if (!folders.value.includes(targetFallbackFolder)) {
      folders.value.push(targetFallbackFolder);
    }

    // Reassign all media in deleted folder to targetFallbackFolder locally
    gallery.value.forEach((item) => {
      if (item.category === folderName) {
        item.category = targetFallbackFolder;
      }
    });

    folders.value = folders.value.filter((f) => f !== folderName);
    persistFolders();
    persistGallery();
    return true;
  }

  // ==========================================
  // MEDIA MOVEMENT & REASSIGNMENT
  // ==========================================
  async function moveMediaToFolder(mediaId, targetFolder) {
    const item = gallery.value.find((g) => g.id === mediaId);
    if (!item) return { success: false, error: 'Media item not found' };

    const prevFolder = item.category;
    item.category = targetFolder;
    persistGallery();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('gallery')
          .update({ category: targetFolder })
          .eq('id', mediaId);
        if (error) {
          item.category = prevFolder;
          persistGallery();
          throw error;
        }
        return { success: true, error: null };
      } catch (err) {
        console.error('[Gallery] Error moving media to folder:', err);
        return { success: false, error: err };
      }
    }
    return { success: true, error: null };
  }

  async function bulkMoveMedia(mediaIds, targetFolder) {
    if (!mediaIds || mediaIds.length === 0) return { success: false, error: 'No media items provided' };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('gallery')
          .update({ category: targetFolder })
          .in('id', mediaIds);
        if (error) throw error;
      } catch (err) {
        console.error('[Gallery] Error bulk moving media in Supabase:', err);
        return { success: false, error: err };
      }
    }

    gallery.value.forEach((item) => {
      if (mediaIds.includes(item.id)) {
        item.category = targetFolder;
      }
    });
    persistGallery();
    return { success: true, error: null };
  }

  // ==========================================
  // UPLOAD & ITEM ACTIONS
  // ==========================================
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
        persistGallery();
        return { data, error: null };
      }
    } catch (err) {
      console.error('[Gallery] Upload failed:', err);
      return { data: null, error: err };
    }
  }

  async function deleteMedia(id) {
    const itemToDelete = gallery.value.find((item) => item.id === id);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('gallery').delete().eq('id', id).select();
        if (error) {
          console.error('[Gallery] Delete failed in Supabase:', error);
          alert('Delete failed: ' + (error.message || 'Access denied'));
          return false;
        }
        if (!data || data.length === 0) {
          console.warn('[Gallery] 0 rows deleted in Supabase. Check if you are signed in with an active admin session.');
          alert('Delete blocked by Supabase security: Please sign in at /admin/login with your admin account.');
          return false;
        }

        // Clean up from storage bucket if image is hosted in Supabase portfolio bucket
        if (itemToDelete && itemToDelete.image_url && itemToDelete.image_url.includes('/portfolio/')) {
          try {
            const parts = itemToDelete.image_url.split('/portfolio/');
            if (parts[1]) {
              const storagePath = decodeURIComponent(parts[1]);
              await supabase.storage.from('portfolio').remove([storagePath]);
            }
          } catch (storageErr) {
            console.warn('[Gallery] Could not remove file from storage:', storageErr);
          }
        }
      } catch (err) {
        console.error('[Gallery] Delete failed:', err);
        alert('Delete failed: ' + err.message);
        return false;
      }
    }

    gallery.value = gallery.value.filter((item) => item.id !== id);
    persistGallery();
    return true;
  }

  async function toggleFeatured(id) {
    const item = gallery.value.find((g) => g.id === id);
    if (!item) return;
    const prev = item.is_featured;
    item.is_featured = !item.is_featured;
    persistGallery();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('gallery')
          .update({ is_featured: item.is_featured })
          .eq('id', id);
        if (error) {
          item.is_featured = prev;
          persistGallery();
          throw error;
        }
      } catch (err) {
        console.error('[Gallery] Update featured failed in Supabase:', err);
      }
    }
  }

  return {
    gallery,
    folders,
    folderCounts,
    loading,
    totalStorageBytes,
    totalStorageMB,
    maxQuotaMB,
    usedPercentage,
    remainingMB,
    estimatedPhotosRemaining,
    fetchGallery,
    createFolder,
    updateFolder,
    deleteFolder,
    moveMediaToFolder,
    bulkMoveMedia,
    uploadMediaFile,
    deleteMedia,
    toggleFeatured,
  };
}
