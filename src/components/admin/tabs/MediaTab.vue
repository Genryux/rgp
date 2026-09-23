<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useGallery } from '../../../composables/useGallery';
import { useSections } from '../../../composables/useSections';
import { useModalState } from '../../../composables/useModalState';
import {
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Folder,
  FolderPlus,
  FolderInput,
  Loader2,
  HardDrive,
  Database,
  CheckCircle2,
  Info,
  Edit3,
  X,
  Check,
  MoveRight,
  CheckSquare,
  Square,
  Layers,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  AlertTriangle,
  Download,
  ExternalLink,
} from '@lucide/vue';

const {
  gallery,
  folders,
  folderCounts,
  totalStorageMB,
  maxQuotaMB,
  usedPercentage,
  remainingMB,
  estimatedPhotosRemaining,
  totalDbStorageMB,
  maxDbQuotaMB,
  dbUsedPercentage,
  dbRemainingMB,
  createFolder,
  updateFolder,
  deleteFolder,
  moveMediaToFolder,
  bulkMoveMedia,
  uploadMediaFile,
  deleteMedia,
  toggleFeatured,
} = useGallery();

const { openModal, closeModal } = useModalState();
const { visibleSections } = useSections();

function getImageFileName(item) {
  if (!item) return '';
  if (item.title) return item.title;
  if (item.file_name) return item.file_name;
  if (item.image_url) {
    const parts = item.image_url.split('/');
    return parts[parts.length - 1] || 'photo.jpg';
  }
  return 'photo.jpg';
}

function getImageUsage(item) {
  if (!item) return null;
  const url = item.image_url;

  // 1. Check direct hero background match
  const heroSec = visibleSections.value?.find((s) => s.section_type === 'hero');
  if (heroSec && heroSec.content?.bg_image === url) {
    return {
      type: 'hero',
      label: 'Hero Banner',
      fullText: 'Featured in Hero Banner',
      badgeText: 'Hero Banner',
      isSpecial: true,
    };
  }

  // 2. Check direct about studio portrait match
  const aboutSec = visibleSections.value?.find((s) => s.section_type === 'about');
  if (aboutSec && aboutSec.content?.image_url === url) {
    return {
      type: 'about',
      label: 'About Studio',
      fullText: 'Featured in About Studio',
      badgeText: 'About Studio',
      isSpecial: true,
    };
  }

  // 3. Check Showcase Carousel
  const carouselSec = visibleSections.value?.find((s) => s.section_type === 'carousel');
  if (carouselSec) {
    const categoryName = item.category || 'Highlights';
    return {
      type: 'carousel',
      label: `Showcase Carousel (${categoryName})`,
      fullText: `Featured in Showcase Carousel (${categoryName})`,
      badgeText: `Showcase Carousel`,
      isSpecial: false,
    };
  }

  // 4. Check Gallery Grid
  const gridSec = visibleSections.value?.find((s) => s.section_type === 'gallery_grid');
  if (gridSec) {
    return {
      type: 'gallery_grid',
      label: 'Homepage Gallery Grid',
      fullText: `Live in Homepage Gallery Grid (${item.category || 'All'})`,
      badgeText: 'Gallery Grid',
      isSpecial: false,
    };
  }

  return {
    type: 'live',
    label: 'Homepage Portfolio',
    fullText: `Live in Homepage Portfolio (${item.category || 'All'})`,
    badgeText: 'Homepage Portfolio',
    isSpecial: false,
  };
}

const activeFolder = ref('All'); // 'All' or folder name
const viewFilter = ref('all'); // 'all' (show both folders & photos) | 'folders' (show only folders) | 'photos' (show only photos)
const uploading = ref(false);
const uploadProgress = ref('');
const fileInputRef = ref(null);

// Toast Notification Feedback State
const toast = ref({
  visible: false,
  title: '',
  subtitle: '',
  type: 'success', // 'success' | 'danger' | 'info'
});
let toastTimer = null;

function triggerToast(title, subtitle = '', type = 'success', duration = 3500) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = {
    visible: true,
    title,
    subtitle,
    type,
  };
  toastTimer = setTimeout(() => {
    toast.value.visible = false;
  }, duration);
}

function dismissToast() {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value.visible = false;
}

// Modal states
const isCreateFolderModalOpen = ref(false);
const isRenameFolderModalOpen = ref(false);
const isDeleteFolderModalOpen = ref(false);
const isMoveMediaModalOpen = ref(false);

// Delete Media Modal State (Single & Bulk)
const mediaToDelete = ref(null);
const isBulkDeleteModalOpen = ref(false);

function promptDeleteMedia(item) {
  mediaToDelete.value = item;
}

function cancelDeleteMedia() {
  mediaToDelete.value = null;
}

async function confirmDeleteMedia() {
  if (!mediaToDelete.value) return;
  const item = mediaToDelete.value;
  const fileName = getImageFileName(item);
  await deleteMedia(item.id);
  if (viewingItem.value && viewingItem.value.id === item.id) {
    closeImageViewer();
  }
  mediaToDelete.value = null;
  triggerToast('Photo Deleted', `"${fileName}" was removed from ${item.category || 'gallery'}`, 'info', 3500);
}

function openDeleteBulkMedia() {
  if (selectedMediaIds.value.length === 0) return;
  isBulkDeleteModalOpen.value = true;
}

async function confirmBulkDeleteMedia() {
  const count = selectedMediaIds.value.length;
  if (count === 0) return;
  for (const id of selectedMediaIds.value) {
    await deleteMedia(id);
  }
  selectedMediaIds.value = [];
  isBatchMode.value = false;
  isBulkDeleteModalOpen.value = false;
  triggerToast('Photos Deleted', `Permanently deleted ${count} selected photos`, 'info', 3500);
}

