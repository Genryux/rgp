<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});

// Helper to extract YouTube embed URL
const embedUrl = computed(() => {
  const url = props.content.video_url || '';
  if (!url) return null;

  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
});
</script>

<template>
  <section id="highlights" class="py-24 bg-[#111111] border-b border-white/5 relative overflow-hidden font-manrope">
    <span id="portfolio" class="absolute -top-24"></span>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center">
      <!-- Top Eyebrow Badge (Following "POST-PRODUCTION MASTERY" pattern) -->
      <span
        v-if="content.badge_text"
        class="text-xs font-semibold uppercase tracking-widest text-[#FFD700] font-manrope mb-2 inline-block"
      >
        {{ content.badge_text }}
      </span>

      <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-3">
        {{ content.title || 'CINEMATIC HIGHLIGHTS' }}
      </h2>
      <p v-if="content.subtitle" class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto mb-12">
        {{ content.subtitle }}
      </p>

      <!-- Video Player Frame (Slightly increased size: max-w-5xl vs previous max-w-4xl) -->
      <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video max-w-5xl mx-auto group">
        <iframe
          v-if="embedUrl"
          :src="embedUrl"
          class="w-full h-full"
          title="Video Highlight Reel"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>

        <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-500 p-8">
          <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-mono">No video highlight URL configured yet.</p>
        </div>
      </div>

      <!-- Subtitle / Caption text using same font as "POST-PRODUCTION MASTERY" -->
      <p v-if="content.caption" class="text-xs font-semibold uppercase tracking-widest text-neutral-400 font-manrope mt-5">
        {{ content.caption }}
      </p>
    </div>
  </section>
</template>
