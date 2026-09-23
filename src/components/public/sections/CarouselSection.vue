<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useGallery } from '../../../composables/useGallery';
import { adminModalTokens } from '../../../lib/designTokens';
import { ChevronLeft, ChevronRight, Maximize2, X, Film } from '@lucide/vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'carousel',
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
});

const currentVariant = computed(() => {
  if (props.content?.variant) return props.content.variant;
  if (props.variant) return props.variant;
  const title = (props.content?.title || '').toLowerCase();
  if (title.includes('film reel') || title.includes('filmstrip')) return 'filmstrip';
  return 'carousel';
});

const isFilmstrip = computed(() => currentVariant.value === 'filmstrip');

const { gallery } = useGallery();

const defaultItems = [
  { id: '1', image_url: '/images/1.jpg', category: 'Weddings', title: 'Romantic Sunset Wedding' },
  { id: '2', image_url: '/images/2.jpg', category: 'Weddings', title: 'Grand Cathedral Vows' },
  { id: '3', image_url: '/images/3.jpg', category: 'Portraits', title: 'Intimate Editorial Portrait' },
  { id: '4', image_url: '/images/4.jpg', category: 'Commercial', title: 'Cinematic Fashion Campaign' },
  { id: '5', image_url: '/images/5.jpg', category: 'Portraits', title: 'Fine Art Studio Session' },
  { id: '6', image_url: '/images/6.jpg', category: 'Weddings', title: 'Beachfront Destination Reception' },
];

// Resolved items (custom content takes precedence, capped at 10)
const rawItems = computed(() => {
  if (props.content?.items && Array.isArray(props.content.items) && props.content.items.length > 0) {
    return props.content.items.slice(0, 10);
  }
  if (gallery.value && gallery.value.length > 0) {
    return gallery.value.slice(0, 10);
  }
  return defaultItems;
});

// Categories list from content or inferred from items
const categories = computed(() => {
  if (props.content?.categories && Array.isArray(props.content.categories) && props.content.categories.length > 0) {
    const list = props.content.categories.filter(Boolean);
    return list.includes('All') ? list : ['All', ...list];
  }
  const set = new Set(rawItems.value.map((i) => i.category || 'Highlights'));
  return ['All', ...Array.from(set)];
});

const activeCategory = ref('All');

// Sliding capsule state and measurement for filter pills
const filterButtonRefs = ref(new Map());

function setFilterBtnRef(el, cat) {
  if (el) {
    filterButtonRefs.value.set(cat, el);
  } else {
    filterButtonRefs.value.delete(cat);
  }
}

const pillState = ref({ left: 0, width: 0, opacity: 0 });

function updatePillPosition() {
  const el = filterButtonRefs.value.get(activeCategory.value);
  if (el) {
    pillState.value = {
      left: el.offsetLeft,
      width: el.offsetWidth,
      opacity: 1,
    };
  } else {
    pillState.value.opacity = 0;
  }
}

watch(
  [activeCategory, categories],
  () => {
    nextTick(() => {
      updatePillPosition();
    });
  },
  { immediate: true, flush: 'post' }
);

// Filtered items based on active category
const filteredItems = computed(() => {
  if (activeCategory.value === 'All') return rawItems.value;
  return rawItems.value.filter(
    (i) => (i.category || 'Highlights').toLowerCase() === activeCategory.value.toLowerCase()
  );
});

// Triplicated clone set for 100% seamless infinite looping without blank gaps
const displayItems = computed(() => {
  const base = filteredItems.value;
  if (!base.length) return [];
  if (base.length === 1) return base.map((it, idx) => ({ ...it, _vKey: `single-${idx}`, _origIdx: 0 }));

  return [
    ...base.map((item, idx) => ({ ...item, _vKey: `pre-${idx}`, _origIdx: idx })),
    ...base.map((item, idx) => ({ ...item, _vKey: `mid-${idx}`, _origIdx: idx })),
    ...base.map((item, idx) => ({ ...item, _vKey: `post-${idx}`, _origIdx: idx })),
  ];
});