// Fullscreen Image Viewer Modal State
const viewingItem = ref(null);

const targetMediaToMove = ref(null); // single item or null for bulk
const selectedDestinationFolder = ref('');
const newFolderName = ref('');
const folderBeingRenamed = ref('');
const folderBeingDeleted = ref('');

// Batch selection mode
const isBatchMode = ref(false);
const selectedMediaIds = ref([]);

// Watch all modal states to hide/show the bottom taskbar dock
watch(
  () => Boolean(
    isCreateFolderModalOpen.value ||
    isRenameFolderModalOpen.value ||
    isDeleteFolderModalOpen.value ||
    isMoveMediaModalOpen.value ||
    mediaToDelete.value ||
    isBulkDeleteModalOpen.value ||
    viewingItem.value
  ),
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) openModal();
    else if (!isOpen && wasOpen) closeModal();
  }
);

onUnmounted(() => {
  if (
    isCreateFolderModalOpen.value ||
    isRenameFolderModalOpen.value ||
    isDeleteFolderModalOpen.value ||
    isMoveMediaModalOpen.value ||
    mediaToDelete.value ||
    isBulkDeleteModalOpen.value ||
    viewingItem.value
  ) {
    closeModal();
  }
});

// Filtered media by active folder
const filteredGallery = computed(() => {
  if (activeFolder.value === 'All') return gallery.value;
  return gallery.value.filter((item) => item.category === activeFolder.value);
});

// Current index of viewing image in filtered gallery
const viewingIndex = computed(() => {
  if (!viewingItem.value) return -1;
  return filteredGallery.value.findIndex((m) => m.id === viewingItem.value.id);
});

function openImageViewer(item) {
  viewingItem.value = item;
}

function closeImageViewer() {
  viewingItem.value = null;
}

function prevImage() {
  if (viewingIndex.value > 0) {
    viewingItem.value = filteredGallery.value[viewingIndex.value - 1];
  } else if (filteredGallery.value.length > 0) {
    viewingItem.value = filteredGallery.value[filteredGallery.value.length - 1];
  }
}

function nextImage() {
  if (viewingIndex.value < filteredGallery.value.length - 1) {
    viewingItem.value = filteredGallery.value[viewingIndex.value + 1];
  } else if (filteredGallery.value.length > 0) {
    viewingItem.value = filteredGallery.value[0];
  }
}

function handleViewerKeydown(e) {
  if (!viewingItem.value) return;
  if (e.key === 'ArrowLeft') {
    prevImage();
  } else if (e.key === 'ArrowRight') {
    nextImage();
  } else if (e.key === 'Escape') {
    closeImageViewer();
  }
}

watch(viewingItem, (item) => {
  if (item) {
    window.addEventListener('keydown', handleViewerKeydown);
  } else {
    window.removeEventListener('keydown', handleViewerKeydown);
  }
});

// Manual upload destination folder
const manualUploadFolder = ref(folders.value[0] || 'Weddings');

// Keep manual selection valid if folders change
watch(
  folders,
  (newFolders) => {
    if (newFolders.length > 0 && !newFolders.includes(manualUploadFolder.value)) {
      manualUploadFolder.value = newFolders[0];
    }
  },
  { immediate: true }
);

async function handleFiles(files) {
  if (!files || files.length === 0) return;
  uploading.value = true;

  const targetCategory = manualUploadFolder.value || folders.value[0] || 'General';
  let successCount = 0;
  let lastError = null;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    uploadProgress.value = `Optimizing & uploading ${i + 1} of ${files.length}: ${file.name}...`;
    const res = await uploadMediaFile(file, targetCategory);
    if (res?.error) {
      lastError = res.error;
    } else {
      successCount++;
    }
  }

  uploading.value = false;
  uploadProgress.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';

  if (lastError && successCount === 0) {
    triggerToast('Upload Failed', lastError.message || 'Please check admin authentication.', 'danger', 4500);
  } else if (lastError) {
    triggerToast('Upload Partial', `Uploaded ${successCount} of ${files.length} photos with errors`, 'danger', 4500);
  } else {
    triggerToast('Upload Complete', `Successfully uploaded ${successCount} photo${successCount > 1 ? 's' : ''} to ${targetCategory}`, 'success', 4000);
  }
}

function onFileInputChange(e) {
  handleFiles(e.target.files);
}

function onDrop(e) {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
}

// ==========================================
// FOLDER ACTIONS
// ==========================================
function openCreateFolder() {
  newFolderName.value = '';
  isCreateFolderModalOpen.value = true;
}

function handleCreateFolder() {
  const trimmed = newFolderName.value.trim();
  if (!trimmed) return;
  const success = createFolder(trimmed);
  if (success) {
    activeFolder.value = trimmed;
    isCreateFolderModalOpen.value = false;
    newFolderName.value = '';
    triggerToast('Folder Created', `Album folder "${trimmed}" created`, 'success', 3500);
  }
}

function openRenameFolder(folderName, e) {
  if (e) e.stopPropagation();
  folderBeingRenamed.value = folderName;
  newFolderName.value = folderName;
  isRenameFolderModalOpen.value = true;
}

async function handleRenameFolder() {
  const oldName = folderBeingRenamed.value;
  const trimmed = newFolderName.value.trim();
  if (!trimmed || trimmed === oldName) {
    isRenameFolderModalOpen.value = false;
    return;
  }
  await updateFolder(oldName, trimmed);
  if (activeFolder.value === oldName) {
    activeFolder.value = trimmed;
  }
  isRenameFolderModalOpen.value = false;
  folderBeingRenamed.value = '';
  newFolderName.value = '';
  triggerToast('Folder Renamed', `Renamed "${oldName}" to "${trimmed}"`, 'success', 3500);
}

