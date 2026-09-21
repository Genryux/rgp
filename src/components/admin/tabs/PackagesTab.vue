<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';
import { useModalState } from '../../../composables/useModalState';
import { adminModalTokens } from '../../../lib/designTokens';
import {
  Plus,
  Check,
  Edit3,
  Trash2,
  X,
  Tag,
  Sparkles,
  Eye,
  EyeOff,
  Search,
  ListFilter,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from '@lucide/vue';

const {
  packages,
  masterInclusions,
  isGlobalPriceMasked,
  toggleGlobalPriceMask,
  togglePackagePriceMask,
  savePackage,
  deletePackage,
  togglePackageActive,
  addMasterInclusion,
  removeMasterInclusion,
  updateMasterInclusion,
} = usePackages();

const { openModal, closeModal } = useModalState();

// Package Editor State
const editingPackage = ref(null);
const inclusionSearch = ref('');
const inclusionFilterMode = ref('all'); // 'all' | 'selected'
const inlineNewInclusion = ref('');
const showSelectedReorder = ref(false);

// Master List Manager Modal State
const showMasterListModal = ref(false);
const masterListSearch = ref('');
const newMasterInclusionInput = ref('');
const editingMasterItem = ref({ oldVal: '', newVal: '' });

// Master Inclusion Delete Confirmation State
const inclusionToDelete = ref(null);

const affectedPackagesCount = computed(() => {
  if (!inclusionToDelete.value) return 0;
  const target = inclusionToDelete.value.toLowerCase();
  return packages.value.filter(
    (p) => Array.isArray(p.features) && p.features.some((f) => f.toLowerCase() === target)
  ).length;
});

function promptDeleteInclusion(item) {
  inclusionToDelete.value = item;
}

function cancelDeleteInclusion() {
  inclusionToDelete.value = null;
}

async function confirmDeleteInclusion() {
  if (!inclusionToDelete.value) return;
  await removeMasterInclusion(inclusionToDelete.value);
  inclusionToDelete.value = null;
}

watch(
  () => Boolean(editingPackage.value || showMasterListModal.value || inclusionToDelete.value),
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) openModal();
    else if (!isOpen && wasOpen) closeModal();
  }
);

onUnmounted(() => {
  if (editingPackage.value || showMasterListModal.value || inclusionToDelete.value) {
    closeModal();
  }
});

const categories = [
  'Weddings',
  'Birthdays & Debuts',
  'Portraits & Studio',
  'Graduation',
  'Commercial',
  'Other',
];

const selectedAdminCategory = ref('All');

// List of category filters including 'All'
const activeCategoryFilters = computed(() => {
  const set = new Set();
  packages.value.forEach((p) => {
    if (p.category) set.add(p.category);
  });
  return ['All', ...Array.from(set)];
});

function getCategoryPackageCount(cat) {
  if (cat === 'All') return packages.value.length;
  return packages.value.filter((p) => p.category === cat).length;
}

const groupedPackages = computed(() => {
  const groups = {};
  
  packages.value.forEach((pkg) => {
    const cat = pkg.category || 'Other';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(pkg);
  });

  const result = [];
  const knownCategories = [...categories];

  Object.keys(groups).forEach((cat) => {
    if (selectedAdminCategory.value === 'All' || selectedAdminCategory.value === cat) {
      result.push({
        category: cat,
        items: groups[cat],
      });
    }
  });

  // Sort groups based on standard category order
  result.sort((a, b) => {
    const idxA = knownCategories.indexOf(a.category);
    const idxB = knownCategories.indexOf(b.category);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.category.localeCompare(b.category);
  });

  return result;
});

// Category expand / collapse state (all expanded by default)
const collapsedCategories = ref(new Set());

function toggleCategoryCollapse(cat) {
  const next = new Set(collapsedCategories.value);
  if (next.has(cat)) {
    next.delete(cat);
  } else {
    next.add(cat);
  }
  collapsedCategories.value = next;
}

function isCategoryExpanded(cat) {
  return !collapsedCategories.value.has(cat);
}

