<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGallery } from '../../../composables/useGallery';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});

const { gallery } = useGallery();

// Get active/featured items from gallery
const items = computed(() => {
  const list = gallery.value.length > 0 ? gallery.value : [];
  return list;
});

const activeIndex = ref(0);
const trackRef = ref(null);
const viewportRef = ref(null);

const categories = computed(() => {
  const set = new Set(items.value.map((i) => i.category || 'Highlights'));
  return ['All', ...Array.from(set)];
});

const activeCategory = ref('All');

const filteredItems = computed(() => {
  if (activeCategory.value === 'All') return items.value;
  return items.value.filter((i) => i.category === activeCategory.value);
});

function getDimensions() {
  const isMobile = window.innerWidth < 768;
  return {
    itemWidth: isMobile ? 320 : 750,
    gap: isMobile ? 12 : 24,
  };
}

function updateCarousel(index) {
  if (filteredItems.value.length === 0) return;
  activeIndex.value = (index + filteredItems.value.length) % filteredItems.value.length;

  if (!trackRef.value || !viewportRef.value) return;

  const { itemWidth, gap } = getDimensions();
  const viewportWidth = viewportRef.value.getBoundingClientRect().width;
  const itemTotalWidth = itemWidth + gap;
  const offset = activeIndex.value * itemTotalWidth - viewportWidth / 2 + itemWidth / 2;

  trackRef.value.style.transform = `translateX(${-offset}px)`;
}

function next() {
  updateCarousel(activeIndex.value + 1);
}

function prev() {
  updateCarousel(activeIndex.value - 1);
}

function handleResize() {
  updateCarousel(activeIndex.value);
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  setTimeout(() => updateCarousel(0), 100);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <section id="portfolio" class="py-24 bg-[#141414] overflow-hidden select-none border-b border-white/5 relative">
    <span id="showcase" class="absolute -top-24"></span>
    <div class="max-w-6xl mx-auto px-4 mb-10 text-center">
      <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-3">
        {{ content.title || 'PORTFOLIO SHOWCASE' }}
      </h2>
      <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
        {{ content.subtitle || 'A visual collection of timeless weddings, portraits, and milestones.' }}
      </p>

      <!-- Category Filter Tabs -->
      <div class="flex flex-wrap justify-center gap-2 mt-8 overflow-x-auto py-2 scrollbar-hide">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat; activeIndex = 0; updateCarousel(0)"
          class="px-5 py-1.5 rounded-full text-xs font-nuosu tracking-wider uppercase transition-all duration-300"
          :class="[
            activeCategory === cat
              ? 'bg-[#FFD700] text-[#141414] font-bold shadow-md shadow-yellow-500/20'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
          ]"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Carousel Viewport -->
    <div ref="viewportRef" class="relative w-full overflow-hidden py-4">
      <div
        ref="trackRef"
        class="flex gap-4 md:gap-6 items-center transition-transform duration-500 ease-out"
        style="will-change: transform;"
      >
        <div
          v-for="(item, index) in filteredItems"
          :key="item.id || index"
          @click="updateCarousel(index)"
          class="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 relative group"
          :class="[
            index === activeIndex
              ? 'w-[320px] h-[220px] md:w-[750px] md:h-[450px] opacity-100 ring-2 ring-[#FFD700]/50 shadow-2xl scale-100'
              : 'w-[320px] h-[220px] md:w-[750px] md:h-[450px] opacity-40 hover:opacity-70 scale-95'
          ]"
        >
          <img
            :src="item.image_url"
            :alt="item.title || 'Portfolio Image'"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />

          <!-- Overlay Details -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 transition-opacity duration-300"
            :class="[index === activeIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-100']"
          >
            <span class="text-xs font-mono text-[#FFD700] uppercase tracking-widest">{{ item.category }}</span>
            <h4 class="text-lg md:text-2xl font-bebas text-white tracking-wide">{{ item.title || 'Studio Showcase' }}</h4>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button
        @click="prev"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition duration-300 z-20 shadow-lg"
        aria-label="Previous image"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        @click="next"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition duration-300 z-20 shadow-lg"
        aria-label="Next image"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Dots Pagination -->
    <div class="flex justify-center gap-2 mt-8">
      <button
        v-for="(_, index) in filteredItems"
        :key="index"
        @click="updateCarousel(index)"
        class="h-2 rounded-full transition-all duration-300"
        :class="[
          index === activeIndex ? 'w-8 bg-[#FFD700]' : 'w-2 bg-white/20 hover:bg-white/40'
        ]"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>
  </section>
</template>