function openDeleteFolder(folderName, e) {
  if (e) e.stopPropagation();
  folderBeingDeleted.value = folderName;
  isDeleteFolderModalOpen.value = true;
}

async function handleDeleteFolder() {
  if (!folderBeingDeleted.value) return;
  const deletedFolder = folderBeingDeleted.value;
  await deleteFolder(deletedFolder, 'General');
  if (activeFolder.value === deletedFolder) {
    activeFolder.value = 'All';
  }
  isDeleteFolderModalOpen.value = false;
  folderBeingDeleted.value = '';
  triggerToast('Folder Deleted', `Folder "${deletedFolder}" removed. Photos moved to General.`, 'info', 3500);
}

// ==========================================
// MOVE MEDIA ACTIONS
// ==========================================
function openMoveSingleMedia(item) {
  targetMediaToMove.value = item;
  selectedDestinationFolder.value = item.category || folders.value[0];
  isMoveMediaModalOpen.value = true;
}

function openMoveBulkMedia() {
  if (selectedMediaIds.value.length === 0) return;
  targetMediaToMove.value = null;
  selectedDestinationFolder.value = folders.value[0];
  isMoveMediaModalOpen.value = true;
}

async function handleConfirmMove() {
  if (!selectedDestinationFolder.value) return;
  const destFolder = selectedDestinationFolder.value;

  if (targetMediaToMove.value) {
    // Single move
    const fileName = getImageFileName(targetMediaToMove.value);
    await moveMediaToFolder(targetMediaToMove.value.id, destFolder);
    if (viewingItem.value && viewingItem.value.id === targetMediaToMove.value.id) {
      viewingItem.value.category = destFolder;
    }
    triggerToast('Photo Moved', `"${fileName}" moved to "${destFolder}"`, 'success', 3500);
  } else if (selectedMediaIds.value.length > 0) {
    // Bulk move
    const count = selectedMediaIds.value.length;
    await bulkMoveMedia(selectedMediaIds.value, destFolder);
    selectedMediaIds.value = [];
    isBatchMode.value = false;
    triggerToast('Photos Moved', `Moved ${count} photos to "${destFolder}"`, 'success', 3500);
  }

  isMoveMediaModalOpen.value = false;
  targetMediaToMove.value = null;
}

// Batch selection helpers
function toggleSelectMedia(id) {
  const index = selectedMediaIds.value.indexOf(id);
  if (index === -1) {
    selectedMediaIds.value.push(id);
  } else {
    selectedMediaIds.value.splice(index, 1);
  }
}

function selectAllVisible() {
  selectedMediaIds.value = filteredGallery.value.map((m) => m.id);
}

function deselectAll() {
  selectedMediaIds.value = [];
}
</script>

