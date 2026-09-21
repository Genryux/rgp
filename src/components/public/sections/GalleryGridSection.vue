<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useGallery } from '../../../composables/useGallery';
import { useModalState } from '../../../composables/useModalState';
import {
  X,
  ChevronLeft,
  ChevronRight,
} from '@lucide/vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'masonry', // masonry | mosaic
  },
});

const { gallery } = useGallery();
const { openModal, closeModal } = useModalState();

const currentVariant = computed(() => {
  return props.content?.variant || props.variant || 'masonry';
});

// Fallback high-res editorial mock images if gallery is empty
const defaultFallbackImages = [
  { id: 'def_1', image_url: '/images/1.jpg', title: 'Sunset Coastal Vows', subtitle: 'Tagaytay Highlands' },
  { id: 'def_2', image_url: '/images/2.jpg', title: 'Intimate Fine Art Session', subtitle: 'Palacio de Memoria' },
  { id: 'def_3', image_url: '/images/3.jpg', title: 'Golden Milestone Gala', subtitle: 'Grand Ballroom' },
  { id: 'def_4', image_url: '/images/4.jpg', title: 'Editorial Cap & Honors', subtitle: 'University Honors' },
  { id: 'def_5', image_url: '/images/5.jpg', title: 'Highland Mist & Pine', subtitle: 'Highland Vows' },
  { id: 'def_6', image_url: '/images/6.jpg', title: 'High Fashion Studio Campaign', subtitle: 'Studio Editorial' },
];

// Resolved base raw items (respects custom content items or fallback)
const rawGalleryItems = computed(() => {
  if (props.content?.items && Array.isArray(props.content.items) && props.content.items.length > 0) {
    return props.content.items;
  }
  if (gallery.value && gallery.value.length > 0) {
    return gallery.value;
  }
  return defaultFallbackImages;
});

// Base items with limit applied if specified
const filteredBaseItems = computed(() => {
  const list = rawGalleryItems.value;
  const limit = Number(props.content?.limit);
  if (limit && limit > 0) {
    return list.slice(0, limit);
  }
  return list;
});

// Ensure we have at least 10 items for rich multi-row distribution
const normalizedBaseItems = computed(() => {
  const base = filteredBaseItems.value;
  if (!base.length) return [];
  let result = [...base];
  while (result.length < 10) {
    result = [...result, ...base];
  }
  return result;
});

// Card width profiles per row to ensure vertical seams never align (true masonry rhythm)
const row1Profiles = [
  { width: 'w-[270px] sm:w-[330px] md:w-[380px]', tag: 'Cinematic' },
  { width: 'w-[160px] sm:w-[190px] md:w-[220px]', tag: 'Editorial' },
  { width: 'w-[240px] sm:w-[280px] md:w-[320px]', tag: 'Signature' },
  { width: 'w-[320px] sm:w-[380px] md:w-[440px]', tag: 'Panorama' },
  { width: 'w-[190px] sm:w-[220px] md:w-[250px]', tag: 'Fine Art' },
];

const row2Profiles = [
  { width: 'w-[190px] sm:w-[220px] md:w-[250px]', tag: 'Portrait' },
  { width: 'w-[300px] sm:w-[360px] md:w-[420px]', tag: 'Landscape' },
  { width: 'w-[210px] sm:w-[240px] md:w-[270px]', tag: 'Square' },
  { width: 'w-[270px] sm:w-[320px] md:w-[370px]', tag: 'Atmosphere' },
  { width: 'w-[170px] sm:w-[200px] md:w-[230px]', tag: 'Story' },
];

const row3Profiles = [
  { width: 'w-[320px] sm:w-[390px] md:w-[450px]', tag: 'Masterpiece' },
  { width: 'w-[200px] sm:w-[230px] md:w-[260px]', tag: 'Studio' },
  { width: 'w-[170px] sm:w-[200px] md:w-[230px]', tag: 'Editorial' },
  { width: 'w-[280px] sm:w-[330px] md:w-[380px]', tag: 'Moments' },
  { width: 'w-[220px] sm:w-[260px] md:w-[300px]', tag: 'Celebration' },
];

