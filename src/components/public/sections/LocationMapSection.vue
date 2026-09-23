<script setup>
import { ref, onMounted } from 'vue';
import { useSettings } from '../../../composables/useSettings';
import { useInquiries } from '../../../composables/useInquiries';
import { usePackages } from '../../../composables/usePackages';
import {
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  Loader2,
  ArrowUpRight,
} from '@lucide/vue';
import { adminModalTokens } from '../../../lib/designTokens';

defineProps({
  content: {
    type: Object,
    default: () => ({
      badge_text: 'STUDIO DIRECT CONTACT & BOOKING',
      title: 'CONNECT WITH OUR PRODUCTION TEAM',
      subtitle: 'Have an upcoming celebration or want a studio session? Inquire directly below.',
      facebook_cta_text: 'Or Message Us on Facebook',
      form_title: 'RESERVE YOUR DATE',
      form_subtitle: 'Share your milestone details and we will verify availability within 24 hours.',
      button_text: 'SEND BOOKING INQUIRY',
      guarantee_note: 'We respect your privacy. All inquiries receive direct quotes & personal consultation.',
    }),
  },
});

const { settings } = useSettings();
const { submitInquiry } = useInquiries();
const { packageCategories, fetchPackages } = usePackages();

onMounted(() => {
  fetchPackages();
});