function openNewPackage(defaultCategory = 'Weddings') {
  inclusionSearch.value = '';
  inclusionFilterMode.value = 'all';
  inlineNewInclusion.value = '';
  showSelectedReorder.value = false;
  const initialCategory = typeof defaultCategory === 'string' && categories.includes(defaultCategory)
    ? defaultCategory
    : (selectedAdminCategory.value !== 'All' ? selectedAdminCategory.value : 'Weddings');
  editingPackage.value = {
    id: `pkg_temp_${Date.now()}`,
    category: initialCategory,
    title: '',
    price: 15000,
    promo_price: null,
    badge: '',
    features: [
      '1 Professional Photographer',
      'Full Day Coverage (Prep to Reception)',
      '150 Enhanced Digital High-Res Photos',
      'Online Private Cloud Gallery (1 Year Access)',
    ],
    is_featured: false,
    is_active: true,
    hide_price: false,
  };
}

function openEditPackage(pkg) {
  inclusionSearch.value = '';
  inclusionFilterMode.value = 'all';
  inlineNewInclusion.value = '';
  showSelectedReorder.value = false;
  editingPackage.value = JSON.parse(JSON.stringify(pkg));
  if (!Array.isArray(editingPackage.value.features)) {
    editingPackage.value.features = [];
  }
  if (editingPackage.value.hide_price === undefined) {
    editingPackage.value.hide_price = false;
  }
}

// Inclusions logic for package editor
function isFeatureSelected(feat) {
  if (!editingPackage.value?.features) return false;
  const target = feat.toLowerCase().trim();
  return editingPackage.value.features.some((f) => f.toLowerCase().trim() === target);
}

function toggleFeature(feat) {
  if (!editingPackage.value) return;
  if (!Array.isArray(editingPackage.value.features)) {
    editingPackage.value.features = [];
  }
  const target = feat.toLowerCase().trim();
  const idx = editingPackage.value.features.findIndex((f) => f.toLowerCase().trim() === target);
  if (idx !== -1) {
    editingPackage.value.features.splice(idx, 1);
  } else {
    editingPackage.value.features.push(feat);
  }
}

function removeSelectedFeature(index) {
  if (editingPackage.value?.features) {
    editingPackage.value.features.splice(index, 1);
  }
}

function moveFeatureUp(index) {
  if (!editingPackage.value?.features || index <= 0) return;
  const items = editingPackage.value.features;
  const temp = items[index];
  items[index] = items[index - 1];
  items[index - 1] = temp;
}

function moveFeatureDown(index) {
  if (!editingPackage.value?.features || index >= editingPackage.value.features.length - 1) return;
  const items = editingPackage.value.features;
  const temp = items[index];
  items[index] = items[index + 1];
  items[index + 1] = temp;
}

const filteredMasterInclusions = computed(() => {
  let list = masterInclusions.value;
  if (inclusionFilterMode.value === 'selected') {
    list = list.filter((feat) => isFeatureSelected(feat));
  }
  if (inclusionSearch.value.trim()) {
    const q = inclusionSearch.value.toLowerCase().trim();
    list = list.filter((feat) => feat.toLowerCase().includes(q));
  }
  return list;
});

async function handleAddInlineInclusion() {
  const trimmed = inlineNewInclusion.value.trim();
  if (!trimmed) return;
  const added = await addMasterInclusion(trimmed);
  if (added && editingPackage.value) {
    if (!isFeatureSelected(added)) {
      editingPackage.value.features.push(added);
    }
  }
  inlineNewInclusion.value = '';
}

// Master List Manager logic
const filteredManagerMasterList = computed(() => {
  if (!masterListSearch.value.trim()) return masterInclusions.value;
  const q = masterListSearch.value.toLowerCase().trim();
  return masterInclusions.value.filter((i) => i.toLowerCase().includes(q));
});

async function handleAddMasterInclusion() {
  const trimmed = newMasterInclusionInput.value.trim();
  if (!trimmed) return;
  await addMasterInclusion(trimmed);
  newMasterInclusionInput.value = '';
}

