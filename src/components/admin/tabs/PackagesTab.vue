<script setup>
import { ref, watch } from 'vue';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';
import { useModalState } from '../../../composables/useModalState';
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
} from '@lucide/vue';

const {
  packages,
  isGlobalPriceMasked,
  toggleGlobalPriceMask,
  togglePackagePriceMask,
  savePackage,
  deletePackage,
  togglePackageActive,
} = usePackages();

const { openModal, closeModal } = useModalState();

const editingPackage = ref(null);
const newFeatureInput = ref('');

watch(
  () => Boolean(editingPackage.value),
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) openModal();
    else if (!isOpen && wasOpen) closeModal();
  }
);

const categories = [
  'Weddings',
  'Birthdays & Debuts',
  'Portraits & Studio',
  'Graduation',
  'Commercial',
  'Other',
];

function openNewPackage() {
  editingPackage.value = {
    id: `pkg_temp_${Date.now()}`,
    category: 'Weddings',
    title: '',
    price: 15000,
    promo_price: null,
    badge: '',
    features: ['Full Event Coverage', 'Enhanced High-Res Photos', 'Private Online Gallery'],
    is_featured: false,
    is_active: true,
    hide_price: false,
  };
}

function openEditPackage(pkg) {
  editingPackage.value = JSON.parse(JSON.stringify(pkg));
  if (editingPackage.value.hide_price === undefined) {
    editingPackage.value.hide_price = false;
  }
}

function addFeature() {
  if (!newFeatureInput.value.trim()) return;
  if (!editingPackage.value.features) editingPackage.value.features = [];
  editingPackage.value.features.push(newFeatureInput.value.trim());
  newFeatureInput.value = '';
}

function removeFeature(index) {
  editingPackage.value.features.splice(index, 1);
}

async function handleSave() {
  if (!editingPackage.value.title) return;
  // If price is masked, clear promo_price
  if (editingPackage.value.hide_price) {
    editingPackage.value.promo_price = null;
  }
  await savePackage(editingPackage.value);
  editingPackage.value = null;
}
</script>

