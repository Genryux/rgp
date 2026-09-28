<script setup>
import { ref, computed, watch } from 'vue';
import { Check, ChevronDown, ArrowRight } from '@lucide/vue';
import { useInquiryAttachment } from '../../../composables/useInquiryAttachment';

const props = defineProps({
  addonPackages: {
    type: Array,
    default: () => [],
  },
  availablePackages: {
    type: Array,
    default: () => [],
  },
  selectedCategory: {
    type: String,
    default: '',
  },
  initialSelectedPackageId: {
    type: String,
    default: '',
  },
});

const { attachedBundle, attachPackageWithAddons } = useInquiryAttachment();

// Selection state for add-on items (Key: `${addonPkg.id}_${itemIndex}`)
const selectedAddonKeys = ref(new Set());

function toggleAddonItem(itemKey) {
  const next = new Set(selectedAddonKeys.value);
  if (next.has(itemKey)) {
    next.delete(itemKey);
  } else {
    next.add(itemKey);
  }
  selectedAddonKeys.value = next;
}

function isAddonItemSelected(itemKey) {
  return selectedAddonKeys.value.has(itemKey);
}

function parseAddonFeature(feat) {
  if (!feat) return { title: '', price: '' };
  if (typeof feat === 'object') {
    const title = feat.title || feat.name || '';
    const price = feat.price ? `₱${Number(feat.price).toLocaleString('en-PH')}` : '';
    return { title, price };
  }
  if (typeof feat !== 'string') return { title: String(feat), price: '' };
  if (feat.includes('+')) {
    const parts = feat.split('+');
    const title = parts[0].trim();
    let pricePart = parts.slice(1).join('+').trim();
    if (!pricePart.startsWith('₱') && !pricePart.startsWith('PHP')) {
      const num = Number(pricePart.replace(/[^\d.]/g, ''));
      if (!isNaN(num) && num > 0) {
        pricePart = `₱${num.toLocaleString('en-PH')}`;
      } else {
        pricePart = `+ ${pricePart}`;
      }
    }
    return { title, price: pricePart };
  }
  return { title: feat.trim(), price: '' };
}

