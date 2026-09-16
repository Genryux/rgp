<script setup>
import { ref, computed } from 'vue';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';
import { Check, Sparkles, Plus, Star, ShieldCheck, ArrowRight, Layers } from '@lucide/vue';

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
  <!-- 2. ALL-INCLUSIVE PACKAGE SPOTLIGHT -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'pricing_spotlight'"
    id="rates"
    class="py-24 bg-[#0f0f0f] border-b border-white/5 font-manrope select-none"
  >
    <div class="max-w-5xl mx-auto px-4">
      <div class="rounded-3xl bg-gradient-to-b from-[#181818] to-[#121212] border-2 border-[#FFD700]/50 p-8 sm:p-14 shadow-2xl relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-72 h-72 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div class="space-y-2">
            <span class="px-3.5 py-1 rounded-full bg-[#FFD700] text-black text-[11px] font-bold uppercase tracking-wider">
              Signature Complete Coverage
            </span>
            <h2 class="text-3xl sm:text-5xl font-bold text-white tracking-tight">The Grand Master Experience</h2>
            <p class="text-xs sm:text-sm text-neutral-400">Everything needed for comprehensive full-day wedding or milestone cinema & photo.</p>
          </div>

          <div class="text-left md:text-right">
            <span class="text-xs uppercase font-mono text-neutral-400 block">All-Inclusive Rate</span>
            <span class="text-4xl sm:text-5xl font-extrabold text-[#FFD700]">₱85,000</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8">
          <div v-for="(feat, idx) in [
            'Full Day Coverage (Preparation, Ceremony & Reception)',
            'Principal Photographer + 2 Associate Shooters',
            'Lead Cinematographer + Drone Pilot',
            '4K Same-Day-Edit (SDE) Video Reel',
            'Full 4K Documentary Film (20-30 mins)',
            'Unlimited High-Resolution Enhanced Photos',
            '10x10 Handcrafted Leather Album (40 Pages)',
            '48-Hour Highlight Sneak Peek Gallery',
          ]" :key="idx" class="flex items-center gap-3 text-xs sm:text-sm text-neutral-200">
            <div class="w-5 h-5 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0">
              <Check class="w-3.5 h-3.5" />
            </div>
            <span>{{ feat }}</span>
          </div>
        </div>

        <div class="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span class="text-xs text-neutral-400">Flexible 3-stage payment terms available (Deposit, Milestone, Delivery)</span>
          <a
            href="#contact"
            class="px-8 py-3.5 rounded-full bg-[#FFD700] text-black font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20"
          >
            Reserve This Package
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
    class="py-24 bg-[#101010] border-b border-white/5 font-manrope select-none"
  >
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12 space-y-2">
        <h2 class="text-3xl sm:text-5xl font-bold text-white tracking-tight">Package Feature Matrix</h2>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
          Compare inclusions and deliverables across our photography and cinema tiers.
        </p>
      </div>

      <div class="overflow-x-auto rounded-3xl border border-white/10 bg-[#151515]">
        <table class="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr class="border-b border-white/10 bg-white/[0.03]">
              <th class="p-4 font-bold text-white uppercase tracking-wider">Features & Deliverables</th>
              <th class="p-4 font-bold text-white text-center">Essential</th>
              <th class="p-4 font-bold text-[#FFD700] text-center bg-[#FFD700]/10">Signature (Popular)</th>
              <th class="p-4 font-bold text-white text-center">Ultimate</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.06] text-neutral-300">
            <tr>
              <td class="p-4 font-semibold text-white">Coverage Hours</td>
              <td class="p-4 text-center">6 Hours</td>
              <td class="p-4 text-center bg-[#FFD700]/5 font-bold text-white">Full Day (10-12 hrs)</td>
              <td class="p-4 text-center">Unlimited Full Day</td>
            </tr>
            <tr>
              <td class="p-4 font-semibold text-white">Shooters & Crew</td>
              <td class="p-4 text-center">2 Photographers</td>
              <td class="p-4 text-center bg-[#FFD700]/5 font-bold text-white">2 Photo + 2 Video</td>
              <td class="p-4 text-center">3 Photo + 3 Video + Drone</td>
            </tr>
            <tr>
              <td class="p-4 font-semibold text-white">4K Same-Day-Edit (SDE)</td>
              <td class="p-4 text-center text-neutral-600">—</td>
              <td class="p-4 text-center bg-[#FFD700]/5 text-[#FFD700] font-bold">Included</td>
              <td class="p-4 text-center text-[#FFD700] font-bold">Included</td>
            </tr>
            <tr>
              <td class="p-4 font-semibold text-white">Aerial Drone Footage</td>
              <td class="p-4 text-center text-neutral-600">—</td>
              <td class="p-4 text-center bg-[#FFD700]/5 text-[#FFD700] font-bold">Included</td>
              <td class="p-4 text-center text-[#FFD700] font-bold">Dual 5.1K Drone Ops</td>
            </tr>
            <tr>
              <td class="p-4 font-semibold text-white">Physical Leather Heirloom Album</td>
              <td class="p-4 text-center text-neutral-600">—</td>
              <td class="p-4 text-center bg-[#FFD700]/5 text-[#FFD700] font-bold">10x10 Album</td>
              <td class="p-4 text-center text-[#FFD700] font-bold">12x12 Master + 2 Parent Albums</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