const row4Profiles = [
  { width: 'w-[180px] sm:w-[210px] md:w-[240px]', tag: 'Portrait' },
  { width: 'w-[240px] sm:w-[280px] md:w-[320px]', tag: 'Square' },
  { width: 'w-[330px] sm:w-[400px] md:w-[460px]', tag: 'Horizon' },
  { width: 'w-[190px] sm:w-[220px] md:w-[250px]', tag: 'Detail' },
  { width: 'w-[290px] sm:w-[350px] md:w-[390px]', tag: 'Grand Frame' },
];

const row5Profiles = [
  { width: 'w-[260px] sm:w-[310px] md:w-[360px]', tag: 'Aesthetic' },
  { width: 'w-[180px] sm:w-[210px] md:w-[240px]', tag: 'Capture' },
  { width: 'w-[310px] sm:w-[370px] md:w-[430px]', tag: 'Cinema' },
  { width: 'w-[200px] sm:w-[230px] md:w-[270px]', tag: 'Composition' },
  { width: 'w-[280px] sm:w-[340px] md:w-[390px]', tag: 'Editorial' },
];

function buildRowItems(rowOffset, profiles, rowKey) {
  const base = normalizedBaseItems.value;
  if (!base.length) return [];
  const count = base.length;
  const itemsPerRow = Math.max(6, count);
  const rowBase = [];

  for (let i = 0; i < itemsPerRow; i++) {
    const rawIdx = (i + rowOffset) % count;
    const raw = base[rawIdx];
    const prof = profiles[i % profiles.length];
    rowBase.push({
      ...raw,
      _rawIdx: rawIdx,
      _rowIdx: i,
      _profile: prof,
    });
  }

  // Clone 4 sets for 100% gapless infinite loop
  const set0 = rowBase.map((it, idx) => ({ ...it, _loopId: `${rowKey}_s0_${idx}` }));
  const set1 = rowBase.map((it, idx) => ({ ...it, _loopId: `${rowKey}_s1_${idx}` }));
  const set2 = rowBase.map((it, idx) => ({ ...it, _loopId: `${rowKey}_s2_${idx}` }));
  const set3 = rowBase.map((it, idx) => ({ ...it, _loopId: `${rowKey}_s3_${idx}` }));
  return [...set0, ...set1, ...set2, ...set3];
}

const row1Items = computed(() => buildRowItems(0, row1Profiles, 'r1'));
const row2Items = computed(() => buildRowItems(2, row2Profiles, 'r2'));
const row3Items = computed(() => buildRowItems(4, row3Profiles, 'r3'));
const row4Items = computed(() => buildRowItems(6, row4Profiles, 'r4'));
const row5Items = computed(() => buildRowItems(8, row5Profiles, 'r5'));

// Slider Refs & States
const sliderRef = ref(null);
const trackRef = ref(null);

const isMouseDown = ref(false);
const isDragging = ref(false);
const isHovered = ref(false);
let startX = 0;
let startScrollLeft = 0;
let lastX = 0;
let lastTime = 0;
let velocity = 0;
let momentumAnimId = null;
let autoSlideAnimId = null;
let currentSubpixelX = 0;

// Touch tracking for mobile
let touchStartY = 0;
let isTouchHorizontal = false;

// ==========================================
// INFINITE LOOP WRAP-AROUND MECHANICS
// ==========================================
function checkInfiniteWrap() {
  if (!sliderRef.value) return;
  const current = sliderRef.value.scrollLeft;
  const singleSetWidth = sliderRef.value.scrollWidth / 4;
  if (singleSetWidth <= 0) return;

  // If scrolled too far to the right (past Set 2), wrap back to Set 1
  if (current >= singleSetWidth * 2.5) {
    sliderRef.value.scrollLeft = current - singleSetWidth;
    currentSubpixelX = sliderRef.value.scrollLeft;
  }
  // If scrolled too far to the left (past Set 1), wrap forward to Set 2
  else if (current <= singleSetWidth * 0.5) {
    sliderRef.value.scrollLeft = current + singleSetWidth;
    currentSubpixelX = sliderRef.value.scrollLeft;
  }
}

