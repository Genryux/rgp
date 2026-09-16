<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: {
    type: Object,
    default: () => ({
      badge_text: 'HOW WE WORK',
      title: 'OUR CLIENT PROCESS',
      subtitle: 'From your initial inquiry to the final delivery of your timeless gallery',
      steps: [
        {
          step: '01',
          title: 'Consultation & Date Lock',
          desc: 'We discuss your vision, event timeline, and secure your date with a reservation deposit.',
        },
        {
          step: '02',
          title: 'Pre-Event Planning',
          desc: 'We coordinate mood boards, shot lists, location scouting, and lighting strategy.',
        },
        {
          step: '03',
          title: 'The Shoot Day',
          desc: 'Our experienced team captures every genuine emotion, unscripted laugh, and milestone.',
        },
        {
          step: '04',
          title: 'Master Retouching & Delivery',
          desc: 'Sneak peeks in 48 hours, followed by complete color-graded galleries and 4K reels.',
        },
      ],
    }),
  },
});

const defaultSteps = [
  {
    step: '01',
    title: 'Consultation & Date Lock',
    desc: 'We discuss your vision, event timeline, and secure your date with a reservation deposit.',
  },
  {
    step: '02',
    title: 'Pre-Event Planning',
    desc: 'We coordinate mood boards, shot lists, location scouting, and lighting strategy.',
  },
  {
    step: '03',
    title: 'The Shoot Day',
    desc: 'Our experienced team captures every genuine emotion, unscripted laugh, and milestone.',
  },
  {
    step: '04',
    title: 'Master Retouching & Delivery',
    desc: 'Sneak peeks in 48 hours, followed by complete color-graded galleries and 4K reels.',
  },
];

const stepsList = computed(() => {
  if (Array.isArray(props.content?.steps) && props.content.steps.length > 0) {
    return props.content.steps;
  }
  return defaultSteps;
});

const gridLayoutClass = computed(() => {
  const count = stepsList.value.length;
  if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto';
  if (count === 3) return 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto';
  if (count === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
});
</script>

<template>
  <section class="py-24 bg-[#0f0f0f] border-b border-white/5 font-manrope">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-xs font-semibold uppercase tracking-widest text-[#FFD700]">
          {{ content.badge_text || 'HOW WE WORK' }}
        </span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'OUR CLIENT PROCESS' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-xl mx-auto">
          {{ content.subtitle || 'A seamless, stress-free experience crafted around your milestones.' }}
        </p>
      </div>

      <div class="grid gap-6 relative" :class="gridLayoutClass">
        <div
          v-for="(item, idx) in stepsList"
          :key="idx"
          class="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-[#FFD700]/50 transition duration-300 relative group flex flex-col justify-between"
        >
          <div>
            <span class="text-4xl font-bebas text-[#FFD700]/40 group-hover:text-[#FFD700] transition duration-300 block mb-4">
              {{ item.step || (idx + 1 < 10 ? '0' + (idx + 1) : String(idx + 1)) }}
            </span>
            <h3 class="text-lg font-bold text-white mb-2">{{ item.title || 'Step ' + (idx + 1) }}</h3>
            <p class="text-xs text-neutral-400 leading-relaxed font-nuosu">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
