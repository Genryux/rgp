<script setup>
import { ref, computed, watch } from 'vue';
import { useGallery } from '../../../composables/useGallery';
import { useModalState } from '../../../composables/useModalState';
import {
  UploadCloud,
  Star,
  Trash2,
  Image as ImageIcon,
  Folder,
  FolderPlus,
  FolderInput,
  Loader2,
  HardDrive,
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
  ArrowLeft,
  AlertTriangle,
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

const activeFolder = ref('All'); // 'All' or folder name
const viewFilter = ref('all'); // 'all' (show both folders & photos) | 'folders' (show only folders) | 'photos' (show only photos)
const uploading = ref(false);
const uploadProgress = ref('');
const fileInputRef = ref(null);

// Modal states
const isCreateFolderModalOpen = ref(false);
const isRenameFolderModalOpen = ref(false);
const isDeleteFolderModalOpen = ref(false);
const isMoveMediaModalOpen = ref(false);

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
    isMoveMediaModalOpen.value
  ),
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) openModal();
    else if (!isOpen && wasOpen) closeModal();
  }
);

// Filtered media by active folder
const filteredGallery = computed(() => {
  if (activeFolder.value === 'All') return gallery.value;
  return gallery.value.filter((item) => item.category === activeFolder.value);
});

// Upload target folder (defaults to active folder if specific, or first available folder)
const uploadTargetFolder = computed(() => {
  if (activeFolder.value !== 'All' && folders.value.includes(activeFolder.value)) {
    return activeFolder.value;
  }
  return folders.value[0] || 'Weddings';
});

