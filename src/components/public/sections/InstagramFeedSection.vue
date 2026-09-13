<script setup>
import { useSettings } from '../../../composables/useSettings';
import { useGallery } from '../../../composables/useGallery';

defineProps({
  content: {
    type: Object,
    default: () => ({
      title: 'FOLLOW OUR JOURNEY ON INSTAGRAM',
      handle: '@rgpfilmsstudio',
    }),
  },
});

const { settings } = useSettings();
const { gallery } = useGallery();
</script>

<template>
  <section class="py-20 bg-[#0e0e0e] border-b border-white/5 font-manrope">
    <div class="max-w-6xl mx-auto px-4 text-center">
      <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700]">SOCIAL FEED</span>
      <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-1 mb-2">
        {{ content.title || 'FOLLOW OUR VISUAL JOURNEY' }}
      </h2>
      <a
        :href="settings.instagram_url || 'https://instagram.com'"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs font-mono text-[#FFD700] hover:underline inline-block mb-10"
      >
        {{ content.handle || '@rgpfilmsstudio' }} ↗
      </a>

      <!-- Mini 6-photo feed grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <a
          v-for="(img, idx) in gallery.slice(0, 6)"
          :key="idx"
          :href="settings.instagram_url || '#'"
          target="_blank"
          class="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.08] relative group block"
        >
          <img
            :src="img.image_url"
            :alt="img.title || 'Instagram shot'"
            class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-[#FFD700]">
            <span class="text-lg">♥</span>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