function initSliderPosition() {
  nextTick(() => {
    if (!sliderRef.value) return;
    const singleSetWidth = sliderRef.value.scrollWidth / 4;
    if (singleSetWidth > 0) {
      sliderRef.value.scrollLeft = singleSetWidth * 1.5;
      currentSubpixelX = sliderRef.value.scrollLeft;
    }
  });
}

// ==========================================
// SMOOTH AUTO-SLIDING ANIMATION
// ==========================================
function startAutoSlide() {
  stopAutoSlide();
  const speed = 0.65; // continuous elegant drift speed in px/frame

  function step() {
    if (
      !isMouseDown.value &&
      !isDragging.value &&
      !isHovered.value &&
      !momentumAnimId &&
      sliderRef.value
    ) {
      currentSubpixelX += speed;
      sliderRef.value.scrollLeft = currentSubpixelX;
      checkInfiniteWrap();
    }
    autoSlideAnimId = requestAnimationFrame(step);
  }
  autoSlideAnimId = requestAnimationFrame(step);
}

function stopAutoSlide() {
  if (autoSlideAnimId) {
    cancelAnimationFrame(autoSlideAnimId);
    autoSlideAnimId = null;
  }
}

// ==========================================
// CURSOR-ONLY DRAG-TO-SLIDE PHYSICS
// ==========================================
function onMouseDown(e) {
  if (e.button !== 0) return; // Left click only
  stopMomentum();

  isMouseDown.value = true;
  isDragging.value = false;
  startX = e.clientX;
  startScrollLeft = sliderRef.value?.scrollLeft || 0;
  currentSubpixelX = startScrollLeft;
  lastX = e.clientX;
  lastTime = performance.now();
  velocity = 0;

  window.addEventListener('mousemove', onMouseMove, { passive: false });
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
  if (!isMouseDown.value || !sliderRef.value) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 5) {
    isDragging.value = true;
    e.preventDefault(); // Prevent text selection while dragging
  }

  const now = performance.now();
  const dt = Math.max(1, now - lastTime);
  velocity = (e.clientX - lastX) / dt;
  lastX = e.clientX;
  lastTime = now;

  sliderRef.value.scrollLeft = startScrollLeft - dx;
  currentSubpixelX = sliderRef.value.scrollLeft;
  checkInfiniteWrap();
}

function onMouseUp(e) {
  if (!isMouseDown.value) return;
  isMouseDown.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);

  if (sliderRef.value && Math.abs(velocity) > 0.08) {
    applyMomentum();
  } else {
    currentSubpixelX = sliderRef.value?.scrollLeft || 0;
    setTimeout(() => {
      isDragging.value = false;
    }, 60);
  }
}

function onTouchStart(e) {
  stopMomentum();
  isDragging.value = false;
  isTouchHorizontal = false;
  const touch = e.touches[0];
  startX = touch.clientX;
  touchStartY = touch.clientY;
  startScrollLeft = sliderRef.value?.scrollLeft || 0;
  currentSubpixelX = startScrollLeft;
  lastX = touch.clientX;
  lastTime = performance.now();
  velocity = 0;
}

function onTouchMove(e) {
  if (!sliderRef.value) return;
  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - touchStartY;

  // Detect gesture direction: only take over deliberate horizontal swipes
  if (!isTouchHorizontal) {
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
      isTouchHorizontal = true;
    } else if (Math.abs(dy) > 6) {
      // Natural vertical page scrolling
      return;
    }
  }

  if (isTouchHorizontal) {
    isDragging.value = true;
    e.preventDefault();
    const now = performance.now();
    const dt = Math.max(1, now - lastTime);
    velocity = (touch.clientX - lastX) / dt;
    lastX = touch.clientX;
    lastTime = now;

    sliderRef.value.scrollLeft = startScrollLeft - dx;
    currentSubpixelX = sliderRef.value.scrollLeft;
    checkInfiniteWrap();
  }
}

function onTouchEnd() {
  if (sliderRef.value && Math.abs(velocity) > 0.08 && isTouchHorizontal) {
    applyMomentum();
  } else {
    currentSubpixelX = sliderRef.value?.scrollLeft || 0;
    setTimeout(() => {
      isDragging.value = false;
    }, 60);
  }
}

function stopMomentum() {
  if (momentumAnimId) {
    cancelAnimationFrame(momentumAnimId);
    momentumAnimId = null;
  }
}

