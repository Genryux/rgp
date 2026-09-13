<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <section
    id="home"
    class="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20"
  >
    <!-- Background image with gradient overlay -->
    <div
      class="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-1000"
      :style="{
        backgroundImage: `url(${content.bg_image || '/images/hero-bg.jpg'})`,
      }"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-[#141414]/80 via-[#141414]/60 to-[#141414]"></div>
    </div>

    <!-- Hero Content -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 text-center select-none py-12">
      <!-- Typography matching original design -->
      <h1 class="text-[24px] md:text-[36px] text-[#f8f8f8] mb-6 flex flex-col md:gap-3 leading-none">
        <div class="flex items-end justify-center gap-3">
          <span class="font-nuosu tracking-wide">{{ content.heading_line1 || 'Turning' }}</span>
          <span class="text-[#FFD700] text-[55px] md:text-[100px] font-italianno leading-none">
            {{ content.heading_accent1 || 'Moments' }}
          </span>
        </div>
        <div class="flex items-center justify-center gap-3 mt-1">
          <span class="font-nuosu tracking-wide">{{ content.heading_line2 || 'into' }}</span>
          <span class="text-[#FFD700] font-bebas text-[52px] md:text-[95px] tracking-wider leading-none">
            {{ content.heading_accent2 || 'Masterpiece.' }}
          </span>
        </div>
      </h1>

      <p class="max-w-2xl mx-auto text-gray-300 font-nuosu text-base md:text-lg mb-8 leading-relaxed">
        {{ content.subheading || 'Professional photography and videography services crafted to preserve your milestones in timeless elegance.' }}
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-wrap justify-center gap-4">
        <a
          :href="content.cta_link || '#contact'"
          class="px-8 py-3.5 rounded-full bg-[#FFD700] text-[#141414] font-nuosu font-semibold tracking-wider hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {{ content.cta_text || 'BOOK A SESSION' }}
        </a>
        <a
          href="#rates"
          class="px-8 py-3.5 rounded-full border border-white/20 text-[#f8f8f8] font-nuosu tracking-wider hover:bg-white/10 transition-all duration-300"
        >
          VIEW PACKAGES
        </a>
      </div>
    </div>

    <!-- Scroll Down Indicator -->
    <a
      href="#showcase"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-[#FFD700] transition flex flex-col items-center gap-2 z-10 animate-bounce"
      aria-label="Scroll to showcase"
    >
      <span class="text-[10px] tracking-widest font-mono uppercase">Explore</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </a>
  </section>
</template>
