<script setup>
defineProps({
  type: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="w-full h-32 rounded-xl bg-black/60 border border-white/[0.08] p-3 flex flex-col justify-center items-center overflow-hidden relative select-none group-hover:border-[#FFD700]/40 transition duration-300">
    
    <!-- ========================================== -->
    <!-- 1. HERO VARIANTS (4 Blocks) -->
    <!-- ========================================== -->
    <!-- Hero 1: Luxury Editorial -->
    <div v-if="type === 'hero' || type === 'hero-editorial'" class="w-full h-full flex flex-col justify-center items-center gap-1.5">
      <div class="w-2/3 h-2.5 rounded-full bg-white/25 animate-pulse"></div>
      <div class="w-1/2 h-3 rounded-full bg-[#FFD700]/70"></div>
      <div class="w-3/4 h-1 rounded-full bg-white/10 mt-0.5"></div>
      <div class="flex gap-1.5 mt-2">
        <div class="w-12 h-3 rounded-full bg-[#FFD700] opacity-90"></div>
        <div class="w-12 h-3 rounded-full bg-white/10 border border-white/20"></div>
      </div>
    </div>

    <!-- Hero 2: Split 2-Column with Framed Card -->
    <div v-else-if="type === 'hero-split'" class="w-full h-full grid grid-cols-12 gap-2 items-center px-1">
      <div class="col-span-7 space-y-1.5">
        <div class="w-10 h-1 rounded-full bg-[#FFD700]"></div>
        <div class="w-full h-2.5 rounded-full bg-white/30"></div>
        <div class="w-3/4 h-2 rounded-full bg-[#FFD700]/60"></div>
        <div class="w-5/6 h-1 rounded-full bg-white/10"></div>
        <div class="w-12 h-2.5 rounded-md bg-[#FFD700] mt-1"></div>
      </div>
      <div class="col-span-5 h-22 rounded-lg bg-neutral-800 border border-[#FFD700]/50 relative overflow-hidden flex items-end p-1">
        <div class="w-full h-1.5 rounded bg-black/60"></div>
      </div>
    </div>

    <!-- Hero 3: Minimalist Cinema Spotlight -->
    <div v-else-if="type === 'hero-minimalist'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 relative">
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-20 h-20 bg-[#FFD700]/15 rounded-full blur-xl"></div>
      </div>
      <div class="w-16 h-1 rounded-full bg-white/20"></div>
      <div class="w-3/4 h-3.5 rounded-full bg-white/40"></div>
      <div class="w-1/3 h-3 rounded-full bg-[#FFD700]"></div>
      <div class="w-20 h-3 rounded-full bg-[#FFD700] mt-1"></div>
    </div>

    <!-- Hero 4: Fullscreen Video Reel Hero -->
    <div v-else-if="type === 'hero-video'" class="w-full h-full flex flex-col justify-between p-1.5 bg-neutral-900/60 rounded-lg relative">
      <div class="w-8 h-1 rounded bg-[#FFD700]"></div>
      <div class="w-8 h-8 rounded-full bg-[#FFD700] self-center flex items-center justify-center shadow-lg shadow-yellow-500/20">
        <div class="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-black ml-0.5"></div>
      </div>
      <div class="w-full h-4 rounded-md bg-black/70 border border-white/10 px-2 flex items-center justify-between">
        <div class="w-14 h-1 rounded bg-white/40"></div>
        <div class="w-6 h-2 rounded bg-[#FFD700]"></div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 2. FEATURES SECTION (4 Blocks) -->
    <!-- ========================================== -->
    <!-- Features 1: 3-Column Studio Highlights -->
    <div v-else-if="type === 'features-grid' || type === 'about-split' || type === 'about'" class="w-full h-full flex flex-col justify-between py-1 px-2">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-3 gap-1.5 w-full">
        <div v-for="i in 3" :key="i" class="p-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between h-20">
          <div class="w-4 h-4 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-[#FFD700]"></div>
          </div>
          <div class="w-full h-1.5 rounded bg-white/30"></div>
          <div class="w-3/4 h-1 rounded bg-white/10"></div>
        </div>
      </div>
    </div>

    <!-- Features 2: 4-Step Process Timeline -->
    <div v-else-if="type === 'process-timeline' || type === 'process'" class="w-full h-full flex flex-col justify-between py-1 px-2">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div v-for="i in 4" :key="i" class="p-1 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between h-20">
          <span class="text-[9px] font-bold text-[#FFD700]">0{{ i }}</span>
          <div class="w-full h-1 rounded-full bg-white/20"></div>
          <div class="w-3/4 h-1 rounded-full bg-white/10"></div>
        </div>
      </div>
    </div>

    <!-- Features 3: Camera & Cinema Gear Arsenal -->
    <div v-else-if="type === 'gear-arsenal' || type === 'gear'" class="w-full h-full flex flex-col justify-between py-1 px-2">
      <div class="w-24 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div v-for="i in 4" :key="i" class="p-1 rounded-lg bg-white/5 border border-white/10 space-y-1 h-20">
          <div class="w-8 h-1 rounded bg-[#FFD700]"></div>
          <div class="w-full h-0.5 rounded bg-white/15"></div>
          <div class="w-full h-0.5 rounded bg-white/15"></div>
        </div>
      </div>
    </div>

    <!-- Features 4: Studio Story & Philosophy Manifesto -->
    <div v-else-if="type === 'story-manifesto' || type === 'about-manifesto' || type === 'text_block'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-4 text-center">
      <div class="w-12 h-1 rounded-full bg-[#FFD700]"></div>
      <div class="w-3/4 h-2 rounded-full bg-white/30"></div>
      <div class="w-full h-1 rounded-full bg-white/10"></div>
      <div class="w-2/3 h-1 rounded-full bg-white/10"></div>
      <div class="w-14 h-2 rounded-full bg-[#FFD700]/70 mt-1"></div>
    </div>

    <!-- ========================================== -->
    <!-- 3. PRICING COMPONENT (4 Blocks) -->
    <!-- ========================================== -->
    <!-- Pricing 1: 3-Tier Luxury Pricing Cards -->
    <div v-else-if="type === 'pricing-tiered' || type === 'rates-tiered' || type === 'rates'" class="w-full h-full flex flex-col justify-between py-1">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-3 gap-1.5 w-full px-2">
        <div class="rounded-lg bg-white/5 border border-white/10 p-1.5 flex flex-col justify-between h-20">
          <div class="w-8 h-1 rounded-full bg-white/30"></div>
          <div class="w-10 h-2 rounded-full bg-[#FFD700]/70"></div>
          <div class="w-full h-1 rounded bg-white/10"></div>
          <div class="w-full h-2 rounded bg-white/10"></div>
        </div>
        <div class="rounded-lg bg-white/10 border border-[#FFD700]/60 p-1.5 flex flex-col justify-between h-20 shadow-md">
          <div class="w-8 h-1 rounded-full bg-[#FFD700]"></div>
          <div class="w-10 h-2 rounded-full bg-[#FFD700]"></div>
          <div class="w-full h-1 rounded bg-white/20"></div>
          <div class="w-full h-2 rounded bg-[#FFD700]"></div>
        </div>
        <div class="rounded-lg bg-white/5 border border-white/10 p-1.5 flex flex-col justify-between h-20">
          <div class="w-8 h-1 rounded-full bg-white/30"></div>
          <div class="w-10 h-2 rounded-full bg-[#FFD700]/70"></div>
          <div class="w-full h-1 rounded bg-white/10"></div>
          <div class="w-full h-2 rounded bg-white/10"></div>
        </div>
      </div>
    </div>

    <!-- Pricing 2: Single All-Inclusive Spotlight -->
    <div v-else-if="type === 'pricing-spotlight'" class="w-full h-full flex flex-col justify-between py-1.5 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="w-full rounded-xl bg-white/5 border border-[#FFD700]/30 p-2 flex gap-2 items-center">
        <!-- Left mini plan cards -->
        <div class="w-1/2 space-y-1">
          <div class="w-full h-3 rounded bg-white/10 border border-white/10"></div>
          <div class="w-full h-3.5 rounded bg-[#FFD700]/20 border border-[#FFD700]/60 flex items-center justify-between px-1">
            <div class="w-2 h-2 rounded-full border border-[#FFD700] bg-[#FFD700]"></div>
            <div class="w-4 h-1.5 rounded bg-[#FFD700]"></div>
          </div>
          <div class="w-full h-3 rounded bg-white/10 border border-white/10"></div>
        </div>
        <!-- Right mini includes box -->
        <div class="w-1/2 h-full rounded bg-white/5 p-1 space-y-1 flex flex-col justify-center">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between">
            <div class="w-8 h-1 rounded bg-white/20"></div>
            <div class="w-1.5 h-1.5 rounded-full border border-[#FFD700]/70 bg-[#FFD700]/20"></div>
          </div>
        </div>
      </div>
      <div class="flex justify-center items-center">
        <div class="w-14 h-2 rounded-full bg-[#FFD700]"></div>
      </div>
    </div>

    <!-- Pricing 3: A La Carte Deliverables & Add-ons -->
    <div v-else-if="type === 'pricing-addons'" class="w-full h-full flex flex-col justify-between py-1 px-3 relative">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-3 gap-1.5 w-full">
        <div v-for="i in 3" :key="i" class="p-1 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between relative" :class="[i === 1 ? 'border-[#FFD700]/60' : '']">
          <div v-if="i === 1" class="absolute -top-1 -right-0.5 w-2.5 h-1 rounded-full bg-[#FFD700]"></div>
          <div class="w-8 h-1 rounded bg-white/40 mb-0.5"></div>
          <div class="w-5 h-1 rounded bg-[#FFD700] mb-0.5"></div>
          <div class="w-full h-0.5 bg-white/10 my-0.5"></div>
          <div class="space-y-0.5">
            <div class="w-6 h-0.5 rounded bg-white/20"></div>
            <div class="w-5 h-0.5 rounded bg-white/20"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing 4: Feature Comparison Matrix Table -->
    <div v-else-if="type === 'pricing-comparison'" class="w-full h-full flex flex-col justify-between py-1 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="w-full space-y-1">
        <div class="grid grid-cols-4 gap-1 p-1 bg-white/10 rounded">
          <div class="w-full h-1 bg-white/30"></div>
          <div class="w-full h-1 bg-[#FFD700]"></div>
          <div class="w-full h-1 bg-[#FFD700]"></div>
          <div class="w-full h-1 bg-[#FFD700]"></div>
        </div>
        <div v-for="i in 3" :key="i" class="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded border border-white/5">
          <div class="w-full h-1 bg-white/20"></div>
          <div class="w-2 h-2 rounded-full bg-emerald-400 mx-auto"></div>
          <div class="w-2 h-2 rounded-full bg-emerald-400 mx-auto"></div>
          <div class="w-2 h-2 rounded-full bg-emerald-400 mx-auto"></div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 4. TESTIMONIALS COMPONENT (4 Blocks) -->
    <!-- ========================================== -->
    <!-- Testimonials 1: Image Review Cards (Full-bleed screenshots with subtle tilt) -->
    <div v-else-if="type === 'testimonials-dual' || type === 'testimonials'" class="w-full h-full flex flex-col justify-between py-1.5 px-2">
      <div class="flex items-center justify-between w-full">
        <div class="space-y-0.5">
          <div class="w-8 h-1 rounded-full bg-[#FFD700]"></div>
          <div class="w-16 h-1.5 rounded-full bg-white/30"></div>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-[#FFD700]"></div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div
          v-for="i in 4"
          :key="i"
          class="rounded-lg bg-neutral-900 border overflow-hidden flex flex-col items-center justify-center p-1"
          :class="[
            i === 1 ? '-rotate-[2deg] border-rose-500/40' :
            i === 2 ? 'rotate-[1deg] border-sky-500/40' :
            i === 3 ? '-rotate-[1deg] border-[#FFD700]/40' :
            'rotate-[2deg] border-emerald-500/40'
          ]"
        >
          <div class="w-full h-11 rounded bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-1 p-1">
            <div class="w-4 h-4 rounded bg-white/20"></div>
            <div class="w-full h-0.5 rounded bg-white/20"></div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center gap-1">
        <div class="w-3 h-0.5 rounded-full bg-[#FFD700]"></div>
        <div class="w-1 h-0.5 rounded-full bg-white/20"></div>
        <div class="w-1 h-0.5 rounded-full bg-white/20"></div>
      </div>
    </div>

    <!-- Testimonials 2: 3-Column Review Wall -->
    <div v-else-if="type === 'testimonials-grid'" class="w-full h-full flex flex-col justify-between py-1 px-2">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-3 gap-1.5 w-full items-start">
        <div
          v-for="i in 3"
          :key="i"
          class="p-1.5 rounded-lg bg-white/5 border border-white/10 space-y-1"
          :class="[i === 1 ? 'h-14' : i === 2 ? 'h-22' : 'h-17']"
        >
          <div class="w-8 h-1 rounded bg-[#FFD700]"></div>
          <div class="w-full h-0.5 rounded bg-white/20"></div>
          <div v-if="i !== 1" class="w-3/4 h-0.5 rounded bg-white/20"></div>
          <div class="w-8 h-0.5 rounded bg-white/40"></div>
        </div>
      </div>
    </div>

    <!-- Testimonials 3: Full-Width Editorial Quote with Title and Arrow Navigation -->
    <div v-else-if="type === 'testimonials-featured' || type === 'testimonials-spotlight'" class="w-full h-full flex flex-col justify-between py-2 px-3 text-center">
      <!-- Header Title Skeleton Above -->
      <div class="flex flex-col items-center gap-1">
        <div class="w-10 h-1 rounded-full bg-[#FFD700]/70"></div>
        <div class="w-24 h-1.5 rounded-full bg-white/40"></div>
      </div>
      <!-- Quote Block with Left/Right Arrows -->
      <div class="flex items-center justify-between gap-1.5 w-full px-1">
        <div class="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <div class="w-1 h-1 rounded-full bg-white/40"></div>
        </div>
        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-3/4 h-1.5 rounded-full bg-white/30"></div>
          <div class="w-1/2 h-1.5 rounded-full bg-white/20"></div>
          <div class="w-12 h-1 rounded-full bg-[#FFD700] mt-0.5"></div>
        </div>
        <div class="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <div class="w-1 h-1 rounded-full bg-white/40"></div>
        </div>
      </div>
      <!-- Pagination Dots -->
      <div class="flex justify-center gap-1">
        <div class="w-3 h-0.5 rounded-full bg-[#FFD700]"></div>
        <div class="w-1 h-0.5 rounded-full bg-white/20"></div>
        <div class="w-1 h-0.5 rounded-full bg-white/20"></div>
      </div>
    </div>

    <!-- Testimonials 4: Partner Venues Marquee -->
    <div v-else-if="type === 'trust-venues' || type === 'venues'" class="w-full h-full flex flex-col justify-center items-center gap-2 px-2">
      <div class="w-24 h-1.5 rounded-full bg-white/20"></div>
      <div class="flex gap-1.5 w-full overflow-hidden justify-center">
        <div class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] text-[#FFD700]">Tagaytay</div>
        <div class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] text-[#FFD700]">Shangri-La</div>
        <div class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] text-[#FFD700]">Balesin</div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 5. PORTFOLIO (4 Blocks) -->
    <!-- ========================================== -->
    <!-- Portfolio 1: 4K Cinema Video Reel Player -->
    <div v-else-if="type === 'portfolio-video' || type === 'video'" class="w-full h-full flex flex-col justify-between py-1 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="w-full h-20 rounded-xl bg-neutral-900 border border-[#FFD700]/50 relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <div class="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-black ml-0.5"></div>
        </div>
      </div>
    </div>

    <!-- Portfolio 2: Interactive RAW vs Color Graded Slider -->
    <div v-else-if="type === 'portfolio-before-after' || type === 'before-after' || type === 'before_after'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20"></div>
      <div class="w-full h-18 rounded-xl bg-neutral-900 border border-white/10 relative overflow-hidden flex">
        <div class="w-1/2 h-full bg-neutral-800 flex items-center justify-start p-2">
          <span class="text-[8px] text-neutral-400 font-bold">RAW</span>
        </div>
        <div class="w-1/2 h-full bg-[#FFD700]/10 flex items-center justify-end p-2 border-l border-[#FFD700]">
          <span class="text-[8px] text-[#FFD700] font-bold">GRADED</span>
        </div>
      </div>
    </div>

    <!-- Portfolio 3: Curated Featured Works Slider -->
    <div v-else-if="type === 'portfolio-curated' || type === 'carousel'" class="w-full h-full flex flex-col justify-between py-1">
      <div class="flex justify-center gap-1">
        <div class="w-6 h-1.5 rounded-full bg-[#FFD700]"></div>
        <div class="w-6 h-1.5 rounded-full bg-white/10"></div>
        <div class="w-6 h-1.5 rounded-full bg-white/10"></div>
      </div>
      <div class="flex items-center justify-center gap-1.5 px-1">
        <div class="w-12 h-12 rounded-lg bg-white/5 border border-white/10 opacity-40 scale-90"></div>
        <div class="w-24 h-16 rounded-xl bg-white/10 border border-[#FFD700]/60 shadow-lg relative flex items-end p-1.5">
          <div class="w-12 h-1.5 rounded-full bg-[#FFD700]/80"></div>
        </div>
        <div class="w-12 h-12 rounded-lg bg-white/5 border border-white/10 opacity-40 scale-90"></div>
      </div>
      <div class="flex justify-center gap-1">
        <div class="w-3 h-1 rounded-full bg-[#FFD700]"></div>
        <div class="w-1 h-1 rounded-full bg-white/20"></div>
      </div>
    </div>

    <!-- Portfolio 4: Editorial Filmstrip -->
    <div v-else-if="type === 'portfolio-filmstrip' || type === 'filmstrip'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-1">
      <div class="w-20 h-1 rounded-full bg-white/20"></div>
      <div class="flex gap-1.5 w-full overflow-hidden justify-center items-center">
        <div v-for="i in 4" :key="i" class="w-16 h-16 rounded-md bg-neutral-900 border border-white/20 relative p-1 flex flex-col justify-between">
          <div class="w-4 h-0.5 bg-[#FFD700]"></div>
          <div class="w-full h-1 bg-white/10"></div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 6. GALLERY COMPONENT (2 Blocks) -->
    <!-- ========================================== -->
    <!-- Gallery 1: Masonry Photo Grid -->
    <div v-else-if="type === 'gallery-masonry' || type === 'gallery-grid' || type === 'gallery_grid'" class="w-full h-full flex flex-col justify-between py-1 px-1">
      <div class="w-16 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div class="h-18 rounded-md bg-neutral-800 border border-white/10"></div>
        <div class="h-18 rounded-md bg-neutral-800 border border-[#FFD700]/40"></div>
        <div class="h-18 rounded-md bg-neutral-800 border border-white/10"></div>
        <div class="h-18 rounded-md bg-neutral-800 border border-white/10"></div>
      </div>
    </div>

    <!-- Gallery 2: Edge-to-Edge Mosaic Wall -->
    <div v-else-if="type === 'gallery-mosaic'" class="w-full h-full flex flex-col justify-between py-1 px-1">
      <div class="w-16 h-1 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-6 gap-1 w-full">
        <div v-for="i in 12" :key="i" class="h-8 rounded bg-neutral-800 border border-white/10"></div>
      </div>
      <div class="w-12 h-1 rounded-full bg-[#FFD700] mx-auto"></div>
    </div>

    <!-- ========================================== -->
    <!-- 7. FOOTER COMPONENT (3 Blocks) -->
    <!-- ========================================== -->
    <!-- Footer 1: Multi-Column Studio Hub -->
    <div v-else-if="type === 'footer-multi-column' || type === 'footer'" class="w-full h-full flex flex-col justify-between py-2 px-3 bg-[#0a0a0a]">
      <div class="grid grid-cols-4 gap-2 w-full">
        <div class="col-span-2 space-y-1">
          <div class="w-12 h-2 rounded bg-[#FFD700]"></div>
          <div class="w-full h-1 rounded bg-white/20"></div>
          <div class="w-3/4 h-1 rounded bg-white/10"></div>
        </div>
        <div class="space-y-1">
          <div class="w-8 h-1 rounded bg-white/30"></div>
          <div class="w-10 h-0.5 rounded bg-white/15"></div>
          <div class="w-8 h-0.5 rounded bg-white/15"></div>
        </div>
        <div class="space-y-1">
          <div class="w-8 h-1 rounded bg-white/30"></div>
          <div class="w-10 h-0.5 rounded bg-white/15"></div>
        </div>
      </div>
      <div class="w-full border-t border-white/10 pt-1 flex justify-between">
        <div class="w-16 h-1 rounded bg-white/20"></div>
        <div class="w-12 h-1 rounded bg-[#FFD700]/50"></div>
      </div>
    </div>

    <!-- Footer 2: Centered Minimalist Luxury -->
    <div v-else-if="type === 'footer-minimal'" class="w-full h-full flex flex-col justify-center items-center gap-2 px-4 text-center bg-[#0a0a0a]">
      <div class="w-16 h-2 rounded bg-[#FFD700]"></div>
      <div class="flex gap-2">
        <div class="w-8 h-1 rounded bg-white/20"></div>
        <div class="w-8 h-1 rounded bg-white/20"></div>
        <div class="w-8 h-1 rounded bg-white/20"></div>
      </div>
      <div class="w-24 h-1 rounded bg-white/10"></div>
    </div>

    <!-- Footer 3: Split Map & Studio Hours -->
    <div v-else-if="type === 'footer-split-map'" class="w-full h-full grid grid-cols-2 gap-2 items-center px-2 bg-[#0a0a0a]">
      <div class="space-y-1">
        <div class="w-14 h-2 rounded bg-[#FFD700]"></div>
        <div class="w-full h-1 rounded bg-white/20"></div>
        <div class="w-20 h-1 rounded bg-white/10"></div>
      </div>
      <div class="h-20 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center">
        <div class="w-3 h-3 rounded-full bg-[#FFD700]"></div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 1. NAVBAR COMPONENT (4 Blocks) -->
    <!-- ========================================== -->
    <!-- Navbar 1: Floating Glass Island -->
    <div v-else-if="type === 'navbar-floating' || type === 'navbar'" class="w-full h-full flex flex-col justify-center items-center px-3">
      <div class="w-full h-8 rounded-full bg-white/[0.08] border border-[#FFD700]/50 backdrop-blur-md flex items-center justify-between px-3 shadow-lg">
        <div class="w-8 h-2 rounded bg-[#FFD700]"></div>
        <div class="flex gap-2">
          <div class="w-5 h-1 rounded bg-white/40"></div>
          <div class="w-5 h-1 rounded bg-white/40"></div>
          <div class="w-5 h-1 rounded bg-white/40"></div>
        </div>
        <div class="w-9 h-3 rounded-full bg-[#FFD700]"></div>
      </div>
    </div>

    <!-- Navbar 2: Simple Translucent Split Navbar (Center Logo) -->
    <div v-else-if="type === 'navbar-fullwidth'" class="w-full h-full flex flex-col justify-center px-2">
      <div class="w-full h-8 bg-black/60 backdrop-blur-md border-b border-white/15 flex items-center justify-between px-3 rounded-lg">
        <div class="flex gap-2 flex-1 justify-end pr-3">
          <div class="w-5 h-1 rounded bg-white/40"></div>
          <div class="w-5 h-1 rounded bg-white/40"></div>
        </div>
        <div class="w-7 h-3 rounded bg-[#FFD700] shrink-0"></div>
        <div class="flex gap-2 flex-1 justify-start pl-3">
          <div class="w-5 h-1 rounded bg-white/40"></div>
          <div class="w-5 h-1 rounded bg-white/40"></div>
        </div>
      </div>
    </div>

    <!-- Navbar 3: Centered Monogram Header -->
    <div v-else-if="type === 'navbar-centered'" class="w-full h-full flex flex-col justify-center items-center px-3">
      <div class="w-full h-10 border-y border-white/10 flex flex-col justify-center items-center gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
        <div class="w-12 h-2.5 rounded bg-[#FFD700]"></div>
        <div class="flex gap-2">
          <div class="w-6 h-1 rounded bg-white/40"></div>
          <div class="w-6 h-1 rounded bg-white/40"></div>
          <div class="w-6 h-1 rounded bg-white/40"></div>
          <div class="w-6 h-1 rounded bg-white/40"></div>
          <div class="w-6 h-1 rounded bg-white/40"></div>
        </div>
      </div>
    </div>

    <!-- Navbar 4: Dynamic Translucent Header -->
    <div v-else-if="type === 'navbar-dynamic'" class="w-full h-full flex flex-col justify-center items-center px-3">
      <div class="w-full h-8 bg-gradient-to-r from-black/60 via-white/[0.04] to-black/60 border-b border-white/15 flex items-center justify-between px-3">
        <div class="w-8 h-2 rounded bg-[#FFD700]"></div>
        <div class="flex gap-2">
          <div class="w-5 h-1 rounded bg-white/40"></div>
          <div class="w-5 h-1 rounded bg-white/40"></div>
          <div class="w-5 h-1 rounded bg-white/40"></div>
        </div>
        <div class="w-10 h-3 rounded-full bg-[#FFD700]/20 border border-[#FFD700]"></div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 9. CONTACT US PAGE (4 Blocks) -->
    <!-- ========================================== -->
    <!-- Contact 1: Direct Booking & Inquiry Form -->
    <div v-else-if="type === 'contact-split' || type === 'contact'" class="w-full h-full flex flex-col justify-center items-center px-4 py-2">
      <div class="w-12 h-1 rounded bg-[#FFD700] mb-1"></div>
      <div class="w-24 h-1 rounded bg-white/20 mb-2"></div>
      <div class="w-full max-w-[150px] p-2 rounded-lg bg-white/5 border border-white/10 space-y-1.5 shadow-sm">
        <div class="grid grid-cols-2 gap-1">
          <div class="h-1.5 rounded bg-white/10"></div>
          <div class="h-1.5 rounded bg-white/10"></div>
        </div>
        <div class="grid grid-cols-3 gap-1">
          <div class="h-1.5 rounded bg-white/10"></div>
          <div class="h-1.5 rounded bg-white/10"></div>
          <div class="h-1.5 rounded bg-white/10"></div>
        </div>
        <div class="h-3 rounded bg-white/10"></div>
        <div class="h-2 rounded-full bg-[#FFD700] w-full"></div>
      </div>
    </div>

    <!-- Contact 2: Studio Location & Split Booking Form -->
    <div v-else-if="type === 'contact-location-map' || type === 'location-map' || type === 'location_map'" class="w-full h-full flex flex-col justify-center px-2.5 py-1.5">
      <!-- Centered Section Header -->
      <div class="flex flex-col items-center mb-1">
        <div class="w-8 h-0.5 rounded bg-[#FFD700] mb-0.5"></div>
        <div class="w-20 h-1 rounded bg-white/30"></div>
      </div>

      <!-- 2-Column Split Containers with Aligned Tops -->
      <div class="grid grid-cols-12 gap-1.5 items-start">
        <!-- Left side: Studio Info Card (5 cols) -->
        <div class="col-span-5 p-1.5 rounded-lg bg-white/5 border border-white/10 space-y-1 shadow-sm">
          <div class="w-8 h-1 rounded bg-white/40"></div>
          <div class="space-y-0.5">
            <div class="w-full h-0.5 rounded bg-white/20"></div>
            <div class="w-3/4 h-0.5 rounded bg-white/20"></div>
          </div>
          <!-- Highlighted FB button skeleton -->
          <div class="w-full h-2.5 rounded bg-[#1877F2]/30 border border-[#1877F2]/40 mt-1"></div>
        </div>

        <!-- Right side: Booking Form Card (7 cols) -->
        <div class="col-span-7 p-1.5 rounded-lg bg-white/5 border border-white/10 space-y-1 shadow-sm">
          <div class="w-12 h-1 rounded bg-white/40"></div>
          <div class="grid grid-cols-2 gap-0.5">
            <div class="h-1.5 rounded bg-white/10"></div>
            <div class="h-1.5 rounded bg-white/10"></div>
          </div>
          <div class="h-1.5 rounded bg-white/10"></div>
          <div class="h-2 rounded-full bg-[#FFD700] w-full mt-0.5"></div>
        </div>
      </div>
    </div>

    <!-- Fallback Generic Skeleton -->
    <div v-else class="w-full h-full flex flex-col justify-center items-center gap-2">
      <div class="w-1/2 h-2 rounded bg-white/20"></div>
      <div class="w-3/4 h-1 rounded bg-white/10"></div>
      <div class="w-16 h-3 rounded bg-[#FFD700]/50"></div>
    </div>

  </div>
</template>
