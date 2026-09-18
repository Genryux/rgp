<script setup>
import { ref, computed, watch, watchEffect, nextTick, onMounted, onUnmounted } from 'vue';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';
import { useGallery } from '../../../composables/useGallery';
import { Check, Sparkles, Plus, Star, ShieldCheck, ArrowRight } from '@lucide/vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'pricing_tiered', // pricing_tiered | pricing_spotlight | pricing_addons | pricing_comparison
  },
});

const { packages, isGlobalPriceMasked } = usePackages();

const currentVariant = computed(() => {
  return props.content?.variant || props.variant || 'pricing_tiered';
});

const activePackages = computed(() =>
  packages.value.filter((p) => p.is_active)
);

const categories = computed(() => {
  const source = activePackages.value.length > 0
    ? activePackages.value
    : (props.content?.plans && props.content.plans.length > 0 ? props.content.plans : []);
  const set = new Set(source.map((p) => p.category || 'Standard').filter(Boolean));
  return Array.from(set);
});

const selectedCategory = ref('');

// Auto-select first category when categories load or change
watchEffect(() => {
  if (categories.value.length > 0) {
    if (!selectedCategory.value || !categories.value.includes(selectedCategory.value)) {
      selectedCategory.value = categories.value[0];
    }
  } else {
    selectedCategory.value = '';
  }
});

// Sliding capsule state and measurement
const filterButtonRefs = ref(new Map());

function setFilterBtnRef(el, cat) {
  if (el) {
    filterButtonRefs.value.set(cat, el);
  } else {
    filterButtonRefs.value.delete(cat);
  }
}

const pillState = ref({ left: 0, width: 0, opacity: 0 });

function updatePillPosition() {
  const el = filterButtonRefs.value.get(selectedCategory.value);
  if (el) {
    pillState.value = {
      left: el.offsetLeft,
      width: el.offsetWidth,
      opacity: 1,
    };
  } else {
    pillState.value.opacity = 0;
  }
}

watch(
  [selectedCategory, categories, currentVariant],
  () => {
    nextTick(() => {
      updatePillPosition();
    });
  },
  { immediate: true, flush: 'post' }
);

onMounted(() => {
  nextTick(() => {
    updatePillPosition();
  });
  window.addEventListener('resize', updatePillPosition);
});

onUnmounted(() => {
  window.removeEventListener('resize', updatePillPosition);
});

const filteredPackages = computed(() => {
  if (!selectedCategory.value) return activePackages.value;
  return activePackages.value.filter((p) => (p.category || 'Standard') === selectedCategory.value);
});

function formatPrice(amount) {
  if (!amount) return '0';
  return Number(amount).toLocaleString('en-PH');
}

// A La Carte Deliverables Defaults & State (pricing_addons variant)
const defaultAddons = [
  {
    id: 'addon_sde',
    title: '4K Same-Day-Edit (SDE) Video Reel',
    subtext: 'High-energy cinematic teaser edited live on-site and premiered during your reception program.',
    price: 15000,
    promo_price: null,
    badge: 'Most Requested',
    is_featured: true,
    inclusion_title: "What's Included:",
    features: [
      'Dedicated on-site senior cinema editor',
      'Projection-ready 4K master export',
      'Licensed cinematic score & sound design',
      'Same-evening cloud delivery for social sharing',
    ],
    button_text: 'Inquire Add-on',
  },
  {
    id: 'addon_drone',
    title: 'Licensed 4K Aerial Drone Coverage',
    subtext: 'Cinematic aerial cinematography capturing sweeping venue, coastline, and ceremony vistas.',
    price: 8000,
    promo_price: null,
    badge: 'Popular Upgrade',
    is_featured: false,
    inclusion_title: "What's Included:",
    features: [
      'CAAP / FAA certified professional drone pilot',
      'Up to 3 cinematic aerial flight sessions',
      'High-bitrate 4K 60fps landscape establishing shots',
      'Integrated seamlessly into final highlight films',
    ],
    button_text: 'Inquire Add-on',
  },
  {
    id: 'addon_album',
    title: 'Luxury Hardbound Leather Photo Album',
    subtext: 'Heirloom archival fine-art album handcrafted in genuine Florence leather with custom foil debossing.',
    price: 12000,
    promo_price: null,
    badge: 'Studio Signature',
    is_featured: false,
    inclusion_title: "What's Included:",
    features: [
      '10x10 Hardbound 40-page archival layout',
      'Handcrafted genuine Italian leather binding',
      'Ultra-thick layflat fine-art photo paper',
      'Custom gold foil debossing & archival storage box',
    ],
    button_text: 'Inquire Add-on',
  },
  {
    id: 'addon_prenup',
    title: 'Pre-Wedding / Prenup Visual Session',
    subtext: 'Editorial scenic destination photoshoot documenting your authentic love story.',
    price: 18000,
    promo_price: 16000,
    badge: 'Best Value',
    is_featured: true,
    inclusion_title: "What's Included:",
    features: [
      'Half-day creative destination photoshoot',
      '2 Photographers + 1 Cinematographer',
      '30 High-end magazine retouched digital portraits',
      '1-2 Minute Save-the-Date video teaser',
    ],
    button_text: 'Inquire Add-on',
  },
  {
    id: 'addon_raw',
    title: 'RAW Footage & Master Archives on SSD',
    subtext: 'Complete uncompressed high-bitrate video footage and RAW photographic files on physical hardware.',
    price: 5000,
    promo_price: null,
    badge: null,
    is_featured: false,
    inclusion_title: "What's Included:",
    features: [
      'Complete unedited camera takes & b-roll',
      'Full-resolution RAW photographic master files',
      'Delivered on rugged portable 1TB SSD',
      'Lifetime personal archiving & printing rights',
    ],
    button_text: 'Inquire Add-on',
  },
  {
    id: 'addon_overtime',
    title: 'Overtime Coverage (Per Hour)',
    subtext: 'Keep our full camera team shooting past standard contracted hours for late-night afterparties.',
    price: 3500,
    promo_price: null,
    badge: null,
    is_featured: false,
    inclusion_title: "What's Included:",
    features: [
      'Full camera crew remains active on-site',
      'Captures late-night celebrations and send-offs',
      'All additional photos processed and color-graded',
      'Billed strictly per extra hour requested',
    ],
    button_text: 'Inquire Add-on',
  },
];

