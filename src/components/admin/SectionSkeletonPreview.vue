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
    <!-- 1. HERO VARIANTS -->
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

    <!-- Hero 4: Modern Bento Box Hero -->
    <div v-else-if="type === 'hero-bento'" class="w-full h-full grid grid-cols-3 gap-1.5 p-1">
      <div class="col-span-2 rounded-lg bg-white/10 border border-white/15 p-1.5 flex flex-col justify-between">
        <div class="w-12 h-1 rounded bg-[#FFD700]"></div>
        <div class="w-full h-2 rounded bg-white/30"></div>
        <div class="w-10 h-2 rounded bg-[#FFD700]"></div>
      </div>
      <div class="col-span-1 space-y-1">
        <div class="h-10 rounded-md bg-white/5 border border-white/10 p-1">
          <div class="w-6 h-1 rounded bg-[#FFD700]"></div>
        </div>
        <div class="h-10 rounded-md bg-white/5 border border-white/10 p-1">
          <div class="w-6 h-1 rounded bg-emerald-400"></div>
        </div>
      </div>
    </div>

    <!-- Hero 5: Fullscreen Video Reel Hero -->
    <div v-else-if="type === 'hero-video'" class="w-full h-full flex flex-col justify-between p-1.5 bg-neutral-900/60 rounded-lg relative">
      <div class="w-8 h-1 rounded bg-[#FFD700]"></div>
      <div class="w-8 h-8 rounded-full bg-[#FFD700] self-center flex items-center justify-center">
        <div class="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-black ml-0.5"></div>
      </div>
      <div class="w-full h-4 rounded-md bg-black/70 border border-white/10 px-2 flex items-center justify-between">
        <div class="w-14 h-1 rounded bg-white/40"></div>
        <div class="w-6 h-2 rounded bg-[#FFD700]"></div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 2. SHOWCASE & MEDIA VARIANTS -->
    <!-- ========================================== -->
    <!-- Showcase 1: Infinite 3-Card Carousel -->
    <div v-else-if="type === 'carousel'" class="w-full h-full flex flex-col justify-between py-1">
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

    <!-- Showcase 2: Masonry Photo Grid -->
    <div v-else-if="type === 'gallery_grid' || type === 'gallery-grid'" class="w-full h-full flex flex-col justify-between py-1 px-1">
      <div class="w-16 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div class="h-18 rounded-md bg-neutral-800 border border-white/10"></div>
        <div class="h-18 rounded-md bg-neutral-800 border border-[#FFD700]/40"></div>
        <div class="h-18 rounded-md bg-neutral-800 border border-white/10"></div>
        <div class="h-18 rounded-md bg-neutral-800 border border-white/10"></div>
      </div>
    </div>

    <!-- Showcase 3: Editorial Filmstrip -->
    <div v-else-if="type === 'filmstrip'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-1">
      <div class="w-20 h-1 rounded-full bg-white/20"></div>
      <div class="flex gap-1.5 w-full overflow-hidden justify-center items-center">
        <div v-for="i in 4" :key="i" class="w-16 h-16 rounded-md bg-neutral-900 border border-white/20 relative p-1 flex flex-col justify-between">
          <div class="w-4 h-0.5 bg-[#FFD700]"></div>
          <div class="w-full h-1 bg-white/10"></div>
        </div>
      </div>
    </div>

    <!-- Showcase 4: Before / After Slider -->
    <div v-else-if="type === 'before_after' || type === 'before-after'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-3">
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

    <!-- Showcase 5: Instagram Social Snapshot Grid -->
    <div v-else-if="type === 'instagram'" class="w-full h-full flex flex-col justify-between py-1 px-1">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-6 gap-1 w-full">
        <div v-for="i in 6" :key="i" class="h-14 rounded-md bg-neutral-800 border border-white/10"></div>
      </div>
      <div class="w-16 h-1 rounded-full bg-[#FFD700] mx-auto"></div>
    </div>

    <!-- ========================================== -->
    <!-- 3. ABOUT & TEAM VARIANTS -->
    <!-- ========================================== -->
    <!-- About 1: Split Story & Stats -->
    <div v-else-if="type === 'about' || type === 'about-split'" class="w-full h-full flex items-center justify-center gap-3 px-3">
      <div class="w-16 h-22 rounded-xl bg-neutral-900 border border-[#FFD700]/40 flex-shrink-0"></div>
      <div class="flex-1 space-y-1.5">
        <div class="w-10 h-1 rounded-full bg-[#FFD700]"></div>
        <div class="w-24 h-2 rounded-full bg-white/30"></div>
        <div class="w-full h-1 rounded-full bg-white/10"></div>
        <div class="flex gap-1.5 pt-1">
          <div class="w-6 h-3 rounded bg-white/5 border border-white/10"></div>
          <div class="w-6 h-3 rounded bg-white/5 border border-white/10"></div>
          <div class="w-6 h-3 rounded bg-white/5 border border-white/10"></div>
        </div>
      </div>
    </div>

    <!-- About 2: Founder Signature & Manifesto -->
    <div v-else-if="type === 'about-manifesto'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-4 text-center">
      <div class="w-12 h-1 rounded-full bg-[#FFD700]"></div>
      <div class="w-3/4 h-2 rounded-full bg-white/30"></div>
      <div class="w-full h-1 rounded-full bg-white/10"></div>
      <div class="w-2/3 h-1 rounded-full bg-white/10"></div>
      <div class="w-14 h-2 rounded-full bg-[#FFD700]/70 mt-1"></div>
    </div>

    <!-- About 3: Creative Team Grid -->
    <div v-else-if="type === 'team'" class="w-full h-full flex flex-col justify-between py-1 px-2">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-3 gap-2 w-full">
        <div v-for="i in 3" :key="i" class="rounded-lg bg-white/5 border border-white/10 overflow-hidden flex flex-col h-20">
          <div class="h-12 bg-neutral-800"></div>
          <div class="p-1 space-y-0.5">
            <div class="w-8 h-1 rounded-full bg-[#FFD700]"></div>
            <div class="w-12 h-1 rounded-full bg-white/20"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- About 4: Camera & Drone Gear Arsenal -->
    <div v-else-if="type === 'gear'" class="w-full h-full flex flex-col justify-between py-1 px-2">
      <div class="w-24 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div v-for="i in 4" :key="i" class="p-1 rounded-lg bg-white/5 border border-white/10 space-y-1 h-20">
          <div class="w-8 h-1 rounded bg-[#FFD700]"></div>
          <div class="w-full h-0.5 rounded bg-white/15"></div>
          <div class="w-full h-0.5 rounded bg-white/15"></div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 4. SERVICES & RATES VARIANTS -->
    <!-- ========================================== -->
    <!-- Rates 1: 3-Tier Luxury Pricing Cards -->
    <div v-else-if="type === 'rates' || type === 'rates-tiered'" class="w-full h-full flex flex-col justify-between py-1">
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

    <!-- Rates 2: Minimalist Rates List Table -->
    <div v-else-if="type === 'rates-list'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20"></div>
      <div class="w-full space-y-1">
        <div v-for="i in 3" :key="i" class="w-full h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between px-2">
          <div class="w-24 h-1 rounded bg-white/30"></div>
          <div class="w-8 h-1 rounded bg-[#FFD700]"></div>
        </div>
      </div>
    </div>

    <!-- Rates 3: Tabbed Milestone Switcher -->
    <div v-else-if="type === 'rates-tabbed'" class="w-full h-full flex flex-col justify-between py-1 px-3">
      <div class="flex justify-center gap-1">
        <div class="w-10 h-2 rounded-full bg-[#FFD700]"></div>
        <div class="w-10 h-2 rounded-full bg-white/10"></div>
        <div class="w-10 h-2 rounded-full bg-white/10"></div>
      </div>
      <div class="w-full h-16 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-between">
        <div class="space-y-1">
          <div class="w-16 h-2 rounded bg-[#FFD700]"></div>
          <div class="w-24 h-1 rounded bg-white/20"></div>
        </div>
        <div class="w-10 h-4 rounded bg-[#FFD700]"></div>
      </div>
    </div>

    <!-- Rates 4: 4-Step Process Timeline -->
    <div v-else-if="type === 'process'" class="w-full h-full flex flex-col justify-between py-1 px-2">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div v-for="i in 4" :key="i" class="p-1 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between h-20">
          <span class="text-[9px] font-bold text-[#FFD700]">0{{ i }}</span>
          <div class="w-full h-1 rounded-full bg-white/20"></div>
          <div class="w-3/4 h-1 rounded-full bg-white/10"></div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 5. TRUST & REVIEWS VARIANTS -->
    <!-- ========================================== -->
    <!-- Testimonials 1: Dual Review Cards -->
    <div v-else-if="type === 'testimonials' || type === 'testimonials-dual'" class="w-full h-full flex flex-col justify-between py-1 px-2">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-2 gap-2 w-full">
        <div v-for="i in 2" :key="i" class="p-2 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div class="w-12 h-1 rounded bg-[#FFD700]"></div>
          <div class="w-full h-1 rounded bg-white/20"></div>
          <div class="w-4/5 h-1 rounded bg-white/20"></div>
          <div class="w-10 h-1 rounded bg-white/40 pt-1"></div>
        </div>
      </div>
    </div>

    <!-- Testimonials 2: Spotlight Quote -->
    <div v-else-if="type === 'testimonials-spotlight'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-4 text-center">
      <div class="w-8 h-1 rounded-full bg-[#FFD700]"></div>
      <div class="w-4/5 h-2 rounded-full bg-white/30"></div>
      <div class="w-3/5 h-2 rounded-full bg-white/30"></div>
      <div class="w-16 h-1 rounded-full bg-[#FFD700] mt-1"></div>
    </div>

    <!-- Testimonials 3: Venues Marquee -->
    <div v-else-if="type === 'venues'" class="w-full h-full flex flex-col justify-center items-center gap-2 px-2">
      <div class="w-24 h-1.5 rounded-full bg-white/20"></div>
      <div class="flex gap-1.5 w-full overflow-hidden justify-center">
        <div class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] text-[#FFD700]">Venue A</div>
        <div class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] text-[#FFD700]">Venue B</div>
        <div class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] text-[#FFD700]">Venue C</div>
      </div>
    </div>

    <!-- Testimonials 4: FAQ Accordion -->
    <div v-else-if="type === 'faq'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20"></div>
      <div class="w-full space-y-1">
        <div class="w-full h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between px-2">
          <div class="w-28 h-1 rounded bg-white/30"></div>
          <span class="text-[#FFD700] text-[8px]">+</span>
        </div>
        <div class="w-full h-8 rounded-lg bg-white/10 border border-[#FFD700]/40 p-1.5 space-y-1">
          <div class="w-24 h-1 rounded bg-white/40"></div>
          <div class="w-full h-0.5 rounded bg-white/15"></div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 6. CONTACT & BOOKING VARIANTS -->
    <!-- ========================================== -->
    <!-- Contact 1: Split Booking Form -->
    <div v-else-if="type === 'contact' || type === 'contact-split'" class="w-full h-full grid grid-cols-2 gap-2 items-center px-2">
      <div class="space-y-1">
        <div class="w-12 h-1 rounded bg-[#FFD700]"></div>
        <div class="w-full h-2 rounded bg-white/20"></div>
        <div class="w-3/4 h-1 rounded bg-white/10"></div>
      </div>
      <div class="p-1.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
        <div class="w-full h-2 rounded bg-white/10"></div>
        <div class="w-full h-2 rounded bg-white/10"></div>
        <div class="w-full h-2 rounded bg-[#FFD700]"></div>
      </div>
    </div>

    <!-- Contact 2: CTA Banner -->
    <div v-else-if="type === 'cta' || type === 'cta-banner'" class="w-full h-full flex flex-col justify-center items-center gap-2 px-3 bg-gradient-to-r from-amber-500/10 via-[#FFD700]/20 to-amber-500/10 rounded-lg">
      <div class="w-3/4 h-2.5 rounded-full bg-[#FFD700]"></div>
      <div class="w-1/2 h-1 rounded-full bg-white/20"></div>
      <div class="w-20 h-3 rounded-full bg-[#FFD700] text-black text-[7px] font-bold flex items-center justify-center">BOOK NOW</div>
    </div>

    <!-- Contact 3: Location Map Card -->
    <div v-else-if="type === 'location_map' || type === 'location-map'" class="w-full h-full flex items-center justify-center gap-2 px-2">
      <div class="w-20 h-20 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center">
        <div class="w-3 h-3 rounded-full bg-[#FFD700]"></div>
      </div>
      <div class="flex-1 space-y-1.5">
        <div class="w-14 h-1 rounded bg-[#FFD700]"></div>
        <div class="w-full h-1.5 rounded bg-white/30"></div>
        <div class="w-3/4 h-1 rounded bg-white/10"></div>
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