function startEditMasterItem(item) {
  editingMasterItem.value = { oldVal: item, newVal: item };
}

async function saveEditMasterItem() {
  if (editingMasterItem.value.oldVal && editingMasterItem.value.newVal.trim()) {
    await updateMasterInclusion(editingMasterItem.value.oldVal, editingMasterItem.value.newVal.trim());
  }
  editingMasterItem.value = { oldVal: '', newVal: '' };
}

function cancelEditMasterItem() {
  editingMasterItem.value = { oldVal: '', newVal: '' };
}

async function handleSave() {
  if (!editingPackage.value.title) return;
  if (editingPackage.value.hide_price) {
    editingPackage.value.promo_price = null;
  }
  const res = await savePackage(editingPackage.value);
  if (res?.error) {
    alert('Error saving package to Supabase: ' + (res.error.message || 'Please check your admin session.'));
    return;
  }
  editingPackage.value = null;
}
</script>

<template>
  <div class="space-y-8 font-manrope">
    <!-- Header with Master List Button, Price Masking Switch & Add Button -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Services & Rates Manager</h2>
        <p class="text-xs text-neutral-400 mt-0.5">
          Create, update, and manage studio pricing packages and master deliverables
        </p>
      </div>

      <!-- Top-right Action Buttons (Uniform Sizing) -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Master Inclusions List Button -->
        <button
          @click="showMasterListModal = true"
          class="cursor-pointer px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-200 hover:text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm"
          title="Manage reusable package inclusions"
        >
          <span>Master Inclusions</span>
          <span class="px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 text-[10px] font-mono font-semibold">
            {{ masterInclusions.length }}
          </span>
        </button>

        <!-- Global Price Mask Toggle Button -->
        <button
          v-if="packages.length > 0"
          @click="toggleGlobalPriceMask"
          class="cursor-pointer px-5 py-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-2 shadow-sm"
          :class="[
            isGlobalPriceMasked
              ? 'bg-white/20 border-white/30 text-white shadow-sm'
              : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-neutral-300 hover:text-white'
          ]"
          :title="isGlobalPriceMasked ? 'Public prices currently masked as 2?,???' : 'Public prices show full amount'"
        >
          <component :is="isGlobalPriceMasked ? EyeOff : Eye" class="w-4 h-4 text-neutral-300" />
          <span>{{ isGlobalPriceMasked ? 'Mask All Prices Active' : 'Mask All Prices' }}</span>
        </button>

        <!-- Add Package Button -->
        <button
          @click="openNewPackage"
          class="cursor-pointer px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#141414] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>
    </div>

    <!-- Category Filter Pills Bar (When packages exist) -->
    <div v-if="packages.length > 0" class="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
      <button
        v-for="cat in activeCategoryFilters"
        :key="cat"
        @click="selectedAdminCategory = cat"
        class="px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2"
        :class="[
          selectedAdminCategory === cat
            ? 'bg-white/15 text-white font-bold border border-white/30 shadow-sm'
            : 'bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]'
        ]"
      >
        <span>{{ cat }}</span>
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-mono"
          :class="[
            selectedAdminCategory === cat
              ? 'bg-white/20 text-white font-bold'
              : 'bg-white/[0.08] text-neutral-400'
          ]"
        >
          {{ getCategoryPackageCount(cat) }}
        </span>
      </button>
    </div>

    <!-- Categorized Package Groups (When packages exist) -->
    <div v-if="packages.length > 0" class="space-y-10">
      <div
        v-for="group in groupedPackages"
        :key="group.category"
        class="space-y-4"
      >
        <!-- Category Section Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] hover:border-white/15 px-5 py-3 rounded-2xl transition">
          <div class="flex items-center gap-3">
            <!-- Expand / Collapse Arrow Button (Neutral Background) -->
            <button
              type="button"
              @click="toggleCategoryCollapse(group.category)"
              class="cursor-pointer p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition flex items-center justify-center border border-white/[0.08]"
              :title="isCategoryExpanded(group.category) ? 'Collapse ' + group.category : 'Expand ' + group.category"
            >
              <ChevronUp v-if="isCategoryExpanded(group.category)" class="w-4 h-4 stroke-[2.5]" />
              <ChevronDown v-else class="w-4 h-4 stroke-[2.5]" />
            </button>

            <!-- Clickable Category Title -->
            <button
              type="button"
              @click="toggleCategoryCollapse(group.category)"
              class="cursor-pointer text-left flex items-center gap-2.5 group/cat"
            >
              <h3 class="text-sm font-bold uppercase tracking-wider text-white group-hover/cat:text-[#FFD700] transition">
                {{ group.category }}
              </h3>
            </button>

            <!-- Neutral Packages Count Badge -->
            <span class="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/[0.08] text-xs font-mono font-medium">
              {{ group.items.length }} {{ group.items.length === 1 ? 'Package' : 'Packages' }}
            </span>
          </div>

          <button
            @click="openNewPackage(group.category)"
            class="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-white/[0.06]"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add to {{ group.category }}</span>
          </button>
        </div>

        <!-- Cards Grid for this Category (Collapsible & Content-Aware Height) -->
        <div
          v-if="isCategoryExpanded(group.category)"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start transition-all duration-300"
        >
          <div
            v-for="pkg in group.items"
            :key="pkg.id"
            class="rounded-3xl p-6 bg-[#141414] border flex flex-col justify-between relative group transition shadow-xl h-fit self-start"
            :class="[
              pkg.badge
                ? 'border-[#FFD700]/40 bg-gradient-to-b from-[#FFD700]/[0.03] to-[#141414] hover:border-[#FFD700]/70'
                : 'border-white/[0.08] hover:border-white/[0.18]'
            ]"
          >
            <!-- Badge if present (With matching gold border highlight) -->
            <div
              v-if="pkg.badge"
              class="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#FFD700] text-[#141414] text-[10px] font-bold uppercase tracking-wider shadow-md"
            >
              {{ pkg.badge }}
            </div>

            <div>
              <h3 class="text-lg font-bold text-white tracking-wide mb-2">{{ pkg.title }}</h3>

              <!-- Price Display (with Eye Mask Toggle Button directly beside it) -->
              <div class="flex items-center gap-2.5 mb-4">
                <div class="flex items-baseline gap-2">
                  <!-- If Masked: Show 2?,??? and hide promo price -->
                  <template v-if="pkg.hide_price || isGlobalPriceMasked">
                    <span class="text-2xl font-extrabold text-[#FFD700]">₱{{ formatMaskedPrice(pkg.price) }}</span>
                  </template>

                  <!-- Standard Full Price & Promo Price -->
                  <template v-else>
                    <span class="text-2xl font-extrabold text-[#FFD700]">
                      ₱{{ Number(pkg.promo_price || pkg.price).toLocaleString('en-PH') }}
                    </span>
                    <span v-if="pkg.promo_price" class="text-xs text-neutral-500 line-through font-medium">
                      ₱{{ Number(pkg.price).toLocaleString('en-PH') }}
                    </span>
                  </template>
                </div>

                <!-- Eye Mask Toggle Button -->
                <button
                  @click="togglePackagePriceMask(pkg.id)"
                  class="cursor-pointer p-1 rounded-lg transition"
                  :class="[
                    (pkg.hide_price || isGlobalPriceMasked)
                      ? 'text-neutral-200 hover:text-white hover:bg-white/10'
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                  ]"
                  :title="pkg.hide_price ? 'Price is masked (Click to reveal)' : 'Price is visible (Click to mask)'"
                >
                  <component :is="(pkg.hide_price || isGlobalPriceMasked) ? EyeOff : Eye" class="w-4 h-4" />
                </button>
              </div>

              <!-- Inclusions Count & List -->
              <div class="mb-6 space-y-2.5">
                <div class="flex items-center justify-between text-[11px] text-neutral-400 border-b border-white/[0.06] pb-1.5">
                  <span>Inclusions</span>
                  <span class="font-mono text-neutral-400">{{ pkg.features ? pkg.features.length : 0 }} items</span>
                </div>
                <ul v-if="pkg.features && pkg.features.length > 0" class="space-y-1.5 text-xs text-neutral-300 pr-1">
                  <li v-for="(feat, idx) in pkg.features" :key="idx" class="flex items-start gap-2 leading-snug">
                    <Check class="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span>{{ feat }}</span>
                  </li>
                </ul>
                <div v-else class="py-5 px-3 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-1">
                  <p class="text-xs text-neutral-400">No inclusions configured yet</p>
                  <button
                    type="button"
                    @click="openEditPackage(pkg)"
                    class="text-[11px] text-[#FFD700] hover:underline font-medium cursor-pointer"
                  >
                    + Add inclusions
                  </button>
                </div>
              </div>
            </div>

            <!-- Action Controls -->
            <div class="pt-4 border-t border-white/[0.08] flex justify-between items-center">
              <button
                @click="openEditPackage(pkg)"
                class="cursor-pointer px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-neutral-200 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 class="w-3.5 h-3.5" />
                <span>Edit Package</span>
              </button>

              <button
                @click="deletePackage(pkg.id)"
                class="cursor-pointer text-neutral-400 hover:text-red-400 p-1.5 text-xs transition rounded-xl hover:bg-red-500/10"
                title="Delete Package"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State UI when no packages exist -->
    <div
      v-else
      class="flex justify-center items-center py-12 w-full"
    >
      <div class="text-center py-16 px-8 bg-[#141414] border border-white/[0.08] rounded-3xl space-y-4 max-w-lg w-full shadow-2xl">
        <div class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-400">
          <Tag class="w-6 h-6 text-neutral-400" />
        </div>
        <div class="space-y-1.5">
          <h3 class="text-base font-bold text-white">No Service Packages Created Yet</h3>
          <p class="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Create customized pricing packages for Weddings, Birthdays, Debuts, and Studio Sessions with toggleable master inclusions.
          </p>
        </div>
        <div class="pt-2">
          <button
            @click="openNewPackage"
            class="cursor-pointer px-6 py-2.5 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 inline-flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            <span>Add First Package</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- PACKAGE ADD / EDIT MODAL WITH TOGGLEABLE MASTER INCLUSIONS -->
    <!-- ======================================================== -->
    <div
      v-if="editingPackage"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] p-6 md:px-8 py-5 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">
              {{ editingPackage.id.startsWith('pkg_temp_') ? 'Add New Package' : 'Edit Package' }}
            </h3>
            <p class="text-xs text-neutral-400 mt-0.5">Configure package pricing, metadata, and select inclusions from the master list</p>
          </div>
          <button
            @click="editingPackage = null"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
            title="Close modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Body Content -->
        <div class="flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Category</label>
              <select
                v-model="editingPackage.category"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              >
                <option v-for="cat in categories" :key="cat" :value="cat" class="bg-[#1a1a1a] text-white">{{ cat }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Package Title <span class="text-[#FFD700]">*</span></label>
              <input
                type="text"
                v-model="editingPackage.title"
                required
                placeholder="e.g. Gold Cinematic Wedding Package"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
            </div>
          </div>

          <!-- Pricing & Badge -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Regular Price (₱) <span class="text-[#FFD700]">*</span></label>
              <input
                type="number"
                v-model="editingPackage.price"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">
                Promo Price (₱)
                <span v-if="editingPackage.hide_price" class="text-[10px] text-neutral-500 font-normal">(disabled)</span>
              </label>
              <input
                type="number"
                v-model="editingPackage.promo_price"
                :disabled="editingPackage.hide_price"
                placeholder="Leave blank if none"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Badge (Optional)</label>
              <input
                type="text"
                v-model="editingPackage.badge"
                placeholder="e.g. Most Popular"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
            </div>
          </div>

          <!-- Hide / Mask Price Checkbox -->
          <div class="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="editingPackage.hide_price"
                class="w-4 h-4 rounded-md border border-white/20 bg-black/50 accent-[#FFD700] cursor-pointer"
              />
              <span class="text-xs text-neutral-300">
                Hide / Mask price on website (shows as <strong class="text-[#FFD700]">₱{{ formatMaskedPrice(editingPackage.price || 25000) }}</strong> with "Inquire to unlock" CTA)
              </span>
            </label>
          </div>

          <!-- ============================================== -->
          <!-- TOGGLEABLE INCLUSIONS FROM PACKAGE MASTER LIST -->
          <!-- ============================================== -->
          <div class="p-5 rounded-3xl bg-black/40 border border-white/[0.08] space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <label class="block text-sm font-semibold text-white">
                  <span>Select inclusion from the master list</span>
                </label>
              </div>

              <!-- Selected count & Reorder toggle -->
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full bg-white/10 text-neutral-200 text-xs font-mono font-semibold">
                  {{ editingPackage.features ? editingPackage.features.length : 0 }} Selected
                </span>
                <button
                  type="button"
                  @click="showSelectedReorder = !showSelectedReorder"
                  class="px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition cursor-pointer"
                  :class="[
                    showSelectedReorder
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                  ]"
                >
                  {{ showSelectedReorder ? 'Done Ordering' : 'Arrange Order' }}
                </button>
              </div>
            </div>

            <!-- Reorder / Selected Preview Tray (when activated) -->
            <div v-if="showSelectedReorder && editingPackage.features.length > 0" class="p-4 rounded-2xl bg-[#141414] border border-[#FFD700]/30 space-y-2">
              <div class="flex items-center justify-between text-xs text-neutral-300 mb-2 font-semibold">
                <span>Selected Inclusions Display Order:</span>
                <span class="text-[11px] text-neutral-500">Move up/down to adjust presentation order</span>
              </div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <div
                  v-for="(feat, idx) in editingPackage.features"
                  :key="idx"
                  class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="font-mono text-[#FFD700] text-[11px] w-5">{{ idx + 1 }}.</span>
                    <span class="truncate">{{ feat }}</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      @click="moveFeatureUp(idx)"
                      :disabled="idx === 0"
                      class="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="moveFeatureDown(idx)"
                      :disabled="idx === editingPackage.features.length - 1"
                      class="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="removeSelectedFeature(idx)"
                      class="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer"
                      title="Remove from package"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Search & Filter Controls -->
            <div class="flex flex-col sm:flex-row items-center gap-2.5">
              <div class="relative flex-1 w-full">
                <Search class="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  v-model="inclusionSearch"
                  placeholder="Search master inclusions..."
                  class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
                />
              </div>

              <!-- Filter pills -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="inclusionFilterMode = 'all'"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  :class="[
                    inclusionFilterMode === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/[0.03] text-neutral-400 hover:text-white'
                  ]"
                >
                  All ({{ masterInclusions.length }})
                </button>
                <button
                  type="button"
                  @click="inclusionFilterMode = 'selected'"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  :class="[
                    inclusionFilterMode === 'selected'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'bg-white/[0.03] text-neutral-400 hover:text-white'
                  ]"
                >
                  Selected ({{ editingPackage.features ? editingPackage.features.length : 0 }})
                </button>
              </div>
            </div>

            <!-- Toggleable Master Inclusions List -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              <button
                v-for="feat in filteredMasterInclusions"
                :key="feat"
                type="button"
                @click="toggleFeature(feat)"
                class="p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer"
                :class="[
                  isFeatureSelected(feat)
                    ? 'bg-[#FFD700]/10 border-[#FFD700]/40 text-white shadow-sm'
                    : 'bg-transparent border-white/[0.12] text-neutral-300 hover:bg-white/[0.04] hover:border-white/25'
                ]"
              >
                <span class="text-xs leading-snug break-words flex-1" :class="{ 'font-semibold text-white': isFeatureSelected(feat) }">
                  {{ feat }}
                </span>

                <!-- Checkbox / Indicator -->
                <div
                  class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition"
                  :class="[
                    isFeatureSelected(feat)
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'border border-white/20 group-hover:border-white/40'
                  ]"
                >
                  <Check v-if="isFeatureSelected(feat)" class="w-3 h-3 stroke-[3]" />
                </div>
              </button>

              <!-- Rich Empty State for Package Inclusion Picker -->
              <div
                v-if="filteredMasterInclusions.length === 0"
                class="col-span-full py-8 px-4 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-2.5"
              >
                <!-- Case A: Search has no results -->
                <template v-if="inclusionSearch.trim()">
                  <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                    <Search class="w-4 h-4 text-neutral-400" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-semibold text-white">No matching inclusions</p>
                    <p class="text-[11px] text-neutral-400 max-w-xs mx-auto">
                      No results for "<span class="text-neutral-200">{{ inclusionSearch }}</span>". Add it as a new inclusion below.
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="inclusionSearch = ''"
                    class="cursor-pointer px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] text-neutral-300 hover:text-white transition"
                  >
                    Clear search
                  </button>
                </template>

                <!-- Case B: 'selected' filter is active but nothing selected -->
                <template v-else-if="inclusionFilterMode === 'selected'">
                  <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                    <Check class="w-4 h-4 text-neutral-400" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-semibold text-white">No inclusions selected yet</p>
                    <p class="text-[11px] text-neutral-400 max-w-xs mx-auto">
                      Toggle inclusions from the 'All' tab to attach them to this package.
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="inclusionFilterMode = 'all'"
                    class="cursor-pointer px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] text-neutral-300 hover:text-white transition"
                  >
                    View all inclusions
                  </button>
                </template>

                <!-- Case C: Master list is completely empty -->
                <template v-else>
                  <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                    <ListFilter class="w-4 h-4 text-neutral-400" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-semibold text-white">No master inclusions available</p>
                    <p class="text-[11px] text-neutral-400 max-w-xs mx-auto">
                      Type an inclusion below and click 'Add & Select' to add it to your master list.
                    </p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Quick Add New Inclusion to Master List -->
            <div class="pt-3 border-t border-white/[0.06] flex items-center gap-2">
              <input
                type="text"
                v-model="inlineNewInclusion"
                @keyup.enter="handleAddInlineInclusion"
                placeholder="Can't find an inclusion? Add new to master list..."
                class="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
              <button
                type="button"
                @click="handleAddInlineInclusion"
                class="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add & Select</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Fixed Footer Actions -->
        <div class="flex justify-end items-center gap-3 p-6 md:px-8 py-4 border-t border-white/[0.08] bg-[#141414] shrink-0">
          <button
            @click="editingPackage = null"
            class="cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            class="cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/20 text-center flex items-center justify-center"
          >
            Save Package
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- PACKAGE MASTER LIST MANAGEMENT MODAL -->
    <!-- ======================================================== -->
    <div
      v-if="showMasterListModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] p-6 md:px-8 py-5 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">
              <span>Package Master List</span>
            </h3>
            <p class="text-xs text-neutral-400 mt-0.5">
              Standardized inclusions and deliverables used across studio packages
            </p>
          </div>
          <button
            @click="showMasterListModal = false"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
            title="Close modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Body Content -->
        <div class="flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-4">
          <!-- Add New Master Inclusion -->
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Add New Master Inclusion</label>
            <div class="flex gap-2">
              <input
                type="text"
                v-model="newMasterInclusionInput"
                @keyup.enter="handleAddMasterInclusion"
                placeholder="e.g. 2 Professional Videographers..."
                class="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
              <button
                @click="handleAddMasterInclusion"
                type="button"
                class="cursor-pointer px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#141414] text-xs font-bold uppercase tracking-wider hover:bg-yellow-400 transition flex items-center gap-1.5 shrink-0"
              >
                <Plus class="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="relative">
            <Search class="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              v-model="masterListSearch"
              placeholder="Search master inclusions..."
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
            />
          </div>

          <!-- Master List Items -->
          <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <div
              v-for="item in filteredManagerMasterList"
              :key="item"
              class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 text-xs text-neutral-200 hover:border-white/20 transition"
            >
              <!-- In-place edit mode -->
              <template v-if="editingMasterItem.oldVal === item">
                <input
                  type="text"
                  v-model="editingMasterItem.newVal"
                  @keyup.enter="saveEditMasterItem"
                  class="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.08] border border-white/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                  autofocus
                />
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    @click="saveEditMasterItem"
                    class="px-3 py-1 rounded-lg bg-[#FFD700] text-[#141414] font-bold text-[11px] cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    @click="cancelEditMasterItem"
                    class="px-2.5 py-1 rounded-lg bg-white/10 text-neutral-300 text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </template>

              <!-- Standard view mode -->
              <template v-else>
                <div class="flex items-center gap-2.5 min-w-0">
                  <Check class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span class="break-words">{{ item }}</span>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    @click="startEditMasterItem(item)"
                    class="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                    title="Edit Master Inclusion"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="promptDeleteInclusion(item)"
                    class="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete from Master List"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </template>
            </div>

            <!-- Rich Empty State for Master List Manager -->
            <div
              v-if="filteredManagerMasterList.length === 0"
              class="py-12 px-4 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-3"
            >
              <!-- Case 1: Search has no results -->
              <template v-if="masterListSearch.trim()">
                <div class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                  <Search class="w-5 h-5 text-neutral-400" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-sm font-semibold text-white">No matching inclusions</h4>
                  <p class="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    No deliverables found matching "<span class="text-neutral-200 font-medium">{{ masterListSearch }}</span>".
                  </p>
                </div>
                <button
                  type="button"
                  @click="masterListSearch = ''"
                  class="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition mt-1"
                >
                  Clear search filter
                </button>
              </template>

              <!-- Case 2: Master list has 0 items -->
              <template v-else>
                <div class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                  <ListFilter class="w-5 h-5 text-neutral-400" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-sm font-semibold text-white">No Master Inclusions Yet</h4>
                  <p class="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    Your studio deliverables list is currently empty. Use the input box above to add your standardized package features.
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Fixed Footer Actions -->
        <div class="flex justify-end p-6 md:px-8 py-4 border-t border-white/[0.08] bg-[#141414] shrink-0">
          <button
            @click="showMasterListModal = false"
            class="cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-md text-center flex items-center justify-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MASTER INCLUSION DELETE CONFIRMATION MODAL               -->
    <!-- ======================================================== -->
    <div
      v-if="inclusionToDelete"
      class="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4 select-none"
    >
      <div class="bg-[#141414] border border-white/[0.14] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl overflow-hidden">
        <!-- Icon & Header -->
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>

          <div class="space-y-1 flex-1 min-w-0">
            <h3 class="text-base font-bold text-white tracking-wide">Delete Master Inclusion?</h3>
            <p class="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to remove <strong class="text-white font-semibold">"{{ inclusionToDelete }}"</strong> from the master deliverables list?
            </p>
          </div>
        </div>

        <!-- Warning Callout Box -->
        <div class="p-3.5 rounded-2xl bg-red-500/[0.08] border border-red-500/20 text-xs text-red-300 leading-relaxed space-y-1.5">
          <p class="font-bold text-red-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <AlertTriangle class="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Warning: Cascade Removal</span>
          </p>
          <p class="text-[11px] text-neutral-300">
            Deleting this inclusion will permanently remove it from the master list and <strong class="text-red-300 font-semibold">remove it from every package</strong> where it is currently included ({{ affectedPackagesCount }} active {{ affectedPackagesCount === 1 ? 'package' : 'packages' }} affected).
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end items-center gap-2.5 pt-2">
          <button
            type="button"
            @click="cancelDeleteInclusion"
            class="cursor-pointer px-5 py-2.5 min-w-[100px] rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeleteInclusion"
            class="cursor-pointer px-5 py-2.5 min-w-[110px] rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