const currentSlideIndex = ref(0);
const trackRef = ref(null);
const viewportRef = ref(null);
const isTransitionEnabled = ref(true);
let resetTimer = null;

// Original index relative to the base filtered items (for dots pagination)
const activeIndex = computed(() => {
  const len = filteredItems.value.length;
  if (len <= 1) return 0;
  return ((currentSlideIndex.value % len) + len) % len;
});

function getDimensions() {
  if (typeof window === 'undefined') return { itemWidth: 860, gap: 24 };
  const isMobile = window.innerWidth < 768;
  const isLg = window.innerWidth >= 1024;
  return {
    itemWidth: isMobile ? 340 : (isLg ? 940 : 860),
    gap: isMobile ? 16 : 24,
  };
}

function updateTrackPosition(withAnimation = true) {
  if (!trackRef.value || !viewportRef.value || !displayItems.value.length) return;

  isTransitionEnabled.value = withAnimation;
  trackRef.value.style.transition = withAnimation
    ? 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)'
    : 'none';

  const { itemWidth, gap } = getDimensions();
  const viewportWidth = viewportRef.value.getBoundingClientRect().width;
  const itemTotalWidth = itemWidth + gap;
  const offset = currentSlideIndex.value * itemTotalWidth - (viewportWidth / 2) + (itemWidth / 2);

  trackRef.value.style.transform = `translateX(${-offset}px)`;
}

function handleIndexWrap() {
  const len = filteredItems.value.length;
  if (len <= 1) return;

  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    if (currentSlideIndex.value >= 2 * len) {
      currentSlideIndex.value = len + (currentSlideIndex.value % len);
      updateTrackPosition(false);
    } else if (currentSlideIndex.value < len) {
      currentSlideIndex.value = len + (((currentSlideIndex.value % len) + len) % len);
      updateTrackPosition(false);
    }
  }, 480);
}

function next() {
  const len = filteredItems.value.length;
  if (len <= 1) return;
  currentSlideIndex.value++;
  updateTrackPosition(true);
  handleIndexWrap();
}

function prev() {
  const len = filteredItems.value.length;
  if (len <= 1) return;
  currentSlideIndex.value--;
  updateTrackPosition(true);
  handleIndexWrap();
}

function goToIndex(idx) {
  const len = filteredItems.value.length;
  if (len <= 1) return;
  currentSlideIndex.value = len + idx;
  updateTrackPosition(true);
  handleIndexWrap();
}

function setCategory(cat) {
  activeCategory.value = cat;
  nextTick(() => {
    updatePillPosition();
    const el = filterButtonRefs.value.get(cat);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    const len = filteredItems.value.length;
    currentSlideIndex.value = len > 1 ? len : 0;
    updateTrackPosition(false);
  });
}

function handleCardClick(displayIdx, origIdx) {
  if (currentSlideIndex.value === displayIdx) {
    openLightbox(origIdx);
  } else {
    currentSlideIndex.value = displayIdx;
    updateTrackPosition(true);
    handleIndexWrap();
  }
}

// Fullscreen Lightbox Image Viewer
const activeLightbox = ref(null);
const lightboxIndex = ref(0);

const activeLightboxList = computed(() => {
  return isFilmstrip.value ? rawItems.value : filteredItems.value;
});

function openLightbox(origIdx) {
  lightboxIndex.value = origIdx;
  activeLightbox.value = activeLightboxList.value[origIdx] || activeLightboxList.value[0];
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  activeLightbox.value = null;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

function nextLightbox() {
  const len = activeLightboxList.value.length;
  if (len <= 1) return;
  lightboxIndex.value = (lightboxIndex.value + 1) % len;
  activeLightbox.value = activeLightboxList.value[lightboxIndex.value];
}

function prevLightbox() {
  const len = activeLightboxList.value.length;
  if (len <= 1) return;
  lightboxIndex.value = (lightboxIndex.value - 1 + len) % len;
  activeLightbox.value = activeLightboxList.value[lightboxIndex.value];
}

function handleKeydown(e) {
  if (!activeLightbox.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextLightbox();
  if (e.key === 'ArrowLeft') prevLightbox();
}

// Filmstrip horizontal track scrolling
const filmstripTrackRef = ref(null);

function scrollFilmstrip(direction) {
  if (!filmstripTrackRef.value) return;
  const scrollAmount = 360 * 1.5;
  filmstripTrackRef.value.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth',
  });
}

