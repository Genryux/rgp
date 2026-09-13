<script setup>
import { useSettings } from '../../composables/useSettings';

const { settings } = useSettings();
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-[#0e0e0e] border-t border-white/10 text-white/70 py-12 px-4 relative overflow-hidden">
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
      <!-- Brand -->
      <div class="space-y-3">
        <img src="/images/Logo1.png" alt="RGP Films & Studio" class="h-14 mx-auto md:mx-0 opacity-90" />
        <p class="text-sm text-gray-400 font-nuosu">
          {{ settings.tagline || 'Turning Moments into Masterpiece.' }}
        </p>
      </div>

      <!-- Quick Nav -->
      <div class="flex flex-wrap justify-center gap-6 text-sm font-nuosu">
        <a href="#home" class="hover:text-[#FFD700] transition">Home</a>
        <a href="#showcase" class="hover:text-[#FFD700] transition">Works</a>
        <a href="#rates" class="hover:text-[#FFD700] transition">Rates</a>
        <a href="#about" class="hover:text-[#FFD700] transition">About</a>
        <a href="#contact" class="hover:text-[#FFD700] transition">Book</a>
      </div>

      <!-- Social & Contact -->
      <div class="text-center md:text-right space-y-2">
        <p class="text-xs text-gray-400">CONNECT WITH US</p>
        <div class="flex justify-center md:justify-end gap-4">
          <a
            v-if="settings.facebook_url"
            :href="settings.facebook_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-300 hover:text-[#FFD700] transition"
            title="Facebook"
          >
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
            </svg>
          </a>
        </div>
        <p class="text-xs text-gray-500 font-mono">{{ settings.contact_phone }}</p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-2">
      <p>© {{ currentYear }} {{ settings.studio_name }}. All rights reserved.</p>
      <p>Crafted for timeless visual storytelling.</p>
    </div>
  </footer>
</template>
