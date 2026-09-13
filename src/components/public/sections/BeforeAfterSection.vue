<script setup>
import { ref } from 'vue';

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

function handleInput(e) {
  sliderPos.value = Number(e.target.value);
}
</script>

<template>
  <section class="py-24 bg-[#111111] border-b border-white/5 font-manrope">
    <div class="max-w-5xl mx-auto px-4">
      <div class="text-center mb-12">
        <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700]">POST-PRODUCTION MASTERY</span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'BEFORE & AFTER RETOUCHING' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'Drag the interactive slider to compare straight-out-of-camera RAW vs master edit.' }}
        </p>
      </div>

      <!-- Comparison Slider Container -->
      <div class="relative max-w-3xl mx-auto rounded-3xl overflow-hidden aspect-[16/10] border border-white/[0.12] shadow-2xl select-none">
        <!-- After Image (Full background) -->
        <img
          :src="content.after_image || '/images/1.jpg'"
          alt="After Retouching"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <span class="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono uppercase text-[#FFD700] z-10">
          Master Grade
        </span>

        <!-- Before Image (Clipped overlay) -->
        <div
          class="absolute inset-0 overflow-hidden"
          :style="{ width: `${sliderPos}%` }"
        >
          <img
            :src="content.before_image || '/images/5.jpg'"
            alt="Before Retouching"
            class="absolute inset-0 w-full h-full object-cover max-w-none"
            :style="{ width: '100%', minWidth: '768px' }"
          />
          <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono uppercase text-neutral-300 z-10">
            Raw Capture
          </span>
        </div>

        <!-- Slider Line & Handle -->
        <div
          class="absolute top-0 bottom-0 w-0.5 bg-[#FFD700] shadow-lg pointer-events-none z-20"
          :style="{ left: `${sliderPos}%` }"
        >
          <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FFD700] text-black shadow-xl flex items-center justify-center text-xs font-bold">
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