function applyMomentum() {
  stopMomentum();
  function step() {
    if (!sliderRef.value) {
      momentumAnimId = null;
      return;
    }
    if (Math.abs(velocity) < 0.02) {
      velocity = 0;
      currentSubpixelX = sliderRef.value.scrollLeft;
      momentumAnimId = null;
      setTimeout(() => {
        isDragging.value = false;
      }, 60);
      return;
    }

    currentSubpixelX -= velocity * 14;
    sliderRef.value.scrollLeft = currentSubpixelX;
    velocity *= 0.93; // Smooth deceleration friction
    checkInfiniteWrap();
    momentumAnimId = requestAnimationFrame(step);
  }
  momentumAnimId = requestAnimationFrame(step);
}

// ==========================================
// LIGHTBOX VIEWER
// ==========================================
const activeLightboxItem = ref(null);
const activeLightboxIndex = ref(0);

function openLightbox(item, index) {
  if (isDragging.value) return; // Don't trigger click if user was dragging
  activeLightboxItem.value = item;
  activeLightboxIndex.value = index;
  openModal();
}

function closeLightbox() {
  activeLightboxItem.value = null;
  closeModal();
}

function nextLightbox() {
  const base = normalizedBaseItems.value;
  if (!base.length) return;
  activeLightboxIndex.value = (activeLightboxIndex.value + 1) % base.length;
  activeLightboxItem.value = base[activeLightboxIndex.value];
}

function prevLightbox() {
  const base = normalizedBaseItems.value;
  if (!base.length) return;
  activeLightboxIndex.value = (activeLightboxIndex.value - 1 + base.length) % base.length;
  activeLightboxItem.value = base[activeLightboxIndex.value];
}

function handleKeydown(e) {
  if (!activeLightboxItem.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextLightbox();
  if (e.key === 'ArrowLeft') prevLightbox();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  initSliderPosition();
  startAutoSlide();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  stopMomentum();
  stopAutoSlide();
  if (activeLightboxItem.value) {
    closeModal();
  }
});
</script>

