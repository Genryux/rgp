<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSettings } from '../../composables/useSettings';
import { useAuth } from '../../composables/useAuth';
import { Menu, X } from '@lucide/vue';

const props = defineProps({
  isPreview: {
    type: Boolean,
    default: false,
  },
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'floating', // floating | fullwidth | centered | dynamic
  },
});

const { settings } = useSettings();
const { isAuthenticated } = useAuth();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const currentVariant = computed(() => {
  return props.content?.variant || props.variant || 'floating';
});

function handleScroll() {
  if (props.isPreview) return;
  isScrolled.value = window.scrollY > 50;
}

onMounted(() => {
  if (!props.isPreview) {
    window.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  if (!props.isPreview) {
    window.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <!-- ========================================== -->
  <!-- 1. FLOATING GLASS ISLAND NAVBAR -->
  <!-- ========================================== -->
  <header
    v-if="currentVariant === 'floating'"
    class="w-full transition-all duration-300 font-manrope select-none"
    :class="[
      isPreview
        ? 'relative top-0 left-0 bg-transparent py-4 px-4 sm:px-8 z-10'
        : 'fixed top-0 left-0 py-4 px-4 sm:px-8 z-40'
    ]"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between bg-black/70 backdrop-blur-xl border border-white/15 px-5 sm:px-7 py-2.5 rounded-full shadow-2xl">
      <!-- Logo -->
      <a href="#home" class="flex items-center gap-2 group" title="Home">
        <img src="/images/Logo1.png" alt="RGP Films & Studio" class="h-9 sm:h-10 object-contain transition duration-300 group-hover:scale-105" />
      </a>

      <!-- Desktop Links -->
      <nav class="hidden md:flex items-center space-x-7">
        <a href="#home" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">HOME</a>
        <a href="#portfolio" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">PORTFOLIO</a>
        <a href="#rates" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">PRICING</a>
        <a href="#gallery" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">GALLERY</a>
        <a href="#contact" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">CONTACT</a>
      </nav>

      <!-- CTA -->
      <div class="hidden sm:flex items-center gap-3">
        <a
          href="#contact"
          class="px-5 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-md shadow-yellow-500/20"
        >
          {{ content.cta_text || 'Book Now' }}
        </a>
      </div>

      <!-- Mobile Button -->
      <button
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="md:hidden text-white p-1 rounded-lg hover:bg-white/10 transition"
        aria-label="Toggle menu"
      >
        <component :is="isMobileMenuOpen ? X : Menu" class="w-5 h-5" />
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden max-w-6xl mx-auto mt-2 bg-black/95 border border-white/15 rounded-2xl p-4 space-y-3 backdrop-blur-xl shadow-2xl"
    >
      <a @click="isMobileMenuOpen = false" href="#home" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">HOME</a>
      <a @click="isMobileMenuOpen = false" href="#portfolio" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">PORTFOLIO</a>
      <a @click="isMobileMenuOpen = false" href="#rates" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">PRICING</a>
      <a @click="isMobileMenuOpen = false" href="#gallery" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">GALLERY</a>
      <a @click="isMobileMenuOpen = false" href="#contact" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">CONTACT</a>
    </div>
  </header>

  <!-- ========================================== -->
  <!-- 2. SIMPLE TRANSLUCENT SPLIT NAVBAR (CENTER LOGO) -->
  <!-- ========================================== -->
  <header
    v-else-if="currentVariant === 'fullwidth'"
    class="w-full font-manrope select-none transition-all duration-300"
    :class="[
      isPreview
        ? 'relative top-0 left-0 z-10 bg-black/60 backdrop-blur-xl border-b border-white/10 py-3.5 px-6'
        : (isScrolled
            ? 'fixed top-0 left-0 z-40 bg-black/75 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5 px-6'
            : 'fixed top-0 left-0 z-40 bg-transparent border-b border-transparent py-5 px-6')
    ]"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <!-- Left Group: Portfolio & Pricing -->
      <nav class="hidden md:flex items-center space-x-8 flex-1 justify-end pr-10">
        <a href="#portfolio" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">PORTFOLIO</a>
        <a href="#rates" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">PRICING</a>
      </nav>

      <!-- Center Logo (Acts as Home button) -->
      <a href="#home" class="flex items-center justify-center group shrink-0" title="Home">
        <img src="/images/Logo1.png" alt="RGP Films" class="h-10 sm:h-12 object-contain transition duration-300 group-hover:scale-105" />
      </a>

      <!-- Right Group: Gallery & Contact -->
      <nav class="hidden md:flex items-center space-x-8 flex-1 justify-start pl-10">
        <a href="#gallery" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">GALLERY</a>
        <a href="#contact" class="text-xs font-bold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">CONTACT</a>
      </nav>

      <!-- Mobile Button -->
      <button
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="md:hidden text-white p-1 rounded-lg hover:bg-white/10 transition"
        aria-label="Toggle menu"
      >
        <component :is="isMobileMenuOpen ? X : Menu" class="w-5 h-5" />
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden max-w-6xl mx-auto mt-3 bg-black/95 border border-white/15 rounded-2xl p-4 space-y-3 backdrop-blur-xl shadow-2xl"
    >
      <a @click="isMobileMenuOpen = false" href="#home" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">HOME</a>
      <a @click="isMobileMenuOpen = false" href="#portfolio" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">PORTFOLIO</a>
      <a @click="isMobileMenuOpen = false" href="#rates" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">PRICING</a>
      <a @click="isMobileMenuOpen = false" href="#gallery" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">GALLERY</a>
      <a @click="isMobileMenuOpen = false" href="#contact" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">CONTACT</a>
    </div>
  </header>

  <!-- ========================================== -->
  <!-- 3. MINIMALIST CENTERED BRAND HEADER -->
  <!-- ========================================== -->
  <header
    v-else-if="currentVariant === 'centered'"
    class="w-full py-6 px-4 font-manrope select-none bg-gradient-to-b from-black/90 to-transparent"
    :class="[
      isPreview
        ? 'relative top-0 left-0 z-10'
        : 'fixed top-0 left-0 z-40'
    ]"
  >
    <div class="max-w-5xl mx-auto flex flex-col items-center justify-center gap-3">
      <!-- Centered Logo -->
      <a href="#home" class="group text-center" title="Home">
        <img src="/images/Logo1.png" alt="Studio Logo" class="h-12 sm:h-14 mx-auto object-contain transition duration-300 group-hover:scale-105" />
      </a>

      <!-- Symmetrical Non-Negotiables Navigation with Top & Bottom Dividers -->
      <nav class="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-2.5 border-y border-white/[0.08] w-full max-w-2xl">
        <a href="#home" class="text-xs font-semibold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">HOME</a>
        <a href="#portfolio" class="text-xs font-semibold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">PORTFOLIO</a>
        <a href="#rates" class="text-xs font-semibold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">PRICING</a>
        <a href="#gallery" class="text-xs font-semibold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">GALLERY</a>
        <a href="#contact" class="text-xs font-semibold tracking-widest text-neutral-300 hover:text-[#FFD700] transition">CONTACT</a>
      </nav>
    </div>
  </header>

  <!-- ========================================== -->
  <!-- 4. TRANSPARENT-TO-SOLID DYNAMIC HEADER -->
  <!-- ========================================== -->
  <header
    v-else
    class="w-full transition-all duration-300 font-manrope select-none"
    :class="[
      isPreview
        ? 'relative top-0 left-0 bg-[#141414]/90 border-b border-white/10 py-3.5 px-6 z-10'
        : (isScrolled
            ? 'fixed top-0 left-0 bg-[#141414]/95 backdrop-blur-md border-b border-white/10 shadow-lg py-3 px-6 z-40'
            : 'fixed top-0 left-0 bg-transparent py-5 px-6 z-40')
    ]"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <!-- Logo without yellow dot -->
      <a href="#home" class="flex items-center gap-3 group" title="Home">
        <img src="/images/Logo1.png" alt="RGP Studio" class="h-9 sm:h-10 object-contain transition duration-300 group-hover:scale-105" />
      </a>

      <!-- Desktop Links -->
      <nav class="hidden md:flex items-center space-x-7">
        <a href="#home" class="text-xs font-bold text-neutral-300 hover:text-[#FFD700] transition tracking-widest">HOME</a>
        <a href="#portfolio" class="text-xs font-bold text-neutral-300 hover:text-[#FFD700] transition tracking-widest">PORTFOLIO</a>
        <a href="#rates" class="text-xs font-bold text-neutral-300 hover:text-[#FFD700] transition tracking-widest">PRICING</a>
        <a href="#gallery" class="text-xs font-bold text-neutral-300 hover:text-[#FFD700] transition tracking-widest">GALLERY</a>
        <a href="#contact" class="text-xs font-bold text-neutral-300 hover:text-[#FFD700] transition tracking-widest">CONTACT</a>
      </nav>

      <!-- CTA Book Now button -->
      <div class="hidden sm:flex items-center gap-3">
        <a
          href="#contact"
          class="px-5 py-2 rounded-full bg-[#FFD700] hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-md shadow-yellow-500/20"
        >
          <span>{{ content.cta_text || 'Book Now' }}</span>
        </a>
      </div>

      <!-- Mobile Button -->
      <button
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="md:hidden text-white p-1 rounded-lg hover:bg-white/10 transition"
        aria-label="Toggle menu"
      >
        <component :is="isMobileMenuOpen ? X : Menu" class="w-5 h-5" />
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden max-w-6xl mx-auto mt-2 bg-black/95 border border-white/15 rounded-2xl p-4 space-y-3 backdrop-blur-xl shadow-2xl"
    >
      <a @click="isMobileMenuOpen = false" href="#home" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">HOME</a>
      <a @click="isMobileMenuOpen = false" href="#portfolio" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">PORTFOLIO</a>
      <a @click="isMobileMenuOpen = false" href="#rates" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">PRICING</a>
      <a @click="isMobileMenuOpen = false" href="#gallery" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">GALLERY</a>
      <a @click="isMobileMenuOpen = false" href="#contact" class="block text-center text-xs font-bold tracking-wider text-neutral-200 hover:text-[#FFD700] py-1.5 transition">CONTACT</a>
    </div>
  </header>
</template>
