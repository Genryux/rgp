<script setup>
import { computed } from 'vue';
import { Check } from '@lucide/vue';
import { useInquiryAttachment, extractNumericPrice } from '../../../composables/useInquiryAttachment';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';

const props = defineProps({
  allowClear: {
    type: Boolean,
    default: true,
  },
  currentCategory: {
    type: String,
    default: '',
  },
  customBundle: {
    type: Object,
    default: null,
  },
});

const { attachedBundle, clearAttachment } = useInquiryAttachment();
const { packages, isGlobalPriceMasked } = usePackages();

const effectiveCategory = computed(() => {
  return (
    props.customBundle?.category ||
    attachedBundle.value?.category ||
    attachedBundle.value?.package?.category ||
    props.currentCategory ||
    'Wedding'
  );
});

const effectivePackage = computed(() => {
  return props.customBundle?.package || attachedBundle.value?.package || null;
});

const displayedInclusions = computed(() => {
  if (!effectivePackage.value?.features) return [];
  if (Array.isArray(effectivePackage.value.features)) {
    return effectivePackage.value.features;
  }
  return [];
});

const attachedAddons = computed(() => {
  const list = props.customBundle?.addons || attachedBundle.value?.addons;
  if (!list || !Array.isArray(list)) return [];
  return list;
});

const addonsTotalAmount = computed(() => {
  return attachedAddons.value.reduce((sum, item) => {
    const priceStr = item.price || item.rawPrice || '';
    return sum + extractNumericPrice(priceStr);
  }, 0);
});

const isPackagePriceMasked = computed(() => {
  if (props.customBundle) return false;
  if (!effectivePackage.value) return false;
  return Boolean(isGlobalPriceMasked.value || effectivePackage.value.hide_price);
});

const formattedPackagePrice = computed(() => {
  if (!effectivePackage.value) return '0';
  const rawPrice = effectivePackage.value.promo_price ?? effectivePackage.value.price ?? effectivePackage.value.raw_price ?? 0;
  const numPrice = extractNumericPrice(rawPrice);
  if (isPackagePriceMasked.value) {
    return formatMaskedPrice(numPrice);
  }
  return Number(numPrice).toLocaleString('en-PH');
});

const formattedTotalDisplay = computed(() => {
  if (effectivePackage.value && addonsTotalAmount.value > 0) {
    const pkgPriceStr = `₱${formattedPackagePrice.value}`;
    const addonsStr = `₱${Number(addonsTotalAmount.value).toLocaleString('en-PH')}`;
    return `${pkgPriceStr} + ${addonsStr}`;
  } else if (effectivePackage.value) {
    return `₱${formattedPackagePrice.value}`;
  } else if (addonsTotalAmount.value > 0) {
    return `₱${Number(addonsTotalAmount.value).toLocaleString('en-PH')}`;
  }
  return '₱0';
});
</script>

<template>
  <div class="border-2 border-dashed border-[#FFD700] rounded-3xl p-5 sm:p-6 bg-black/40 backdrop-blur-md relative flex flex-col justify-between shadow-xl">
    <div>
      <!-- Inquiring for: [Category] -->
      <div class="flex items-center justify-between gap-2 mb-1">
        <p class="text-xs text-neutral-400 font-manrope">
          Inquiring for: <span class="text-[#FFD700] font-semibold">{{ effectiveCategory }}</span>
        </p>
        <button
          v-if="allowClear && !customBundle && (attachedBundle.package || attachedBundle.addons.length > 0)"
          type="button"
          @click="clearAttachment"
          class="text-[11px] font-manrope text-neutral-400 hover:text-white transition underline cursor-pointer"
          title="Remove attached package"
        >
          Remove
        </button>
      </div>

      <!-- Package Title -->
      <h3
        v-if="effectivePackage?.title || effectivePackage?.name"
        class="text-xl sm:text-2xl font-bebas text-white tracking-wide uppercase truncate"
        :title="effectivePackage.title || effectivePackage.name"
      >
        {{ effectivePackage.title || effectivePackage.name }}
      </h3>

      <!-- Package Price -->
      <div v-if="effectivePackage" class="my-2">
        <span class="text-3xl sm:text-4xl font-bebas text-[#FFD700] tracking-wider">
          ₱{{ formattedPackagePrice }}
        </span>
      </div>

      <!-- DELIVERABLES & INCLUSION -->
      <div v-if="effectivePackage" class="mt-4">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider font-manrope mb-2">
          DELIVERABLES &amp; INCLUSION
        </h4>
        <ul v-if="displayedInclusions.length > 0" class="space-y-1.5 text-xs text-neutral-300 font-nuosu">
          <li
            v-for="(feature, idx) in displayedInclusions"
            :key="idx"
            class="flex items-start gap-2"
          >
            <Check class="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <span class="truncate leading-relaxed" :title="feature">{{ feature }}</span>
          </li>
        </ul>
        <p v-else class="text-xs text-neutral-500 italic font-nuosu">
          Standard tier deliverables
        </p>
      </div>

      <!-- ADD-ONS -->
      <div class="mt-5">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider font-manrope mb-2">
          ADD-ONS
        </h4>
        <ul v-if="attachedAddons.length > 0" class="space-y-1.5 text-xs font-nuosu">
          <li
            v-for="(addon, idx) in attachedAddons"
            :key="idx"
            class="flex items-center justify-between gap-2"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <Check class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span class="truncate text-neutral-300 uppercase text-xs" :title="addon.title">
                {{ addon.title }}
              </span>
            </div>
            <span class="shrink-0 font-mono text-[#FFD700] text-xs font-semibold pl-2 text-right">
              {{ addon.price }}
            </span>
          </li>
        </ul>
        <p v-else class="text-xs text-neutral-400 font-nuosu py-0.5">
          No add-ons added
        </p>
      </div>
    </div>

    <!-- TOTAL -->
    <div class="mt-6 pt-3.5 border-t border-white/10 flex items-baseline justify-between gap-2">
      <span class="text-xs font-bold text-white uppercase tracking-wider font-manrope">TOTAL:</span>
      <span class="text-sm sm:text-base font-bold text-[#FFD700] font-bebas tracking-wide text-right">
        {{ formattedTotalDisplay }}
      </span>
    </div>
  </div>
</template>