// Touch swipe support
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 40) {
    if (isFilmstrip.value) {
      if (diff > 0) scrollFilmstrip(1);
      else scrollFilmstrip(-1);
    } else {
      if (diff > 0) next();
      else prev();
    }
  }
}

function handleResize() {
  updateTrackPosition(false);
  updatePillPosition();
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeydown);

  nextTick(() => {
    updatePillPosition();
    setTimeout(updatePillPosition, 80);
    const len = filteredItems.value.length;
    currentSlideIndex.value = len > 1 ? len : 0;
    setTimeout(() => updateTrackPosition(false), 120);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeydown);
  clearTimeout(resetTimer);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <!-- ========================================================================= -->
  <!-- VARIANT B: EDITORIAL FILMSTRIP & MILESTONE REELS -->
  <!-- ========================================================================= -->
  <section
    v-if="isFilmstrip"
    id="filmstrip"
    class="py-24 bg-[#0d0d0d] overflow-hidden select-none border-b border-white/5 relative font-manrope"
  >
    <div class="max-w-6xl mx-auto px-4 mb-10 text-center">
      <!-- Section Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-4">
        <Film class="w-3.5 h-3.5 text-[#FFD700]" />
        <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700]">
          {{ content.badge_text || '35MM DOCUMENTARY ARCHIVE' }}
        </span>
      </div>

      <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-3">
        {{ content.title || 'EDITORIAL FILMSTRIP & MILESTONE REELS' }}
      </h2>
      <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
        {{ content.subtitle || 'Snapshot frames and documentary highlights from recent events' }}
      </p>
    </div>

    <!-- The 35mm Perforated Filmstrip Container -->
    <div class="relative w-full overflow-hidden py-6 bg-black/60 border-y border-white/10 shadow-2xl">
      <!-- Top Perforation Sprocket Ribbon -->
      <div class="w-full flex items-center justify-between px-4 pb-4 border-b border-white/[0.06] overflow-hidden select-none opacity-40">
        <div class="flex items-center gap-6 w-full overflow-hidden">
          <div v-for="i in 30" :key="'sprocket-top-' + i" class="flex items-center gap-3 shrink-0">
            <div class="w-3.5 h-2.5 rounded-[2px] bg-[#1a1a1a] border border-white/20 shadow-inner"></div>
            <span class="text-[9px] font-mono tracking-widest text-neutral-500">KODAK 400 • {{ i < 10 ? '0' + i : i }}A</span>
          </div>
        </div>
      </div>

      <!-- Horizontal Filmstrip Frames Scroll Track -->
      <div
        ref="filmstripTrackRef"
        class="flex items-center gap-6 px-6 md:px-12 py-6 overflow-x-auto scrollbar-none scroll-smooth"
        @touchstart.passive="handleTouchStart"
        @touchend.passive="handleTouchEnd"
      >
        <div
          v-for="(item, index) in rawItems"
          :key="item.id || index"
          @click="openLightbox(index)"
          class="flex-shrink-0 group cursor-pointer select-none"
        >
          <!-- 35mm Film Frame Outer Casing -->
          <div class="p-3 bg-[#161616] border border-white/15 rounded-2xl shadow-2xl transition-all duration-300 group-hover:border-[#FFD700]/60 group-hover:-translate-y-1.5 group-hover:shadow-[0_12px_30px_rgba(255,215,0,0.15)] flex flex-col justify-between w-[270px] sm:w-[310px] md:w-[350px]">
            <!-- Frame Header Stamp -->
            <div class="flex items-center justify-between pb-2 border-b border-white/[0.08] text-[10px] font-mono text-neutral-400">
              <span class="text-[#FFD700] font-bold">FR // {{ index + 1 < 10 ? '0' + (index + 1) : index + 1 }}</span>
              <span class="tracking-widest uppercase">{{ item.category || '35MM RAW' }}</span>
              <span class="opacity-60">24 FPS</span>
            </div>

            <!-- Frame Image Box (3:2 classic proportion) -->
            <div class="my-2.5 aspect-[3/2] w-full rounded-xl overflow-hidden bg-neutral-900 border border-black/40 relative shadow-inner">
              <img
                :src="item.image_url"
                :alt="item.title || 'Milestone Reel Frame'"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

              <!-- Hover Expand Icon -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div class="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[#FFD700] flex items-center justify-center shadow-lg">
                  <Maximize2 class="w-4 h-4" />
                </div>
              </div>
            </div>

            <!-- Frame Footer Caption & Metadata -->
            <div class="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <div class="min-w-0 pr-2">
                <p class="text-xs font-bold text-white tracking-wide truncate group-hover:text-[#FFD700] transition-colors">
                  {{ item.title || `Milestone Frame #${index + 1}` }}
                </p>
                <p class="text-[10px] font-mono text-neutral-400 truncate mt-0.5">
                  {{ item.category ? `${item.category} Highlight` : 'Documentary Master Reel' }}
                </p>
              </div>
              <div class="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#FFD700] shrink-0">
                <Film class="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Perforation Sprocket Ribbon -->
      <div class="w-full flex items-center justify-between px-4 pt-4 border-t border-white/[0.06] overflow-hidden select-none opacity-40">
        <div class="flex items-center gap-6 w-full overflow-hidden">
          <div v-for="i in 30" :key="'sprocket-bot-' + i" class="flex items-center gap-3 shrink-0">
            <div class="w-3.5 h-2.5 rounded-[2px] bg-[#1a1a1a] border border-white/20 shadow-inner"></div>
            <span class="text-[9px] font-mono tracking-widest text-neutral-500">RGP STUDIOS • 35MM ARCHIVE</span>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows for Filmstrip -->
      <button
        v-if="rawItems.length > 3"
        type="button"
        @click="scrollFilmstrip(-1)"
        class="cursor-pointer absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all duration-300 z-20 shadow-2xl active:scale-90"
        aria-label="Scroll left"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <button
        v-if="rawItems.length > 3"
        type="button"
        @click="scrollFilmstrip(1)"
        class="cursor-pointer absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all duration-300 z-20 shadow-2xl active:scale-90"
        aria-label="Scroll right"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- VARIANT A: CURATED FEATURED WORKS SLIDER -->
  <!-- ========================================================================= -->
  <section
    v-else
    id="portfolio"
    class="py-24 bg-[#141414] overflow-hidden select-none border-b border-white/5 relative"
  >
    <span id="showcase" class="absolute -top-24"></span>

    <div class="max-w-6xl mx-auto px-4 mb-10 text-center">
      <!-- Section Badge -->
      <div v-if="content.badge_text" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-4">
        <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700]"></span>
        <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700] font-manrope">
          {{ content.badge_text }}
        </span>
      </div>

      <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-3">
        {{ content.title || 'PORTFOLIO SHOWCASE' }}
      </h2>
      <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
        {{ content.subtitle || 'A visual collection of timeless weddings, portraits, and milestones.' }}
      </p>

      <!-- Category Filter Pills with Smooth Sliding Capsule (Design Tokens Pattern) -->
      <div v-if="categories.length > 1" :class="adminModalTokens.filterWrapper">
        <div :class="adminModalTokens.filterTrack">
          <!-- Smooth Sliding Frosted Glass Capsule -->
          <div
            :class="adminModalTokens.filterSlidingCapsule"
            :style="{
              left: `${pillState.left}px`,
              width: `${pillState.width}px`,
              opacity: pillState.opacity,
            }"
          ></div>

          <button
            v-for="cat in categories"
            :key="cat"
            :ref="(el) => setFilterBtnRef(el, cat)"
            type="button"
            @click="setCategory(cat)"
            :class="[
              adminModalTokens.filterButton,
              activeCategory === cat
                ? adminModalTokens.filterButtonActive
                : adminModalTokens.filterButtonInactive
            ]"
          >
            <span>{{ cat }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Carousel Viewport -->
    <div
      ref="viewportRef"
      class="relative w-full overflow-hidden py-4"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
    >
      <div
        ref="trackRef"
        class="flex gap-4 md:gap-6 items-center"
        style="will-change: transform;"
      >
        <div
          v-for="(item, index) in displayItems"
          :key="item._vKey || index"
          @click="handleCardClick(index, item._origIdx)"
          class="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 relative group select-none"
          :class="[
            index === currentSlideIndex
              ? 'w-[340px] h-[230px] md:w-[860px] md:h-[510px] lg:w-[940px] lg:h-[550px] opacity-100 ring-2 ring-[#FFD700]/50 shadow-2xl scale-100'
              : 'w-[340px] h-[230px] md:w-[860px] md:h-[510px] lg:w-[940px] lg:h-[550px] opacity-40 hover:opacity-75 scale-95'
          ]"
        >
          <img
            :src="item.image_url"
            alt="Portfolio Visual"
            class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
            loading="lazy"
          />

          <!-- Hover Overlay with Expand Action (No Category / File Name Text) -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-5 pointer-events-none"
          >
            <div
              class="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              title="Click to view image"
            >
              <Maximize2 class="w-4 h-4 text-[#FFD700]" />
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button
        v-if="filteredItems.length > 1"
        @click.stop="prev"
        class="cursor-pointer absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all duration-300 z-20 shadow-2xl active:scale-90"
        aria-label="Previous image"
      >
        <ChevronLeft class="w-6 h-6" />
      </button>

      <button
        v-if="filteredItems.length > 1"
        @click.stop="next"
        class="cursor-pointer absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all duration-300 z-20 shadow-2xl active:scale-90"
        aria-label="Next image"
      >
        <ChevronRight class="w-6 h-6" />
      </button>
    </div>

    <!-- Dots Pagination (Only based on active filtered items) -->
    <div v-if="filteredItems.length > 1" class="flex justify-center gap-2 mt-8">
      <button
        v-for="(_, index) in filteredItems"
        :key="index"
        type="button"
        @click="goToIndex(index)"
        class="cursor-pointer h-2 rounded-full transition-all duration-300"
        :class="[
          index === activeIndex ? 'w-8 bg-[#FFD700]' : 'w-2 bg-white/20 hover:bg-white/40'
        ]"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>
  </section>

  <!-- Fullscreen Lightbox Image Viewer Modal (Shared between both variants) -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activeLightbox"
        class="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 select-none"
        @click.self="closeLightbox"
      >
        <!-- Top Bar: Counter & Close Button -->
        <div class="absolute top-4 md:top-6 left-4 md:left-8 right-4 md:right-8 flex items-center justify-between pointer-events-auto z-30">
          <div class="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-mono font-semibold tracking-wider">
            {{ lightboxIndex + 1 }} / {{ activeLightboxList.length }}
          </div>
          <button
            type="button"
            @click="closeLightbox"
            class="cursor-pointer w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition shadow-lg active:scale-95"
            aria-label="Close image viewer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Lightbox Prev Arrow -->
        <button
          v-if="activeLightboxList.length > 1"
          type="button"
          @click.stop="prevLightbox"
          class="cursor-pointer absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FFD700] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all duration-200 z-30 shadow-2xl active:scale-90"
          aria-label="Previous image"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>

        <!-- Lightbox Next Arrow -->
        <button
          v-if="activeLightboxList.length > 1"
          type="button"
          @click.stop="nextLightbox"
          class="cursor-pointer absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FFD700] hover:text-black border border-white/15 text-white flex items-center justify-center transition-all duration-200 z-30 shadow-2xl active:scale-90"
          aria-label="Next image"
        >
          <ChevronRight class="w-6 h-6" />
        </button>

        <!-- Displayed Lightbox Image -->
        <div class="max-w-[92vw] max-h-[86vh] flex items-center justify-center relative z-20">
          <img
            :src="activeLightbox.image_url"
            alt="Fullscreen Visual"
            class="max-w-full max-h-[86vh] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
