<script setup>
import { ref, computed } from 'vue';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';

defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});

const { packages, isGlobalPriceMasked } = usePackages();

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
</script>

<template>
  <section id="rates" class="py-24 bg-[#141414] border-b border-white/5 relative">
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
            class="px-5 py-1.5 rounded-full text-xs font-nuosu tracking-wider uppercase transition-all duration-300"
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <!-- If Masked: Show 2?,??? and disable promo price -->
              <template v-if="pkg.hide_price || isGlobalPriceMasked">
                <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] tracking-wider">
                  ₱{{ formatMaskedPrice(pkg.price) }}
                </span>
              </template>

              <!-- Standard Price & Promo Price -->
              <template v-else>
                <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] tracking-wider">
                  ₱{{ formatPrice(pkg.promo_price || pkg.price) }}
                </span>
                <span
                  v-if="pkg.promo_price"
                  class="text-sm font-mono text-gray-500 line-through"
                >
                  ₱{{ formatPrice(pkg.price) }}
                </span>
              </template>
            </div>

            <!-- Inclusions Checklist -->
            <ul class="space-y-3 text-sm text-gray-300 font-nuosu mb-8">
              <li
                v-for="(feature, idx) in pkg.features"
                :key="idx"
                class="flex items-start gap-3"
              >
                <svg class="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- Book Button -->
          <a
            href="#contact"
            class="w-full py-3 rounded-full text-center text-xs font-nuosu font-bold tracking-wider uppercase transition-all duration-300"
            :class="[
              pkg.is_featured
                ? 'bg-[#FFD700] text-[#141414] hover:bg-yellow-400'
                : 'bg-white/10 text-white hover:bg-[#FFD700] hover:text-[#141414]'
            ]"
          >
            Inquire to unlock price
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
