<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useInquiries } from '../../../composables/useInquiries';
import { useSettings } from '../../../composables/useSettings';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';
import { useInquiryAttachment } from '../../../composables/useInquiryAttachment';
import { useTurnstile } from '../../../composables/useTurnstile';
import AttachedPackageCard from './AttachedPackageCard.vue';
import { Send, CheckCircle2, AlertCircle, ChevronDown, ShieldCheck, Loader2, Check } from '@lucide/vue';
import { adminModalTokens } from '../../../lib/designTokens';

defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});

const { submitInquiry } = useInquiries();
const { settings } = useSettings();
const { packageCategories, packages, isGlobalPriceMasked, fetchPackages } = usePackages();
const { attachedBundle } = useInquiryAttachment();
const { turnstileContainer, turnstileToken, resetTurnstile } = useTurnstile();

onMounted(() => {
  fetchPackages();
});

const form = ref({
  name: '',
  email: '',
  phone: '',
  event_type: attachedBundle.value?.category || (packageCategories.value && packageCategories.value[0]) || 'Weddings',
  event_date: '',
  message: '',
  _gotcha: '', // Honeypot field
});

// Auto-select event_type when attached bundle category changes
watch(
  () => attachedBundle.value.category,
  (newCat) => {
    if (newCat) {
      form.value.event_type = newCat;
    }
  },
  { immediate: true }
);

watch(
  packageCategories,
  (cats) => {
    if (!form.value.event_type && cats.length > 0) {
      form.value.event_type = attachedBundle.value.category || cats[0];
    }
  },
  { immediate: true }
);

const hasAttachedBundle = computed(() => {
  return Boolean(
    attachedBundle.value?.package ||
    (attachedBundle.value?.addons && attachedBundle.value.addons.length > 0)
  );
});

const attachedPackage = computed(() => {
  return attachedBundle.value?.package || null;
});

const attachedAddons = computed(() => {
  if (!attachedBundle.value?.addons || !Array.isArray(attachedBundle.value.addons)) return [];
  return attachedBundle.value.addons;
});

function extractNumericPrice(val) {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const addonsTotalAmount = computed(() => {
  return attachedAddons.value.reduce((sum, item) => {
    const priceStr = item.price || item.rawPrice || '';
    return sum + extractNumericPrice(priceStr);
  }, 0);
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

  // Cloudflare Turnstile verification check
  if (typeof window !== 'undefined' && window.turnstile && !turnstileToken.value) {
    statusMessage.value = 'Please complete the security verification below.';
    isSuccess.value = false;
    return;
  }

  submitting.value = true;
  statusMessage.value = '';

  const pkg = attachedPackage.value;
  const inquiryPayload = {
    ...form.value,
    turnstile_token: turnstileToken.value,
    package_name: pkg ? (pkg.title || pkg.name || '') : '',
    package_price: pkg ? extractNumericPrice(pkg.promo_price ?? pkg.price ?? pkg.raw_price ?? 0) : 0,
    package_inclusions: pkg && Array.isArray(pkg.features) ? pkg.features : [],
    addons: attachedAddons.value,
    addons_total: addonsTotalAmount.value,
    message: form.value.message,
  };

  const { error } = await submitInquiry(inquiryPayload);

  submitting.value = false;
  resetTurnstile();

  if (!error) {
    isSuccess.value = true;
    statusMessage.value = 'Thank you! Your message has been sent successfully. We will get back to you shortly.';
    form.value = {
      name: '',
      email: '',
      phone: '',
      event_type: attachedBundle.value?.category || (packageCategories.value && packageCategories.value[0]) || 'Weddings',
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

    <div class="mx-auto px-4 relative z-10 transition-all duration-300" :class="hasAttachedBundle ? 'max-w-6xl' : 'max-w-3xl'">
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

      <!-- Inquiry Form & Attached Package 2-Column Card -->
      <div class="relative bg-[#141414]/90 backdrop-blur-xl border border-white/[0.12] rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
        <div :class="hasAttachedBundle ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start' : ''">
          
          <!-- Left Column: Form Fields (7 cols on lg, 8 on xl when attached, full width when detached) -->
          <div :class="hasAttachedBundle ? 'lg:col-span-7 xl:col-span-8' : 'w-full'">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Honeypot (hidden from humans) -->
              <input
                type="text"
                v-model="form._gotcha"
                class="hidden"
                tabindex="-1"
                autocomplete="off"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

              <!-- Cloudflare Turnstile Spam Protection Widget -->
              <div class="flex justify-center py-1">
                <div ref="turnstileContainer"></div>
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
              <div class="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-1 font-manrope text-center">
                <ShieldCheck class="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>{{ content.guarantee_note || 'We respect your privacy. All inquiries are answered within 24 hours.' }}</span>
              </div>
            </form>
          </div>

          <!-- Right Column: Attached Package & Add-ons Box (Rendered ONLY when hasAttachedBundle is true) -->
          <div v-if="hasAttachedBundle" class="lg:col-span-5 xl:col-span-4 w-full">
            <AttachedPackageCard
              :current-category="form.event_type"
              :allow-clear="true"
            />
          </div>

        </div>
      </div>
    </div>
  </section>
</template>
