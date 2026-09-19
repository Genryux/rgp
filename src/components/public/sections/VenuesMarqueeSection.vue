<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});

const defaultVenues = [
  'Tagaytay Highlands',
  'Palacio de Memoria',
  'The Manila Hotel',
  'Antonio’s Garden',
  'Balesin Island Club',
  'Shangri-La at The Fort',
  'Pinto Art Museum',
  'Club Ananda Tagaytay',
];

const venuesList = computed(() => {
  const raw = props.content?.venues && props.content.venues.length > 0
    ? props.content.venues
    : defaultVenues;
  let repeated = [...raw];
  while (repeated.length < 8) {
    repeated = [...repeated, ...raw];
  }
  return repeated;
});
</script>

<template>
  <section class="py-16 sm:py-20 bg-[#0a0a0a] border-b border-white/5 font-manrope overflow-hidden relative select-none">
    <div class="max-w-6xl mx-auto px-4 text-center mb-8 space-y-1">
      <span class="text-[11px] font-semibold uppercase tracking-widest text-[#FFD700]">
        {{ content.badge_text || 'FEATURED LOCATIONS & COLLABORATORS' }}
      </span>
      <h3 class="text-xl md:text-2xl font-bebas text-white tracking-wider">
        {{ content.title || 'TRUSTED & FEATURED AT PREMIER VENUES' }}
      </h3>
      <p v-if="content.subtitle" class="text-xs text-neutral-400 max-w-lg mx-auto pt-1">
        {{ content.subtitle }}
      </p>
    </div>

    <!-- Edge gradient fade masks -->
    <div class="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
    <div class="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10"></div>

    <!-- Infinite Seamless Double-Track Marquee -->
    <div class="w-full overflow-hidden relative py-2">
      <div class="flex w-max animate-marquee-venues hover:[animation-play-state:paused]">
        <!-- Track 1 -->
        <div class="flex items-center gap-6 pr-6 shrink-0">
          <div
            v-for="(venue, idx) in venuesList"
            :key="'v1-' + idx"
            class="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#FFD700]/30 text-sm text-neutral-300 hover:text-white font-nuosu transition whitespace-nowrap shadow-sm"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] shrink-0 shadow-sm shadow-yellow-500/50"></span>
            <span>{{ venue }}</span>
          </div>
        </div>

        <!-- Track 2 (Exact Clone for Seamless Loop) -->
        <div class="flex items-center gap-6 pr-6 shrink-0" aria-hidden="true">
          <div
            v-for="(venue, idx) in venuesList"
            :key="'v2-' + idx"
            class="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#FFD700]/30 text-sm text-neutral-300 hover:text-white font-nuosu transition whitespace-nowrap shadow-sm"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] shrink-0 shadow-sm shadow-yellow-500/50"></span>
            <span>{{ venue }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee-venues {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee-venues {
  display: flex;
  width: max-content;
  animation: marquee-venues 32s linear infinite;
  will-change: transform;
}
</style>
