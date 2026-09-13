<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useSettings } from '../../composables/useSettings';
import { useAuth } from '../../composables/useAuth';

const props = defineProps({
  isPreview: {
    type: Boolean,
    default: false,
  },
});

const { settings } = useSettings();
const { isAuthenticated } = useAuth();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

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
  <nav
    class="w-full transition-all duration-300"
    :class="[
      isPreview
        ? 'relative top-0 left-0 z-20 bg-[#141414]/90 border-b border-white/10 py-3'
        : (isScrolled ? 'fixed top-0 left-0 z-50 bg-[#141414]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3' : 'fixed top-0 left-0 z-50 bg-transparent py-5')
    ]"
  >
    <div class="max-w-6xl mx-auto px-4 flex justify-between items-center">
      <!-- Logo -->
      <a href="#home" class="flex items-center gap-3 group">
        <img src="/images/Logo1.png" alt="RGP Films & Studio" class="h-10 md:h-14 transition duration-300 group-hover:scale-105" />
      </a>

      <!-- Desktop Links -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="#home" class="text-[#f8f8f8] font-nuosu text-sm tracking-wider hover:text-[#FFD700] transition duration-300">HOME</a>
        <a href="#showcase" class="text-[#f8f8f8] font-nuosu text-sm tracking-wider hover:text-[#FFD700] transition duration-300">WORKS</a>
        <a href="#rates" class="text-[#f8f8f8] font-nuosu text-sm tracking-wider hover:text-[#FFD700] transition duration-300">PACKAGES & RATES</a>
        <a href="#about" class="text-[#f8f8f8] font-nuosu text-sm tracking-wider hover:text-[#FFD700] transition duration-300">ABOUT</a>
        <a href="#contact" class="text-[#f8f8f8] font-nuosu text-sm tracking-wider hover:text-[#FFD700] transition duration-300">CONTACT</a>
        
        <router-link
          v-if="!isPreview"
          to="/admin"
          class="px-4 py-1.5 rounded-full border border-[#FFD700]/40 text-[#FFD700] text-xs font-medium hover:bg-[#FFD700]/10 transition duration-300"
        >
          CMS Portal
        </router-link>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="md:hidden text-white p-2 focus:outline-none"
        aria-label="Toggle Menu"
      >
        <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden bg-[#141414]/95 border-b border-white/10 px-6 py-6 space-y-4 text-center backdrop-blur-md"
    >
      <a @click="isMobileMenuOpen = false" href="#home" class="block text-[#f8f8f8] font-nuosu text-base hover:text-[#FFD700]">HOME</a>
      <a @click="isMobileMenuOpen = false" href="#showcase" class="block text-[#f8f8f8] font-nuosu text-base hover:text-[#FFD700]">WORKS</a>
      <a @click="isMobileMenuOpen = false" href="#rates" class="block text-[#f8f8f8] font-nuosu text-base hover:text-[#FFD700]">PACKAGES & RATES</a>
      <a @click="isMobileMenuOpen = false" href="#about" class="block text-[#f8f8f8] font-nuosu text-base hover:text-[#FFD700]">ABOUT</a>
      <a @click="isMobileMenuOpen = false" href="#contact" class="block text-[#f8f8f8] font-nuosu text-base hover:text-[#FFD700]">CONTACT</a>
    </div>
  </nav>
</template>
