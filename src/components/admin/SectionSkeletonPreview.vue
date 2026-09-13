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
    
    <!-- 1. Hero Skeleton -->
    <div v-if="type === 'hero'" class="w-full h-full flex flex-col justify-center items-center gap-2">
      <div class="w-3/4 h-3 rounded-full bg-white/20 animate-pulse"></div>
      <div class="w-1/2 h-2.5 rounded-full bg-[#FFD700]/50"></div>
      <div class="w-2/3 h-1.5 rounded-full bg-white/10 mt-1"></div>
      <div class="flex gap-1.5 mt-2">
        <div class="w-12 h-3.5 rounded-full bg-[#FFD700] opacity-80"></div>
        <div class="w-12 h-3.5 rounded-full bg-white/10 border border-white/20"></div>
      </div>
    </div>

    <!-- 2. Showcase Carousel Skeleton -->
    <div v-else-if="type === 'carousel'" class="w-full h-full flex flex-col justify-between py-1">
      <div class="flex justify-center gap-1">
        <div class="w-6 h-1.5 rounded-full bg-[#FFD700]"></div>
        <div class="w-6 h-1.5 rounded-full bg-white/10"></div>
        <div class="w-6 h-1.5 rounded-full bg-white/10"></div>
      </div>
      <div class="flex items-center justify-center gap-2 px-1">
        <div class="w-14 h-12 rounded-lg bg-white/5 border border-white/10 opacity-40 scale-90"></div>
        <div class="w-24 h-16 rounded-xl bg-white/10 border border-[#FFD700]/60 shadow-lg relative flex items-end p-1.5">
          <div class="w-12 h-1.5 rounded-full bg-[#FFD700]/80"></div>
        </div>
        <div class="w-14 h-12 rounded-lg bg-white/5 border border-white/10 opacity-40 scale-90"></div>
      </div>
      <div class="flex justify-center gap-1">
        <div class="w-3 h-1 rounded-full bg-[#FFD700]"></div>
        <div class="w-1 h-1 rounded-full bg-white/20"></div>
        <div class="w-1 h-1 rounded-full bg-white/20"></div>
      </div>
    </div>

    <!-- 3. Video Highlight Skeleton -->
    <div v-else-if="type === 'video'" class="w-full h-full flex flex-col justify-center items-center gap-1.5">
      <div class="w-20 h-1.5 rounded-full bg-white/20"></div>
      <div class="w-36 h-20 rounded-xl bg-neutral-900 border border-white/10 relative flex items-center justify-center">
        <div class="w-7 h-7 rounded-full bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center">
          <div class="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-[#FFD700] ml-0.5"></div>
        </div>
      </div>
    </div>

    <!-- 4. Packages & Rates Table Skeleton -->
    <div v-else-if="type === 'rates'" class="w-full h-full flex flex-col justify-between py-1">
      <div class="w-24 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-3 gap-1.5 w-full px-2">
        <div class="rounded-lg bg-white/5 border border-white/10 p-1.5 flex flex-col justify-between h-20">
          <div class="w-8 h-1 rounded-full bg-white/30"></div>
          <div class="w-10 h-2.5 rounded-full bg-[#FFD700]/70"></div>
          <div class="space-y-0.5">
            <div class="w-full h-1 rounded-full bg-white/10"></div>
            <div class="w-3/4 h-1 rounded-full bg-white/10"></div>
          </div>
          <div class="w-full h-2 rounded bg-white/10"></div>
        </div>

        <div class="rounded-lg bg-white/10 border border-[#FFD700]/60 p-1.5 flex flex-col justify-between h-20 shadow-md">
          <div class="w-8 h-1 rounded-full bg-[#FFD700]"></div>
          <div class="w-10 h-2.5 rounded-full bg-[#FFD700]"></div>
          <div class="space-y-0.5">
            <div class="w-full h-1 rounded-full bg-white/20"></div>
            <div class="w-3/4 h-1 rounded-full bg-white/20"></div>
          </div>
          <div class="w-full h-2 rounded bg-[#FFD700] text-black"></div>
        </div>

        <div class="rounded-lg bg-white/5 border border-white/10 p-1.5 flex flex-col justify-between h-20">
          <div class="w-8 h-1 rounded-full bg-white/30"></div>
          <div class="w-10 h-2.5 rounded-full bg-[#FFD700]/70"></div>
          <div class="space-y-0.5">
            <div class="w-full h-1 rounded-full bg-white/10"></div>
            <div class="w-3/4 h-1 rounded-full bg-white/10"></div>
          </div>
          <div class="w-full h-2 rounded bg-white/10"></div>
        </div>
      </div>
    </div>

    <!-- 5. About / Split Bio Skeleton -->
    <div v-else-if="type === 'about'" class="w-full h-full flex items-center justify-center gap-3 px-4">
      <div class="w-16 h-22 rounded-xl bg-neutral-900 border border-[#FFD700]/30 flex-shrink-0"></div>
      <div class="flex-1 space-y-1.5">
        <div class="w-12 h-1 rounded-full bg-[#FFD700]"></div>
        <div class="w-24 h-2 rounded-full bg-white/30"></div>
        <div class="w-full h-1 rounded-full bg-white/10"></div>
        <div class="w-5/6 h-1 rounded-full bg-white/10"></div>
        <div class="flex gap-2 pt-1">
          <div class="w-6 h-3 rounded bg-white/5 border border-white/10"></div>
          <div class="w-6 h-3 rounded bg-white/5 border border-white/10"></div>
          <div class="w-6 h-3 rounded bg-white/5 border border-white/10"></div>
        </div>
      </div>
    </div>

    <!-- 6. Process Steps Skeleton -->
    <div v-else-if="type === 'process'" class="w-full h-full flex flex-col justify-between py-1 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div v-for="i in 4" :key="i" class="p-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between h-20">
          <span class="text-[10px] font-bold text-[#FFD700]">0{{ i }}</span>
          <div class="w-full h-1 rounded-full bg-white/20"></div>
          <div class="w-3/4 h-1 rounded-full bg-white/10"></div>
        </div>
      </div>
    </div>

    <!-- 7. Creative Team Skeleton -->
    <div v-else-if="type === 'team'" class="w-full h-full flex flex-col justify-between py-1 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-3 gap-2 w-full">
        <div v-for="i in 3" :key="i" class="rounded-lg bg-white/5 border border-white/10 overflow-hidden flex flex-col h-20">
          <div class="h-12 bg-neutral-800"></div>
          <div class="p-1 space-y-0.5">
            <div class="w-10 h-1 rounded-full bg-[#FFD700]"></div>
            <div class="w-14 h-1 rounded-full bg-white/20"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 8. Marquee Venues Skeleton -->
    <div v-else-if="type === 'venues'" class="w-full h-full flex flex-col justify-center items-center gap-2 px-3">
      <div class="w-28 h-1.5 rounded-full bg-white/20"></div>
      <div class="flex gap-2 w-full overflow-hidden justify-center">
        <div class="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-[#FFD700] whitespace-nowrap">● Venue A</div>
        <div class="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-[#FFD700] whitespace-nowrap">● Venue B</div>
        <div class="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-[#FFD700] whitespace-nowrap">● Venue C</div>
      </div>
    </div>

    <!-- 9. Production Gear Skeleton -->
    <div v-else-if="type === 'gear'" class="w-full h-full flex flex-col justify-between py-1 px-3">
      <div class="w-24 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full">
        <div v-for="i in 4" :key="i" class="p-1 rounded-lg bg-white/5 border border-white/10 space-y-1 h-20">
          <div class="w-10 h-1 rounded bg-[#FFD700]"></div>
          <div class="w-full h-0.5 rounded bg-white/15"></div>
          <div class="w-full h-0.5 rounded bg-white/15"></div>
          <div class="w-3/4 h-0.5 rounded bg-white/15"></div>
        </div>
      </div>
    </div>

    <!-- 10. Instagram Feed Skeleton -->
    <div v-else-if="type === 'instagram'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 py-1 px-3">
      <div class="w-24 h-1.5 rounded-full bg-white/20"></div>
      <div class="grid grid-cols-6 gap-1 w-full">
        <div v-for="i in 6" :key="i" class="aspect-square rounded-md bg-white/5 border border-white/10"></div>
      </div>
    </div>

    <!-- 11. Before / After Retouching Slider Skeleton -->
    <div v-else-if="type === 'before_after'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 px-6">
      <div class="w-28 h-1.5 rounded-full bg-white/20"></div>
      <div class="w-36 h-20 rounded-xl bg-neutral-900 border border-white/15 relative overflow-hidden flex items-center">
        <div class="w-1/2 h-full bg-neutral-800 border-r border-[#FFD700] flex items-center justify-end">
          <div class="w-3 h-3 rounded-full bg-[#FFD700] -mr-1.5 shadow-md flex items-center justify-center text-[7px] font-bold text-black">↔</div>
        </div>
      </div>
    </div>

    <!-- 12. Studio Location & Map Skeleton -->
    <div v-else-if="type === 'location_map'" class="w-full h-full flex items-center justify-center gap-2 px-3">
      <div class="w-1/3 h-22 rounded-xl bg-white/5 border border-white/10 p-1.5 space-y-1">
        <div class="w-6 h-1 rounded bg-[#FFD700]"></div>
        <div class="w-12 h-1 rounded bg-white/20"></div>
        <div class="w-10 h-1 rounded bg-white/20"></div>
      </div>
      <div class="flex-1 h-22 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center">
        <div class="w-4 h-4 rounded-full bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center text-[8px]">📍</div>
      </div>
    </div>

    <!-- 13. Photo Gallery Grid Skeleton -->
    <div v-else-if="type === 'gallery_grid'" class="w-full h-full flex flex-col justify-center items-center gap-1.5 py-1">
      <div class="w-20 h-1.5 rounded-full bg-white/20"></div>
      <div class="grid grid-cols-4 gap-1.5 w-full px-3">
        <div v-for="i in 4" :key="i" class="aspect-square rounded-lg bg-white/5 border border-white/10"></div>
      </div>
    </div>

    <!-- 14. Text Block / Story Skeleton -->
    <div v-else-if="type === 'text_block'" class="w-full h-full flex flex-col justify-center items-center gap-2 px-6 text-center">
      <div class="w-28 h-2.5 rounded-full bg-white/30"></div>
      <div class="w-full h-1.5 rounded-full bg-white/10"></div>
      <div class="w-4/5 h-1.5 rounded-full bg-white/10"></div>
      <div class="w-2/3 h-1.5 rounded-full bg-white/10"></div>
    </div>

    <!-- 15. Testimonials / Reviews Skeleton -->
    <div v-else-if="type === 'testimonials'" class="w-full h-full flex flex-col justify-between py-1 px-3">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto"></div>
      <div class="grid grid-cols-2 gap-2 w-full">
        <div v-for="i in 2" :key="i" class="p-2 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div class="flex gap-0.5">
            <div v-for="s in 5" :key="s" class="w-1 h-1 rounded-full bg-[#FFD700]"></div>
          </div>
          <div class="w-full h-1 rounded-full bg-white/20"></div>
          <div class="w-3/4 h-1 rounded-full bg-white/20"></div>
          <div class="w-10 h-1.5 rounded-full bg-white/40 mt-1"></div>
        </div>
      </div>
    </div>

    <!-- 16. FAQ Accordion Skeleton -->
    <div v-else-if="type === 'faq'" class="w-full h-full flex flex-col justify-center gap-1.5 px-4">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto mb-1"></div>
      <div class="w-full h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between px-2">
        <div class="w-24 h-1 rounded-full bg-white/30"></div>
        <div class="w-2 h-2 rounded-full bg-[#FFD700]"></div>
      </div>
      <div class="w-full h-8 rounded-lg bg-white/10 border border-white/20 flex flex-col justify-center px-2 space-y-1">
        <div class="flex items-center justify-between">
          <div class="w-28 h-1 rounded-full bg-white/40"></div>
          <div class="w-2 h-2 rounded-full bg-[#FFD700]"></div>
        </div>
        <div class="w-36 h-1 rounded-full bg-white/15"></div>
      </div>
    </div>

    <!-- 17. CTA Banner Skeleton -->
    <div v-else-if="type === 'cta'" class="w-full h-full flex flex-col justify-center items-center gap-2 px-4 rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/5">
      <div class="w-36 h-2 rounded-full bg-white/40"></div>
      <div class="w-24 h-1.5 rounded-full bg-white/20"></div>
      <div class="w-16 h-3 rounded-full bg-[#FFD700]"></div>
    </div>

    <!-- 18. Contact & Booking Form Skeleton -->
    <div v-else-if="type === 'contact'" class="w-full h-full flex flex-col justify-center gap-1 px-4">
      <div class="w-20 h-1.5 rounded-full bg-white/20 mx-auto mb-1"></div>
      <div class="grid grid-cols-2 gap-1">
        <div class="h-3.5 rounded bg-white/5 border border-white/10"></div>
        <div class="h-3.5 rounded bg-white/5 border border-white/10"></div>
      </div>
      <div class="h-5 rounded bg-white/5 border border-white/10"></div>
      <div class="h-3.5 rounded bg-[#FFD700] text-black opacity-90"></div>
    </div>

    <!-- Default Fallback Skeleton -->
    <div v-else class="w-full h-full flex flex-col justify-center items-center gap-2">
      <div class="w-20 h-2 rounded-full bg-white/20"></div>
      <div class="w-32 h-1.5 rounded-full bg-white/10"></div>
    </div>
  </div>
</template>