<template>
  <!-- Mosaic Edge-to-Edge Wall Variant -->
  <section v-if="currentVariant === 'mosaic'" id="gallery" class="py-16 bg-[#101010] border-b border-white/5 font-manrope">
    <div class="px-4 sm:px-8 max-w-7xl mx-auto">
      <div v-if="content.title" class="text-center mb-10">
        <h2 class="text-3xl md:text-5xl font-bebas tracking-wider text-[#f8f8f8] mb-2">{{ content.title }}</h2>
        <p v-if="content.subtitle" class="text-gray-400 font-nuosu text-sm max-w-xl mx-auto">{{ content.subtitle }}</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="img in normalizedBaseItems"
          :key="img.id"
          @click="openLightbox(img, 0)"
          class="aspect-square rounded-lg overflow-hidden bg-neutral-900 border border-white/10 group relative cursor-pointer"
        >
          <img
            :src="img.image_url"
            :alt="img.title || 'Gallery image'"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
            loading="lazy"
            draggable="false"
          />
          <div v-if="img.title || img.subtitle" class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 pointer-events-none">
            <h4 v-if="img.title" class="text-xs font-bold text-white tracking-wide truncate">{{ img.title }}</h4>
            <span v-if="img.subtitle" class="text-[9px] font-mono text-[#FFD700] uppercase tracking-wider mt-0.5 truncate">{{ img.subtitle }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Masonry Photo Grid Variant (5-Row Multi-Layer + Cursor Drag + Infinite Loop + Smooth Drift) -->
  <section
    v-else
    id="gallery"
    class="py-20 md:py-28 bg-[#0b0b0b] border-b border-white/5 font-manrope relative overflow-hidden select-none"
  >
    <!-- Background Ambient Glow -->
    <div class="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#FFD700]/[0.03] rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

    <!-- Section Header (Clean Title & Subtitle) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 mb-8 md:mb-12">
      <h2 class="text-3xl sm:text-4xl md:text-6xl font-bebas tracking-wider text-[#f8f8f8]">
        {{ content.title || 'PORTFOLIO & STORIES' }}
      </h2>
      <p v-if="content.subtitle" class="text-gray-400 font-nuosu text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
        {{ content.subtitle }}
      </p>
    </div>

    <!-- Edge Gradient Fade Masks (Subtle, Narrow Vignette) -->
    <div class="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 md:w-20 bg-gradient-to-r from-[#0b0b0b]/60 to-transparent z-20"></div>
    <div class="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 md:w-20 bg-gradient-to-l from-[#0b0b0b]/60 to-transparent z-20"></div>

    <!-- Infinite Looping Horizontal Slider Viewport -->
    <div
      ref="sliderRef"
      @mousedown="onMouseDown"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      class="w-full overflow-x-auto select-none py-2 transition-all duration-100"
      :class="[
        isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
      ]"
      style="scrollbar-width: none; -ms-overflow-style: none;"
    >
      <!-- 5-Row Multi-Layer Tapestry Track with Increased Row & Column Gaps -->
      <div
        ref="trackRef"
        class="flex flex-col gap-6 sm:gap-7 md:gap-8 px-6 sm:px-12 w-max"
      >
        <!-- Row 1 -->
        <div class="flex items-center gap-6 sm:gap-7 md:gap-8">
          <div
            v-for="item in row1Items"
            :key="item._loopId"
            @click="openLightbox(item, item._rawIdx)"
            class="shrink-0 group relative rounded-lg sm:rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl transition-all duration-300 hover:border-[#FFD700]/50 hover:shadow-[#FFD700]/10 hover:-translate-y-1 h-[155px] sm:h-[180px] md:h-[210px]"
            :class="item._profile.width"
          >
            <img
              :src="item.image_url"
              :alt="item.title || 'Gallery image'"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
              loading="lazy"
              draggable="false"
            />
            <div v-if="item.title || item.subtitle" class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 pointer-events-none">
              <h4 v-if="item.title" class="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{{ item.title }}</h4>
              <span v-if="item.subtitle" class="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider mt-0.5 truncate">{{ item.subtitle }}</span>
            </div>
          </div>
        </div>

        <!-- Row 2 (Staggered Offset) -->
        <div class="flex items-center gap-6 sm:gap-7 md:gap-8 -ml-10 sm:-ml-16 md:-ml-20">
          <div
            v-for="item in row2Items"
            :key="item._loopId"
            @click="openLightbox(item, item._rawIdx)"
            class="shrink-0 group relative rounded-lg sm:rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl transition-all duration-300 hover:border-[#FFD700]/50 hover:shadow-[#FFD700]/10 hover:-translate-y-1 h-[155px] sm:h-[180px] md:h-[210px]"
            :class="item._profile.width"
          >
            <img
              :src="item.image_url"
              :alt="item.title || 'Gallery image'"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
              loading="lazy"
              draggable="false"
            />
            <div v-if="item.title || item.subtitle" class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 pointer-events-none">
              <h4 v-if="item.title" class="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{{ item.title }}</h4>
              <span v-if="item.subtitle" class="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider mt-0.5 truncate">{{ item.subtitle }}</span>
            </div>
          </div>
        </div>

        <!-- Row 3 (Staggered Offset) -->
        <div class="flex items-center gap-6 sm:gap-7 md:gap-8 -ml-4 sm:-ml-8 md:-ml-12">
          <div
            v-for="item in row3Items"
            :key="item._loopId"
            @click="openLightbox(item, item._rawIdx)"
            class="shrink-0 group relative rounded-lg sm:rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl transition-all duration-300 hover:border-[#FFD700]/50 hover:shadow-[#FFD700]/10 hover:-translate-y-1 h-[155px] sm:h-[180px] md:h-[210px]"
            :class="item._profile.width"
          >
            <img
              :src="item.image_url"
              :alt="item.title || 'Gallery image'"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
              loading="lazy"
              draggable="false"
            />
            <div v-if="item.title || item.subtitle" class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 pointer-events-none">
              <h4 v-if="item.title" class="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{{ item.title }}</h4>
              <span v-if="item.subtitle" class="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider mt-0.5 truncate">{{ item.subtitle }}</span>
            </div>
          </div>
        </div>

        <!-- Row 4 (Staggered Offset) -->
        <div class="flex items-center gap-6 sm:gap-7 md:gap-8 -ml-14 sm:-ml-20 md:-ml-28">
          <div
            v-for="item in row4Items"
            :key="item._loopId"
            @click="openLightbox(item, item._rawIdx)"
            class="shrink-0 group relative rounded-lg sm:rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl transition-all duration-300 hover:border-[#FFD700]/50 hover:shadow-[#FFD700]/10 hover:-translate-y-1 h-[155px] sm:h-[180px] md:h-[210px]"
            :class="item._profile.width"
          >
            <img
              :src="item.image_url"
              :alt="item.title || 'Gallery image'"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
              loading="lazy"
              draggable="false"
            />
            <div v-if="item.title || item.subtitle" class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 pointer-events-none">
              <h4 v-if="item.title" class="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{{ item.title }}</h4>
              <span v-if="item.subtitle" class="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider mt-0.5 truncate">{{ item.subtitle }}</span>
            </div>
          </div>
        </div>

        <!-- Row 5 (Staggered Offset) -->
        <div class="flex items-center gap-6 sm:gap-7 md:gap-8 -ml-8 sm:-ml-12 md:-ml-16">
          <div
            v-for="item in row5Items"
            :key="item._loopId"
            @click="openLightbox(item, item._rawIdx)"
            class="shrink-0 group relative rounded-lg sm:rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl transition-all duration-300 hover:border-[#FFD700]/50 hover:shadow-[#FFD700]/10 hover:-translate-y-1 h-[155px] sm:h-[180px] md:h-[210px]"
            :class="item._profile.width"
          >
            <img
              :src="item.image_url"
              :alt="item.title || 'Gallery image'"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
              loading="lazy"
              draggable="false"
            />
            <div v-if="item.title || item.subtitle" class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 pointer-events-none">
              <h4 v-if="item.title" class="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{{ item.title }}</h4>
              <span v-if="item.subtitle" class="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider mt-0.5 truncate">{{ item.subtitle }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- FULLSCREEN LUXURY LIGHTBOX MODAL -->
    <!-- ================================================================= -->
    <div
      v-if="activeLightboxItem"
      class="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 select-none animate-in fade-in duration-300"
    >
      <!-- Top Control Bar -->
      <div class="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <span class="text-xs text-neutral-400 font-mono">
          {{ activeLightboxIndex + 1 }} / {{ normalizedBaseItems.length }}
        </span>

        <!-- Close Button -->
        <button
          type="button"
          @click="closeLightbox"
          class="cursor-pointer w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition"
          title="Close Lightbox (ESC)"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Main Image Display Container -->
      <div class="flex-1 flex items-center justify-center relative my-4 overflow-hidden">
        <!-- Prev Button -->
        <button
          type="button"
          @click.stop="prevLightbox"
          class="cursor-pointer absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition shadow-2xl"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>

        <!-- Active Photo with Smooth Zoom Frame -->
        <div class="max-w-5xl max-h-[75vh] sm:max-h-[82vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-950 flex items-center justify-center">
          <img
            :src="activeLightboxItem.image_url"
            :alt="activeLightboxItem.title || 'Enlarged photo'"
            class="max-w-full max-h-[75vh] sm:max-h-[82vh] object-contain select-none"
            draggable="false"
          />
        </div>

        <!-- Next Button -->
        <button
          type="button"
          @click.stop="nextLightbox"
          class="cursor-pointer absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition shadow-2xl"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight class="w-6 h-6" />
        </button>
      </div>

      <!-- Bottom Caption Bar -->
      <div v-if="activeLightboxItem.title || activeLightboxItem.subtitle" class="max-w-4xl mx-auto w-full text-center pb-2 z-10">
        <h3 v-if="activeLightboxItem.title" class="text-lg sm:text-xl font-bold text-white tracking-wide">
          {{ activeLightboxItem.title }}
        </h3>
        <p v-if="activeLightboxItem.subtitle" class="text-xs text-[#FFD700] font-mono mt-1">
          {{ activeLightboxItem.subtitle }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Ensure horizontal scrollbar is hidden across all platforms */
div::-webkit-scrollbar {
  display: none;
}
</style>
