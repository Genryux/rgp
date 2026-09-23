<script setup>
import { computed } from 'vue';
import { useSettings } from '../../composables/useSettings';
import { Mail, Phone, MapPin } from '@lucide/vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'multi_column', // multi_column | minimal | split_map
  },
});

const { settings } = useSettings();
const currentYear = new Date().getFullYear();

const currentVariant = computed(() => {
  return props.content?.variant || props.variant || 'multi_column';
});

const resolvedMapUrl = computed(() => {
  const raw = props.content?.map_embed_url || props.content?.map_url;
  if (raw && typeof raw === 'string') {
    const trimmed = raw.trim();
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }
  const query = props.content?.map_query || props.content?.location_title || settings.value?.address || 'Metro Manila, Philippines';
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
});
</script>

<template>
  <!-- ========================================== -->
  <!-- 1. MULTI-COLUMN STUDIO HUB -->
  <!-- ========================================== -->
  <footer
    v-if="currentVariant === 'multi_column'"
    class="bg-[#0c0c0c] border-t border-white/[0.08] text-neutral-400 py-16 px-6 font-manrope select-none relative overflow-hidden"
  >
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
      <!-- Column 1: Brand & Tagline -->
      <div class="md:col-span-2 space-y-4">
        <img
          :src="settings.logo_url || '/images/Logo1.png'"
          :alt="settings.studio_name || 'RGP Films'"
          class="h-12 object-contain"
        />
        <p class="text-xs text-neutral-400 max-w-sm leading-relaxed">
          {{ content.tagline || settings.tagline || 'Turning Moments into Masterpiece. Premium wedding cinematography, portraits, and commercial visual production.' }}
        </p>
        <div class="flex items-center gap-3 pt-2">
          <!-- Facebook -->
          <a
            :href="settings.facebook_url || 'https://facebook.com'"
            target="_blank"
            rel="noopener noreferrer"
            class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
            title="Facebook"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <!-- Instagram -->
          <a
            :href="settings.instagram_url || 'https://instagram.com'"
            target="_blank"
            rel="noopener noreferrer"
            class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
            title="Instagram"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <!-- YouTube (when available) -->
          <a
            v-if="settings.youtube_url"
            :href="settings.youtube_url"
            target="_blank"
            rel="noopener noreferrer"
            class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
            title="YouTube"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <!-- TikTok (when available) -->
          <a
            v-if="settings.tiktok_url"
            :href="settings.tiktok_url"
            target="_blank"
            rel="noopener noreferrer"
            class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
            title="TikTok"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          </a>
          <!-- Email Contact -->
          <a
            :href="settings.contact_email ? `mailto:${settings.contact_email}` : 'mailto:studio@rgpfilms.com'"
            class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
            title="Email Studio"
          >
            <Mail class="w-4 h-4" />
          </a>
        </div>
      </div>

      <!-- Column 2: Navigation -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-widest text-white">Explore Studio</h4>
        <ul class="space-y-2 text-xs">
          <li><a href="#home" class="hover:text-[#FFD700] transition">Home Hero</a></li>
          <li><a href="#showcase" class="hover:text-[#FFD700] transition">Cinematic Works</a></li>
          <li><a href="#rates" class="hover:text-[#FFD700] transition">Packages & Rates</a></li>
          <li><a href="#about" class="hover:text-[#FFD700] transition">Our Creative Team</a></li>
          <li><a href="#contact" class="hover:text-[#FFD700] transition">Bookings & Date Check</a></li>
        </ul>
      </div>

      <!-- Column 3: Contact Details -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-widest text-white">Studio Contact</h4>
        <p class="text-xs flex items-center gap-2 text-neutral-300">
          <Phone class="w-3.5 h-3.5 text-[#FFD700]" />
          <span>{{ settings.contact_phone || '+63 912 345 6789' }}</span>
        </p>
        <p class="text-xs flex items-center gap-2 text-neutral-300">
          <Mail class="w-3.5 h-3.5 text-[#FFD700]" />
          <span>{{ settings.contact_email || 'studio@rgpfilms.com' }}</span>
        </p>
        <p class="text-xs flex items-start gap-2 text-neutral-400 pt-1">
          <MapPin class="w-3.5 h-3.5 text-[#FFD700] shrink-0 mt-0.5" />
          <span>{{ content.location || settings.address || 'Metro Manila & Tagaytay, Philippines • Worldwide' }}</span>
        </p>
      </div>
    </div>

    <!-- Bottom Strip -->
    <div class="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
      <p>© {{ currentYear }} {{ settings.studio_name || 'RGP Films & Studio' }}. {{ content.copyright_text || 'All rights reserved.' }}</p>
      <p class="flex items-center gap-1">
        <span>{{ content.bottom_note || 'Crafted with passion for timeless cinema' }}</span>
      </p>
    </div>
  </footer>

  <!-- ========================================== -->
  <!-- 2. MINIMALIST CENTERED LUXURY FOOTER -->
  <!-- ========================================== -->
  <footer
    v-else-if="currentVariant === 'minimal'"
    class="bg-[#090909] border-t border-white/[0.08] text-neutral-400 py-14 px-4 font-manrope select-none text-center"
  >
    <div class="max-w-4xl mx-auto space-y-6">
      <img
        :src="settings.logo_url || '/images/Logo1.png'"
        :alt="settings.studio_name || 'RGP Studio'"
        class="h-12 mx-auto object-contain"
      />
      <p class="text-[11px] font-mono text-[#FFD700] uppercase tracking-widest">
        {{ content.tagline || settings.tagline || 'Documentary Wedding Cinema & Fine Art Stills' }}
      </p>

      <nav class="flex flex-wrap justify-center gap-8 text-xs font-semibold tracking-wider text-neutral-300">
        <a href="#home" class="hover:text-white transition">HOME</a>
        <a href="#showcase" class="hover:text-white transition">PORTFOLIO</a>
        <a href="#rates" class="hover:text-white transition">RATES</a>
        <a href="#about" class="hover:text-white transition">STORY</a>
        <a href="#contact" class="hover:text-white transition">RESERVE</a>
      </nav>

      <!-- Social Media Icons in Minimal -->
      <div class="flex items-center justify-center gap-3 pt-1">
        <a
          :href="settings.facebook_url || 'https://facebook.com'"
          target="_blank"
          rel="noopener noreferrer"
          class="w-7 h-7 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
          title="Facebook"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a
          :href="settings.instagram_url || 'https://instagram.com'"
          target="_blank"
          rel="noopener noreferrer"
          class="w-7 h-7 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
          title="Instagram"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a
          v-if="settings.youtube_url"
          :href="settings.youtube_url"
          target="_blank"
          rel="noopener noreferrer"
          class="w-7 h-7 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
          title="YouTube"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </a>
        <!-- TikTok (when available) -->
        <a
          v-if="settings.tiktok_url"
          :href="settings.tiktok_url"
          target="_blank"
          rel="noopener noreferrer"
          class="w-7 h-7 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
          title="TikTok"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
        </a>
        <a
          :href="settings.contact_email ? `mailto:${settings.contact_email}` : 'mailto:studio@rgpfilms.com'"
          class="w-7 h-7 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
          title="Email Studio"
        >
          <Mail class="w-3.5 h-3.5" />
        </a>
      </div>

      <div class="pt-4 border-t border-white/5 text-[11px] text-neutral-500">
        © {{ currentYear }} {{ settings.studio_name || 'RGP Films & Studio' }}. {{ content.copyright_text || 'All rights reserved.' }}
      </div>
    </div>
  </footer>

  <!-- ========================================== -->
  <!-- 3. SPLIT MAP & STUDIO INFO FOOTER -->
  <!-- ========================================== -->
  <footer
    v-else
    class="bg-[#0e0e0e] border-t border-white/[0.08] text-neutral-400 py-16 px-6 font-manrope select-none"
  >
    <div class="max-w-6xl mx-auto space-y-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <!-- Left: Studio Details -->
        <div class="space-y-4">
          <img
            :src="settings.logo_url || '/images/Logo1.png'"
            :alt="settings.studio_name || 'RGP Studio'"
            class="h-11 object-contain"
          />
          <h3 class="text-xl font-bold text-white">
            {{ content.title || 'Visit Our Studio by Appointment' }}
          </h3>
          <p class="text-xs text-neutral-400 leading-relaxed max-w-md">
            {{ content.subtitle || content.description || 'Consult with our directors and review luxury physical album sample sets over artisan coffee.' }}
          </p>

          <div class="space-y-2 text-xs text-neutral-300">
            <p class="flex items-center gap-2">
              <span class="text-neutral-500 font-semibold uppercase text-[10px]">Studio Hours:</span>
              <span>{{ content.studio_hours || settings.business_hours || 'Monday – Saturday: 9:00 AM – 7:00 PM' }}</span>
            </p>
            <p class="flex items-center gap-2">
              <Phone class="w-3.5 h-3.5 text-[#FFD700]" />
              <span>{{ settings.contact_phone || '+63 912 345 6789' }}</span>
            </p>
            <p class="flex items-center gap-2">
              <Mail class="w-3.5 h-3.5 text-[#FFD700]" />
              <span>{{ settings.contact_email || 'studio@rgpfilms.com' }}</span>
            </p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <a
              :href="settings.facebook_url || 'https://facebook.com'"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
              title="Facebook"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a
              :href="settings.instagram_url || 'https://instagram.com'"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
              title="Instagram"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a
              v-if="settings.youtube_url"
              :href="settings.youtube_url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
              title="YouTube"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <!-- TikTok (when available) -->
            <a
              v-if="settings.tiktok_url"
              :href="settings.tiktok_url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
              title="TikTok"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
            <a
              :href="settings.contact_email ? `mailto:${settings.contact_email}` : 'mailto:studio@rgpfilms.com'"
              class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition"
              title="Email Studio"
            >
              <Mail class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Right: Interactive Google Map Frame -->
        <div class="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 group">
          <iframe
            :src="resolvedMapUrl"
            class="w-full h-full border-0 filter contrast-125 opacity-90 group-hover:opacity-100 transition duration-500"
            loading="lazy"
            allowfullscreen=""
            referrerpolicy="no-referrer-when-downgrade"
            title="Studio Google Map Location"
          ></iframe>

          <!-- Location floating badge overlay -->
          <div class="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-black/85 backdrop-blur-md border border-white/15 px-3.5 py-2.5 rounded-xl shadow-lg pointer-events-none flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center shrink-0">
              <MapPin class="w-4 h-4 text-[#FFD700]" />
            </div>
            <div class="min-w-0">
              <h5 class="text-xs font-bold text-white truncate">
                {{ content.location_title || settings.address || 'Metro Manila & Tagaytay Hub' }}
              </h5>
              <p class="text-[10px] text-neutral-400 font-mono truncate">
                {{ content.location_subtitle || 'Available for worldwide destination bookings' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Strip -->
      <div class="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <p>© {{ currentYear }} {{ settings.studio_name || 'RGP Films & Studio' }}. {{ content.copyright_text || 'All rights reserved.' }}</p>
        <p class="flex items-center gap-1">
          <span>{{ content.bottom_note || 'Crafted with passion for timeless cinema' }}</span>
        </p>
      </div>
    </div>
  </footer>
</template>