const form = ref({
  name: '',
  email: '',
  phone: '',
  event_type: (packageCategories.value && packageCategories.value[0]) || 'Weddings',
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
      event_type: (packageCategories.value && packageCategories.value[0]) || 'Weddings',
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
  <section class="py-24 bg-[#141414] border-b border-white/5 relative overflow-hidden font-manrope">
    <!-- Ambient Glow Accents -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-[#1877F2]/05 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Centered Section Header -->
      <div class="text-center mb-12 lg:mb-16">
        <span :class="adminModalTokens.eyebrowMastery">
          {{ content.badge_text || 'STUDIO DIRECT CONTACT & BOOKING' }}
        </span>
        <h2 class="text-3xl md:text-5xl font-bebas text-white tracking-wider mt-2 mb-3">
          {{ content.title || 'CONNECT WITH OUR PRODUCTION TEAM' }}
        </h2>
        <p class="text-neutral-400 font-nuosu text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          {{ content.subtitle || 'Have an upcoming celebration or want a studio session? Inquire directly below.' }}
        </p>
      </div>

      <!-- 2-Column Split: Studio Info (Left) + Booking Form (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        <!-- LEFT COLUMN: Studio Information & Highlighted Facebook Messenger -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Studio Details Cards Container -->
          <div class="p-6 sm:p-8 rounded-3xl bg-[#141414]/90 backdrop-blur-xl border border-white/[0.12] space-y-5 shadow-2xl">
            <!-- Studio Card Header to align with Form Card Header -->
            <div class="border-b border-white/[0.08] pb-4">
              <h3 class="text-2xl sm:text-3xl font-bebas text-white tracking-wider">
                DIRECT CONTACT
              </h3>
              <p class="text-neutral-400 font-nuosu text-xs sm:text-sm mt-1 leading-relaxed">
                Connect directly with our studio directors and booking team.
              </p>
            </div>

            <!-- Phone / Viber -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Phone class="w-5 h-5 text-[#FFD700]" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">Direct Call / Viber</span>
                <a
                  :href="'tel:' + (settings.contact_phone || '+639000000000')"
                  class="text-sm font-semibold text-white hover:text-[#FFD700] transition mt-0.5 block leading-snug"
                >
                  {{ settings.contact_phone || '+63 900 000 0000' }}
                </a>
              </div>
            </div>

            <div class="h-px bg-white/[0.06] w-full"></div>

            <!-- Email Inquiries -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Mail class="w-5 h-5 text-[#FFD700]" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">Email Inquiries</span>
                <a
                  :href="'mailto:' + (settings.contact_email || 'contact@rgpfilmsstudio.site')"
                  class="text-sm font-semibold text-white hover:text-[#FFD700] transition mt-0.5 block leading-snug truncate"
                >
                  {{ settings.contact_email || 'contact@rgpfilmsstudio.site' }}
                </a>
              </div>
            </div>
          </div>

          <!-- HIGHLIGHTED: "Or message us on facebook" Callout Card -->
          <div class="pt-2">
            <a
              :href="settings.facebook_url || 'https://www.facebook.com/profile.php?id=61586681783932'"
              target="_blank"
              rel="noopener noreferrer"
              title="Configured in Settings > Facebook Page URL"
              class="relative group block p-5 rounded-3xl bg-gradient-to-r from-[#1877F2]/12 via-[#1877F2]/06 to-transparent border border-[#1877F2]/35 hover:border-[#1877F2]/70 shadow-lg shadow-black/40 hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]"
            >
              <!-- Subtle ambient glow inside button -->
              <div class="absolute -right-6 -top-6 w-24 h-24 bg-[#1877F2]/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>

              <div class="relative z-10 flex items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <!-- Branded Facebook Icon -->
                  <div class="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>

                  <div>
                    <span class="text-sm font-bold text-white uppercase tracking-wider font-manrope block">
                      {{ content.facebook_cta_text || 'Or Message Us on Facebook' }}
                    </span>
                    <p class="text-xs text-neutral-400 font-nuosu mt-0.5">
                      Prefer direct chat? Connect with our studio team instantly via Messenger.
                    </p>
                  </div>
                </div>

                <!-- Action Arrow Badge -->
                <div class="w-9 h-9 rounded-xl bg-white/[0.06] group-hover:bg-[#1877F2] text-neutral-300 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm">
                  <ArrowUpRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- RIGHT COLUMN: Luxury Booking & Inquiry Form Card -->
        <div class="lg:col-span-7">
          <div class="relative bg-[#141414]/90 backdrop-blur-xl border border-white/[0.12] rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
            <!-- Subtle Gold Glow in top-right -->
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Form Card Header -->
            <div class="mb-6 relative z-10 border-b border-white/[0.08] pb-5">
              <h3 class="text-2xl sm:text-3xl font-bebas text-white tracking-wider">
                {{ content.form_title || 'RESERVE YOUR DATE' }}
              </h3>
              <p class="text-neutral-400 font-nuosu text-xs sm:text-sm mt-1 leading-relaxed">
                {{ content.form_subtitle || 'Share your milestone details and we will verify availability within 24 hours.' }}
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
                class="mb-6 p-4 rounded-2xl text-center text-sm font-manrope transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
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

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-5 relative z-10">
              <!-- Honeypot (hidden from humans) -->
              <input
                type="text"
                v-model="form._gotcha"
                class="hidden"
                tabindex="-1"
                autocomplete="off"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                  <label :class="adminModalTokens.inputLabelUppercase">Service / Event Type</label>
                  <div class="relative">
                    <select
                      v-model="form.event_type"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/25 transition appearance-none cursor-pointer pr-10"
                    >
                      <option
                        v-for="cat in packageCategories"
                        :key="cat"
                        :value="cat"
                        class="bg-neutral-900 text-white"
                      >
                        {{ cat }}
                      </option>
                      <option
                        v-if="!packageCategories.includes('Other')"
                        value="Other"
                        class="bg-neutral-900 text-white"
                      >
                        Other Inquiries
                      </option>
                    </select>
                    <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      <ChevronDown class="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Event Date -->
              <div>
                <label :class="adminModalTokens.inputLabelUppercase">Target Date / Milestone Schedule</label>
                <input
                  type="date"
                  v-model="form.event_date"
                  style="color-scheme: dark;"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/25 transition cursor-pointer"
                />
              </div>

              <!-- Message / Vision -->
              <div>
                <label :class="adminModalTokens.inputLabelUppercase">Milestone Details &amp; Special Requests *</label>
                <textarea
                  v-model="form.message"
                  required
                  rows="4"
                  placeholder="Tell us about your event location, preferred coverage hours, guest count, or creative vision..."
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
                  <span>{{ content.button_text || 'SEND BOOKING INQUIRY' }}</span>
                  <Send class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </template>
                <template v-else>
                  <Loader2 class="w-4 h-4 animate-spin" />
                  <span>SENDING INQUIRY...</span>
                </template>
              </button>

              <!-- Trust Guarantee / Privacy Note -->
              <div class="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-1 font-manrope text-center">
                <ShieldCheck class="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>{{ content.guarantee_note || 'We respect your privacy. All inquiries receive direct quotes & personal consultation.' }}</span>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
