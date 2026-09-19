<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Star, Quote, Heart, Award, Building2, ArrowLeft, ArrowRight, Maximize2, X } from '@lucide/vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'testimonials_dual', // testimonials_dual | testimonials_grid | testimonials_featured | trust_venues
  },
});

const currentVariant = computed(() => {
  if (props.content?.variant) return props.content.variant;
  if (props.variant) return props.variant;
  if (props.content?.venues && !props.content?.testimonials && !props.content?.featured_quote && !props.content?.featured_quotes) {
    return 'trust_venues';
  }
  return 'testimonials_dual';
});

const defaultCardImages = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg',
  '/images/6.jpg',
];

const defaultTestimonials = [
  {
    client_name: 'Clarisse & Ethan',
    event: 'Church Wedding at Tagaytay Highlands',
    location: 'Tagaytay Highlands',
    card_image: '/images/1.jpg',
    quote: 'RGP Films captured the warmth and genuine joy of our wedding day so flawlessly. Looking back at our film brings tears of joy every single time!',
    rating: 5,
  },
  {
    client_name: 'Jessica & Marcus',
    event: 'Grand Debut at Palacio de Memoria',
    location: 'Palacio de Memoria',
    card_image: '/images/2.jpg',
    quote: 'The team was so fun and professional to work with! The same-day edit reel brought everyone to tears at our reception.',
    rating: 5,
  },
  {
    client_name: 'Patricia & Daniel',
    event: 'Beach Wedding at Balesin Island Club',
    location: 'Balesin Island Club',
    card_image: '/images/3.jpg',
    quote: 'Their attention to detail and ability to capture candid emotion without feeling intrusive was extraordinary. Pure cinematic mastery.',
    rating: 5,
  },
  {
    client_name: 'Sophia & Miguel',
    event: 'Vineyard Vows at Antonio’s Tagaytay',
    location: 'Antonio’s Tagaytay',
    card_image: '/images/4.jpg',
    quote: 'From pre-nup preparations to the final sparkler send-off, every single moment was preserved in unforgettable, breathtaking elegance.',
    rating: 5,
  },
];

const items = computed(() => {
  const raw = (props.content?.testimonials && props.content.testimonials.length > 0)
    ? props.content.testimonials
    : defaultTestimonials;
  return raw.slice(0, 10);
});

// Distribute items round-robin across 3 columns for true masonry layout
const columns = computed(() => {
  const cols = [[], [], []];
  items.value.forEach((item, idx) => {
    cols[idx % 3].push(item);
  });
  return cols;
});

const venuesList = computed(() => {
  return props.content?.venues || [
    'Tagaytay Highlands',
    'Palacio de Memoria',
    'The Manila Hotel',
    'Antonio’s Garden',
    'Balesin Island Club',
    'Shangri-La at The Fort',
    'Pinto Art Museum',
    'Club Ananda Tagaytay',
  ];
});

const marqueeDisplayList = computed(() => {
  const base = venuesList.value && venuesList.value.length > 0 ? venuesList.value : [
    'Tagaytay Highlands',
    'Palacio de Memoria',
    'The Manila Hotel',
    'Antonio’s Garden',
    'Balesin Island Club',
    'Shangri-La at The Fort',
    'Pinto Art Museum',
    'Club Ananda Tagaytay',
  ];
  let repeated = [...base];
  while (repeated.length < 8) {
    repeated = [...repeated, ...base];
  }
  return repeated;
});

// Editorial Quotes Carousel (Multiple featured quotes support)
const defaultFeaturedQuotes = [
  {
    quote: 'Working with RGP Films was the single best decision we made for our wedding. The team made us feel completely natural in front of the lens, and our 4K film feels like a genuine cinematic masterpiece.',
    client_name: 'Clarisse & Ethan Morales',
    event: 'Tagaytay Highlands Church Wedding',
  },
  {
    quote: 'The level of artistry and emotional storytelling blew us away. Watching our wedding film was like reliving the most magical day of our lives all over again.',
    client_name: 'Jessica & Marcus Tan',
    event: 'Palacio de Memoria Grand Reception',
  },
  {
    quote: 'Unobtrusive, supremely professional, and incredibly gifted. They captured glances and tears we didn’t even realize happened. Worth every single cent.',
    client_name: 'Patricia & Daniel Gomez',
    event: 'Balesin Island Club Destination Wedding',
  },
];

