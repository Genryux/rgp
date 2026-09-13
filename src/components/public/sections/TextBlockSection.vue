<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <section class="py-20 bg-[#111111] border-b border-white/5">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h2 v-if="content.title" class="text-3xl md:text-5xl font-bebas text-white tracking-wider mb-6">
        {{ content.title }}
      </h2>
      <div class="text-gray-300 font-nuosu text-base md:text-lg leading-relaxed space-y-4">
        <p>{{ content.body || 'Every photo tells a story of love, laughter, and timeless memories.' }}</p>
      </div>
    </div>
  </section>
</template>
