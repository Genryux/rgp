<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({
      title: 'TRUSTED & FEATURED AT PREMIER VENUES',
      venues: [
        'Tagaytay Highlands',
        'Palacio de Memoria',
        'The Manila Hotel',
        'Antonio’s Garden',
        'Balesin Island Club',
        'Shangri-La at The Fort',
        'Pinto Art Museum',
        'Conrad Manila',
      ],
    }),
  },
});
</script>

<template>
  <section class="py-16 bg-[#0a0a0a] border-b border-white/5 font-manrope overflow-hidden">
    <div class="max-w-6xl mx-auto px-4 text-center mb-8">
      <span class="text-[11px] font-semibold uppercase tracking-widest text-[#FFD700]">FEATURED LOCATIONS & COLLABORATORS</span>
      <h3 class="text-xl md:text-2xl font-bebas text-white tracking-wider mt-1">
        {{ content.title || 'TRUSTED & FEATURED AT PREMIER VENUES' }}
      </h3>
    </div>

    <!-- Marquee Track -->
    <div class="relative w-full overflow-hidden select-none py-2">
      <div class="flex gap-8 whitespace-nowrap animate-scroll items-center opacity-70 hover:opacity-100 transition">
        <div
          v-for="(venue, idx) in [...(content.venues || []), ...(content.venues || [])]"
          :key="idx"
          class="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-neutral-300 font-nuosu"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700]"></span>
          <span>{{ venue }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