const displayAddons = computed(() => {
  if (Array.isArray(props.content?.addons) && props.content.addons.length > 0) {
    return props.content.addons.map((a, i) => ({
      id: a.id || `addon_${i}`,
      title: a.title || 'Add-on Deliverable',
      subtext: a.subtext || a.desc || '',
      price: a.price,
      promo_price: a.promo_price || null,
      badge: a.badge || null,
      is_featured: Boolean(a.is_featured || a.badge),
      inclusion_title: a.inclusion_title || "What's Included:",
      features: Array.isArray(a.features) && a.features.length > 0
        ? a.features
        : (a.desc ? [a.desc] : ['Professional studio production & delivery']),
      button_text: a.button_text || props.content?.button_text || 'Inquire Add-on',
      hide_price: Boolean(a.hide_price),
    }));
  }
  return defaultAddons;
});

function formatAddonPrice(amount) {
  if (!amount && amount !== 0) return '0';
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^\d.]/g, '');
    if (cleaned && !isNaN(Number(cleaned))) {
      return Number(cleaned).toLocaleString('en-PH');
    }
    return amount.replace('₱', '').trim();
  }
  return Number(amount).toLocaleString('en-PH');
}

function formatMaskedAddonPrice(amount) {
  if (!amount && amount !== 0) return '0';
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^\d.]/g, '');
    if (cleaned && !isNaN(Number(cleaned))) {
      return formatMaskedPrice(Number(cleaned));
    }
    return formatMaskedPrice(amount);
  }
  return formatMaskedPrice(amount);
}

// A La Carte Deliverables Dynamic Folder Showcase Background
const { gallery } = useGallery();

const folderBgImages = computed(() => {
  if (props.content?.bg_type === 'image' && props.content?.bg_source === 'folder' && props.content?.bg_folder) {
    const matched = (gallery.value || []).filter((i) => i.category === props.content.bg_folder);
    if (matched.length > 0) {
      return matched.map((i) => i.image_url);
    }
  }
  return [];
});

const currentBgSlideIndex = ref(0);
let bgSlideshowTimer = null;

function startBgSlideshow() {
  stopBgSlideshow();
  if (folderBgImages.value.length > 1) {
    bgSlideshowTimer = setInterval(() => {
      currentBgSlideIndex.value = (currentBgSlideIndex.value + 1) % folderBgImages.value.length;
    }, 6000);
  }
}

function stopBgSlideshow() {
  if (bgSlideshowTimer) {
    clearInterval(bgSlideshowTimer);
    bgSlideshowTimer = null;
  }
}

watch(
  folderBgImages,
  () => {
    currentBgSlideIndex.value = 0;
    startBgSlideshow();
  },
  { immediate: true }
);

onUnmounted(() => {
  stopBgSlideshow();
});

