<script setup>
import { ref } from 'vue';
import { useInquiries } from '../../../composables/useInquiries';
import { useSettings } from '../../../composables/useSettings';
import { Send, CheckCircle2, AlertCircle, ChevronDown, ShieldCheck, Loader2 } from '@lucide/vue';
import { adminModalTokens } from '../../../lib/designTokens';

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
  <section id="contact" class="py-24 bg-[#141414] border-b border-white/5 relative overflow-hidden font-manrope">
    <!-- Ambient Golden Glow Accents -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-4xl mx-auto px-4 relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span :class="adminModalTokens.eyebrowMastery">
          {{ content.badge_text || 'GET IN TOUCH' }}
        </span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'LET’S CREATE MAGIC TOGETHER' }}
        </h2>
        <p class="text-neutral-400 font-nuosu text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          {{ content.subtitle || 'Have an upcoming event or want a studio session? Send us your details below.' }}
        </p>
      </div>

      <!-- Status Toast -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="statusMessage"
          class="mb-8 p-4 sm:p-5 rounded-2xl text-center text-sm font-manrope transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
          :class="[
            isSuccess
              ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-emerald-500/5'
              : 'bg-rose-500/10 border border-rose-500/25 text-rose-400 shadow-rose-500/5'
          ]"
        >
          <CheckCircle2 v-if="isSuccess" class="w-5 h-5 shrink-0 text-emerald-400" />
          <AlertCircle v-else class="w-5 h-5 shrink-0 text-rose-400" />
          <span>{{ statusMessage }}</span>
        </div>
      </Transition>

      <!-- Inquiry Form Card -->
      <div class="relative bg-[#141414]/90 backdrop-blur-xl border border-white/[0.12] rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl overflow-hidden">
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
              <label :class="adminModalTokens.inputLabelUppercase">Full Name *</label>
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="Juan Dela Cruz"
                class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/25 transition"
              />
            </div>

            <!-- Email -->
            <div>
              <label :class="adminModalTokens.inputLabelUppercase">Email Address *</label>
              <input
                type="email"
                v-model="form.email"
                required
                placeholder="juan@example.com"
                class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/25 transition"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Contact Phone -->
            <div>
              <label :class="adminModalTokens.inputLabelUppercase">Phone / Viber</label>
              <input
                type="tel"
                v-model="form.phone"
                placeholder="+63 917 000 0000"
                class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/25 transition"
              />
            </div>

            <!-- Event Type -->
            <div>
              <label :class="adminModalTokens.inputLabelUppercase">Event / Service Type</label>
              <div class="relative">
                <select
                  v-model="form.event_type"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/25 transition appearance-none cursor-pointer pr-10"
                >
                  <option value="Wedding" class="bg-neutral-900 text-white">Wedding Coverage</option>
                  <option value="Debut" class="bg-neutral-900 text-white">Debut Celebration</option>
                  <option value="Birthday" class="bg-neutral-900 text-white">Birthday / Milestone</option>
                  <option value="Studio Portrait" class="bg-neutral-900 text-white">Studio / Creative Portrait</option>
                  <option value="Graduation" class="bg-neutral-900 text-white">Graduation Portrait</option>
                  <option value="Commercial" class="bg-neutral-900 text-white">Commercial / Product</option>
                  <option value="Other" class="bg-neutral-900 text-white">Other Inquiries</option>
                </select>
                <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDown class="w-4 h-4" />
                </div>
              </div>
            </div>

            <!-- Event Date -->
            <div>
              <label :class="adminModalTokens.inputLabelUppercase">Target Date</label>
              <input
                type="date"
                v-model="form.event_date"
                style="color-scheme: dark;"
                class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/25 transition cursor-pointer"
              />
            </div>
          </div>

          <!-- Message -->
          <div>
            <label :class="adminModalTokens.inputLabelUppercase">Your Vision / Details *</label>
            <textarea
              v-model="form.message"
              required
              rows="4"
              placeholder="Tell us about your event, location, hours of coverage, or special requests..."
              class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/25 transition leading-relaxed"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-4 rounded-full bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50 shadow-lg shadow-yellow-500/20 cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            <template v-if="!submitting">
              <span>{{ content.button_text || 'SEND INQUIRY' }}</span>
              <Send class="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </template>
            <template v-else>
              <Loader2 class="w-4 h-4 animate-spin" />
              <span>SENDING INQUIRY...</span>
            </template>
          </button>

          <!-- Response Guarantee & Privacy Note -->
          <div class="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-2 font-manrope">
            <ShieldCheck class="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>{{ content.guarantee_note || 'We respect your privacy. All inquiries are answered within 24 hours.' }}</span>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