<template>
  <div class="space-y-6 font-manrope">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Media & Showcase Manager</h2>
        <p class="text-xs text-neutral-400 mt-0.5">Upload, organize folders, and monitor your cloud media & database consumption</p>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TOP SECTION: STORAGE & DATABASE QUOTA (LEFT) + DRAG & DROP UPLOAD (RIGHT) -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      
      <!-- LEFT: CLOUD MEDIA & DATABASE CONSUMPTION CARD -->
      <div class="lg:col-span-6 rounded-3xl bg-[#141414] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
        <!-- Ambient glow -->
        <div
          class="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-all duration-700"
          :class="[
            usedPercentage > 90 || dbUsedPercentage > 90
              ? 'bg-red-500/20'
              : usedPercentage > 70 || dbUsedPercentage > 70
                ? 'bg-yellow-500/15'
                : 'bg-white/[0.03]'
          ]"
        ></div>

        <!-- 1. Media Files Storage Quota (1 GB Free Tier) -->
        <div class="space-y-2 relative z-10">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="p-2 rounded-xl border transition duration-300 shrink-0"
                :class="[
                  usedPercentage > 90
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'bg-white/[0.06] border-white/10 text-neutral-300'
                ]"
              >
                <HardDrive class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h3 class="text-xs font-bold text-white tracking-wide">Media Storage</h3>
                  <span class="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono text-neutral-300 border border-white/[0.06]">
                    1 GB Free Tier
                  </span>
                </div>
                <p class="text-[10px] text-neutral-400 truncate">{{ gallery.length }} photos uploaded</p>
              </div>
            </div>

            <!-- Numbers & Percentage Tag -->
            <div class="flex items-baseline gap-1 text-right shrink-0">
              <span class="text-sm font-extrabold text-white">{{ totalStorageMB }} MB</span>
              <span class="text-[10px] text-neutral-400 font-medium">/ {{ maxQuotaMB }} MB</span>
              <span
                class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
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

          <!-- Progress Bar Gauge -->
          <div class="space-y-1">
            <div class="w-full h-2 rounded-full bg-black/60 border border-white/[0.08] overflow-hidden p-0.5">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :style="{ width: `${usedPercentage}%` }"
                :class="[
                  usedPercentage > 90
                    ? 'bg-gradient-to-r from-red-600 to-red-400'
                    : usedPercentage > 70
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                      : 'bg-gradient-to-r from-yellow-600 via-[#FFD700] to-yellow-300'
                ]"
              ></div>
            </div>
            <div class="flex justify-between items-center text-[10px] text-neutral-400 px-0.5">
              <span>0 MB</span>
              <span class="text-neutral-300 font-medium">~{{ remainingMB }} MB Remaining (Room for ~{{ estimatedPhotosRemaining.toLocaleString() }} WebP photos)</span>
              <span>1,000 MB</span>
            </div>
          </div>
        </div>

        <div class="h-px bg-white/[0.06] w-full relative z-10"></div>

        <!-- 2. Supabase PostgreSQL Database Storage Quota (500 MB Free Tier) -->
        <div class="space-y-2 relative z-10">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="p-2 rounded-xl border transition duration-300 shrink-0"
                :class="[
                  dbUsedPercentage > 90
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'bg-white/[0.06] border-white/10 text-neutral-300'
                ]"
              >
                <Database class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h3 class="text-xs font-bold text-white tracking-wide">Database Storage</h3>
                  <span class="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono text-neutral-300 border border-white/[0.06]">
                    500 MB Free Tier
                  </span>
                </div>
                <p class="text-[10px] text-neutral-400 truncate">PostgreSQL tables, sections, packages & inquiries</p>
              </div>
            </div>

            <!-- Numbers & Percentage Tag -->
            <div class="flex items-baseline gap-1 text-right shrink-0">
              <span class="text-sm font-extrabold text-white">{{ totalDbStorageMB }} MB</span>
              <span class="text-[10px] text-neutral-400 font-medium">/ {{ maxDbQuotaMB }} MB</span>
              <span
                class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                :class="[
                  dbUsedPercentage > 90
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : dbUsedPercentage > 70
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                ]"
              >
                {{ dbUsedPercentage }}%
              </span>
            </div>
          </div>

          <!-- Progress Bar Gauge -->
          <div class="space-y-1">
            <div class="w-full h-2 rounded-full bg-black/60 border border-white/[0.08] overflow-hidden p-0.5">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :style="{ width: `${dbUsedPercentage}%` }"
                :class="[
                  dbUsedPercentage > 90
                    ? 'bg-gradient-to-r from-red-600 to-red-400'
                    : dbUsedPercentage > 70
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                      : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-400'
                ]"
              ></div>
            </div>
            <div class="flex justify-between items-center text-[10px] text-neutral-400 px-0.5">
              <span>0 MB</span>
              <span class="text-neutral-300 font-medium">~{{ dbRemainingMB }} MB Remaining</span>
              <span>500 MB</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: COMPACT DRAG & DROP UPLOAD CARD -->
      <div
        @dragover.prevent
        @drop="onDrop"
        class="lg:col-span-6 rounded-3xl bg-[#141414] border-2 border-dashed border-white/[0.12] hover:border-[#FFD700] p-5 shadow-xl flex flex-col justify-between space-y-3 cursor-pointer transition duration-300 relative group"
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

        <div class="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div class="flex items-center gap-2 pointer-events-none">
            <UploadCloud class="w-4 h-4 text-neutral-300" />
            <h3 class="text-sm font-bold text-white tracking-wide">Quick Upload Dropzone</h3>
          </div>
          <!-- Manual Target Folder Selector -->
          <div class="flex items-center gap-1.5" @click.stop>
            <label class="text-[10px] font-bold text-neutral-400 uppercase hidden sm:inline">Upload to:</label>
            <div class="relative">
              <select
                v-model="manualUploadFolder"
                class="px-2.5 py-1 pr-6 rounded-xl bg-black/60 border border-white/15 hover:border-white/30 text-xs font-semibold text-white focus:outline-none focus:border-[#FFD700] cursor-pointer transition appearance-none"
              >
                <option v-for="f in folders" :key="f" :value="f" class="bg-[#141414] text-white">
                  {{ f }}
                </option>
              </select>
              <Folder class="w-3 h-3 fill-neutral-400 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div class="space-y-1.5 text-center py-2 pointer-events-none">
          <div class="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-300 group-hover:text-white group-hover:scale-110 transition duration-300">
            <UploadCloud class="w-5 h-5" />
          </div>
          <h4 class="text-xs font-bold text-white">Drag & drop photos here, or click to browse</h4>
          <p class="text-[10px] text-neutral-400">
            Auto-compressed to lightweight WebP (~350KB) before uploading
          </p>
        </div>

        <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-neutral-400 pointer-events-none">
          <span>Multiple files supported</span>
          <span class="text-neutral-400 text-[10px] font-mono">WebP canvas encoder</span>
        </div>

        <!-- Upload Progress Indicator Overlay -->
        <div
          v-if="uploading"
          class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-4 z-20 space-y-2"
        >
          <Loader2 class="w-6 h-6 text-neutral-200 animate-spin" />
          <p class="text-xs font-semibold text-neutral-200">{{ uploadProgress }}</p>
        </div>
      </div>
    </div>

    <!-- BATCH ACTION FLOATING / STICKY TOOLBAR -->
    <div
      v-if="isBatchMode && selectedMediaIds.length > 0"
      class="p-4 rounded-2xl bg-[#181818] border border-white/15 shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-fadeIn"
    >
      <div class="flex items-center gap-3">
        <span class="w-7 h-7 rounded-xl bg-white/10 text-white font-extrabold text-xs flex items-center justify-center">
          {{ selectedMediaIds.length }}
        </span>
        <span class="text-xs font-bold text-white">Photos Selected</span>
        <button
          @click="selectAllVisible"
          class="text-xs text-neutral-400 hover:text-white underline pl-2 border-l border-white/10"
        >
          Select All ({{ filteredGallery.length }})
        </button>
        <button
          @click="deselectAll"
          class="text-xs text-neutral-400 hover:text-white underline"
        >
          Clear
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openMoveBulkMedia"
          class="cursor-pointer px-4 py-2 rounded-xl bg-[#FFD700] text-black text-xs font-bold hover:bg-yellow-400 transition flex items-center gap-2 shadow-md shadow-yellow-500/20"
        >
          <FolderInput class="w-4 h-4" />
          <span>Move {{ selectedMediaIds.length }} Photos to Folder</span>
        </button>
        <button
          @click="openDeleteBulkMedia"
          class="cursor-pointer px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition flex items-center gap-2 shadow-md"
        >
          <Trash2 class="w-4 h-4" />
          <span>Delete ({{ selectedMediaIds.length }})</span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MAIN SHOWCASE MEDIA & FOLDER EXPLORER -->
    <!-- ========================================================================= -->
    <div class="space-y-6">
      
      <!-- Section Header with Breadcrumbs, Filters, Create Folder & Batch Select -->
      <div class="flex flex-wrap justify-between items-center gap-4 border-b border-white/[0.08] pb-4">
        
        <!-- Left: Breadcrumb / Title & All/Folder filter pills -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Back button if inside a folder -->
          <button
            v-if="activeFolder !== 'All'"
            @click="activeFolder = 'All'"
            class="cursor-pointer p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white transition flex items-center justify-center"
            title="Back to All Media"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>

          <!-- Breadcrumb Title -->
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-extrabold text-white tracking-wide">
              {{ activeFolder === 'All' ? 'All Showcase Media' : activeFolder }}
            </h3>
            <span class="text-xs text-neutral-400 font-mono">({{ filteredGallery.length }})</span>
          </div>

          <!-- All / Folders Filter Pills (Visible when in 'All' view) -->
          <div v-if="activeFolder === 'All'" class="flex items-center gap-1.5 ml-2 pl-3 border-l border-white/10">
            <button
              @click="viewFilter = 'all'"
              class="cursor-pointer px-3 py-1 rounded-xl text-xs font-bold transition"
              :class="[
                viewFilter === 'all'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              ]"
            >
              All
            </button>
            <button
              @click="viewFilter = 'folders'"
              class="cursor-pointer px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              :class="[
                viewFilter === 'folders'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              ]"
            >
              <Folder class="w-3.5 h-3.5 fill-neutral-300 text-neutral-300" />
              <span>Folders ({{ folders.length }})</span>
            </button>
            <button
              @click="viewFilter = 'photos'"
              class="cursor-pointer px-3 py-1 rounded-xl text-xs font-bold transition"
              :class="[
                viewFilter === 'photos'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              ]"
            >
              Photos ({{ gallery.length }})
            </button>
          </div>

          <!-- Inside Folder Actions (Rename / Delete) -->
          <div v-if="activeFolder !== 'All'" class="flex items-center gap-1.5 ml-2 pl-3 border-l border-white/10">
            <button
              @click="openRenameFolder(activeFolder)"
              class="cursor-pointer px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white border border-white/[0.08] transition flex items-center gap-1"
              title="Rename active folder"
            >
              <Edit3 class="w-3.5 h-3.5 text-neutral-400" />
              <span>Rename</span>
            </button>
            <button
              @click="openDeleteFolder(activeFolder)"
              class="cursor-pointer px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-xs font-semibold text-neutral-400 hover:text-red-400 border border-white/[0.08] transition flex items-center gap-1"
              title="Delete active folder"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Right: Create Folder + Batch Select -->
        <div class="flex items-center gap-2.5">
          <!-- + Create Folder Button (Only shown when at root 'All' view) -->
          <button
            v-if="activeFolder === 'All'"
            @click="openCreateFolder"
            class="cursor-pointer px-3.5 py-1.5 rounded-2xl bg-white/[0.05] hover:bg-white/15 text-neutral-200 hover:text-white text-xs font-bold border border-white/10 hover:border-white/25 transition flex items-center gap-1.5 shadow-sm group"
          >
            <FolderPlus class="w-3.5 h-3.5 fill-neutral-300/40 text-neutral-300" />
            <span>Create Folder</span>
          </button>

          <!-- Batch Select Button -->
          <button
            @click="isBatchMode = !isBatchMode; if (!isBatchMode) deselectAll()"
            class="cursor-pointer px-3.5 py-1.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2"
            :class="[
              isBatchMode
                ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-md shadow-yellow-500/20'
                : 'bg-white/[0.05] text-neutral-300 border-white/[0.08] hover:text-white hover:border-white/20'
            ]"
          >
            <component :is="isBatchMode ? CheckSquare : Square" class="w-3.5 h-3.5" />
            <span>{{ isBatchMode ? 'Done' : 'Batch Select' }}</span>
          </button>
        </div>
      </div>

      <!-- FOLDERS TILES GRID (Displayed when activeFolder === 'All' and filter is not 'photos') -->
      <div v-if="activeFolder === 'All' && viewFilter !== 'photos'" class="space-y-3">
        <div class="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
          <span>Folders ({{ folders.length }})</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div
            v-for="f in folders"
            :key="f"
            @click="activeFolder = f"
            class="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] hover:border-white/25 cursor-pointer transition duration-200 group flex flex-col justify-between space-y-2.5 shadow-lg hover:scale-[1.02]"
          >
            <div class="flex items-center justify-between">
              <!-- Solid Fill Folder Icon with Light Gray Color -->
              <div class="text-neutral-300 flex items-center justify-center transition group-hover:scale-110">
                <Folder class="w-6 h-6 fill-neutral-300 text-neutral-300" />
              </div>

              <!-- Quick action dots/edit -->
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  @click="openRenameFolder(f, $event)"
                  class="cursor-pointer p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white"
                  title="Rename folder"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="openDeleteFolder(f, $event)"
                  class="cursor-pointer p-1 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                  title="Delete folder"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-white group-hover:text-neutral-200 transition truncate">{{ f }}</h4>
              <span class="text-[10px] text-neutral-400 font-mono">{{ folderCounts[f] || 0 }} photos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- COMPACT PHOTOS & MEDIA GRID -->
      <div v-if="viewFilter !== 'folders'" class="space-y-3">
        <div v-if="activeFolder === 'All'" class="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider pt-2">
          <span>Photos ({{ filteredGallery.length }})</span>
        </div>

        <div v-if="filteredGallery.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          <div
            v-for="item in filteredGallery"
            :key="item.id"
            class="rounded-2xl overflow-hidden bg-[#141414] border flex flex-col group relative shadow-lg transition duration-200"
            :class="[
              selectedMediaIds.includes(item.id)
                ? 'border-[#FFD700] ring-2 ring-[#FFD700]/30'
                : 'border-white/[0.08] hover:border-white/20'
            ]"
          >
            <!-- Photo Thumbnail (Shrunk and compact) -->
            <div
              class="aspect-square bg-neutral-900 relative overflow-hidden cursor-pointer"
              @click="isBatchMode ? toggleSelectMedia(item.id) : openImageViewer(item)"
            >
              <img
                :src="item.image_url"
                :alt="item.title || 'Photo'"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />

              <!-- Batch Selection Checkbox Overlay -->
              <div
                v-if="isBatchMode"
                class="absolute top-2 left-2 z-20"
              >
                <div
                  class="w-5 h-5 rounded-md flex items-center justify-center transition shadow-md"
                  :class="[
                    selectedMediaIds.includes(item.id)
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-black/70 border border-white/30 text-transparent'
                  ]"
                >
                  <Check class="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <!-- Top Overlay Badges (Category / Folder Tag) -->
              <div
                v-if="!isBatchMode"
                class="absolute top-2 left-2 pointer-events-none"
              >
                <span class="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-semibold text-neutral-200 flex items-center gap-1">
                  <Folder class="w-2.5 h-2.5 fill-neutral-400 text-neutral-400" />
                  <span>{{ item.category }}</span>
                </span>
              </div>

              <!-- File Size Badge at Bottom Left of Thumbnail -->
              <div class="absolute bottom-1.5 left-1.5 pointer-events-none">
                <span class="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[8px] font-mono text-neutral-300">
                  {{ ((item.file_size_bytes || 350000) / 1024).toFixed(0) }} KB
                </span>
              </div>
            </div>

            <!-- Photo Card Footer: Filename & Action Buttons -->
            <div class="px-2.5 py-2 bg-[#141414] border-t border-white/[0.06] flex items-center justify-between gap-2">
              <p class="text-xs font-medium text-neutral-300 truncate group-hover:text-white transition" :title="getImageFileName(item)">
                {{ getImageFileName(item) }}
              </p>

              <!-- Action Buttons -->
              <div class="flex items-center gap-1 shrink-0">
                <!-- Move to Folder Button -->
                <button
                  @click.stop="openMoveSingleMedia(item)"
                  class="cursor-pointer p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/15 text-neutral-400 hover:text-white transition"
                  title="Move to another folder"
                >
                  <FolderInput class="w-3.5 h-3.5" />
                </button>

                <!-- Delete Button -->
                <button
                  @click.stop="promptDeleteMedia(item)"
                  class="cursor-pointer p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete Photo"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 bg-[#141414] border border-white/[0.08] rounded-3xl space-y-2.5">
          <Folder class="w-8 h-8 fill-neutral-600 text-neutral-600 mx-auto" />
          <p class="text-xs font-bold text-neutral-300">No photos in "{{ activeFolder }}"</p>
          <p class="text-[11px] text-neutral-500 max-w-xs mx-auto">
            Upload new photos into this folder or move existing photos here.
          </p>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 1. CREATE FOLDER MODAL -->
    <!-- ========================================== -->
    <Teleport to="body">
      <div
        v-if="isCreateFolderModalOpen"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
      >
        <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
          <div class="flex justify-between items-center border-b border-white/[0.08] pb-3">
            <div class="flex items-center gap-2">
              <FolderPlus class="w-5 h-5 fill-neutral-300/40 text-neutral-300" />
              <h3 class="text-lg font-bold text-white">Create New Album Folder</h3>
            </div>
            <button @click="isCreateFolderModalOpen = false" class="cursor-pointer text-neutral-400 hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-3">
            <label class="block text-xs font-semibold uppercase text-neutral-400">Folder / Album Name</label>
            <input
              type="text"
              v-model="newFolderName"
              placeholder="e.g. Studio Sessions 2026, Destination Weddings..."
              @keyup.enter="handleCreateFolder"
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              @click="isCreateFolderModalOpen = false"
              class="cursor-pointer px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              @click="handleCreateFolder"
              :disabled="!newFolderName.trim()"
              class="cursor-pointer px-6 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Create Folder
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================== -->
    <!-- 2. RENAME FOLDER MODAL -->
    <!-- ========================================== -->
    <Teleport to="body">
      <div
        v-if="isRenameFolderModalOpen"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
      >
        <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
          <div class="flex justify-between items-center border-b border-white/[0.08] pb-3">
            <div class="flex items-center gap-2">
              <Edit3 class="w-5 h-5 text-neutral-300" />
              <h3 class="text-lg font-bold text-white">Rename Folder</h3>
            </div>
            <button @click="isRenameFolderModalOpen = false" class="cursor-pointer text-neutral-400 hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-3">
            <label class="block text-xs font-semibold uppercase text-neutral-400">New Name for "{{ folderBeingRenamed }}"</label>
            <input
              type="text"
              v-model="newFolderName"
              @keyup.enter="handleRenameFolder"
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              @click="isRenameFolderModalOpen = false"
              class="cursor-pointer px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              @click="handleRenameFolder"
              :disabled="!newFolderName.trim() || newFolderName === folderBeingRenamed"
              class="cursor-pointer px-6 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Save Name
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================== -->
    <!-- 3. DELETE FOLDER CONFIRMATION MODAL -->
    <!-- ========================================== -->
    <Teleport to="body">
      <div
        v-if="isDeleteFolderModalOpen"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-[10002] flex items-center justify-center p-4"
      >
        <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl">
          <div class="flex items-start gap-4">
            <div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle class="w-5 h-5" />
            </div>

            <div class="space-y-1 flex-1 min-w-0">
              <h3 class="text-base font-bold text-white tracking-wide">Delete Folder?</h3>
              <p class="text-xs text-neutral-300 leading-relaxed">
                Are you sure you want to delete folder <strong class="text-white font-semibold">"{{ folderBeingDeleted }}"</strong>?
              </p>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300 leading-relaxed space-y-1">
            <p class="font-semibold text-neutral-200">Safe Reassignment:</p>
            <p class="text-[11px] text-neutral-400">
              Photos inside this folder will <strong>NOT</strong> be deleted. They will automatically and safely be moved to the <strong>General</strong> folder.
            </p>
          </div>

          <div class="flex justify-end items-center gap-2.5 pt-2">
            <button
              type="button"
              @click="isDeleteFolderModalOpen = false"
              class="cursor-pointer px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleDeleteFolder"
              class="cursor-pointer px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete Folder</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================== -->
    <!-- 4. MOVE MEDIA TO FOLDER MODAL -->
    <!-- ========================================== -->
    <Teleport to="body">
      <div
        v-if="isMoveMediaModalOpen"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-[10001] flex items-center justify-center p-4"
      >
        <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
          <div class="flex justify-between items-center border-b border-white/[0.08] pb-3">
            <div class="flex items-center gap-2">
              <FolderInput class="w-5 h-5 text-neutral-300" />
              <h3 class="text-lg font-bold text-white">
                {{ targetMediaToMove ? 'Move Photo to Folder' : `Move ${selectedMediaIds.length} Photos` }}
              </h3>
            </div>
            <button @click="isMoveMediaModalOpen = false" class="cursor-pointer text-neutral-400 hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-3">
            <label class="block text-xs font-semibold uppercase text-neutral-400">Select Destination Folder:</label>
            
            <div class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              <button
                v-for="f in folders"
                :key="f"
                @click="selectedDestinationFolder = f"
                type="button"
                class="cursor-pointer p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition"
                :class="[
                  selectedDestinationFolder === f
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-black/40 border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
                ]"
              >
                <div class="flex items-center gap-2.5">
                  <Folder class="w-4 h-4" :class="[selectedDestinationFolder === f ? 'fill-white text-white' : 'fill-neutral-400 text-neutral-400']" />
                  <span>{{ f }}</span>
                </div>
                <Check v-if="selectedDestinationFolder === f" class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              @click="isMoveMediaModalOpen = false"
              class="cursor-pointer px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              @click="handleConfirmMove"
              :disabled="!selectedDestinationFolder"
              class="cursor-pointer px-6 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg shadow-yellow-500/20 flex items-center gap-1.5"
            >
              <span>Move to {{ selectedDestinationFolder }}</span>
              <MoveRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================== -->
    <!-- 5. FULLSCREEN CINEMATIC IMAGE VIEWER -->
    <!-- ========================================== -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="viewingItem"
          class="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex flex-col justify-between font-manrope select-none"
          @click.self="closeImageViewer"
        >
          <!-- Top Bar -->
          <div class="px-6 py-4 relative flex items-center justify-between border-b border-white/[0.08] bg-black/40 backdrop-blur-md z-10">
            <!-- Left Info -->
            <div class="flex items-center gap-3 min-w-0">
              <span class="px-2.5 py-1 rounded-full bg-white/10 text-xs font-mono text-neutral-300">
                {{ viewingIndex + 1 }} / {{ filteredGallery.length }}
              </span>
              <div class="flex items-center gap-2 min-w-0">
                <span class="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-semibold text-neutral-300 flex items-center gap-1.5 shrink-0">
                  <Folder class="w-3 h-3 fill-neutral-400 text-neutral-400" />
                  <span>{{ viewingItem.category }}</span>
                </span>
                <span class="text-xs font-mono text-neutral-400 truncate max-w-[160px] sm:max-w-xs">
                  {{ getImageFileName(viewingItem) }}
                </span>
              </div>
            </div>

            <!-- Centered Subtle Usage Indicator (Neutral text, not a badge) -->
            <div
              v-if="getImageUsage(viewingItem)"
              class="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2 text-xs text-neutral-400"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
              <span>{{ getImageUsage(viewingItem).fullText }}</span>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- Move Folder -->
              <button
                @click="openMoveSingleMedia(viewingItem)"
                class="cursor-pointer p-2 rounded-xl bg-white/[0.05] hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5"
                title="Move photo to folder"
              >
                <FolderInput class="w-4 h-4" />
                <span class="hidden sm:inline">Move</span>
              </button>

              <!-- Open in New Tab -->
              <a
                :href="viewingItem.image_url"
                target="_blank"
                class="cursor-pointer p-2 rounded-xl bg-white/[0.05] hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 transition"
                title="Open high-res in new tab"
              >
                <ExternalLink class="w-4 h-4" />
              </a>

              <!-- Delete -->
              <button
                @click="promptDeleteMedia(viewingItem)"
                class="cursor-pointer p-2 rounded-xl bg-white/[0.05] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/10 transition"
                title="Delete photo"
              >
                <Trash2 class="w-4 h-4" />
              </button>

              <!-- Close -->
              <button
                @click="closeImageViewer"
                class="cursor-pointer p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition ml-2"
                title="Close viewer (Esc)"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Center Canvas with Navigation Arrows -->
          <div
            class="flex-1 flex items-center justify-between px-4 sm:px-8 relative overflow-hidden my-auto"
            @click.self="closeImageViewer"
          >
            <!-- Prev Button -->
            <button
              v-if="filteredGallery.length > 1"
              @click.stop="prevImage"
              class="cursor-pointer w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition hover:scale-110 shadow-2xl z-20"
              title="Previous (←)"
            >
              <ChevronLeft class="w-6 h-6" />
            </button>
            <div v-else class="w-12"></div>

            <!-- Image View -->
            <div class="relative max-h-[80vh] max-w-[85vw] flex items-center justify-center pointer-events-auto">
              <img
                :src="viewingItem.image_url"
                :alt="viewingItem.title || 'Fullscreen Preview'"
                class="max-h-[80vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform duration-300"
              />
            </div>

            <!-- Next Button -->
            <button
              v-if="filteredGallery.length > 1"
              @click.stop="nextImage"
              class="cursor-pointer w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition hover:scale-110 shadow-2xl z-20"
              title="Next (→)"
            >
              <ChevronRight class="w-6 h-6" />
            </button>
            <div v-else class="w-12"></div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-6 py-3 border-t border-white/[0.08] bg-black/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400 z-10">
            <div class="flex items-center gap-4 flex-wrap">
              <span>File size: <strong class="text-neutral-200 font-mono">{{ ((viewingItem.file_size_bytes || 350000) / 1024).toFixed(0) }} KB</strong></span>
              <span class="hidden sm:inline">Folder: <strong class="text-neutral-200">{{ viewingItem.category }}</strong></span>
            </div>
            <div class="hidden md:flex items-center gap-4 text-[11px] text-neutral-500">
              <span>Press <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">←</kbd> <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">→</kbd> to navigate</span>
              <span>Press <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">ESC</kbd> to exit</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ========================================== -->
    <!-- 6. DELETE SINGLE MEDIA CONFIRMATION MODAL -->
    <!-- ========================================== -->
    <Teleport to="body">
      <div
        v-if="mediaToDelete"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-[10002] flex items-center justify-center p-4"
      >
        <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl">
          <div class="flex items-start gap-4">
            <div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Trash2 class="w-5 h-5" />
            </div>

            <div class="space-y-1 flex-1 min-w-0">
              <h3 class="text-base font-bold text-white tracking-wide">Delete Photo?</h3>
              <p class="text-xs text-neutral-300 leading-relaxed">
                Are you sure you want to permanently delete this photo? This action cannot be undone.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <img
              :src="mediaToDelete.image_url"
              :alt="mediaToDelete.title || 'Photo Preview'"
              class="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-white truncate">{{ getImageFileName(mediaToDelete) }}</p>
              <p class="text-[10px] text-neutral-400 font-mono">{{ ((mediaToDelete.file_size_bytes || 350000) / 1024).toFixed(0) }} KB &bull; {{ mediaToDelete.category }}</p>
            </div>
          </div>

          <div class="flex justify-end items-center gap-2.5 pt-2">
            <button
              type="button"
              @click="cancelDeleteMedia"
              class="cursor-pointer px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmDeleteMedia"
              class="cursor-pointer px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete Photo</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================== -->
    <!-- 7. DELETE BULK MEDIA CONFIRMATION MODAL -->
    <!-- ========================================== -->
    <Teleport to="body">
      <div
        v-if="isBulkDeleteModalOpen"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-[10002] flex items-center justify-center p-4"
      >
        <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl">
          <div class="flex items-start gap-4">
            <div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Trash2 class="w-5 h-5" />
            </div>

            <div class="space-y-1 flex-1 min-w-0">
              <h3 class="text-base font-bold text-white tracking-wide">Delete Selected Photos?</h3>
              <p class="text-xs text-neutral-300 leading-relaxed">
                Are you sure you want to permanently delete <strong class="text-white font-semibold">{{ selectedMediaIds.length }} selected photos</strong>? This action cannot be undone.
              </p>
            </div>
          </div>

          <div class="flex justify-end items-center gap-2.5 pt-2">
            <button
              type="button"
              @click="isBulkDeleteModalOpen = false"
              class="cursor-pointer px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmBulkDeleteMedia"
              class="cursor-pointer px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete {{ selectedMediaIds.length }} Photos</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================================= -->
    <!-- VISUAL TOAST FEEDBACK NOTIFICATION                        -->
    <!-- ========================================================= -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-6 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-6 scale-95"
      >
        <div
          v-if="toast.visible"
          class="fixed bottom-6 left-6 z-[10001] max-w-md w-[calc(100vw-3rem)] sm:w-auto bg-[#1a1a1a]/95 backdrop-blur-md border border-white/15 text-white px-4 py-3 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3.5 font-manrope select-none"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              :class="[
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : toast.type === 'danger'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-white/10 text-neutral-300 border border-white/15'
              ]"
            >
              <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4" />
              <AlertTriangle v-else-if="toast.type === 'danger'" class="w-4 h-4" />
              <Info v-else class="w-4 h-4" />
            </div>

            <div class="min-w-0">
              <p class="text-xs font-bold text-white truncate">{{ toast.title }}</p>
              <p v-if="toast.subtitle" class="text-[11px] text-neutral-400 truncate mt-0.5">{{ toast.subtitle }}</p>
            </div>
          </div>

          <button
            @click="dismissToast"
            type="button"
            class="cursor-pointer p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition shrink-0 ml-2"
            title="Dismiss"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>
