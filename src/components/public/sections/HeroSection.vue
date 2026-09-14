<script setup>
import { computed } from 'vue';
import { Play, Star, Sparkles, Film, ArrowRight, Camera } from '@lucide/vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'editorial', // editorial | split_card | minimalist_cinema | bento | video_reel
  },
});

const currentVariant = computed(() => {
  return props.content?.variant || props.variant || 'editorial';
});
</script>

<template>
  <!-- ========================================== -->
  <!-- VARIANT 1: LUXURY EDITORIAL (SIGNATURE) -->
  <!-- ========================================== -->
  <section
    v-if="currentVariant === 'editorial'"
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
      <!-- Typography matching signature luxury design -->
      <h1 class="text-[24px] md:text-[36px] text-[#f8f8f8] mb-6 flex flex-col md:gap-3 leading-none font-manrope">
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

  <!-- ========================================== -->
  <!-- VARIANT 2: SPLIT 2-COLUMN WITH FRAMED CARD -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'split_card'"
    id="home"
    class="relative min-h-[90vh] flex items-center bg-[#0d0d0d] pt-24 pb-16 overflow-hidden"
  >
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 w-full relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Left Column: Typography & CTAs -->
        <div class="lg:col-span-7 space-y-6 text-left">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[#FFD700]/30 text-[#FFD700] text-xs font-semibold uppercase tracking-wider">
            <Sparkles class="w-3.5 h-3.5 text-[#FFD700]" />
            <span>{{ content.badge_text || 'Premium Visual Storytelling' }}</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight font-manrope">
            <span>{{ content.heading_line1 || 'Capturing' }}</span>
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-yellow-200 to-[#FFD700]">
              {{ content.heading_accent1 || 'Pure Emotion' }}
            </span>
            <span class="text-neutral-300 font-light text-3xl sm:text-4xl block mt-1">
              {{ content.heading_accent2 || '& Timeless Elegance.' }}
            </span>
          </h1>

          <p class="text-neutral-400 text-base md:text-lg max-w-xl leading-relaxed">
            {{ content.subheading || 'Specialized in editorial wedding cinema, intimate portraits, and high-impact commercial campaigns.' }}
          </p>

          <div class="flex flex-wrap items-center gap-4 pt-2">
            <a
              :href="content.cta_link || '#contact'"
              class="px-8 py-3.5 rounded-2xl bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
            >
              <span>{{ content.cta_text || 'Reserve Your Date' }}</span>
              <ArrowRight class="w-4 h-4" />
            </a>
            <a
              href="#showcase"
              class="px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition"
            >
              View Portfolio
            </a>
          </div>

          <!-- Social Proof Quick Strip -->
          <div class="flex items-center gap-6 pt-4 border-t border-white/[0.08]">
            <div class="flex items-center gap-1.5 text-amber-400">
              <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-amber-400" />
            </div>
            <div class="text-xs text-neutral-400">
              <strong class="text-white">5.0 Star Rating</strong> across 250+ weddings & debut milestones
            </div>
          </div>
        </div>

        <!-- Right Column: Framed Visual Card -->
        <div class="lg:col-span-5 relative">
          <div class="relative rounded-3xl overflow-hidden border-2 border-[#FFD700]/40 shadow-2xl shadow-yellow-500/10 group">
            <img
              :src="content.bg_image || '/images/hero-bg.jpg'"
              alt="Studio Feature"
              class="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            
            <div class="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase font-mono tracking-wider text-[#FFD700]">Lead Showcase</span>
                <h4 class="text-sm font-bold text-white">Cinematic Wedding Reel</h4>
              </div>
              <div class="w-10 h-10 rounded-full bg-[#FFD700] text-black flex items-center justify-center font-bold">
                <Camera class="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- VARIANT 3: MINIMALIST CINEMA SPOTLIGHT -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'minimalist_cinema'"
    id="home"
    class="relative min-h-screen flex flex-col justify-center items-center bg-[#0a0a0a] text-center px-4 pt-24 pb-16 overflow-hidden"
  >
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FFD700]/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="relative z-10 max-w-4xl mx-auto space-y-8">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-300 text-xs tracking-widest uppercase">
        <Film class="w-3.5 h-3.5 text-[#FFD700]" />
        <span>RGP Films & Studio • Est. 2019</span>
      </div>

      <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight uppercase leading-[1.08] font-manrope">
        {{ content.heading_line1 || 'CINEMATIC' }}
        <span class="text-[#FFD700] font-italianno text-6xl sm:text-8xl md:text-9xl normal-case block my-1">
          {{ content.heading_accent1 || 'Artistry' }}
        </span>
        {{ content.heading_accent2 || 'FOR YOUR STORY' }}
      </h1>

      <p class="max-w-xl mx-auto text-neutral-400 text-sm sm:text-base leading-relaxed">
        {{ content.subheading || 'Crafting evocative, documentary-grade films and photography for discerning couples and brands.' }}
      </p>

      <div class="flex flex-wrap justify-center items-center gap-4 pt-2">
        <a
          :href="content.cta_link || '#contact'"
          class="px-9 py-4 rounded-full bg-[#FFD700] text-black font-extrabold text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20"
        >
          {{ content.cta_text || 'CHECK AVAILABILITY' }}
        </a>
        <a
          href="#rates"
          class="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/15 text-xs font-bold uppercase tracking-widest transition"
        >
          EXPLORE RATES
        </a>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- VARIANT 4: MODERN BENTO BOX HERO -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'bento'"
    id="home"
    class="relative min-h-[92vh] flex items-center bg-[#101010] pt-24 pb-16 px-4"
  >
    <div class="max-w-6xl mx-auto w-full space-y-6">
      <!-- Main Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <!-- Main Large Hero Card (8 Cols) -->
        <div class="md:col-span-8 rounded-3xl bg-[#161616] border border-white/[0.08] p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div
            class="absolute inset-0 bg-cover bg-center opacity-30"
            :style="{ backgroundImage: `url(${content.bg_image || '/images/hero-bg.jpg'})` }"
          ></div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/70 to-transparent"></div>

          <div class="relative z-10 space-y-4">
            <span class="px-3.5 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold uppercase tracking-wider">
              Studio & On-Location
            </span>
            <h1 class="text-3xl sm:text-5xl font-black text-white leading-tight font-manrope">
              {{ content.heading_line1 || 'Crafting' }}
              <span class="text-[#FFD700]">{{ content.heading_accent1 || 'Unforgettable' }}</span>
              <span class="block">{{ content.heading_accent2 || 'Visual Legacies.' }}</span>
            </h1>
            <p class="text-neutral-400 text-sm sm:text-base max-w-lg">
              {{ content.subheading || 'Award-winning photo & cinema team preserving weddings, debuts, and milestones.' }}
            </p>
          </div>

          <div class="relative z-10 pt-6 flex flex-wrap items-center gap-3">
            <a
              :href="content.cta_link || '#contact'"
              class="px-7 py-3 rounded-2xl bg-[#FFD700] text-black font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition"
            >
              {{ content.cta_text || 'Book Session' }}
            </a>
            <a
              href="#showcase"
              class="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition"
            >
              View Works
            </a>
          </div>
        </div>

        <!-- Bento Card 1: 5-Star Reputation (4 Cols) -->
        <div class="md:col-span-4 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-white/[0.08] p-6 flex flex-col justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-1 text-[#FFD700]">
              <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-[#FFD700]" />
            </div>
            <h3 class="text-2xl font-bold text-white">100% Client Satisfaction</h3>
            <p class="text-xs text-neutral-400 leading-relaxed">
              Consistently rated 5 stars by over 250+ wedding couples, debutantes, and corporate partners across the country.
            </p>
          </div>
          <div class="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400 font-semibold">
            <span>Verified Testimonials</span>
            <span class="text-[#FFD700]">250+</span>
          </div>
        </div>

        <!-- Bento Card 2: Gear & Fidelity (4 Cols) -->
        <div class="md:col-span-4 rounded-3xl bg-[#141414] border border-white/[0.08] p-6 space-y-3">
          <div class="w-9 h-9 rounded-2xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center font-bold">
            <Camera class="w-5 h-5" />
          </div>
          <h4 class="text-base font-bold text-white">4K Cinema & HDR Delivery</h4>
          <p class="text-xs text-neutral-400 leading-relaxed">
            Shot on Sony FX cinema bodies and G-Master prime optics for magazine-grade clarity and colors.
          </p>
        </div>

        <!-- Bento Card 3: 48-Hour Sneak Peek (4 Cols) -->
        <div class="md:col-span-4 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
          <Sparkles class="w-5 h-5" />
        </div>
        <div class="md:col-span-4 rounded-3xl bg-[#141414] border border-white/[0.08] p-6 space-y-3">
          <h4 class="text-base font-bold text-white">48-Hour Sneak Peek</h4>
          <p class="text-xs text-neutral-400 leading-relaxed">
            Receive your first highlights batch within 48 hours to share with friends and family.
          </p>
        </div>

        <!-- Bento Card 4: Date Reservation (4 Cols) -->
        <div class="md:col-span-4 rounded-3xl bg-gradient-to-br from-[#FFD700]/20 to-neutral-900 border border-[#FFD700]/30 p-6 flex flex-col justify-between">
          <div class="space-y-1">
            <span class="text-[10px] uppercase font-mono text-[#FFD700] tracking-wider">Season 2026</span>
            <h4 class="text-lg font-bold text-white">Calendar Open For Booking</h4>
          </div>
          <a
            href="#contact"
            class="inline-flex items-center justify-between text-xs font-bold text-[#FFD700] hover:text-yellow-300 pt-3"
          >
            <span>Lock Your Date Now</span>
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- VARIANT 5: FULLSCREEN VIDEO REEL HERO -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'video_reel'"
    id="home"
    class="relative min-h-screen flex flex-col justify-end bg-black pb-16 px-4 pt-24 overflow-hidden"
  >
    <!-- Background visual / simulated video preview -->
    <div
      class="absolute inset-0 bg-cover bg-center z-0 scale-100"
      :style="{ backgroundImage: `url(${content.bg_image || '/images/hero-bg.jpg'})` }"
    >
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>
    </div>

    <!-- Center Play Reel Pill -->
    <div class="relative z-10 max-w-5xl mx-auto w-full mb-12 flex justify-center">
      <a
        :href="content.video_url || '#showcase'"
        class="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-[#FFD700] text-white transition shadow-2xl"
      >
        <div class="w-9 h-9 rounded-full bg-[#FFD700] text-black flex items-center justify-center font-bold group-hover:scale-110 transition">
          <Play class="w-4 h-4 fill-black ml-0.5" />
        </div>
        <div class="text-left">
          <span class="text-[10px] text-[#FFD700] font-mono uppercase tracking-wider block">Watch 4K Highlight Reel</span>
          <span class="text-xs font-bold text-white">Turn sound on (2:45 min)</span>
        </div>
      </a>
    </div>

    <!-- Bottom Content Bar -->
    <div class="relative z-10 max-w-5xl mx-auto w-full">
      <div class="p-6 md:p-8 rounded-3xl bg-[#141414]/90 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div class="space-y-1">
          <span class="text-[11px] font-mono text-[#FFD700] uppercase tracking-wider">Cinematic Video & Photography</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-white font-manrope">
            {{ content.heading_line1 || 'Capturing Every Heartbeat' }}
          </h2>
          <p class="text-xs text-neutral-400 max-w-md">
            {{ content.subheading || 'Documentary wedding cinema and timeless portraits created with passion.' }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <a
            :href="content.cta_link || '#contact'"
            class="px-6 py-3 rounded-2xl bg-[#FFD700] text-black font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition"
          >
            {{ content.cta_text || 'Book Your Date' }}
          </a>
          <a
            href="#rates"
            class="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition"
          >
            View Packages
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