function extractNumericPrice(val) {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function getSelectedAddonsTotal(addonPkg) {
  if (!addonPkg || !Array.isArray(addonPkg.features)) return 0;
  let sum = 0;
  addonPkg.features.forEach((feat, idx) => {
    if (selectedAddonKeys.value.has(`${addonPkg.id}_${idx}`)) {
      const parsed = parseAddonFeature(feat);
      sum += extractNumericPrice(parsed.price);
    }
  });
  return sum;
}

function getSelectedAddonsCount(addonPkg) {
  if (!addonPkg || !Array.isArray(addonPkg.features)) return 0;
  let count = 0;
  addonPkg.features.forEach((feat, idx) => {
    if (selectedAddonKeys.value.has(`${addonPkg.id}_${idx}`)) {
      count++;
    }
  });
  return count;
}

function toggleSelectAllAddons(addonPkg) {
  if (!addonPkg || !Array.isArray(addonPkg.features)) return;
  const next = new Set(selectedAddonKeys.value);
  const allSelected = addonPkg.features.every((_, idx) =>
    next.has(`${addonPkg.id}_${idx}`)
  );
  if (allSelected) {
    addonPkg.features.forEach((_, idx) => {
      next.delete(`${addonPkg.id}_${idx}`);
    });
  } else {
    addonPkg.features.forEach((_, idx) => {
      next.add(`${addonPkg.id}_${idx}`);
    });
  }
  selectedAddonKeys.value = next;
}

// Base Package Attachment for Add-ons
const selectedAddonBasePackageId = ref(
  props.initialSelectedPackageId || attachedBundle.value?.package?.id || (props.availablePackages?.[0]?.id || '')
);

// Keep in sync with initialSelectedPackageId prop if passed (e.g. Spotlight)
watch(
  () => props.initialSelectedPackageId,
  (newId) => {
    if (newId) {
      selectedAddonBasePackageId.value = newId;
    }
  },
  { immediate: true }
);

// If user selected a package via package card, also reflect it here
watch(
  () => attachedBundle.value?.package?.id,
  (newPkgId) => {
    if (newPkgId && (props.availablePackages || []).some((p) => p.id === newPkgId)) {
      selectedAddonBasePackageId.value = newPkgId;
    }
  }
);

// Clear or validate selected package when category or available packages change
watch(
  () => [props.selectedCategory, props.availablePackages],
  () => {
    const list = props.availablePackages || [];
    if (list.length > 0) {
      const exists = list.some((p) => p.id === selectedAddonBasePackageId.value);
      if (!exists) {
        selectedAddonBasePackageId.value = props.initialSelectedPackageId || list[0].id;
      }
    } else {
      selectedAddonBasePackageId.value = '';
    }
  },
  { immediate: true }
);

const selectedAttachedPackage = computed(() => {
  if (!selectedAddonBasePackageId.value) return null;
  return (props.availablePackages || []).find((p) => p.id === selectedAddonBasePackageId.value) || null;
});

const hasSelectedPackage = computed(() => {
  return Boolean(selectedAddonBasePackageId.value && selectedAttachedPackage.value);
});

function handleInquireAddons(addonPkg) {
  if (!hasSelectedPackage.value) return;

  const selectedItems = [];
  if (addonPkg && Array.isArray(addonPkg.features)) {
    addonPkg.features.forEach((feat, idx) => {
      if (selectedAddonKeys.value.has(`${addonPkg.id}_${idx}`)) {
        selectedItems.push(parseAddonFeature(feat));
      }
    });
  }

  const basePkg = selectedAttachedPackage.value;
  attachPackageWithAddons(basePkg, selectedItems, props.selectedCategory);
}
</script>

<template>
  <div v-if="addonPackages && addonPackages.length > 0" class="space-y-6 font-manrope">
    <div
      v-for="addonPkg in addonPackages"
      :key="addonPkg.id"
      class="rounded-3xl p-5 sm:p-6 bg-[#0f0f0f] border border-white/10 transition shadow-2xl"
    >
      <!-- Card Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-white/10">
        <div>
          <div class="flex items-center gap-2.5">
            <h3 class="text-xl sm:text-2xl font-bebas text-white tracking-wide">
              Add-ons
            </h3>
            <span
              v-if="addonPkg.badge && !addonPkg.badge.toUpperCase().includes('ADD') && !addonPkg.badge.toUpperCase().includes('DELIVERABLE')"
              class="px-2 py-0.5 rounded-full bg-[#FFD700] text-[#141414] text-[10px] font-bold uppercase tracking-wider shadow-sm"
            >
              {{ addonPkg.badge }}
            </span>
          </div>
          <p class="text-xs text-neutral-400 font-nuosu mt-0.5">
            Select optional additions & bespoke upgrades available for {{ selectedCategory || 'this tier' }}.
          </p>
        </div>

        <!-- Live Selection Indicator -->
        <div v-if="getSelectedAddonsCount(addonPkg) > 0" class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-manrope font-medium text-[#FFD700]">
            {{ getSelectedAddonsCount(addonPkg) }} selected
          </span>
        </div>
      </div>

      <!-- Package Selection Dropdown -->
      <div
        v-if="availablePackages && availablePackages.length > 0"
        class="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
      >
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-neutral-300 font-manrope shrink-0">
            Select Package:
          </span>
          <span class="text-[11px] text-neutral-500 font-nuosu hidden md:inline">
            (Link these add-ons to a package tier)
          </span>
        </div>

        <div class="relative w-full sm:w-auto sm:min-w-[240px] md:min-w-[280px]">
          <select
            v-model="selectedAddonBasePackageId"
            class="w-full px-3 py-1.5 rounded-lg bg-[#141414] border text-xs font-manrope focus:outline-none focus:border-[#FFD700] transition appearance-none cursor-pointer pr-8 truncate"
            :class="selectedAddonBasePackageId ? 'border-[#FFD700]/50 text-white' : 'border-white/20 text-neutral-400'"
          >
            <option value="" disabled class="bg-neutral-900 text-neutral-400">
              Select a package to link add-ons...
            </option>
            <option
              v-for="p in availablePackages"
              :key="p.id"
              :value="p.id"
              class="bg-neutral-900 text-white"
            >
              {{ p.title || p.name }}
            </option>
          </select>
          <ChevronDown class="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <!-- Selectable Add-on Items Grid (Compact) -->
      <div class="mt-4">
        <div
          v-if="addonPkg.features && addonPkg.features.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3"
        >
          <div
            v-for="(feat, idx) in addonPkg.features"
            :key="idx"
            @click="toggleAddonItem(`${addonPkg.id}_${idx}`)"
            class="group flex items-center justify-between gap-2.5 py-2.5 px-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none"
            :class="[
              isAddonItemSelected(`${addonPkg.id}_${idx}`)
                ? 'bg-white/[0.06] border-[#FFD700]/70 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06] hover:border-white/15 text-neutral-300'
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <!-- Compact Checkbox Box -->
              <div
                class="w-4 h-4 rounded-md flex items-center justify-center transition shrink-0 border"
                :class="[
                  isAddonItemSelected(`${addonPkg.id}_${idx}`)
                    ? 'bg-[#FFD700] border-[#FFD700] text-[#141414]'
                    : 'border-white/20 bg-white/5 group-hover:border-white/30'
                ]"
              >
                <Check
                  v-if="isAddonItemSelected(`${addonPkg.id}_${idx}`)"
                  class="w-3 h-3 stroke-[2.5]"
                />
              </div>

              <!-- Title with Truncate -->
              <span
                class="text-xs font-medium truncate group-hover:text-white transition"
                :title="parseAddonFeature(feat).title"
              >
                {{ parseAddonFeature(feat).title }}
              </span>
            </div>

            <!-- Price on Right Side -->
            <span
              v-if="parseAddonFeature(feat).price"
              class="shrink-0 font-mono text-xs font-bold text-[#FFD700] pl-2 text-right"
            >
              {{ parseAddonFeature(feat).price }}
            </span>
          </div>
        </div>

        <div
          v-else
          class="py-6 px-4 rounded-xl border border-dashed border-white/10 text-center text-neutral-400 text-xs font-nuosu"
        >
          No add-on items configured for this category yet.
        </div>
      </div>

      <!-- Card Footer / Interactive Computation & Actions -->
      <div class="mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <!-- Quick Select / Deselect All -->
          <button
            type="button"
            @click="toggleSelectAllAddons(addonPkg)"
            class="text-[11px] font-manrope text-neutral-400 hover:text-white transition underline underline-offset-4 cursor-pointer"
          >
            {{
              addonPkg.features && addonPkg.features.every((_, idx) => isAddonItemSelected(`${addonPkg.id}_${idx}`))
                ? 'Deselect All'
                : 'Select All'
            }}
          </button>

          <div class="h-3 w-px bg-white/10 hidden sm:block"></div>

          <!-- Selected Summary -->
          <div class="text-xs font-manrope">
            <template v-if="getSelectedAddonsCount(addonPkg) > 0">
              <div class="flex flex-wrap items-baseline gap-1.5">
                <span class="text-neutral-400">Total Selected:</span>
                <span class="ml-1 font-mono font-bold text-[#FFD700] text-xs sm:text-sm">
                  +₱{{ Number(getSelectedAddonsTotal(addonPkg)).toLocaleString('en-PH') }}
                </span>
                <span v-if="selectedAttachedPackage" class="text-neutral-400 text-[11px]">
                  (linked with {{ selectedAttachedPackage.title || selectedAttachedPackage.name }})
                </span>
              </div>
            </template>
            <template v-else-if="!hasSelectedPackage">
              <span class="text-neutral-400 text-xs">
                Select a package above to link your add-ons
              </span>
            </template>
            <template v-else>
              <span class="text-neutral-400 text-xs">
                Linked to {{ selectedAttachedPackage.title || selectedAttachedPackage.name }} — click items above to select add-ons
              </span>
            </template>
          </div>
        </div>

        <!-- CTA Button -->
        <div>
          <button
            type="button"
            :disabled="!hasSelectedPackage || getSelectedAddonsCount(addonPkg) === 0"
            @click="handleInquireAddons(addonPkg)"
            class="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-sm"
            :class="[
              hasSelectedPackage && getSelectedAddonsCount(addonPkg) > 0
                ? 'bg-[#FFD700] text-[#141414] hover:bg-yellow-400 cursor-pointer active:scale-95'
                : 'bg-white/5 border border-white/10 text-neutral-500 cursor-not-allowed opacity-60'
            ]"
          >
            <span>
              {{
                !hasSelectedPackage
                  ? 'Select package above'
                  : (getSelectedAddonsCount(addonPkg) > 0
                      ? `Inquire with ${getSelectedAddonsCount(addonPkg)} Add-on${getSelectedAddonsCount(addonPkg) > 1 ? 's' : ''}`
                      : 'Select add-ons to include')
              }}
            </span>
            <ArrowRight v-if="hasSelectedPackage && getSelectedAddonsCount(addonPkg) > 0" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