async function handleFiles(files) {
  if (!files || files.length === 0) return;
  uploading.value = true;

  const targetCategory = uploadTargetFolder.value;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    uploadProgress.value = `Optimizing & uploading ${i + 1} of ${files.length}: ${file.name}...`;
    await uploadMediaFile(file, targetCategory);
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

// ==========================================
// FOLDER ACTIONS
// ==========================================
function openCreateFolder() {
  newFolderName.value = '';
  isCreateFolderModalOpen.value = true;
}

function handleCreateFolder() {
  if (!newFolderName.value.trim()) return;
  const success = createFolder(newFolderName.value.trim());
  if (success) {
    activeFolder.value = newFolderName.value.trim();
    isCreateFolderModalOpen.value = false;
    newFolderName.value = '';
  }
}

function openRenameFolder(folderName, e) {
  if (e) e.stopPropagation();
  folderBeingRenamed.value = folderName;
  newFolderName.value = folderName;
  isRenameFolderModalOpen.value = true;
}

async function handleRenameFolder() {
  if (!newFolderName.value.trim()) return;
  await updateFolder(folderBeingRenamed.value, newFolderName.value.trim());
  if (activeFolder.value === folderBeingRenamed.value) {
    activeFolder.value = newFolderName.value.trim();
  }
  isRenameFolderModalOpen.value = false;
  folderBeingRenamed.value = '';
  newFolderName.value = '';
}

function openDeleteFolder(folderName, e) {
  if (e) e.stopPropagation();
  folderBeingDeleted.value = folderName;
  isDeleteFolderModalOpen.value = true;
}

async function handleDeleteFolder() {
  if (!folderBeingDeleted.value) return;
  await deleteFolder(folderBeingDeleted.value, 'General');
  if (activeFolder.value === folderBeingDeleted.value) {
    activeFolder.value = 'All';
  }
  isDeleteFolderModalOpen.value = false;
  folderBeingDeleted.value = '';
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

  if (targetMediaToMove.value) {
    // Single move
    await moveMediaToFolder(targetMediaToMove.value.id, selectedDestinationFolder.value);
  } else if (selectedMediaIds.value.length > 0) {
    // Bulk move
    await bulkMoveMedia(selectedMediaIds.value, selectedDestinationFolder.value);
    selectedMediaIds.value = [];
    isBatchMode.value = false;
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
        <p class="text-xs text-neutral-400 mt-0.5">Upload, organize folders, and monitor your 1 GB cloud storage consumption</p>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TOP SECTION: STORAGE QUOTA (LEFT) + DRAG & DROP UPLOAD (RIGHT) -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      
      <!-- LEFT: COMPACT CLOUD STORAGE CONSUMPTION CARD -->
      <div class="lg:col-span-6 rounded-3xl bg-[#141414] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
        <!-- Ambient glow -->
        <div
          class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-700"
          :class="[
            usedPercentage > 90
              ? 'bg-red-500/20'
              : usedPercentage > 70
                ? 'bg-yellow-500/20'
                : 'bg-[#FFD700]/10'
          ]"
        ></div>

        <!-- Top Header & Usage Metrics -->
        <div class="flex items-center justify-between gap-3 relative z-10">
          <div class="flex items-center gap-2.5">
            <div
              class="p-2.5 rounded-2xl border transition duration-300"
              :class="[
                usedPercentage > 90
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-yellow-500/10 border-yellow-500/20 text-[#FFD700]'
              ]"
            >
              <HardDrive class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-white tracking-wide">Storage Quota</h3>
                <span class="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono text-neutral-300">
                  1 GB Free Tier
                </span>
              </div>
              <p class="text-[11px] text-neutral-400">{{ gallery.length }} photos uploaded</p>
            </div>
          </div>

          <!-- Numbers & Percentage Tag -->
          <div class="flex items-baseline gap-1 text-right">
            <span class="text-xl font-extrabold text-white">{{ totalStorageMB }} MB</span>
            <span class="text-[11px] text-neutral-400 font-medium">/ {{ maxQuotaMB }} MB</span>
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
        <div class="space-y-1.5 relative z-10">
          <div class="w-full h-2.5 rounded-full bg-black/60 border border-white/[0.08] overflow-hidden p-0.5">
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
            <span class="text-[#FFD700] font-semibold">~{{ remainingMB }} MB Remaining</span>
            <span>1,000 MB</span>
          </div>
        </div>

        <!-- Micro stats strip -->
        <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-neutral-400 relative z-10">
          <span class="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 class="w-3.5 h-3.5 flex-shrink-0" />
            <span>Room for ~{{ estimatedPhotosRemaining.toLocaleString() }} more WebP photos</span>
          </span>
          <span class="text-neutral-500 font-mono text-[10px]">~350 KB/photo</span>
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

        <div class="flex items-center justify-between border-b border-white/[0.06] pb-2.5 pointer-events-none">
          <div class="flex items-center gap-2">
            <UploadCloud class="w-4 h-4 text-[#FFD700]" />
            <h3 class="text-sm font-bold text-white tracking-wide">Quick Upload Dropzone</h3>
          </div>
          <div class="px-2.5 py-0.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[10px] text-[#FFD700] font-semibold flex items-center gap-1">
            <Folder class="w-3 h-3" />
            <span>Target: <strong>{{ uploadTargetFolder }}</strong></span>
          </div>
        </div>

        <div class="space-y-1.5 text-center py-2 pointer-events-none">
          <div class="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#FFD700] group-hover:scale-110 transition duration-300">
            <UploadCloud class="w-5 h-5" />
          </div>
          <h4 class="text-xs font-bold text-white">Drag & drop photos here, or click to browse</h4>
          <p class="text-[10px] text-neutral-400">
            Auto-compressed to lightweight WebP (~350KB) before uploading
          </p>
        </div>

        <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-neutral-400 pointer-events-none">
          <span>Multiple files supported</span>
          <span class="text-[#FFD700] text-[10px] font-mono">WebP canvas encoder</span>
        </div>

        <!-- Upload Progress Indicator Overlay -->
        <div
          v-if="uploading"
          class="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-4 z-20 space-y-2"
        >
          <Loader2 class="w-6 h-6 text-[#FFD700] animate-spin" />
          <p class="text-xs font-semibold text-[#FFD700]">{{ uploadProgress }}</p>
        </div>
      </div>
    </div>

    <!-- BATCH ACTION FLOATING / STICKY TOOLBAR -->
    <div
      v-if="isBatchMode && selectedMediaIds.length > 0"
      class="p-4 rounded-2xl bg-[#181818] border border-[#FFD700]/50 shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-fadeIn"
    >
      <div class="flex items-center gap-3">
        <span class="w-7 h-7 rounded-xl bg-[#FFD700] text-black font-extrabold text-xs flex items-center justify-center">
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
          class="px-4 py-2 rounded-xl bg-[#FFD700] text-black text-xs font-bold hover:bg-yellow-400 transition flex items-center gap-2 shadow-md shadow-yellow-500/20"
        >
          <FolderInput class="w-4 h-4" />
          <span>Move {{ selectedMediaIds.length }} Photos to Folder</span>
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
            class="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-[#FFD700] transition flex items-center gap-1 text-xs font-bold"
            title="Back to All Media"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>All</span>
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
              class="px-3 py-1 rounded-xl text-xs font-bold transition"
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
              class="px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              :class="[
                viewFilter === 'folders'
                  ? 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30'
                  : 'text-neutral-400 hover:text-white'
              ]"
            >
              <Folder class="w-3.5 h-3.5" />
              <span>Folders ({{ folders.length }})</span>
            </button>
            <button
              @click="viewFilter = 'photos'"
              class="px-3 py-1 rounded-xl text-xs font-bold transition"
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
              class="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white border border-white/[0.08] transition flex items-center gap-1"
              title="Rename active folder"
            >
              <Edit3 class="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Rename</span>
            </button>
            <button
              @click="openDeleteFolder(activeFolder)"
              class="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-xs font-semibold text-neutral-400 hover:text-red-400 border border-white/[0.08] transition flex items-center gap-1"
              title="Delete active folder"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Right: Create Folder + Batch Select -->
        <div class="flex items-center gap-2.5">
          <!-- + Create Folder Button -->
          <button
            @click="openCreateFolder"
            class="px-3.5 py-1.5 rounded-2xl bg-white/[0.05] hover:bg-[#FFD700] hover:text-black text-neutral-200 text-xs font-bold border border-white/10 hover:border-[#FFD700] transition flex items-center gap-1.5 shadow-sm"
          >
            <FolderPlus class="w-3.5 h-3.5 text-[#FFD700] group-hover:text-black" />
            <span>Create Folder</span>
          </button>

          <!-- Batch Select Button -->
          <button
            @click="isBatchMode = !isBatchMode; if (!isBatchMode) deselectAll()"
            class="px-3.5 py-1.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2"
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
            class="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] hover:border-[#FFD700] cursor-pointer transition duration-200 group flex flex-col justify-between space-y-2.5 shadow-lg hover:scale-[1.02]"
          >
            <div class="flex items-center justify-between">
              <div class="w-8 h-8 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] flex items-center justify-center transition group-hover:bg-[#FFD700] group-hover:text-black">
                <Folder class="w-4 h-4" />
              </div>

              <!-- Quick action dots/edit -->
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  @click="openRenameFolder(f, $event)"
                  class="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white"
                  title="Rename"
                >
                  <Edit3 class="w-3 h-3 text-[#FFD700]" />
                </button>
                <button
                  @click="openDeleteFolder(f, $event)"
                  class="p-1 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-white group-hover:text-[#FFD700] transition truncate">{{ f }}</h4>
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
              @click="isBatchMode ? toggleSelectMedia(item.id) : null"
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
                class="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none"
              >
                <span class="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-semibold uppercase text-neutral-200 flex items-center gap-1">
                  <Folder class="w-2.5 h-2.5 text-[#FFD700]" />
                  <span>{{ item.category }}</span>
                </span>

                <span
                  v-if="item.is_featured"
                  class="px-1.5 py-0.5 rounded-md bg-[#FFD700] text-[#121212] text-[9px] font-bold uppercase shadow-md flex items-center gap-0.5"
                >
                  <Star class="w-2.5 h-2.5 fill-current" />
                  <span>Featured</span>
                </span>
              </div>

              <!-- File Size Badge at Bottom Left of Thumbnail -->
              <div class="absolute bottom-1.5 left-1.5 pointer-events-none">
                <span class="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[8px] font-mono text-neutral-300">
                  {{ ((item.file_size_bytes || 350000) / 1024).toFixed(0) }} KB
                </span>
              </div>
            </div>

            <!-- Actions Footer: Feature Toggle, Move to Folder, Delete -->
            <div class="p-2 bg-[#141414] flex items-center justify-between border-t border-white/[0.06] text-[11px]">
              <button
                @click="toggleFeatured(item.id)"
                class="font-semibold transition flex items-center gap-1"
                :class="[item.is_featured ? 'text-[#FFD700]' : 'text-neutral-400 hover:text-white']"
                title="Feature on Home Carousel"
              >
                <Star class="w-3 h-3" :class="[item.is_featured ? 'fill-current' : '']" />
                <span class="hidden sm:inline">{{ item.is_featured ? 'Featured' : 'Star' }}</span>
              </button>

              <div class="flex items-center gap-1">
                <!-- Move to Folder Button -->
                <button
                  @click="openMoveSingleMedia(item)"
                  class="p-1 rounded-md bg-white/[0.04] hover:bg-[#FFD700] hover:text-black text-neutral-300 transition"
                  title="Move to another folder"
                >
                  <FolderInput class="w-3 h-3" />
                </button>

                <!-- Delete Button -->
                <button
                  @click="deleteMedia(item.id)"
                  class="p-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete Photo"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 bg-[#141414] border border-white/[0.08] rounded-3xl space-y-2.5">
          <Folder class="w-8 h-8 text-neutral-600 mx-auto" />
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
    <div
      v-if="isCreateFolderModalOpen"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-3">
          <div class="flex items-center gap-2">
            <FolderPlus class="w-5 h-5 text-[#FFD700]" />
            <h3 class="text-lg font-bold text-white">Create New Album Folder</h3>
          </div>
          <button @click="isCreateFolderModalOpen = false" class="text-neutral-400 hover:text-white">
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
            class="px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleCreateFolder"
            :disabled="!newFolderName.trim()"
            class="px-6 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 disabled:opacity-30 transition"
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 2. RENAME FOLDER MODAL -->
    <!-- ========================================== -->
    <div
      v-if="isRenameFolderModalOpen"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-3">
          <div class="flex items-center gap-2">
            <Edit3 class="w-5 h-5 text-[#FFD700]" />
            <h3 class="text-lg font-bold text-white">Rename Folder</h3>
          </div>
          <button @click="isRenameFolderModalOpen = false" class="text-neutral-400 hover:text-white">
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
            class="px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleRenameFolder"
            :disabled="!newFolderName.trim() || newFolderName === folderBeingRenamed"
            class="px-6 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 disabled:opacity-30 transition"
          >
            Save Name
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 3. DELETE FOLDER CONFIRMATION MODAL -->
    <!-- ========================================== -->
    <div
      v-if="isDeleteFolderModalOpen"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
        <div class="flex items-center gap-3 text-red-400">
          <AlertTriangle class="w-6 h-6" />
          <h3 class="text-lg font-bold text-white">Delete "{{ folderBeingDeleted }}" Folder?</h3>
        </div>

        <p class="text-xs text-neutral-300 leading-relaxed">
          Photos inside this folder will <strong>NOT</strong> be deleted. They will automatically be safely moved to the <strong>General</strong> folder.
        </p>

        <div class="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            @click="isDeleteFolderModalOpen = false"
            class="px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleDeleteFolder"
            class="px-6 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase transition shadow-lg shadow-red-600/30"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 4. MOVE MEDIA TO FOLDER MODAL -->
    <!-- ========================================== -->
    <div
      v-if="isMoveMediaModalOpen"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-3">
          <div class="flex items-center gap-2">
            <FolderInput class="w-5 h-5 text-[#FFD700]" />
            <h3 class="text-lg font-bold text-white">
              {{ targetMediaToMove ? 'Move Photo to Folder' : `Move ${selectedMediaIds.length} Photos` }}
            </h3>
          </div>
          <button @click="isMoveMediaModalOpen = false" class="text-neutral-400 hover:text-white">
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
              class="p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition"
              :class="[
                selectedDestinationFolder === f
                  ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]'
                  : 'bg-black/40 border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
              ]"
            >
              <div class="flex items-center gap-2.5">
                <Folder class="w-4 h-4" :class="[selectedDestinationFolder === f ? 'text-[#FFD700]' : 'text-neutral-400']" />
                <span>{{ f }}</span>
              </div>
              <Check v-if="selectedDestinationFolder === f" class="w-4 h-4 text-[#FFD700]" />
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            @click="isMoveMediaModalOpen = false"
            class="px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleConfirmMove"
            :disabled="!selectedDestinationFolder"
            class="px-6 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 disabled:opacity-30 transition shadow-lg shadow-yellow-500/20 flex items-center gap-1.5"
          >
            <span>Move to {{ selectedDestinationFolder }}</span>
            <MoveRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
