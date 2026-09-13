<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({
      title: 'WHAT OUR CLIENTS SAY',
      testimonials: [
        {
          client_name: 'Clarisse & Ethan',
          event: 'Wedding Coverage',
          quote: 'RGP Films captured the warmth and joy of our wedding day so flawlessly. Looking back at the photos brings tears to our eyes!',
          rating: 5,
        },
        {
          client_name: 'Jessica Gomez',
          event: 'Debut Celebration',
          quote: 'The team was so fun and professional to work with! The highlight video was truly cinematic.',
          rating: 5,
        },
      ],
    }),
  },
});
</script>

<template>
  <section class="py-24 bg-[#141414] border-b border-white/5">
    <div class="max-w-6xl mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mb-12">
        {{ content.title || 'CLIENT LOVE & REVIEWS' }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="(t, idx) in (content.testimonials || [])"
          :key="idx"
          class="p-8 rounded-3xl bg-white/5 border border-white/10 text-left relative flex flex-col justify-between"
        >
          <div class="space-y-4">
            <div class="flex text-[#FFD700] gap-1">
              <span v-for="star in 5" :key="star">★</span>
            </div>
            <p class="text-gray-300 font-nuosu italic text-base leading-relaxed">
              "{{ t.quote }}"
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-white/10">
            <h4 class="font-bebas text-lg text-white tracking-wide">{{ t.client_name }}</h4>
            <span class="text-xs font-mono text-[#FFD700]">{{ t.event }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
