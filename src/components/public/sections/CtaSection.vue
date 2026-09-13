<script setup>
defineProps({
  content: {
    type: Object,
    default: () => ({
      heading: 'READY TO TURN YOUR MOMENTS INTO A MASTERPIECE?',
      subheading: 'Book your wedding, birthday, or creative studio session today.',
      button_text: 'BOOK YOUR SESSION',
      button_link: '#contact',
    }),
  },
});
</script>

<template>
  <section class="py-20 bg-gradient-to-r from-yellow-600/20 via-[#FFD700]/15 to-yellow-600/20 border-y border-[#FFD700]/20 text-center px-4 relative">
    <div class="max-w-4xl mx-auto space-y-6">
      <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider">
        {{ content.heading || 'READY TO TURN YOUR MOMENTS INTO A MASTERPIECE?' }}
      </h2>
      <p class="text-gray-300 font-nuosu text-base max-w-xl mx-auto">
        {{ content.subheading || 'Dates fill quickly for the upcoming season. Inquire now to secure your schedule.' }}
      </p>
      <div>
        <a
          :href="content.button_link || '#contact'"
          class="inline-block px-10 py-4 rounded-full bg-[#FFD700] text-[#141414] font-nuosu font-bold tracking-wider uppercase hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {{ content.button_text || 'BOOK YOUR SESSION' }}
        </a>
      </div>
    </div>
  </section>
</template>