const featuredIndex = ref(0);

const featuredQuotes = computed(() => {
  if (props.content?.featured_quotes && Array.isArray(props.content.featured_quotes) && props.content.featured_quotes.length > 0) {
    return props.content.featured_quotes.slice(0, 10);
  }
  if (props.content?.featured_quote) {
    return [{
      quote: props.content.featured_quote,
      client_name: props.content.featured_client || 'Clarisse & Ethan Morales',
      event: props.content.featured_event || 'Tagaytay Highlands Church Wedding',
    }];
  }
  return defaultFeaturedQuotes;
});

const currentFeatured = computed(() => {
  const list = featuredQuotes.value;
  if (!list.length) return defaultFeaturedQuotes[0];
  const safeIdx = ((featuredIndex.value % list.length) + list.length) % list.length;
  return list[safeIdx] || list[0];
});

function prevFeatured() {
  const list = featuredQuotes.value;
  if (list.length <= 1) return;
  featuredIndex.value = (featuredIndex.value - 1 + list.length) % list.length;
}

function nextFeatured() {
  const list = featuredQuotes.value;
  if (list.length <= 1) return;
  featuredIndex.value = (featuredIndex.value + 1) % list.length;
}

// Title & Underline Accent Parsing for 1:1 Reference Alignment
const titlePrefix = computed(() => {
  if (props.content?.title_prefix) return props.content.title_prefix;
  if (props.content?.title) {
    const raw = props.content.title.trim();
    const parts = raw.split('.');
    if (parts.length > 1) return parts[0] + '.';
    return raw;
  }
  return 'Real Stories.';
});

const titleAccent = computed(() => {
  if (props.content?.title_accent) return props.content.title_accent;
  if (props.content?.title) {
    const raw = props.content.title.trim();
    const parts = raw.split('.');
    if (parts.length > 1) return parts.slice(1).join('.').trim();
    return '';
  }
  return 'Real People';
});

// Carousel State & Responsive Cards Per View
const currentIndex = ref(0);
const cardsPerView = ref(4);

function updateCardsPerView() {
  if (typeof window === 'undefined') return;
  if (window.innerWidth < 640) {
    cardsPerView.value = 1;
  } else if (window.innerWidth < 1024) {
    cardsPerView.value = 2;
  } else if (window.innerWidth < 1280) {
    cardsPerView.value = 3;
  } else {
    cardsPerView.value = 4;
  }
}

// Full-resolution Lightbox for review screenshots
const activeLightbox = ref(null);

function openLightbox(img, title = '') {
  activeLightbox.value = { image: img, title };
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

function handleKeydown(e) {
  if (e.key === 'Escape' && activeLightbox.value) {
    closeLightbox();
  }
}

onMounted(() => {
  updateCardsPerView();
  window.addEventListener('resize', updateCardsPerView);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateCardsPerView);
  window.removeEventListener('keydown', handleKeydown);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});

const maxIndex = computed(() => {
  return Math.max(0, items.value.length - cardsPerView.value);
});

const totalDots = computed(() => {
  return Math.max(1, maxIndex.value + 1);
});

function prevSlide() {
  if (currentIndex.value > 0) currentIndex.value--;
}

function nextSlide() {
  if (currentIndex.value < maxIndex.value) currentIndex.value++;
}

function goToSlide(idx) {
  currentIndex.value = Math.min(Math.max(0, idx), maxIndex.value);
}

// Touch swipe support for mobile
let touchStartX = 0;
function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}
function handleTouchEnd(e) {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 40) {
    if (diff > 0) nextSlide();
    else prevSlide();
  }
}

