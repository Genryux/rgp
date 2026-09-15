<script setup>
import { computed } from 'vue';
import { useGallery } from '../../../composables/useGallery';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});

const { gallery } = useGallery();

const displayedImages = computed(() => {
  if (props.content.category && props.content.category !== 'All') {
    return gallery.value.filter((g) => g.category === props.content.category);
  }
  return gallery.value.slice(0, props.content.limit || 8);
});
</script>

<template>
  <section class="py-20 bg-[#141414] border-b border-white/5">
    <div class="max-w-6xl mx-auto px-4">
      <div v-if="content.title" class="text-center mb-12">
        <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-2">{{ content.title }}</h2>
        <p v-if="content.subtitle" class="text-gray-400 font-nuosu text-sm max-w-xl mx-auto">{{ content.subtitle }}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="img in displayedImages"
          :key="img.id"
          class="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 group relative"
        >
          <img
            :src="img.image_url"
            :alt="img.title || 'Gallery image'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span class="text-xs font-mono text-[#FFD700] tracking-wider">{{ img.title || img.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
