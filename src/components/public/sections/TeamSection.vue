<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({
      title: 'MEET THE CREATIVE TEAM',
      subtitle: 'Passionate directors, lead photographers, and cinematic colorists',
      members: [
        {
          name: 'Lead Director / Principal',
          role: 'Founder & Lead Photographer',
          image_url: '/images/1.jpg',
          bio: 'Specializing in editorial wedding photography with 8+ years of visual storytelling.',
        },
        {
          name: 'Senior Cinematographer',
          role: 'Head of Video & Drone Ops',
          image_url: '/images/2.jpg',
          bio: 'Master of movement, intentional lighting, and 4K same-day-edit reels.',
        },
        {
          name: 'Studio Retoucher & Stylist',
          role: 'Creative Retoucher',
          image_url: '/images/3.jpg',
          bio: 'Ensures color accuracy, natural skin tones, and magazine-worthy polish.',
        },
      ],
    }),
  },
});
</script>

<template>
  <section class="py-24 bg-[#141414] border-b border-white/5 font-manrope">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700]">THE CREATIVES</span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'MEET THE CREATIVE TEAM' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'The dedicated artists behind every timeless frame and cinematic film.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(member, idx) in (content.members || [])"
          :key="idx"
          class="rounded-3xl overflow-hidden bg-[#181818] border border-white/[0.08] group hover:border-[#FFD700]/50 transition duration-300 shadow-xl"
        >
          <div class="aspect-[4/5] bg-black overflow-hidden relative">
            <img
              :src="member.image_url"
              :alt="member.name"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
              <span class="text-[11px] font-mono text-[#FFD700] uppercase tracking-wider block">{{ member.role }}</span>
              <h4 class="text-xl font-bebas text-white tracking-wide">{{ member.name }}</h4>
            </div>
          </div>
          <div class="p-5">
            <p class="text-xs text-neutral-400 font-nuosu leading-relaxed">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
