<script setup>
import { ref, computed } from 'vue';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';
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
  const set = new Set(activePackages.value.map((p) => p.category || 'Standard'));
  return ['All', ...Array.from(set)];
});

const selectedCategory = ref('All');

const filteredPackages = computed(() => {
  if (selectedCategory.value === 'All') return activePackages.value;
  return activePackages.value.filter((p) => p.category === selectedCategory.value);
});

function formatPrice(amount) {
  if (!amount) return '0';
  return Number(amount).toLocaleString('en-PH');
}

// Sample addons for pricing_addons variant
const sampleAddons = computed(() => {
  return props.content?.addons || [
    { title: '4K Same-Day-Edit (SDE) Video Reel', price: '₱15,000', desc: 'Edited on-site and projected during reception program' },
    { title: 'Licensed 4K Aerial Drone Coverage', price: '₱8,000', desc: 'Cinematic aerial establishing shots of ceremony & reception venues' },
    { title: 'Luxury Hardbound Leather Photo Album (10x10)', price: '₱12,000', desc: '40-page archival fine art prints in handcrafted Italian leather box' },
    { title: 'Pre-Wedding / Prenup Visual Session', price: '₱18,000', desc: 'Full-day creative shoot with photo, video, and drone support' },
    { title: 'Overtime Coverage (Per Hour)', price: '₱3,500/hr', desc: 'Extended team shoot coverage past agreed contract hours' },
    { title: 'RAW Uncompressed Video Archive on SSD', price: '₱5,000', desc: 'Complete unedited footage delivered on portable 1TB SSD' },
  ];
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
        <div class="flex flex-wrap justify-center gap-2 mt-8">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-5 py-1.5 rounded-full text-xs font-nuosu tracking-wider uppercase transition-all duration-300 cursor-pointer"
            :class="[
              selectedCategory === cat
                ? 'bg-[#FFD700] text-[#141414] font-bold shadow-md shadow-yellow-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Packages Grid -->
      <div v-if="filteredPackages.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="pkg in filteredPackages"
          :key="pkg.id"
          class="rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative group"
          :class="[
            pkg.is_featured
              ? 'bg-gradient-to-b from-white/10 to-white/5 border-2 border-[#FFD700] shadow-2xl shadow-yellow-500/10 scale-105'
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
            <ul class="space-y-3 text-sm text-gray-300 font-nuosu mb-8">
              <li v-for="(feature, idx) in pkg.features" :key="idx" class="flex items-start gap-3">
                <Check class="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <a
            href="#contact"
            class="w-full py-3 rounded-full text-center text-xs font-nuosu font-bold tracking-wider uppercase transition-all duration-300 block"
            :class="[
              pkg.is_featured
                ? 'bg-[#FFD700] text-[#141414] hover:bg-yellow-400 shadow-md'
                : 'bg-white/10 text-white hover:bg-[#FFD700] hover:text-[#141414]'
            ]"
          >
            Inquire to unlock price
          </a>
        </div>
      </div>
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
        <div v-if="categories.length > 2" class="flex flex-wrap justify-center gap-2 mt-8">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-5 py-1.5 rounded-full text-xs font-nuosu tracking-wider uppercase transition-all duration-300 cursor-pointer"
            :class="[
              selectedCategory === cat
                ? 'bg-[#FFD700] text-[#141414] font-bold shadow-md shadow-yellow-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Main Pricing Card Container -->
      <div class="rounded-3xl bg-gradient-to-b from-[#181818] to-[#121212] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
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
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 3. CUSTOM COVERAGE ADD-ONS & DELIVERABLES -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'pricing_addons'"
    id="rates"
    class="py-24 bg-[#141414] border-b border-white/5 font-manrope select-none"
  >
    <div class="max-w-5xl mx-auto px-4">
      <div class="text-center mb-12 space-y-2">
        <h2 class="text-3xl sm:text-5xl font-bold text-white tracking-tight">Custom Coverage & Add-ons</h2>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
          Personalize your base package with specialized cinematic drone operations, printed heirlooms, and same-day edits.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(addon, idx) in sampleAddons"
          :key="idx"
          class="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition flex items-start justify-between gap-4 group"
        >
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-white group-hover:text-[#FFD700] transition">{{ addon.title }}</h4>
            <p class="text-xs text-neutral-400">{{ addon.desc }}</p>
          </div>
          <span class="text-sm font-extrabold text-[#FFD700] shrink-0 font-mono">{{ addon.price }}</span>
        </div>
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
        <div v-if="categories.length > 2" class="flex flex-wrap justify-center gap-2 mt-8">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-5 py-1.5 rounded-full text-xs font-nuosu tracking-wider uppercase transition-all duration-300 cursor-pointer"
            :class="[
              selectedCategory === cat
                ? 'bg-[#FFD700] text-[#141414] font-bold shadow-md shadow-yellow-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Comparison Table Container -->
      <div v-if="matrixPackages.length > 0" class="overflow-x-auto rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl">
        <table class="w-full text-left text-xs sm:text-sm border-collapse min-w-[720px]">
          <thead>
            <tr class="border-b border-white/10 bg-white/[0.02]">
              <!-- Feature Column Header -->
              <th class="p-6 font-bebas text-lg tracking-wider text-white w-1/4 align-bottom">
                <span>Deliverables & Inclusions</span>
              </th>

              <!-- Package Column Headers -->
              <th
                v-for="pkg in matrixPackages"
                :key="pkg.id"
                class="p-6 text-center align-top relative transition-colors duration-200"
                :class="[
                  pkg.is_featured
                    ? 'bg-[#FFD700]/[0.08] border-x-2 border-t-2 border-[#FFD700]/30 shadow-lg'
                    : 'bg-transparent'
                ]"
              >
                <!-- Badge -->
                <div v-if="pkg.badge" class="mb-2">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFD700] text-[#141414] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    <Sparkles class="w-3 h-3" />
                    {{ pkg.badge }}
                  </span>
                </div>

                <span class="text-[10px] font-mono uppercase tracking-widest text-[#FFD700] block mb-1">
                  {{ pkg.category || 'Standard' }}
                </span>
                <h3 class="text-xl sm:text-2xl font-bebas text-white tracking-wide mb-2">
                  {{ pkg.title }}
                </h3>

                <!-- Price -->
                <div class="flex items-baseline justify-center gap-1 mb-1">
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
                <span class="text-[11px] text-neutral-400 font-nuosu">/ package coverage</span>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-white/[0.06] text-neutral-300">
            <tr
              v-for="(feature, idx) in matrixFeatures"
              :key="idx"
              class="hover:bg-white/[0.02] transition-colors"
            >
              <!-- Feature Row Name -->
              <td class="p-4 sm:p-5 font-nuosu font-medium text-white/90 text-xs sm:text-sm">
                <div class="flex items-center gap-2">
                  <Check class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{{ feature }}</span>
                </div>
              </td>

              <!-- Feature Checks per Package -->
              <td
                v-for="pkg in matrixPackages"
                :key="pkg.id"
                class="p-4 sm:p-5 text-center"
                :class="[
                  pkg.is_featured
                    ? 'bg-[#FFD700]/[0.05] border-x border-[#FFD700]/20'
                    : ''
                ]"
              >
                <div v-if="packageHasFeature(pkg, feature)" class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FFD700]/15 text-[#FFD700] shadow-sm">
                  <Check class="w-4 h-4 stroke-[2.5]" />
                </div>
                <span v-else class="text-neutral-600 font-mono text-sm">—</span>
              </td>
            </tr>
          </tbody>

          <!-- Table Footer CTA Row -->
          <tfoot>
            <tr class="border-t border-white/10 bg-white/[0.02]">
              <td class="p-6 font-nuosu text-xs text-neutral-400">
                Custom add-ons and bespoke upgrades available upon consultation.
              </td>
              <td
                v-for="pkg in matrixPackages"
                :key="pkg.id"
                class="p-6 text-center"
                :class="[
                  pkg.is_featured
                    ? 'bg-[#FFD700]/[0.08] border-x-2 border-b-2 border-[#FFD700]/30'
                    : ''
                ]"
              >
                <a
                  href="#contact"
                  class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-md"
                  :class="[
                    pkg.is_featured
                      ? 'bg-[#FFD700] text-[#141414] hover:bg-[#ffe234] shadow-yellow-500/20'
                      : 'bg-white/5 text-white hover:bg-white/15 border border-white/10'
                  ]"
                >
                  <template v-if="pkg.hide_price || isGlobalPriceMasked">
                    <span>Inquire Price</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </template>
                  <template v-else>
                    <span>Select Tier</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </template>
                </a>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-16 px-4 rounded-3xl border border-white/10 bg-white/[0.02]"
      >
        <p class="text-neutral-400 font-nuosu text-sm">No active packages found in this category.</p>
      </div>
    </div>
  </section>
</template>