<template>
  <div class="space-y-8 font-manrope">
    <!-- Header with Global Price Masking Switch & Add Button -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Services & Rates Manager</h2>
        <p class="text-xs text-neutral-400 mt-0.5">Create, update, and manage pricing packages displayed on your website</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Global Price Mask Toggle Button -->
        <button
          @click="toggleGlobalPriceMask"
          class="px-4 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-2 shadow-md"
          :class="[
            isGlobalPriceMasked
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-white/[0.05] border-white/[0.08] text-neutral-300 hover:text-white'
          ]"
          :title="isGlobalPriceMasked ? 'Public prices currently masked as 2?,???' : 'Public prices show full amount'"
        >
          <component :is="isGlobalPriceMasked ? EyeOff : Eye" class="w-4 h-4" />
          <span>{{ isGlobalPriceMasked ? 'Mask All Prices (2?,???) Active' : 'Mask All Prices' }}</span>
        </button>

        <button
          @click="openNewPackage"
          class="px-5 py-2.5 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>
    </div>

    <!-- Package Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="rounded-3xl p-6 bg-[#141414] border border-white/[0.08] flex flex-col justify-between relative group hover:border-white/[0.18] transition shadow-xl"
      >
        <div>
          <!-- Header with Active Status -->
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-[#FFD700]">{{ pkg.category }}</span>
            <button
              @click="togglePackageActive(pkg.id)"
              class="px-3 py-1 rounded-full text-[10px] font-semibold transition"
              :class="[
                pkg.is_active
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/[0.04] text-neutral-500 border border-white/[0.08]'
              ]"
            >
              {{ pkg.is_active ? 'Active' : 'Inactive' }}
            </button>
          </div>

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

            <!-- Eye Mask Toggle Button Directly Beside Pricing -->
            <button
              @click="togglePackagePriceMask(pkg.id)"
              class="p-1 rounded-lg transition"
              :class="[
                (pkg.hide_price || isGlobalPriceMasked)
                  ? 'text-amber-400 hover:bg-amber-400/10'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
              ]"
              :title="pkg.hide_price ? 'Price is masked (Click to reveal)' : 'Price is visible (Click to mask)'"
            >
              <component :is="(pkg.hide_price || isGlobalPriceMasked) ? EyeOff : Eye" class="w-4 h-4" />
            </button>
          </div>

          <!-- Inclusions List -->
          <ul class="space-y-2 text-xs text-neutral-300 mb-6">
            <li v-for="(feat, idx) in pkg.features" :key="idx" class="flex items-start gap-2">
              <Check class="w-3.5 h-3.5 text-[#FFD700] flex-shrink-0 mt-0.5" />
              <span>{{ feat }}</span>
            </li>
          </ul>
        </div>

        <!-- Action Controls -->
        <div class="pt-4 border-t border-white/[0.08] flex justify-between items-center">
          <button
            @click="openEditPackage(pkg)"
            class="px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-[#FFD700] hover:text-black text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            @click="deletePackage(pkg.id)"
            class="text-neutral-500 hover:text-red-400 p-1 text-xs transition"
            title="Delete Package"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Edit/Add Modal -->
    <div
      v-if="editingPackage"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-4">
          <h3 class="text-xl font-bold text-white tracking-wide">
            {{ editingPackage.id.startsWith('pkg_temp_') ? 'Add New Package' : 'Edit Package' }}
          </h3>
          <button @click="editingPackage = null" class="text-neutral-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Category</label>
              <select
                v-model="editingPackage.category"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              >
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Package Title *</label>
              <input
                type="text"
                v-model="editingPackage.title"
                required
                placeholder="e.g. Gold Cinematic Wedding"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Regular Price (₱) *</label>
              <input
                type="number"
                v-model="editingPackage.price"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>

            <!-- Promo Price Field (Disabled if hide_price is active) -->
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                Promo Price (₱)
                <span v-if="editingPackage.hide_price" class="text-[10px] text-neutral-500 lowercase">(disabled)</span>
              </label>
              <input
                type="number"
                v-model="editingPackage.promo_price"
                :disabled="editingPackage.hide_price"
                placeholder="Leave blank if none"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Badge (Optional)</label>
              <input
                type="text"
                v-model="editingPackage.badge"
                placeholder="e.g. Most Popular"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          <!-- Clean standard input checkbox for Hide / Mask Price -->
          <div class="pt-1">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="editingPackage.hide_price"
                class="w-4 h-4 rounded-md border border-white/20 bg-black/50 accent-[#FFD700] cursor-pointer"
              />
              <span class="text-xs text-neutral-300">
                Hide / Mask price on website (shows as <strong class="text-[#FFD700]">₱{{ formatMaskedPrice(editingPackage.price || 25000) }}</strong> and disables promo price)
              </span>
            </label>
          </div>

          <!-- Inclusions List Editor -->
          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Package Inclusions</label>
            <div class="space-y-2 mb-3">
              <div
                v-for="(feat, idx) in editingPackage.features"
                :key="idx"
                class="flex items-center gap-2"
              >
                <input
                  type="text"
                  v-model="editingPackage.features[idx]"
                  class="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs"
                />
                <button
                  @click="removeFeature(idx)"
                  class="text-neutral-500 hover:text-red-400 p-1.5"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Add feature input -->
            <div class="flex gap-2">
              <input
                type="text"
                v-model="newFeatureInput"
                @keyup.enter="addFeature"
                placeholder="Add inclusion (e.g. 2 Photographers)..."
                class="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#FFD700]"
              />
              <button
                @click="addFeature"
                type="button"
                class="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            @click="editingPackage = null"
            class="px-5 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            class="px-6 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 transition"
          >
            Save Package
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
