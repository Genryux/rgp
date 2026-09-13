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
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Info,
} from '@lucide/vue';

const {
  gallery,
  totalStorageMB,
  maxQuotaMB,
  usedPercentage,
  remainingMB,
  estimatedPhotosRemaining,
  uploadMediaFile,
  deleteMedia,
  toggleFeatured,
} = useGallery();

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
    <!-- Top Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Media & Showcase Manager</h2>
        <p class="text-xs text-neutral-400 mt-0.5">Upload, organize, and monitor your photography storage consumption</p>
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

    <!-- LIVE MEDIA STORAGE CONSUMPTION METER -->
    <div class="p-6 md:p-8 rounded-3xl bg-[#141414] border border-white/[0.08] shadow-2xl space-y-5 relative overflow-hidden">
      <!-- Glow ambient background -->
      <div
        class="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        :class="[
          usedPercentage > 90
            ? 'bg-red-500/20'
            : usedPercentage > 70
              ? 'bg-yellow-500/20'
              : 'bg-[#FFD700]/10'
        ]"
      ></div>

      <!-- Meter Header & Storage Numbers -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div class="flex items-center gap-3">
          <div
            class="p-3 rounded-2xl border transition duration-300"
            :class="[
              usedPercentage > 90
                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                : 'bg-yellow-500/10 border-yellow-500/20 text-[#FFD700]'
            ]"
          >
            <HardDrive class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white tracking-wide">Cloud Storage Consumption</h3>
              <span class="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono text-neutral-300">
                1 GB Free Tier
              </span>
            </div>
            <p class="text-xs text-neutral-400 mt-0.5">
              {{ gallery.length }} photos uploaded • Auto-compressed in WebP
            </p>
          </div>
        </div>

        <!-- Numbers & Percentage Tag -->
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white">{{ totalStorageMB }} MB</span>
          <span class="text-xs text-neutral-400 font-medium">/ {{ maxQuotaMB }} MB</span>
          <span
            class="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
            :class="[
              usedPercentage > 90
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : usedPercentage > 70
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            ]"
          >
            {{ usedPercentage }}%
          </span>
        </div>
      </div>

      <!-- Animated Progress Bar Gauge -->
      <div class="space-y-2 relative z-10">
        <div class="w-full h-3.5 rounded-full bg-black/60 border border-white/[0.08] overflow-hidden p-0.5">
          <div
            class="h-full rounded-full transition-all duration-700 ease-out relative"
            :style="{ width: `${usedPercentage}%` }"
            :class="[
              usedPercentage > 90
                ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-md shadow-red-500/50'
                : usedPercentage > 70
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-md shadow-yellow-500/50'
                  : 'bg-gradient-to-r from-yellow-600 via-[#FFD700] to-yellow-300 shadow-md shadow-yellow-500/30'
            ]"
          ></div>
        </div>

        <div class="flex justify-between items-center text-[11px] text-neutral-400 font-medium px-1">
          <span>0 MB</span>
          <span class="text-[#FFD700]">~{{ remainingMB }} MB Remaining</span>
          <span>1,000 MB (1 GB)</span>
        </div>
      </div>

      <!-- Storage Health & Capacity Forecast -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 relative z-10">
        <div class="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center gap-3">
          <CheckCircle2 class="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div class="text-xs">
            <span class="text-neutral-300 font-semibold block">Capacity Health: Excellent</span>
            <span class="text-neutral-400 text-[11px]">Room for approx. <strong>{{ estimatedPhotosRemaining.toLocaleString() }}</strong> more photos</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center gap-3">
          <Info class="w-4 h-4 text-[#FFD700] flex-shrink-0" />
          <div class="text-xs">
            <span class="text-neutral-300 font-semibold block">WebP Smart Compression</span>
            <span class="text-neutral-400 text-[11px]">Shrinks 15MB photos to ~350KB before uploading</span>
          </div>
        </div>
      </div>

      <!-- High Consumption Warning Alert (appears only if > 85%) -->
      <div
        v-if="usedPercentage >= 85"
        class="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2.5 relative z-10"
      >
        <AlertTriangle class="w-5 h-5 text-red-400 flex-shrink-0" />
        <div>
          <span class="block">Approaching 1 GB Storage Limit ({{ usedPercentage }}% used)</span>
          <span class="text-[11px] text-red-300/80 font-normal">Consider deleting older showcase photos or upgrading your Supabase storage tier.</span>
        </div>
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

            <!-- File Size Badge at Bottom Left of Thumbnail -->
            <div class="absolute bottom-2 left-2 pointer-events-none">
              <span class="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[9px] font-mono text-neutral-300">
                {{ ((item.file_size_bytes || 350000) / 1024).toFixed(0) }} KB WebP
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
