<script setup>
import { ref } from 'vue';
import { useInquiries } from '../../../composables/useInquiries';
import { useSettings } from '../../../composables/useSettings';

defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});

const { submitInquiry } = useInquiries();
const { settings } = useSettings();

const form = ref({
  name: '',
  email: '',
  phone: '',
  event_type: 'Wedding',
  event_date: '',
  message: '',
  _gotcha: '', // Honeypot field
});

const submitting = ref(false);
const statusMessage = ref('');
const isSuccess = ref(false);

async function handleSubmit() {
  // Honeypot spam check
  if (form.value._gotcha) {
    statusMessage.value = 'Spam submission detected.';
    isSuccess.value = false;
    return;
  }

  submitting.value = true;
  statusMessage.value = '';

  const { error } = await submitInquiry(form.value);

  submitting.value = false;
  if (!error) {
    isSuccess.value = true;
    statusMessage.value = 'Thank you! Your message has been sent successfully. We will get back to you shortly.';
    form.value = {
      name: '',
      email: '',
      phone: '',
      event_type: 'Wedding',
      event_date: '',
      message: '',
      _gotcha: '',
    };
  } else {
    isSuccess.value = false;
    statusMessage.value = 'Oops! Something went wrong. Please try again or reach us via phone.';
  }

  setTimeout(() => {
    statusMessage.value = '';
  }, 6000);
}
</script>

<template>
  <section id="contact" class="py-24 bg-[#141414] border-b border-white/5 relative">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-12">
        <span class="text-xs font-mono uppercase tracking-widest text-[#FFD700]">GET IN TOUCH</span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'LET’S CREATE MAGIC TOGETHER' }}
        </h2>
        <p class="text-gray-400 font-nuosu text-sm md:text-base max-w-lg mx-auto">
          {{ content.subtitle || 'Have an upcoming event or want a studio session? Send us your details below.' }}
        </p>
      </div>

      <!-- Status Toast -->
      <div
        v-if="statusMessage"
        class="mb-8 p-4 rounded-2xl text-center text-sm font-nuosu transition-all"
        :class="[
          isSuccess ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        ]"
      >
        {{ statusMessage }}
      </div>

      <!-- Inquiry Form Card -->
      <div class="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-2xl">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Honeypot (hidden from humans) -->
          <input
            type="text"
            v-model="form._gotcha"
            class="hidden"
            tabindex="-1"
            autocomplete="off"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Full Name -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Full Name *</label>
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="Juan Dela Cruz"
                class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Email Address *</label>
              <input
                type="email"
                v-model="form.email"
                required
                placeholder="juan@example.com"
                class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Contact Phone -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Phone / Viber</label>
              <input
                type="tel"
                v-model="form.phone"
                placeholder="+63 917 000 0000"
                class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition"
              />
            </div>

            <!-- Event Type -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Event / Service Type</label>
              <select
                v-model="form.event_type"
                class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#FFD700] transition"
              >
                <option value="Wedding" class="bg-neutral-900">Wedding Coverage</option>
                <option value="Debut" class="bg-neutral-900">Debut Celebration</option>
                <option value="Birthday" class="bg-neutral-900">Birthday / Milestone</option>
                <option value="Studio Portrait" class="bg-neutral-900">Studio / Creative Portrait</option>
                <option value="Graduation" class="bg-neutral-900">Graduation Portrait</option>
                <option value="Commercial" class="bg-neutral-900">Commercial / Product</option>
                <option value="Other" class="bg-neutral-900">Other Inquiries</option>
              </select>
            </div>

            <!-- Event Date -->
            <div>
              <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Target Date</label>
              <input
                type="date"
                v-model="form.event_date"
                class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#FFD700] transition"
              />
            </div>
          </div>

          <!-- Message -->
          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Your Vision / Details *</label>
            <textarea
              v-model="form.message"
              required
              rows="4"
              placeholder="Tell us about your event, location, hours of coverage, or special requests..."
              class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-4 rounded-full bg-[#FFD700] text-[#141414] font-nuosu font-bold tracking-wider uppercase hover:bg-yellow-400 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-yellow-500/20"
          >
            <span v-if="!submitting">SEND INQUIRY</span>
            <span v-else>SENDING INQUIRY...</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
