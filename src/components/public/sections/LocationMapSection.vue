<script setup>
import { useSettings } from '../../../composables/useSettings';
import { MapPin, Phone, Mail, Clock } from '@lucide/vue';

defineProps({
  content: {
    type: Object,
    default: () => ({
      title: 'VISIT OUR STUDIO & LOCATIONS',
      subtitle: 'Schedule an in-person consultation or studio portrait session',
      hours: 'Mon – Sat: 9:00 AM – 7:00 PM (By Appointment)',
    }),
  },
});

const { settings } = useSettings();
</script>

<template>
  <section class="py-24 bg-[#141414] border-b border-white/5 font-manrope">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700]">STUDIO LOCATION</span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'STUDIO LOCATION & SERVICE AREAS' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'Available for destination weddings across the Philippines and worldwide.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <!-- Info Card -->
        <div class="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between space-y-6 shadow-xl">
          <div class="space-y-5">
            <div class="flex items-start gap-3">
              <MapPin class="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
              <div>
                <span class="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block">Physical Address</span>
                <p class="text-sm font-semibold text-white mt-0.5">{{ settings.address || 'Metro Manila, Philippines' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Phone class="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
              <div>
                <span class="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block">Phone / Mobile</span>
                <p class="text-sm font-semibold text-white mt-0.5">{{ settings.contact_phone || '+63 900 000 0000' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Mail class="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
              <div>
                <span class="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block">Email Inquiries</span>
                <p class="text-sm font-semibold text-white mt-0.5">{{ settings.contact_email || 'contact@rgpfilmsstudio.site' }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Clock class="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
              <div>
                <span class="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block">Studio Hours</span>
                <p class="text-sm font-semibold text-white mt-0.5">{{ content.hours || 'Mon – Sat: 9:00 AM – 7:00 PM' }}</p>
              </div>
            </div>
          </div>

          <a
            href="#contact"
            class="w-full py-3 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider text-center hover:bg-yellow-400 transition"
          >
            Schedule a Studio Visit
          </a>
        </div>

        <!-- Map / Visual Frame (2 cols) -->
        <div class="md:col-span-2 rounded-3xl overflow-hidden bg-neutral-900 border border-white/[0.08] relative min-h-[300px] shadow-xl flex items-center justify-center">
          <img
            src="/images/hero-bg.jpg"
            alt="Studio Location"
            class="w-full h-full object-cover opacity-40 absolute inset-0"
          />
          <div class="relative z-10 text-center p-8 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10 max-w-md mx-4 space-y-2">
            <MapPin class="w-8 h-8 text-[#FFD700] mx-auto animate-bounce" />
            <h4 class="text-xl font-bebas text-white tracking-wide">RGP FILMS & STUDIO</h4>
            <p class="text-xs text-neutral-300 font-nuosu">Accepting nationwide & destination wedding bookings.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
