<script setup>
import { ref } from 'vue';

defineProps({
  content: {
    type: Object,
    default: () => ({
      title: 'FREQUENTLY ASKED QUESTIONS',
      faqs: [
        {
          q: 'How far in advance should we book our wedding or event date?',
          a: 'We recommend booking 3 to 6 months in advance to secure your preferred date, especially for peak wedding seasons.',
        },
        {
          q: 'What is the turnaround time for enhanced photos and video edits?',
          a: 'Sneak peek photos are delivered within 48 to 72 hours. Complete enhanced high-resolution galleries and full video edits are delivered within 3 to 4 weeks.',
        },
        {
          q: 'Do you provide raw/unedited files?',
          a: 'Yes, full original JPEG and high-res files are provided upon delivery on a private digital link or USB drive depending on the package.',
        },
      ],
    }),
  },
});

const openIndex = ref(0);

function toggle(idx) {
  openIndex.value = openIndex.value === idx ? -1 : idx;
}
</script>

<template>
  <section class="py-24 bg-[#0e0e0e] border-b border-white/5">
    <div class="max-w-4xl mx-auto px-4">
      <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider text-center mb-12">
        {{ content.title || 'FREQUENTLY ASKED QUESTIONS' }}
      </h2>

      <div class="space-y-4">
        <div
          v-for="(faq, idx) in (content.faqs || [])"
          :key="idx"
          class="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition"
        >
          <button
            @click="toggle(idx)"
            class="w-full p-6 text-left flex justify-between items-center text-white font-nuosu font-semibold text-base hover:text-[#FFD700] transition"
          >
            <span>{{ faq.q }}</span>
            <span class="text-xl text-[#FFD700] ml-4 font-mono">{{ openIndex === idx ? '−' : '+' }}</span>
          </button>
          <div
            v-if="openIndex === idx"
            class="px-6 pb-6 text-gray-400 font-nuosu text-sm leading-relaxed border-t border-white/5 pt-4"
          >
            {{ faq.a }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
