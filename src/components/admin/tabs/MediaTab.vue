<script setup>
import { ref } from 'vue';
import { useGallery } from '../../../composables/useGallery';
import {
  UploadCloud,
  Star,
  Trash2,
  Image as ImageIcon,
  Folder,
  Loader2,
  Sparkles,
} from '@lucide/vue';

const { gallery, uploadMediaFile, deleteMedia, toggleFeatured } = useGallery();

const selectedCategory = ref('Weddings');
const uploading = ref(false);
const uploadProgress = ref('');
const fileInputRef = ref(null);

const categories = [
  'Weddings',
  'Birthdays',
  'Debuts',
  'Portraits',
  'Graduation',
  'Landscapes',
  'Commercial',
  'Other',
];

async function handleFiles(files) {
  if (!files || files.length === 0) return;
  uploading.value = true;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    uploadProgress.value = `Optimizing & uploading ${i + 1} of ${files.length}: ${file.name}...`;
    await uploadMediaFile(file, selectedCategory.value);
  }

  uploading.value = false;
  uploadProgress.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function onFileInputChange(e) {
  handleFiles(e.target.files);
}

function onDrop(e) {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
}
</script>

<template>
  <div class="space-y-8 font-manrope">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Media & Showcase Manager</h2>
        <p class="text-xs text-neutral-400 mt-0.5">Upload, organize, and feature your photography across your portfolio</p>
      </div>

      <!-- Category Picker for Upload -->
      <div class="flex items-center gap-3">
        <label class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Target Album:</label>
        <select
          v-model="selectedCategory"
          class="px-4 py-2 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs font-medium focus:outline-none focus:border-[#FFD700]"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <!-- Drag and Drop Uploader Box -->
    <div
      @dragover.prevent
      @drop="onDrop"
      class="border-2 border-dashed border-white/[0.12] hover:border-[#FFD700] rounded-3xl p-8 md:p-12 text-center bg-[#141414]/50 transition duration-300 relative group cursor-pointer shadow-xl"
      @click="fileInputRef && fileInputRef.click()"
    >
      <input
        type="file"
        ref="fileInputRef"
        multiple
        accept="image/*"
        class="hidden"
        @change="onFileInputChange"
      />

      <div class="space-y-4 max-w-md mx-auto pointer-events-none">
        <div class="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#FFD700] group-hover:scale-110 transition duration-300">
          <UploadCloud class="w-7 h-7" />
        </div>
        <div>
          <h4 class="text-base font-bold text-white tracking-wide">Drag & drop photos here, or click to browse</h4>
          <p class="text-xs text-neutral-400 mt-1">
            Automatically converted to lightweight WebP before uploading to optimize performance
          </p>
        </div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-[#FFD700] font-medium">
          <Folder class="w-3.5 h-3.5" />
          <span>Assigning to: {{ selectedCategory }}</span>
        </div>
      </div>

      <!-- Upload Progress Indicator -->
      <div
        v-if="uploading"
        class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 z-20 space-y-3"
      >
        <Loader2 class="w-8 h-8 text-[#FFD700] animate-spin" />
        <p class="text-xs font-semibold text-[#FFD700]">{{ uploadProgress }}</p>
      </div>
    </div>

    <!-- Gallery Grid -->
    <div>
      <div class="flex justify-between items-center mb-6 border-b border-white/[0.06] pb-3">
        <h3 class="text-lg font-bold text-white tracking-wide">Showcase Gallery ({{ gallery.length }})</h3>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="item in gallery"
          :key="item.id"
          class="rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.08] flex flex-col group relative shadow-lg hover:border-white/[0.18] transition"
        >
          <!-- Photo Thumbnail -->
          <div class="aspect-square bg-neutral-900 relative overflow-hidden">
            <img
              :src="item.image_url"
              :alt="item.title || 'Photo'"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              loading="lazy"
            />

            <!-- Top Overlay Badges -->
            <div class="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center pointer-events-none">
              <span class="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-semibold uppercase text-neutral-200">
                {{ item.category }}
              </span>

              <span
                v-if="item.is_featured"
                class="px-2 py-0.5 rounded-md bg-[#FFD700] text-[#121212] text-[10px] font-bold uppercase shadow-md flex items-center gap-1"
              >
                <Star class="w-3 h-3 fill-current" />
                <span>Featured</span>
              </span>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="p-3 bg-[#141414] flex items-center justify-between border-t border-white/[0.06]">
            <button
              @click="toggleFeatured(item.id)"
              class="text-xs font-semibold transition flex items-center gap-1.5"
              :class="[item.is_featured ? 'text-[#FFD700]' : 'text-neutral-400 hover:text-white']"
            >
              <Star class="w-3.5 h-3.5" :class="[item.is_featured ? 'fill-current' : '']" />
              <span>{{ item.is_featured ? 'In Hero' : 'Feature' }}</span>
            </button>

            <button
              @click="deleteMedia(item.id)"
              class="text-neutral-500 hover:text-red-400 p-1 transition"
              title="Delete Photo"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
