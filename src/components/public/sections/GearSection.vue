<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({
      title: 'PROFESSIONAL GEAR & EQUIPMENT',
      subtitle: 'Industry-standard cameras, prime lenses, and 4K aerial drone systems',
      categories: [
        {
          group: 'Cameras & Cinema Bodies',
          items: ['Sony A7S III (4K 120fps Cinema)', 'Sony A7 IV Full-Frame Bodies', 'Blackmagic Cinema Rig'],
        },
        {
          group: 'Prime & Zoom Lenses',
          items: ['Sony G-Master 24-70mm f/2.8 II', 'Sony G-Master 70-200mm f/2.8', 'Sony 50mm & 85mm f/1.4 Primes'],
        },
        {
          group: 'Aerial & Stabilization',
          items: ['DJI Mavic 3 Cine 5.1K Drone', 'DJI RS3 Pro Gimbal Stabilizer', 'Wireless Video Transmitters'],
        },
        {
          group: 'Audio & Studio Lighting',
          items: ['Godox AD600 Pro High-Speed Strobes', 'Sennheiser Wireless Lav Mics', 'Aputure Amaran Studio LED Kits'],
        },
      ],
    }),
  },
});
</script>

<template>
  <section class="py-24 bg-[#121212] border-b border-white/5 font-manrope">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700]">PRODUCTION STANDARDS</span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'OUR PRODUCTION GEAR & ARSENAL' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'We invest in top-tier camera and audio gear to ensure cinematic fidelity in any lighting condition.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(cat, idx) in (content.categories || [])"
          :key="idx"
          class="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] transition shadow-lg"
        >
          <span class="text-xs font-mono uppercase text-[#FFD700] tracking-wider block mb-3">{{ cat.group }}</span>
          <ul class="space-y-2.5">
            <li
              v-for="(item, i) in cat.items"
              :key="i"
              class="text-xs text-neutral-300 font-nuosu flex items-start gap-2"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] mt-1.5 flex-shrink-0"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
