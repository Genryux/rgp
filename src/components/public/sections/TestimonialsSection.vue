<script setup>
import { computed } from 'vue';
import { Star, Quote, Heart, Award, Building2 } from '@lucide/vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'testimonials_dual', // testimonials_dual | testimonials_grid | testimonials_featured | trust_venues
  },
});

const currentVariant = computed(() => {
  return props.content?.variant || props.variant || 'testimonials_dual';
});

const defaultTestimonials = [
  {
    client_name: 'Clarisse & Ethan',
    event: 'Church Wedding Coverage',
    location: 'Tagaytay Highlands',
    quote: 'RGP Films captured the warmth and genuine joy of our wedding day so flawlessly. Looking back at the photos brings tears to our eyes!',
    rating: 5,
  },
  {
    client_name: 'Jessica & Marcus',
    event: 'Grand Debut & Milestone',
    location: 'Palacio de Memoria',
    quote: 'The team was so fun and professional to work with! The same-day edit reel brought everyone to tears at our reception.',
    rating: 5,
  },
  {
    client_name: 'Patricia & Daniel',
    event: 'Intimate Beach Wedding',
    location: 'Balesin Island Club',
    quote: 'Their attention to detail and ability to capture candid emotion without feeling intrusive was extraordinary.',
    rating: 5,
  },
];

const items = computed(() => {
  return props.content?.testimonials || defaultTestimonials;
});

const venuesList = computed(() => {
  return props.content?.venues || [
    'Tagaytay Highlands',
    'Palacio de Memoria',
    'The Manila Hotel',
    'Antonio’s Garden',
    'Balesin Island Club',
    'Shangri-La at The Fort',
    'Pinto Art Museum',
    'Club Ananda Tagaytay',
  ];
});
</script>

<template>
  <!-- ========================================== -->
  <!-- 1. DUAL REVIEW SPOTLIGHT CARDS -->
  <!-- ========================================== -->
  <section
    v-if="currentVariant === 'testimonials_dual' || currentVariant === 'testimonials'"
    class="py-24 bg-[#141414] border-b border-white/5 font-manrope select-none"
  >
    <div class="max-w-6xl mx-auto px-4 text-center">
      <div class="mb-14 space-y-2">
        <span class="px-3.5 py-1 rounded-full bg-[#FFD700]/10 text-[#FFD700] text-[11px] font-bold uppercase tracking-wider border border-[#FFD700]/20">
          Real Stories
        </span>
        <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {{ content.title || 'CLIENT LOVE & REVIEWS' }}
        </h2>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
          {{ content.subtitle || 'Read firsthand experiences from couples and clients whose milestones we had the honor to capture.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="(t, idx) in items.slice(0, 2)"
          :key="idx"
          class="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 text-left relative flex flex-col justify-between shadow-2xl hover:border-white/20 transition group"
        >
          <div class="space-y-4">
            <div class="flex text-[#FFD700] gap-1">
              <Star v-for="star in (t.rating || 5)" :key="star" class="w-4 h-4 fill-[#FFD700]" />
            </div>
            <p class="text-neutral-200 text-sm sm:text-base leading-relaxed italic">
              "{{ t.quote }}"
            </p>
          </div>
          <div class="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-sm text-white">{{ t.client_name }}</h4>
              <span class="text-[11px] font-mono text-[#FFD700]">{{ t.event }}</span>
            </div>
            <span v-if="t.location" class="text-[10px] text-neutral-500 font-mono">{{ t.location }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 2. 3-COLUMN MASONRY CLIENT REVIEWS GRID -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'testimonials_grid'"
    class="py-24 bg-[#101010] border-b border-white/5 font-manrope select-none"
  >
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-14 space-y-2">
        <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Stories From Our Couples</h2>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
          Over 250+ 5-star verified reviews across weddings, debuts, and commercial visual productions.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(t, idx) in items"
          :key="idx"
          class="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-[#FFD700]/30 transition space-y-4 flex flex-col justify-between"
        >
          <div class="space-y-3">
            <div class="flex text-[#FFD700] gap-1">
              <Star v-for="star in (t.rating || 5)" :key="star" class="w-3.5 h-3.5 fill-[#FFD700]" />
            </div>
            <p class="text-xs text-neutral-300 leading-relaxed italic">
              "{{ t.quote }}"
            </p>
          </div>
          <div class="pt-3 border-t border-white/5">
            <h4 class="font-bold text-xs text-white">{{ t.client_name }}</h4>
            <span class="text-[10px] text-neutral-500 font-mono">{{ t.event }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 3. FULL-WIDTH FEATURED COUPLE EDITORIAL QUOTE -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'testimonials_featured'"
    class="py-28 bg-[#0a0a0a] border-b border-white/5 relative overflow-hidden font-manrope select-none"
  >
    <div class="absolute inset-0 bg-cover bg-center opacity-15" style="background-image: url('/images/hero-bg.jpg');"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]"></div>

    <div class="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
      <Quote class="w-12 h-12 text-[#FFD700]/40 mx-auto" />
      <p class="text-xl sm:text-3xl font-light text-neutral-100 leading-relaxed italic">
        "Working with RGP Films was the single best decision we made for our wedding. The team made us feel completely natural in front of the lens, and our 4K film feels like a genuine cinematic masterpiece."
      </p>
      <div class="space-y-1">
        <h4 class="text-base font-bold text-white tracking-wider uppercase">Clarisse & Ethan Morales</h4>
        <span class="text-xs font-mono text-[#FFD700]">Tagaytay Highlands Church Wedding</span>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 4. PARTNERED VENUES & HOTELS MARQUEE -->
  <!-- ========================================== -->
  <section
    v-else
    class="py-20 bg-[#121212] border-b border-white/5 font-manrope select-none overflow-hidden"
  >
    <div class="max-w-6xl mx-auto px-4 text-center mb-8 space-y-1">
      <span class="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest">Venue & Partner Trust</span>
      <h3 class="text-xl sm:text-2xl font-bold text-white tracking-tight">Trusted at Premier Venues Across the Country</h3>
    </div>

    <!-- Scrolling Marquee Row -->
    <div class="w-full flex overflow-x-hidden relative py-4 mask-fade">
      <div class="flex items-center gap-6 animate-marquee whitespace-nowrap">
        <div
          v-for="(venue, idx) in [...venuesList, ...venuesList]"
          :key="idx"
          class="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-neutral-300 tracking-wider uppercase"
        >
          <Building2 class="w-3.5 h-3.5 text-[#FFD700]" />
          <span>{{ venue }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}
.animate-marquee:hover {
  animation-play-state: paused;
}
</style>