// Spotlight Pricing Plan State & Defaults (Exact 1:1 Layout with Studio Offerings)
const defaultSpotlightPlans = [
  {
    id: 'essential',
    name: 'Essential Cinema Tier',
    price: '₱35,000',
    period: '/event',
    discountBadge: 'Save 20%',
    features: [
      'Full Day Creative Photo & Video Coverage',
      '2 Professional Cinematographers & Shooters',
      '4K Cinematic Highlight Film (3-5 mins)',
      'High-Resolution Master Photo Gallery',
      '48-Hour Sneak Peek Highlight Delivery',
      'Professional Audio Recording & Color Grading',
      'Online Cloud Gallery for 1 Full Year',
      'Fast 14-Day Final Delivery Turnaround',
      'Personalized Creative Consultation & Planning',
    ],
  },
  {
    id: 'signature',
    name: 'Signature Grand Master',
    price: '₱85,000',
    period: '/event',
    discountBadge: 'Save 10% Early Bird',
    features: [
      'Full Day Preparation, Ceremony & Reception Coverage',
      'Principal Photographer + 2 Associate Shooters',
      'Lead Cinematographer + Licensed Drone Pilot',
      '4K Same-Day-Edit (SDE) Video Reel for Reception',
      'Full 4K Extended Documentary Film (20-30 mins)',
      'Unlimited High-Resolution Enhanced Photos',
      '10x10 Handcrafted Leather Heirloom Album (40 Pages)',
      '48-Hour Highlight Sneak Peek Gallery',
      'RAW Uncompressed Media Archive Delivery',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate Luxury Royal',
    price: '₱135,000',
    period: '/event',
    discountBadge: 'Save 15%',
    features: [
      'Unlimited Multi-Day Full Event Coverage',
      'Dual Lead Shooters + Full 6-Person Production Crew',
      'Dual 5.1K Cinema Drones with Dual Operator Support',
      '4K Same-Day-Edit (SDE) + 60-min Feature Film',
      '12x12 Master Album + 2 Matching Parent Heirloom Albums',
      'Pre-Wedding / Prenup Full-Day Cinema Session Included',
      'Live Video Projection Feed for Reception Program',
      'Dedicated Studio Concierge & Priority Turnaround',
      'Lifetime Cloud Archive + Master SSD Box Delivery',
    ],
  },
  {
    id: 'bespoke',
    name: 'Custom Bespoke Production',
    price: '₱180,000',
    period: '/custom',
    discountBadge: 'VIP Bespoke',
    features: [
      'Tailor-Made Production Crew & Equipment Sizing',
      'Destination & Multi-Location Travel Coverage',
      'Custom Film Score & Bespoke Sound Design',
      'Full Archival Hardbound Book Set',
      'VIP Direct Executive Producer Access',
      'Full Commercial & Broadcast Licensing',
    ],
  },
];

const spotlightPlans = computed(() => {
  if (props.content?.plans && props.content.plans.length > 0) {
    return props.content.plans.map((p) => ({
      ...p,
      display_price: p.hide_price || isGlobalPriceMasked.value
        ? `₱${formatMaskedPrice(p.raw_price || p.price)}`
        : (typeof p.price === 'number' ? `₱${formatPrice(p.promo_price || p.price)}` : p.price),
      original_price: !p.hide_price && !isGlobalPriceMasked.value && p.promo_price
        ? `₱${formatPrice(p.price)}`
        : null,
    }));
  }

  const sourcePackages = filteredPackages.value && filteredPackages.value.length > 0
    ? filteredPackages.value
    : activePackages.value;

  if (sourcePackages && sourcePackages.length > 0) {
    return sourcePackages.map((pkg) => ({
      id: pkg.id,
      name: pkg.title,
      category: pkg.category,
      raw_price: pkg.price,
      raw_promo_price: pkg.promo_price,
      display_price: pkg.hide_price || isGlobalPriceMasked.value
        ? `₱${formatMaskedPrice(pkg.price)}`
        : `₱${formatPrice(pkg.promo_price || pkg.price)}`,
      original_price: !pkg.hide_price && !isGlobalPriceMasked.value && pkg.promo_price
        ? `₱${formatPrice(pkg.price)}`
        : null,
      period: '/event',
      discountBadge: pkg.badge || (pkg.promo_price ? 'Promo Offer' : null),
      features: pkg.features && pkg.features.length > 0
        ? pkg.features
        : [
            'Professional event photo & cinema coverage',
            'Enhanced high-resolution digital masters',
            'Private cloud gallery access',
          ],
      is_featured: pkg.is_featured,
      hide_price: pkg.hide_price,
    }));
  }

  return defaultSpotlightPlans.map((p) => ({
    ...p,
    display_price: isGlobalPriceMasked.value ? `₱${formatMaskedPrice(p.price)}` : p.price,
  }));
});

const spotlightSelectedPlanId = ref('');

const activeSpotlightPlan = computed(() => {
  if (!spotlightPlans.value || spotlightPlans.value.length === 0) return null;
  const found = spotlightPlans.value.find((p) => p.id === spotlightSelectedPlanId.value);
  if (found) return found;
  const featured = spotlightPlans.value.find((p) => p.is_featured);
  return featured || spotlightPlans.value[0];
});

const currentSpotlightFeatures = computed(() => {
  return (
    activeSpotlightPlan.value?.features ||
    defaultSpotlightPlans[1].features
  );
});

// Comparison Matrix Data & Helpers
const matrixPackages = computed(() => {
  const source = filteredPackages.value && filteredPackages.value.length > 0
    ? filteredPackages.value
    : activePackages.value;
  return source;
});

const matrixFeatures = computed(() => {
  const set = new Set();
  const list = [];
  matrixPackages.value.forEach((pkg) => {
    if (Array.isArray(pkg.features)) {
      pkg.features.forEach((f) => {
        const str = typeof f === 'string' ? f.trim() : String(f);
        if (str && !set.has(str.toLowerCase())) {
          set.add(str.toLowerCase());
          list.push(str);
        }
      });
    }
  });

  if (list.length === 0) {
    return [
      'Full Day Coverage',
      'Principal Photographers & Cinematographers',
      '4K Cinematic Highlight Film',
      '4K Same-Day-Edit (SDE) Video Reel',
      'High-Resolution Master Photo Gallery',
      'Handcrafted Leather Heirloom Album',
      'Licensed 4K Aerial Drone Coverage',
      'RAW Footage & Master Archives',
      'Dedicated Online Cloud Gallery',
    ];
  }
  return list;
});

function packageHasFeature(pkg, featureName) {
  if (!pkg?.features || !Array.isArray(pkg.features)) return false;
  const target = featureName.toLowerCase().trim();
  return pkg.features.some(
    (f) => (typeof f === 'string' ? f.toLowerCase().trim() : String(f).toLowerCase().trim()) === target
  );
}
</script>

<template>
  <!-- ========================================== -->
  <!-- 1. 3-TIER LUXURY PRICING CARDS -->
  <!-- ========================================== -->
  <section
    v-if="currentVariant === 'pricing_tiered' || currentVariant === 'rates'"
    id="rates"
    class="py-24 bg-[#141414] border-b border-white/5 relative select-none font-manrope"
  >
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-3">
          {{ content.title || 'PACKAGES & RATES' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'Tailored full-coverage packages crafted for weddings, celebrations, and studio portraits.' }}
        </p>

        <!-- Category Filters -->
        <div v-if="categories.length > 1" class="flex justify-center mt-8">
          <div class="relative inline-flex flex-wrap items-center justify-center p-1.5 rounded-full bg-neutral-900/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-black/50 max-w-full">
            <!-- Smooth Sliding Frosted Glass Capsule -->
            <div
              class="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-b from-white/[0.14] to-white/[0.06] border border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
              :style="{
                left: `${pillState.left}px`,
                width: `${pillState.width}px`,
                opacity: pillState.opacity,
              }"
            ></div>

            <button
              v-for="cat in categories"
              :key="cat"
              :ref="(el) => setFilterBtnRef(el, cat)"
              type="button"
              @click="selectedCategory = cat"
              class="relative z-10 px-6 py-2 rounded-full text-xs tracking-wider uppercase transition-colors duration-300 cursor-pointer select-none active:scale-95"
              :class="[
                selectedCategory === cat
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-white font-medium'
              ]"
            >
              <span>{{ cat }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Packages Grid with Smooth Transition -->
      <Transition name="pricing-view" mode="out-in">
        <div
          v-if="filteredPackages.length > 0"
          :key="selectedCategory"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start"
        >
          <div
            v-for="pkg in filteredPackages"
            :key="pkg.id"
            class="rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative group h-fit self-start"
            :class="[
              pkg.badge || pkg.is_featured
                ? 'bg-gradient-to-b from-white/10 to-white/5 border-2 border-[#FFD700] shadow-2xl shadow-yellow-500/10'
                : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
            ]"
          >
            <!-- Badge -->
            <div
              v-if="pkg.badge"
              class="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-[#FFD700] text-[#141414] text-[11px] font-bold uppercase tracking-wider shadow-md"
            >
              {{ pkg.badge }}
            </div>

            <div>
              <span class="text-xs font-mono uppercase tracking-widest text-[#FFD700]">{{ pkg.category }}</span>
              <h3 class="text-2xl font-bebas text-white tracking-wide mt-1 mb-4">{{ pkg.title }}</h3>

              <!-- Price Display (Masked vs Standard) -->
              <div class="flex items-baseline gap-2 mb-6">
                <template v-if="pkg.hide_price || isGlobalPriceMasked">
                  <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] tracking-wider">
                    ₱{{ formatMaskedPrice(pkg.price) }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] tracking-wider">
                    ₱{{ formatPrice(pkg.promo_price || pkg.price) }}
                  </span>
                  <span v-if="pkg.promo_price" class="text-sm font-mono text-gray-500 line-through">
                    ₱{{ formatPrice(pkg.price) }}
                  </span>
                </template>
              </div>

              <!-- Inclusions Checklist -->
              <ul v-if="pkg.features && pkg.features.length > 0" class="space-y-3 text-sm text-gray-300 font-nuosu mb-8">
                <li v-for="(feature, idx) in pkg.features" :key="idx" class="flex items-start gap-3">
                  <Check class="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <span>{{ feature }}</span>
                </li>
              </ul>
              <div v-else class="text-xs text-neutral-500 italic mb-8 font-nuosu">
                No deliverables or inclusions listed for this package.
              </div>
            </div>

            <a
              href="#contact"
              class="w-full py-3 rounded-full text-center text-xs font-nuosu font-bold tracking-wider uppercase transition-all duration-300 block cursor-pointer mt-auto"
              :class="[
                pkg.badge || pkg.is_featured
                  ? 'bg-[#FFD700] text-[#141414] hover:bg-yellow-400 shadow-md'
                  : 'bg-white/10 text-white hover:bg-[#FFD700] hover:text-[#141414]'
              ]"
            >
              {{ pkg.hide_price || isGlobalPriceMasked ? 'Inquire to unlock price' : (content.button_text || 'Inquire / Book Package') }}
            </a>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          :key="'empty-' + selectedCategory"
          class="text-center py-16 px-4 rounded-3xl border border-white/10 bg-white/[0.02]"
        >
          <p class="text-neutral-400 font-nuosu text-sm">No active packages found in this category.</p>
        </div>
      </Transition>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 2. ALL-INCLUSIVE PACKAGE SPOTLIGHT (1:1 Layout with Studio Design System) -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'pricing_spotlight'"
    id="rates"
    class="py-24 bg-[#0f0f0f] border-b border-white/5 font-manrope select-none relative overflow-hidden"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-10">
        <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8]">
          {{ content.title || 'FIND THE PERFECT PLAN FOR YOU' }}
        </h2>
        <p class="mt-3 text-sm md:text-base font-nuosu text-gray-400 max-w-2xl mx-auto">
          {{ content.subtitle || 'Explore our wide range of packages, compare features, and select the one that perfectly matches your vision and budget.' }}
        </p>

        <!-- Category Filter Pills (if multiple categories available) -->
        <div v-if="categories.length > 1" class="flex justify-center mt-8">
          <div class="relative inline-flex flex-wrap items-center justify-center p-1.5 rounded-full bg-neutral-900/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-black/50 max-w-full">
            <!-- Smooth Sliding Frosted Glass Capsule -->
            <div
              class="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-b from-white/[0.14] to-white/[0.06] border border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
              :style="{
                left: `${pillState.left}px`,
                width: `${pillState.width}px`,
                opacity: pillState.opacity,
              }"
            ></div>

            <button
              v-for="cat in categories"
              :key="cat"
              :ref="(el) => setFilterBtnRef(el, cat)"
              type="button"
              @click="selectedCategory = cat"
              class="relative z-10 px-6 py-2 rounded-full text-xs tracking-wider uppercase transition-colors duration-300 cursor-pointer select-none active:scale-95"
              :class="[
                selectedCategory === cat
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-white font-medium'
              ]"
            >
              <span>{{ cat }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Pricing Card Container with Smooth Transition -->
      <Transition name="pricing-view" mode="out-in">
        <div
          :key="selectedCategory"
          class="rounded-3xl bg-gradient-to-b from-[#181818] to-[#121212] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden"
        >
          <!-- Ambient Gold Glow Accent -->
          <div class="absolute -top-24 -right-24 w-80 h-80 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            <!-- LEFT COLUMN: Plan Selection Cards (6 cols) -->
            <div class="lg:col-span-6 space-y-3.5">
              <div
                v-for="plan in spotlightPlans"
                :key="plan.id"
                @click="spotlightSelectedPlanId = plan.id"
                :class="[
                  'flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none relative group',
                  activeSpotlightPlan?.id === plan.id
                    ? 'border-[#FFD700] bg-gradient-to-r from-[#FFD700]/15 via-white/[0.04] to-transparent shadow-lg shadow-yellow-500/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                ]"
              >
                <!-- Radio Circle & Plan Info -->
                <div class="flex items-center gap-3.5 sm:gap-4">
                  <!-- Custom Radio Indicator -->
                  <div class="relative flex items-center justify-center shrink-0">
                    <div
                      :class="[
                        'w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center',
                        activeSpotlightPlan?.id === plan.id
                          ? 'border-[#FFD700]'
                          : 'border-white/30 group-hover:border-white/50'
                      ]"
                    >
                      <div
                        v-if="activeSpotlightPlan?.id === plan.id"
                        class="w-2.5 h-2.5 rounded-full bg-[#FFD700]"
                      ></div>
                    </div>
                  </div>

                  <!-- Plan Name & Discount Badge -->
                  <div>
                    <h3
                      class="text-base sm:text-lg font-bebas tracking-wide transition-colors"
                      :class="activeSpotlightPlan?.id === plan.id ? 'text-white' : 'text-neutral-200 group-hover:text-white'"
                    >
                      {{ plan.name }}
                    </h3>
                    <div v-if="plan.discountBadge" class="mt-0.5">
                      <span class="inline-block text-[10px] font-bold font-nuosu uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD700] text-[#141414] shadow-sm">
                        {{ plan.discountBadge }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Price (Supports Masking & Promo Original Price) -->
                <div class="text-right">
                  <div class="flex flex-col items-end">
                    <span class="text-2xl sm:text-3xl font-bebas tracking-wider text-[#FFD700]">
                      {{ plan.display_price }}
                    </span>
                    <span v-if="plan.original_price" class="text-xs font-mono text-gray-500 line-through">
                      {{ plan.original_price }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: Included Features List (6 cols) -->
            <div class="lg:col-span-6 bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
              <h4 class="text-lg font-bebas tracking-wider text-white mb-5 flex items-center justify-between">
                <span>INCLUDES :</span>
                <span v-if="activeSpotlightPlan?.category" class="text-xs font-mono uppercase tracking-widest text-[#FFD700]">
                  {{ activeSpotlightPlan.category }}
                </span>
              </h4>

              <ul class="space-y-3.5 sm:space-y-4">
                <li
                  v-for="(feature, index) in currentSpotlightFeatures"
                  :key="index"
                  class="flex items-center justify-between text-xs sm:text-sm text-neutral-300 font-nuosu"
                >
                  <span>{{ feature }}</span>
                  <!-- Circular Checkmark Icon matching studio aesthetics -->
                  <div class="w-5 h-5 rounded-full border border-[#FFD700]/70 bg-[#FFD700]/15 flex items-center justify-center shrink-0 ml-3">
                    <Check class="w-3 h-3 text-[#FFD700] stroke-[2.5]" />
                  </div>
                </li>
              </ul>
            </div>

          </div>

          <!-- BOTTOM BAR: Centered Action CTA Button -->
          <div class="mt-8 pt-6 border-t border-white/10 flex justify-center items-center">
            <a
              href="#contact"
              class="w-full sm:w-auto px-10 py-3.5 bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold font-nuosu text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-lg shadow-yellow-500/20 transition-all text-center cursor-pointer"
            >
              {{ activeSpotlightPlan?.hide_price || isGlobalPriceMasked ? 'Inquire to unlock price' : (content.button_text || 'Inquire / Book Package') }}
            </a>
          </div>

        </div>
      </Transition>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 3. CUSTOM COVERAGE ADD-ONS & DELIVERABLES -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'pricing_addons'"
    id="rates"
    class="py-24 border-b border-white/5 font-manrope select-none relative overflow-hidden transition-colors duration-500"
    :class="[
      content.bg_type === 'image' ? 'bg-neutral-950' : 'bg-[#121212]'
    ]"
  >
    <!-- Section Background: Image Option (Hardware-accelerated) -->
    <template v-if="content.bg_type === 'image'">
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
        <!-- Mode A: Showcase Folder Slideshow -->
        <template v-if="content.bg_source === 'folder' && folderBgImages.length > 0">
          <img
            :src="folderBgImages[currentBgSlideIndex] || '/images/hero-bg.jpg'"
            alt="A La Carte Section Background"
            class="w-full h-full object-cover object-center transform scale-105 opacity-35 transition-opacity duration-1000"
          />
        </template>
        <!-- Mode B: Single Photo Selection -->
        <template v-else>
          <img
            :src="content.bg_image || '/images/hero-bg.jpg'"
            alt="A La Carte Section Background"
            class="w-full h-full object-cover object-center transform scale-105 opacity-35"
          />
        </template>
        <div class="absolute inset-0 bg-gradient-to-b from-[#121212]/95 via-[#121212]/80 to-[#121212]/95"></div>
      </div>
    </template>

    <!-- Section Background: Solid with Glowing Gradient Accent Option (Zero-blur GPU radial shaders for 120 FPS) -->
    <template v-else>
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
        <div
          class="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[500px] pointer-events-none opacity-80"
          style="background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.16) 0%, rgba(217, 119, 6, 0.08) 45%, transparent 70%);"
        ></div>
        <div
          class="absolute bottom-10 -right-24 w-[600px] h-[450px] pointer-events-none opacity-60"
          style="background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.12) 0%, rgba(180, 83, 9, 0.05) 50%, transparent 70%);"
        ></div>
        <div
          class="absolute top-1/3 -left-32 w-[550px] h-[450px] pointer-events-none opacity-70"
          style="background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.08) 0%, transparent 65%);"
        ></div>
      </div>
    </template>

    <!-- Content Container -->
    <div class="max-w-6xl mx-auto px-4 relative z-10">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-3">
          {{ content.title || 'A LA CARTE DELIVERABLES' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'Personalize your core coverage with specialized drone operations, handcrafted heirlooms, and same-day edits.' }}
        </p>

        <!-- Category Filters with Sliding Frosted Glass Capsule -->
        <div v-if="categories.length > 1" class="flex justify-center mt-8">
          <div class="relative inline-flex flex-wrap items-center justify-center p-1.5 rounded-full bg-neutral-900/90 border border-white/[0.08] backdrop-blur-md shadow-2xl shadow-black/50 max-w-full">
            <!-- Smooth Sliding Frosted Glass Capsule -->
            <div
              class="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-b from-white/[0.14] to-white/[0.06] border border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
              :style="{
                left: `${pillState.left}px`,
                width: `${pillState.width}px`,
                opacity: pillState.opacity,
              }"
            ></div>

            <button
              v-for="cat in categories"
              :key="cat"
              :ref="(el) => setFilterBtnRef(el, cat)"
              type="button"
              @click="selectedCategory = cat"
              class="relative z-10 px-6 py-2 rounded-full text-xs tracking-wider uppercase transition-colors duration-300 cursor-pointer select-none active:scale-95"
              :class="[
                selectedCategory === cat
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-white font-medium'
              ]"
            >
              <span>{{ cat }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Packages Grid with Smooth Transition (Wired to Rates & Packages Manager) -->
      <Transition name="pricing-view" mode="out-in">
        <div
          v-if="filteredPackages.length > 0"
          :key="selectedCategory"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start"
        >
          <div
            v-for="pkg in filteredPackages"
            :key="pkg.id"
            class="rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative group h-fit self-start backdrop-blur-md transform-gpu"
            :class="[
              pkg.badge || pkg.is_featured
                ? 'bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.04] border-2 border-[#FFD700] shadow-[0_8px_32px_rgba(255,215,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.14] hover:border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_0_rgba(255,255,255,0.1)]'
            ]"
          >
            <!-- Badge: Lowered and pushed more to the right, aligned with the package title -->
            <div
              v-if="pkg.badge"
              class="absolute top-6 sm:top-7 -right-3 sm:-right-4 px-3.5 py-1 rounded-lg bg-[#FFD700] text-[#141414] text-[11px] font-bold uppercase tracking-wider shadow-xl z-20 ring-2 ring-black/40"
            >
              {{ pkg.badge }}
            </div>

            <div class="flex-1 flex flex-col">
              <!-- 1. Title -->
              <h3 class="text-2xl font-bebas text-white tracking-wide pr-14">
                {{ pkg.title }}
              </h3>

              <!-- 2. Subtext -->
              <p class="text-xs text-neutral-400 font-nuosu leading-relaxed mt-1 mb-5">
                {{ pkg.category || 'Package Coverage' }}
              </p>

              <!-- 3. Price -->
              <div class="flex items-baseline gap-2 mb-6">
                <template v-if="pkg.hide_price || isGlobalPriceMasked">
                  <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] tracking-wider">
                    ₱{{ formatMaskedPrice(pkg.price) }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] tracking-wider">
                    ₱{{ formatPrice(pkg.promo_price || pkg.price) }}
                  </span>
                  <span v-if="pkg.promo_price" class="text-sm font-mono text-gray-500 line-through">
                    ₱{{ formatPrice(pkg.price) }}
                  </span>
                </template>
              </div>

              <!-- 4. CTA Button (Reduced radius: rounded-xl) -->
              <a
                href="#contact"
                class="w-full py-3 rounded-xl text-center text-xs font-nuosu font-bold tracking-wider uppercase transition-all duration-300 block cursor-pointer mb-6"
                :class="[
                  pkg.badge || pkg.is_featured
                    ? 'bg-[#FFD700] text-[#141414] hover:bg-yellow-400 shadow-md shadow-yellow-500/20'
                    : 'bg-white/10 text-white hover:bg-[#FFD700] hover:text-[#141414]'
                ]"
              >
                {{ pkg.hide_price || isGlobalPriceMasked ? 'Inquire to unlock price' : (content.button_text || 'Inquire / Book Package') }}
              </a>

              <!-- 5. Separator -->
              <div class="border-t border-white/10 w-full mb-6"></div>

              <!-- 6. Inclusion Text -->
              <p class="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3.5">
                What's Included:
              </p>

              <!-- 7. Inclusion List with Dot (clean solid dot without glow) -->
              <ul v-if="pkg.features && pkg.features.length > 0" class="space-y-3 text-sm text-gray-300 font-nuosu">
                <li v-for="(feature, fIdx) in pkg.features" :key="fIdx" class="flex items-start gap-3">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] shrink-0 mt-2"></span>
                  <span class="leading-relaxed">{{ feature }}</span>
                </li>
              </ul>
              <div v-else class="text-xs text-neutral-500 italic font-nuosu">
                No deliverables or inclusions listed for this package.
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          :key="'empty-' + selectedCategory"
          class="text-center py-16 px-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl"
        >
          <p class="text-neutral-400 font-nuosu text-sm">No active packages found in this category.</p>
        </div>
      </Transition>

      <!-- Optional Footnote / Matrix Disclaimer -->
      <div v-if="content.footer_note" class="mt-12 text-center">
        <p class="text-xs text-neutral-500 font-nuosu">
          {{ content.footer_note }}
        </p>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 4. DETAILED TIER COMPARISON MATRIX -->
  <!-- ========================================== -->
  <section
    v-else
    id="rates"
    class="py-24 bg-[#141414] border-b border-white/5 font-manrope select-none relative"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-3">
          {{ content.title || 'PACKAGE FEATURE MATRIX' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'Compare inclusions and deliverables across our photography and cinema tiers.' }}
        </p>

        <!-- Category Filters (if multiple categories available) -->
        <div v-if="categories.length > 1" class="flex justify-center mt-8">
          <div class="relative inline-flex flex-wrap items-center justify-center p-1.5 rounded-full bg-neutral-900/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-black/50 max-w-full">
            <!-- Smooth Sliding Frosted Glass Capsule -->
            <div
              class="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-b from-white/[0.14] to-white/[0.06] border border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
              :style="{
                left: `${pillState.left}px`,
                width: `${pillState.width}px`,
                opacity: pillState.opacity,
              }"
            ></div>

            <button
              v-for="cat in categories"
              :key="cat"
              :ref="(el) => setFilterBtnRef(el, cat)"
              type="button"
              @click="selectedCategory = cat"
              class="relative z-10 px-6 py-2 rounded-full text-xs tracking-wider uppercase transition-colors duration-300 cursor-pointer select-none active:scale-95"
              :class="[
                selectedCategory === cat
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-white font-medium'
              ]"
            >
              <span>{{ cat }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Comparison Table Container with Smooth Transition -->
      <Transition name="pricing-view" mode="out-in">
        <div
          v-if="matrixPackages.length > 0"
          :key="selectedCategory"
          class="overflow-x-auto rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
        >
          <table class="w-full text-left text-xs sm:text-sm border-collapse min-w-[720px]">
            <thead>
              <tr class="border-b border-white/10 bg-white/[0.02]">
                <!-- Feature Column Header -->
                <th class="p-4 sm:p-5 font-bebas text-base sm:text-lg tracking-wider text-white w-1/4 align-bottom">
                  <span>Deliverables & Inclusions</span>
                </th>

                <!-- Package Column Headers -->
                <th
                  v-for="pkg in matrixPackages"
                  :key="pkg.id"
                  class="p-4 sm:p-5 text-center align-top relative transition-colors duration-200"
                  :class="[
                    pkg.badge || pkg.is_featured
                      ? 'bg-gradient-to-b from-[#FFD700]/15 via-[#FFD700]/[0.06] to-[#FFD700]/[0.03] border-x-2 border-t-2 border-[#FFD700]/40 shadow-lg'
                      : 'bg-transparent'
                  ]"
                >
                  <h3 class="text-xl sm:text-2xl font-bebas text-white tracking-wide mb-1.5">
                    {{ pkg.title }}
                  </h3>

                  <!-- Price -->
                  <div class="flex items-baseline justify-center gap-1">
                    <template v-if="pkg.hide_price || isGlobalPriceMasked">
                      <span class="text-2xl sm:text-3xl font-bebas text-[#FFD700] tracking-wider">
                        ₱{{ formatMaskedPrice(pkg.price) }}
                      </span>
                    </template>
                    <template v-else>
                      <span
                        v-if="pkg.promo_price"
                        class="text-xs text-neutral-500 line-through mr-1 font-mono"
                      >
                        ₱{{ formatPrice(pkg.price) }}
                      </span>
                      <span class="text-2xl sm:text-3xl font-bebas text-[#FFD700] tracking-wider">
                        ₱{{ formatPrice(pkg.promo_price || pkg.price) }}
                      </span>
                    </template>
                  </div>

                  <!-- Select Tier CTA Button (Directly below price) -->
                  <div class="mt-3.5">
                    <a
                      href="#contact"
                      class="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-md"
                      :class="[
                        pkg.badge || pkg.is_featured
                          ? 'bg-[#FFD700] text-[#141414] hover:bg-[#ffe234] shadow-yellow-500/20'
                          : 'bg-white/5 text-white hover:bg-white/15 border border-white/10'
                      ]"
                    >
                      <template v-if="pkg.hide_price || isGlobalPriceMasked">
                        <span>Inquire Price</span>
                        <ArrowRight class="w-3.5 h-3.5" />
                      </template>
                      <template v-else>
                        <span>{{ content.button_text || 'Select Tier' }}</span>
                        <ArrowRight class="w-3.5 h-3.5" />
                      </template>
                    </a>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-white/[0.06] text-neutral-300">
              <tr
                v-for="(feature, idx) in matrixFeatures"
                :key="idx"
                class="hover:bg-white/[0.02] transition-colors"
              >
                <!-- Feature Row Name (Clean without icon) -->
                <td class="py-3 px-4 sm:py-3 sm:px-5 font-nuosu font-medium text-white/90 text-xs sm:text-sm">
                  <span>{{ feature }}</span>
                </td>

                <!-- Feature Checks per Package (Slightly illuminated if badge/featured) -->
                <td
                  v-for="pkg in matrixPackages"
                  :key="pkg.id"
                  class="py-3 px-4 sm:py-3 sm:px-5 text-center transition-colors"
                  :class="[
                    pkg.badge || pkg.is_featured
                      ? 'bg-[#FFD700]/[0.05] border-x border-[#FFD700]/20'
                      : ''
                  ]"
                >
                  <div v-if="packageHasFeature(pkg, feature)" class="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#FFD700]/60 bg-transparent text-[#FFD700]">
                    <Check class="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span v-else class="text-neutral-600 font-mono text-sm">—</span>
                </td>
              </tr>
            </tbody>

            <!-- Table Footer: Bottom Column Badges & Dynamic Note -->
            <tfoot>
              <tr class="border-t border-white/10 bg-white/[0.02]">
                <!-- Bottom Empty Corner Cell -->
                <td class="py-3 px-4 sm:py-3 sm:px-5"></td>

                <!-- Bottom Column Badge Cell -->
                <td
                  v-for="pkg in matrixPackages"
                  :key="pkg.id"
                  class="py-3 px-4 sm:py-3 sm:px-5 text-center transition-colors"
                  :class="[
                    pkg.badge || pkg.is_featured
                      ? 'bg-gradient-to-t from-[#FFD700]/15 via-[#FFD700]/[0.06] to-[#FFD700]/[0.03] border-x-2 border-b-2 border-[#FFD700]/40 shadow-lg'
                      : 'bg-transparent'
                  ]"
                >
                  <div v-if="pkg.badge" class="inline-flex items-center justify-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFD700] text-[#141414] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      <Sparkles class="w-3 h-3" />
                      {{ pkg.badge }}
                    </span>
                  </div>
                  <span v-else class="text-neutral-500 font-mono text-xs">—</span>
                </td>
              </tr>

              <!-- Dynamic Footnote Row -->
              <tr class="border-t border-white/10 bg-white/[0.01]">
                <td
                  :colspan="matrixPackages.length + 1"
                  class="py-3.5 px-5 font-nuosu text-xs text-neutral-400 text-center"
                >
                  {{ content.footer_note || 'Custom add-ons and bespoke upgrades available upon consultation.' }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Empty State -->
        <div
          v-else
          :key="'empty-' + selectedCategory"
          class="text-center py-16 px-4 rounded-3xl border border-white/10 bg-white/[0.02]"
        >
          <p class="text-neutral-400 font-nuosu text-sm">No active packages found in this category.</p>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.pricing-view-enter-active,
.pricing-view-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.pricing-view-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.99);
}

.pricing-view-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.99);
}
</style>

