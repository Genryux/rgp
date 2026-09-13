<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <section id="about" class="py-24 bg-[#0f0f0f] border-b border-white/5 relative overflow-hidden">
    <div class="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <!-- Image / Photographer Showcase -->
      <div class="relative group">
        <div class="rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/5] bg-neutral-900">
          <img
            :src="content.image_url || '/images/main-shot.jpg'"
            alt="About RGP Films & Studio"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </div>
        <!-- Decorative Gold Glow Frame -->
        <div class="absolute -inset-2 rounded-3xl border border-[#FFD700]/20 -z-10 blur-sm"></div>
      </div>

      <!-- Text Bio & Experience Counters -->
      <div class="space-y-6">
        <span class="text-xs font-mono uppercase tracking-widest text-[#FFD700]">ABOUT RGP FILMS & STUDIO</span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wide leading-tight">
          {{ content.title || 'BEHIND THE LENS' }}
        </h2>
        <p class="text-gray-300 font-nuosu text-base leading-relaxed">
          {{ content.subtitle || 'We believe that every love story, celebration, and portrait is a piece of art waiting to be captured. Through timeless framing, intentional light, and heartfelt storytelling, we turn your fleeting moments into permanent masterpieces.' }}
        </p>

        <!-- Stats Counters -->
        <div class="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
          <div>
            <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] block">{{ content.experience_years || '5+' }}</span>
            <span class="text-xs font-nuosu text-gray-400">Years Experience</span>
          </div>
          <div>
            <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] block">{{ content.events_covered || '250+' }}</span>
            <span class="text-xs font-nuosu text-gray-400">Events Documented</span>
          </div>
          <div>
            <span class="text-3xl md:text-4xl font-bebas text-[#FFD700] block">{{ content.satisfaction_rate || '100%' }}</span>
            <span class="text-xs font-nuosu text-gray-400">Client Satisfaction</span>
          </div>
        </div>

        <div class="pt-4">
          <a
            href="#contact"
            class="inline-block px-8 py-3.5 rounded-full border border-[#FFD700] text-[#FFD700] font-nuosu text-sm tracking-wider hover:bg-[#FFD700] hover:text-[#141414] transition-all duration-300"
          >
            GET IN TOUCH
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
