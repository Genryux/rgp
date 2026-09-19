<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({
      title: 'MASTER RETOUCHING & COLOR GRADING',
      subtitle: 'Slide across to see how our colorists enhance lighting, depth, and skin tones',
      before_image: '/images/5.jpg',
      after_image: '/images/1.jpg',
    }),
  },
});

const sliderPos = ref(50);
const containerRef = ref(null);
const containerWidth = ref(960);

function updateContainerWidth() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth;
  }
}

let resizeObserver = null;

onMounted(() => {
  updateContainerWidth();
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateContainerWidth();
    });
    resizeObserver.observe(containerRef.value);
  }
  window.addEventListener('resize', updateContainerWidth);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener('resize', updateContainerWidth);
});

function handleInput(e) {
  sliderPos.value = Number(e.target.value);
}
</script>

<template>
  <section id="portfolio" class="py-24 bg-[#111111] border-b border-white/5 font-manrope relative">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700] font-manrope">
          {{ content.badge_text || 'POST-PRODUCTION MASTERY' }}
        </span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'BEFORE & AFTER RETOUCHING' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'Drag the interactive slider to compare straight-out-of-camera RAW vs master edit.' }}
        </p>
      </div>

      <!-- Comparison Slider Container (Increased size: max-w-4xl lg:max-w-[960px] vs previous max-w-3xl) -->
      <div
        ref="containerRef"
        class="relative max-w-4xl lg:max-w-[960px] mx-auto rounded-3xl overflow-hidden aspect-[16/10] border border-white/[0.12] shadow-2xl select-none"
      >
        <!-- After Image (Full background) -->
        <img
          :src="content.after_image || '/images/1.jpg'"
          alt="After Retouching"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- Master Grade Badge (Using same font as subtitle/caption in 4K Video Reel: font-manrope font-semibold uppercase tracking-wider) -->
        <span
          class="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xs text-[11px] font-semibold font-manrope uppercase tracking-wider text-[#FFD700] z-10 whitespace-nowrap pointer-events-none transition-opacity duration-150 select-none shadow-md border border-white/10"
          :style="{
            opacity: sliderPos > 90 ? Math.max(0, (98 - sliderPos) / 8) : 1
          }"
        >
          {{ content.after_label || 'Master Grade' }}
        </span>

        <!-- Before Image (Clipped overlay) -->
        <div
          class="absolute inset-0 overflow-hidden"
          :style="{ width: `${sliderPos}%` }"
        >
          <img
            :src="content.before_image || '/images/5.jpg'"
            alt="Before Retouching"
            class="absolute inset-0 h-full object-cover max-w-none"
            :style="{ width: `${containerWidth}px` }"
          />
          <!-- Raw Capture Badge (Using same font as subtitle/caption in 4K Video Reel: font-manrope font-semibold uppercase tracking-wider) -->
          <!-- Fixed squishing issue with whitespace-nowrap and graceful opacity fade when slider is on the left side -->
          <span
            class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xs text-[11px] font-semibold font-manrope uppercase tracking-wider text-neutral-300 z-10 whitespace-nowrap pointer-events-none transition-opacity duration-150 select-none shadow-md border border-white/10"
            :style="{
              opacity: sliderPos < 12 ? Math.max(0, (sliderPos - 4) / 8) : 1
            }"
          >
            {{ content.before_label || 'Raw Capture' }}
          </span>
        </div>

        <!-- Slider Line & Handle -->
        <div
          class="absolute top-0 bottom-0 w-0.5 bg-[#FFD700] shadow-lg pointer-events-none z-20"
          :style="{ left: `${sliderPos}%` }"
        >
          <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FFD700] text-black shadow-xl flex items-center justify-center text-xs font-bold select-none cursor-ew-resize">
            ↔
          </div>
        </div>

        <!-- Range Input (invisible overlay) -->
        <input
          type="range"
          min="0"
          max="100"
          :value="sliderPos"
          @input="handleInput"
          class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          aria-label="Before and after comparison slider"
        />
      </div>
    </div>
  </section>
</template>
