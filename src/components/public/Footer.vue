<script setup>
import { computed } from 'vue';
import { useSettings } from '../../composables/useSettings';
import { Mail, Phone, MapPin, ArrowRight, Sparkles, Heart } from '@lucide/vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: 'multi_column', // multi_column | minimal | newsletter | split_map
  },
});

const { settings } = useSettings();
const currentYear = new Date().getFullYear();

const currentVariant = computed(() => {
  return props.content?.variant || props.variant || 'multi_column';
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
        <img src="/images/Logo1.png" alt="RGP Films" class="h-12 object-contain" />
        <p class="text-xs text-neutral-400 max-w-sm leading-relaxed">
          {{ content.tagline || settings.tagline || 'Turning Moments into Masterpiece. Premium wedding cinematography, portraits, and commercial visual production.' }}
        </p>
        <div class="flex items-center gap-3 pt-2">
          <a href="https://facebook.com" target="_blank" class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://instagram.com" target="_blank" class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="mailto:studio@rgpfilms.com" class="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FFD700] hover:text-black text-neutral-400 flex items-center justify-center transition">
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
          <span>Metro Manila & Tagaytay, Philippines • Worldwide</span>
        </p>
      </div>
    </div>

    <!-- Bottom Strip -->
    <div class="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
      <p>© {{ currentYear }} {{ settings.studio_name || 'RGP Films & Studio' }}. All rights reserved.</p>
      <p class="flex items-center gap-1">
        <span>Crafted with passion for timeless cinema</span>
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
      <img src="/images/Logo1.png" alt="RGP Studio" class="h-12 mx-auto object-contain" />
      <p class="text-[11px] font-mono text-[#FFD700] uppercase tracking-widest">
        {{ content.tagline || 'Documentary Wedding Cinema & Fine Art Stills' }}
      </p>

      <nav class="flex flex-wrap justify-center gap-8 text-xs font-semibold tracking-wider text-neutral-300">
        <a href="#home" class="hover:text-white transition">HOME</a>
        <a href="#showcase" class="hover:text-white transition">PORTFOLIO</a>
        <a href="#rates" class="hover:text-white transition">RATES</a>
        <a href="#about" class="hover:text-white transition">STORY</a>
        <a href="#contact" class="hover:text-white transition">RESERVE</a>
      </nav>

      <div class="pt-4 border-t border-white/5 text-[11px] text-neutral-500">
        © {{ currentYear }} {{ settings.studio_name || 'RGP Films & Studio' }}. All rights reserved.
      </div>
    </div>
  </footer>

  <!-- ========================================== -->
  <!-- 3. VIP NEWSLETTER & BOOKING CTA FOOTER -->
  <!-- ========================================== -->
  <footer
    v-else-if="currentVariant === 'newsletter'"
    class="bg-gradient-to-b from-[#141414] to-[#080808] border-t border-white/[0.1] text-neutral-400 py-16 px-6 font-manrope select-none"
  >
    <div class="max-w-5xl mx-auto space-y-10 text-center">
      <div class="space-y-3 max-w-xl mx-auto">
        <span class="px-3 py-1 rounded-full bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider border border-[#FFD700]/20">
          Stay Connected
        </span>
        <h3 class="text-2xl sm:text-4xl font-extrabold text-white">Join Our VIP Wedding Circle</h3>
        <p class="text-xs text-neutral-400">
          Get exclusive seasonal date releases, photo shoot guides, and curated wedding cinema sneak peeks.
        </p>
      </div>

      <!-- Newsletter Bar -->
      <div class="max-w-md mx-auto flex gap-2">
        <input
          type="email"
          placeholder="Enter your email address..."
          class="flex-1 px-4 py-2.5 rounded-full bg-white/5 border border-white/15 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#FFD700]"
        />
        <button
          type="button"
          class="px-6 py-2.5 rounded-full bg-[#FFD700] text-black font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shrink-0"
        >
          Subscribe
        </button>
      </div>

      <div class="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <img src="/images/Logo1.png" alt="RGP" class="h-8 object-contain" />
        <p>© {{ currentYear }} {{ settings.studio_name || 'RGP Films' }}. Preserving love stories worldwide.</p>
      </div>
    </div>
  </footer>

  <!-- ========================================== -->
  <!-- 4. SPLIT MAP & STUDIO INFO FOOTER -->
  <!-- ========================================== -->
  <footer
    v-else
    class="bg-[#0e0e0e] border-t border-white/[0.08] text-neutral-400 py-16 px-6 font-manrope select-none"
  >
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <div class="space-y-4">
        <img src="/images/Logo1.png" alt="RGP Studio" class="h-11 object-contain" />
        <h3 class="text-xl font-bold text-white">Visit Our Studio by Appointment</h3>
        <p class="text-xs text-neutral-400 leading-relaxed max-w-md">
          Consult with our directors and review luxury physical album sample sets over artisan coffee.
        </p>
        <div class="space-y-1.5 text-xs text-neutral-300">
          <p><strong>Studio Hours:</strong> Monday – Saturday: 9:00 AM – 7:00 PM</p>
          <p><strong>Direct Line:</strong> {{ settings.contact_phone || '+63 912 345 6789' }}</p>
        </div>
      </div>

      <div class="h-44 rounded-2xl bg-neutral-900 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <MapPin class="w-8 h-8 text-[#FFD700] mb-2" />
        <h4 class="text-sm font-bold text-white">Metro Manila & Tagaytay Destination Hub</h4>
        <span class="text-xs text-neutral-400 mt-1">Available for worldwide destination bookings</span>
      </div>
    </div>
  </footer>
</template>