// 4 Color Palettes Matching Reference Image Tints (Rose, Icy Blue, Peach/Gold, Sage Mint) in Dark Luxury
const cardThemes = [
  {
    bg: 'bg-gradient-to-b from-rose-500/[0.08] via-rose-500/[0.03] to-[#141414]',
    border: 'border-rose-500/20 hover:border-rose-400/50',
  },
  {
    bg: 'bg-gradient-to-b from-sky-500/[0.08] via-sky-500/[0.03] to-[#141414]',
    border: 'border-sky-500/20 hover:border-sky-400/50',
  },
  {
    bg: 'bg-gradient-to-b from-[#FFD700]/[0.08] via-amber-500/[0.03] to-[#141414]',
    border: 'border-[#FFD700]/25 hover:border-[#FFD700]/50',
  },
  {
    bg: 'bg-gradient-to-b from-emerald-500/[0.08] via-emerald-500/[0.03] to-[#141414]',
    border: 'border-emerald-500/20 hover:border-emerald-400/50',
  },
];

// Playful Tilted Rotations Matching Reference Image
const cardRotations = [
  '-rotate-[1.5deg]',
  'rotate-[1deg]',
  '-rotate-[1deg]',
  'rotate-[1.5deg]',
];
</script>

<template>
  <!-- ========================================== -->
  <!-- 1. DUAL / HORIZONTAL REVIEW CARDS (1:1 Reference Layout) -->
  <!-- ========================================== -->
  <section
    v-if="currentVariant === 'testimonials_dual' || currentVariant === 'testimonials'"
    class="py-24 sm:py-32 bg-[#0c0c0c] border-b border-white/5 font-manrope select-none overflow-hidden relative"
  >
    <!-- Background Ambient Glow -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none opacity-20"
      style="background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.12) 0%, transparent 70%);"
    ></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Top Header Row: Title & Subtitle on Left, Nav Arrows on Right -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <!-- Pill Badge -->
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[#FFD700] text-xs font-semibold tracking-wider mb-4">
            {{ content.badge_text || 'Testimonial' }}
          </span>

          <!-- Heading with Underline Accent -->
          <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            <span>{{ titlePrefix }}</span>
            <span v-if="titleAccent" class="relative inline-block ml-2 text-white pb-1">
              {{ titleAccent }}
              <span class="absolute left-0 bottom-0 w-full h-[3px] bg-gradient-to-r from-[#FFD700] via-[#FFD700]/80 to-[#FFD700]/20 rounded-full"></span>
            </span>
          </h2>

          <!-- Subtitle -->
          <p class="text-sm sm:text-base text-neutral-400 max-w-xl mt-3 font-normal leading-relaxed">
            {{ content.subtitle || 'Check out what our awesome clients are saying about us!' }}
          </p>
        </div>

        <!-- Navigation Arrows (Right Aligned with Heading) -->
        <div class="flex items-center gap-3 shrink-0 self-start md:self-end">
          <button
            type="button"
            @click="prevSlide"
            :disabled="currentIndex === 0"
            class="w-11 h-11 rounded-full border transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            :class="[
              currentIndex === 0
                ? 'bg-white/[0.03] border-white/10 text-neutral-500'
                : 'bg-white/[0.08] hover:bg-white/[0.15] border-white/20 text-white shadow-sm'
            ]"
            aria-label="Previous review"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="nextSlide"
            :disabled="currentIndex >= maxIndex"
            class="w-11 h-11 rounded-full border transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
            :class="[
              currentIndex >= maxIndex
                ? 'bg-white/[0.03] border-white/10 text-neutral-500'
                : 'bg-[#FFD700] hover:bg-yellow-400 text-black border-[#FFD700] font-bold shadow-yellow-500/20'
            ]"
            aria-label="Next review"
          >
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Cards Viewport & Carousel Track -->
      <div
        class="overflow-hidden py-6 -my-6 px-2 -mx-2"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <div
          class="flex gap-5 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
          :style="{
            transform: `translateX(calc(-${currentIndex} * (${100 / cardsPerView}% + ${20 / cardsPerView}px)))`
          }"
        >
          <div
            v-for="(t, idx) in items"
            :key="idx"
            class="shrink-0 transition-all duration-300 py-3"
            :style="{
              width: `calc(${100 / cardsPerView}% - ${((cardsPerView - 1) * 20) / cardsPerView}px)`
            }"
          >
            <!-- Full Bleed Image Review Card (Tilted, Unified Size, 100% Edge-to-Edge) -->
            <div
              @click="openLightbox(t.card_image || t.image_url || defaultCardImages[idx % defaultCardImages.length], t.client_name || `Review Screenshot ${idx + 1}`)"
              class="relative w-full h-[290px] sm:h-[340px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 hover:border-[#FFD700]/70 shadow-2xl transition-all duration-300 hover:rotate-0 hover:scale-[1.03] hover:z-20 cursor-pointer group bg-neutral-950"
              :class="[
                cardRotations[idx % cardRotations.length]
              ]"
            >
              <!-- 100% Full Bleed Cropped & Unified Image -->
              <img
                :src="t.card_image || t.image_url || defaultCardImages[idx % defaultCardImages.length]"
                :alt="t.client_name || `Review Screenshot ${idx + 1}`"
                class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              <!-- Click to Expand Pill on Hover -->
              <div class="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none">
                <Maximize2 class="w-3 h-3 text-[#FFD700]" />
                <span>Expand</span>
              </div>

              <!-- Optional Bottom Info Tag if Client Name is Provided -->
              <div
                v-if="t.client_name"
                class="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              >
                <p class="text-xs font-bold text-white truncate drop-shadow">{{ t.client_name }}</p>
                <p v-if="t.event || t.location" class="text-[10px] text-neutral-300 truncate font-medium mt-0.5">{{ t.event || t.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Indicator Dots (Centered) -->
      <div v-if="totalDots > 1" class="mt-12 flex items-center justify-center gap-2.5">
        <button
          v-for="dotIdx in totalDots"
          :key="dotIdx"
          type="button"
          @click="goToSlide(dotIdx - 1)"
          class="transition-all duration-300 rounded-full cursor-pointer"
          :class="[
            currentIndex === dotIdx - 1
              ? 'w-7 h-2 bg-[#FFD700]'
              : 'w-2 h-2 bg-white/20 hover:bg-white/40'
          ]"
          :aria-label="`Go to slide ${dotIdx}`"
        ></button>
      </div>
    </div>

    <!-- Lightbox Modal for Full Screenshot Viewing -->
    <Teleport to="body">
      <div
        v-if="activeLightbox"
        class="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        @click.self="closeLightbox"
      >
        <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
          <button
            type="button"
            @click="closeLightbox"
            class="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
            aria-label="Close preview"
          >
            <X class="w-5 h-5" />
          </button>
          <img
            :src="activeLightbox.image"
            :alt="activeLightbox.title || 'Review Screenshot'"
            class="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/15 shadow-2xl"
          />
          <p v-if="activeLightbox.title" class="mt-3 text-sm text-neutral-300 font-medium">
            {{ activeLightbox.title }}
          </p>
        </div>
      </div>
    </Teleport>
  </section>

  <!-- ========================================== -->
  <!-- 2. 3-COLUMN MASONRY CLIENT REVIEWS GRID -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'testimonials_grid'"
    class="py-24 bg-[#101010] border-b border-white/5 font-manrope select-none"
  >
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-14 space-y-2">
        <span v-if="content.badge_text" class="px-3.5 py-1 rounded-full bg-[#FFD700]/10 text-[#FFD700] text-[11px] font-bold uppercase tracking-wider border border-[#FFD700]/20 inline-block mb-1">
          {{ content.badge_text }}
        </span>
        <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {{ content.title || 'Stories From Our Couples' }}
        </h2>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
          {{ content.subtitle || 'Over 250+ 5-star verified reviews across weddings, debuts, and commercial visual productions.' }}
        </p>
      </div>

      <!-- Desktop 3-Column Review Wall (Content-Aware Heights, Staggered Flow) -->
      <div class="hidden md:grid md:grid-cols-3 gap-6 items-start">
        <div
          v-for="(col, colIdx) in columns"
          :key="colIdx"
          class="flex flex-col gap-6"
        >
          <div
            v-for="(t, idx) in col"
            :key="idx"
            class="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#FFD700]/30 transition space-y-4 shadow-lg hover:shadow-yellow-500/5 hover:-translate-y-1 duration-300"
          >
            <div class="space-y-3">
              <div class="flex text-[#FFD700] gap-1">
                <Star v-for="star in (t.rating || 5)" :key="star" class="w-3.5 h-3.5 fill-[#FFD700]" />
              </div>
              <p class="text-xs sm:text-[13px] text-neutral-300 leading-relaxed italic">
                "{{ t.quote }}"
              </p>
            </div>
            <div class="pt-3 border-t border-white/5">
              <h4 class="font-bold text-xs text-white">{{ t.client_name }}</h4>
              <span v-if="t.event || t.location" class="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                {{ t.event || t.location }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Single Column (Natural Sequential Flow) -->
      <div class="flex flex-col gap-6 md:hidden">
        <div
          v-for="(t, idx) in items"
          :key="idx"
          class="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#FFD700]/30 transition space-y-4 shadow-lg"
        >
          <div class="space-y-3">
            <div class="flex text-[#FFD700] gap-1">
              <Star v-for="star in (t.rating || 5)" :key="star" class="w-3.5 h-3.5 fill-[#FFD700]" />
            </div>
            <p class="text-xs sm:text-[13px] text-neutral-300 leading-relaxed italic">
              "{{ t.quote }}"
            </p>
          </div>
          <div class="pt-3 border-t border-white/5">
            <h4 class="font-bold text-xs text-white">{{ t.client_name }}</h4>
            <span v-if="t.event || t.location" class="text-[10px] text-neutral-500 font-mono mt-0.5 block">
              {{ t.event || t.location }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 3. FULL-WIDTH FEATURED COUPLE EDITORIAL QUOTE -->
  <!-- ========================================== -->
  <section
    v-else-if="currentVariant === 'testimonials_featured'"
    class="py-24 sm:py-28 bg-[#0a0a0a] border-b border-white/5 relative overflow-hidden font-manrope select-none"
  >
    <div
      class="absolute inset-0 bg-cover bg-center opacity-15"
      :style="{ backgroundImage: `url('${content.featured_bg_image || '/images/hero-bg.jpg'}')` }"
    ></div>
    <div class="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]"></div>

    <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
      <!-- Section Title & Eyebrow Above the Quotes -->
      <div class="text-center space-y-3 mb-10 sm:mb-14">
        <span
          v-if="content.badge_text"
          class="px-3.5 py-1 rounded-full bg-[#FFD700]/10 text-[#FFD700] text-[11px] font-bold uppercase tracking-wider border border-[#FFD700]/20 inline-block"
        >
          {{ content.badge_text }}
        </span>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {{ content.title || 'Words from Our Couples' }}
        </h2>
        <p v-if="content.subtitle" class="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
          {{ content.subtitle }}
        </p>
      </div>

      <!-- Quote Container with Left & Right Arrows on the Quote -->
      <div class="relative max-w-4xl mx-auto px-3 sm:px-14">
        <!-- Left Navigation Arrow on Quote -->
        <button
          v-if="featuredQuotes.length > 1"
          type="button"
          @click="prevFeatured"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/[0.04] hover:bg-[#FFD700]/10 border border-white/10 hover:border-[#FFD700]/40 text-neutral-400 hover:text-[#FFD700] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-sm group"
          aria-label="Previous quote"
        >
          <ArrowLeft class="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <!-- Right Navigation Arrow on Quote -->
        <button
          v-if="featuredQuotes.length > 1"
          type="button"
          @click="nextFeatured"
          class="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/[0.04] hover:bg-[#FFD700]/10 border border-white/10 hover:border-[#FFD700]/40 text-neutral-400 hover:text-[#FFD700] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-sm group"
          aria-label="Next quote"
        >
          <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
        </button>

        <!-- Active Quote Content -->
        <div class="text-center space-y-6 px-4 sm:px-6">
          <Quote class="w-10 h-10 sm:w-12 sm:h-12 text-[#FFD700]/40 mx-auto" />

          <div class="min-h-[120px] sm:min-h-[140px] flex items-center justify-center">
            <Transition mode="out-in" name="quote-fade">
              <div :key="featuredIndex" class="space-y-6 max-w-3xl mx-auto">
                <p class="text-xl sm:text-3xl font-light text-neutral-100 leading-relaxed italic">
                  "{{ currentFeatured.quote }}"
                </p>
                <div class="space-y-1">
                  <h4 class="text-base font-bold text-white tracking-wider uppercase">
                    {{ currentFeatured.client_name }}
                  </h4>
                  <span v-if="currentFeatured.event" class="text-xs font-mono text-[#FFD700] block">
                    {{ currentFeatured.event }}
                  </span>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Pagination Indicator Dots (When multiple quotes exist) -->
          <div v-if="featuredQuotes.length > 1" class="flex items-center justify-center gap-2 pt-2">
            <button
              v-for="(_, dotIdx) in featuredQuotes"
              :key="dotIdx"
              type="button"
              @click="featuredIndex = dotIdx"
              class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
              :class="dotIdx === featuredIndex ? 'w-6 bg-[#FFD700]' : 'w-1.5 bg-white/20 hover:bg-white/40'"
              :aria-label="`Go to quote ${dotIdx + 1}`"
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- 4. PARTNERED VENUES & HOTELS MARQUEE -->
  <!-- ========================================== -->
  <section
    v-else
    class="py-20 bg-[#121212] border-b border-white/5 font-manrope select-none overflow-hidden relative"
  >
    <div class="max-w-6xl mx-auto px-4 text-center mb-8 space-y-1">
      <span class="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest">
        {{ content.badge_text || 'FEATURED LOCATIONS & COLLABORATORS' }}
      </span>
      <h3 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
        {{ content.title || 'TRUSTED & FEATURED AT PREMIER VENUES' }}
      </h3>
      <p v-if="content.subtitle" class="text-xs text-neutral-400 max-w-lg mx-auto pt-1">
        {{ content.subtitle }}
      </p>
    </div>

    <!-- Edge gradient fade masks -->
    <div class="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#121212] to-transparent z-10"></div>
    <div class="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#121212] to-transparent z-10"></div>

    <!-- Scrolling Marquee Row (100% Seamless Double-Track Loop) -->
    <div class="w-full flex overflow-x-hidden relative py-4">
      <div class="flex w-max animate-marquee-venues hover:[animation-play-state:paused]">
        <!-- Track Group 1 -->
        <div class="flex items-center gap-6 pr-6 shrink-0">
          <div
            v-for="(venue, idx) in marqueeDisplayList"
            :key="'trk1-' + idx"
            class="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#FFD700]/30 text-xs font-bold text-neutral-300 hover:text-white tracking-wider uppercase transition shadow-sm whitespace-nowrap"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] shrink-0 shadow-sm shadow-yellow-500/50"></span>
            <span>{{ venue }}</span>
          </div>
        </div>

        <!-- Track Group 2 (Exact Duplicate Clone) -->
        <div class="flex items-center gap-6 pr-6 shrink-0" aria-hidden="true">
          <div
            v-for="(venue, idx) in marqueeDisplayList"
            :key="'trk2-' + idx"
            class="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#FFD700]/30 text-xs font-bold text-neutral-300 hover:text-white tracking-wider uppercase transition shadow-sm whitespace-nowrap"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] shrink-0 shadow-sm shadow-yellow-500/50"></span>
            <span>{{ venue }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee-venues {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.animate-marquee-venues {
  display: flex;
  width: max-content;
  animation: marquee-venues 32s linear infinite;
  will-change: transform;
}

.animate-marquee-venues:hover {
  animation-play-state: paused;
}

/* Smooth quote transition */
.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

