<script setup>
import { ref, onMounted } from 'vue';
import { useSettings } from '../../../composables/useSettings';
import { useGmailAuth } from '../../../composables/useGmailAuth';
import {
  Save,
  CheckCircle2,
  Building,
  Share2,
  Search,
  Globe,
  Loader2,
  AlertTriangle,
  Mail,
  Link2,
  Unlink,
  RefreshCw,
} from '@lucide/vue';

const { settings, updateSettings } = useSettings();
const {
  isConnected,
  connectedEmail,
  senderDisplayName,
  connectedAt,
  loading: gmailLoading,
  error: gmailError,
  checkStatus,
  connectGmail,
  handleOAuthCallback,
  disconnectGmail,
} = useGmailAuth();

const localSettings = ref({ ...settings.value });
const saving = ref(false);
const saveSuccess = ref(false);
const saveError = ref('');
const connectionSuccessNotice = ref(false);

onMounted(async () => {
  const isNewConnection = await handleOAuthCallback();
  if (isNewConnection) {
    connectionSuccessNotice.value = true;
    setTimeout(() => {
      connectionSuccessNotice.value = false;
    }, 6000);
  }
  await checkStatus();
});

function formatConnectionDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

async function handleSave() {
  saving.value = true;
  saveSuccess.value = false;
  saveError.value = '';

  const res = await updateSettings(localSettings.value);
  saving.value = false;

  if (res?.error) {
    saveError.value = res.error.message || 'Failed to update settings in Supabase cloud.';
    setTimeout(() => {
      saveError.value = '';
    }, 5000);
  } else {
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 4000);
  }
}
</script>

<template>
  <div class="space-y-8 max-w-4xl font-manrope">
    <div>
      <h2 class="text-2xl font-bold text-white tracking-wide">Studio Settings & Branding</h2>
      <p class="text-xs text-neutral-400 mt-0.5">Configure studio details, social accounts, and search engine metadata</p>
    </div>

    <!-- Error Toast -->
    <div
      v-if="saveError"
      class="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center justify-center gap-2"
    >
      <AlertTriangle class="w-4 h-4 text-red-400" />
      <span>{{ saveError }}</span>
    </div>

    <!-- Success Toast -->
    <div
      v-if="saveSuccess"
      class="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2"
    >
      <CheckCircle2 class="w-4 h-4" />
      <span>Studio settings updated successfully!</span>
    </div>

    <!-- Connection Success Toast -->
    <div
      v-if="connectionSuccessNotice"
      class="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn"
    >
      <CheckCircle2 class="w-4 h-4 text-emerald-400" />
      <span>Studio Gmail account connected successfully! All admin inquiry replies will now send from this address.</span>
    </div>

    <!-- Official Studio Mailbox (Gmail OAuth) Card -->
    <div class="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
      <div class="absolute -right-20 -top-20 w-52 h-52 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] shrink-0">
            <Mail class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white tracking-wide">Studio Email Integration (Gmail)</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Link your official studio Google account to send real inquiry replies directly from the CMS inbox</p>
          </div>
        </div>

        <div>
          <span
            v-if="isConnected"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Connected</span>
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-neutral-400"
          >
            <span class="w-2 h-2 rounded-full bg-neutral-500"></span>
            <span>Not Connected</span>
          </span>
        </div>
      </div>

      <!-- Gmail Error Alert -->
      <div
        v-if="gmailError"
        class="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2"
      >
        <AlertTriangle class="w-4 h-4 text-red-400 shrink-0" />
        <span>{{ gmailError }}</span>
      </div>

      <!-- Connected State UI -->
      <div v-if="isConnected" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs text-neutral-400">Connected Mailbox:</span>
            <strong class="text-sm text-[#FFD700] font-semibold">{{ connectedEmail }}</strong>
          </div>
          <p v-if="connectedAt" class="text-[11px] text-neutral-500">
            Linked on {{ formatConnectionDate(connectedAt) }} &bull; Authenticated via Google OAuth
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="connectGmail"
            :disabled="gmailLoading"
            class="cursor-pointer px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': gmailLoading }" />
            <span>Switch Account</span>
          </button>
          <button
            type="button"
            @click="disconnectGmail"
            :disabled="gmailLoading"
            class="cursor-pointer px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition border border-red-500/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Unlink class="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      <!-- Disconnected State UI -->
      <div v-else class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-white/[0.06]">
        <div class="space-y-1 max-w-md">
          <p class="text-xs text-neutral-300 font-medium">
            No studio Google account connected yet. Click below to sign in with Google. All client replies sent from the CMS will automatically send from your connected Gmail.
          </p>
          <p class="text-[11px] text-neutral-500">
            Requires standard Google sign-in. You can disconnect or change accounts at any time.
          </p>
        </div>

        <button
          type="button"
          @click="connectGmail"
          :disabled="gmailLoading"
          class="cursor-pointer px-6 py-3 rounded-full bg-white hover:bg-neutral-100 text-[#121212] text-xs font-bold transition flex items-center gap-2.5 shadow-lg shadow-white/5 active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Loader2 v-if="gmailLoading" class="w-4 h-4 animate-spin text-neutral-600" />
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Connect with Google</span>
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSave" class="space-y-8">
      <!-- General Studio Info -->
      <div class="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div class="flex items-center gap-2.5 border-b border-white/[0.06] pb-3 text-white">
          <Building class="w-4 h-4 text-neutral-400" />
          <h3 class="text-base font-bold tracking-wide">General Studio Profile</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Studio Name</label>
            <input
              type="text"
              v-model="localSettings.studio_name"
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Studio Tagline</label>
            <input
              type="text"
              v-model="localSettings.tagline"
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Contact Email</label>
            <input
              type="email"
              v-model="localSettings.contact_email"
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Contact Phone / Viber</label>
            <input
              type="tel"
              v-model="localSettings.contact_phone"
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Studio Address / Location</label>
          <input
            type="text"
            v-model="localSettings.address"
            placeholder="e.g. Metro Manila, Philippines"
            class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
          />
        </div>
      </div>

      <!-- Social Media Links -->
      <div class="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div class="flex items-center gap-2.5 border-b border-white/[0.06] pb-3 text-white">
          <Share2 class="w-4 h-4 text-neutral-400" />
          <h3 class="text-base font-bold tracking-wide">Social Media Accounts</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Facebook Page URL</label>
            <input
              type="url"
              v-model="localSettings.facebook_url"
              placeholder="https://facebook.com/..."
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Instagram Profile URL</label>
            <input
              type="url"
              v-model="localSettings.instagram_url"
              placeholder="https://instagram.com/..."
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">YouTube Channel URL</label>
            <input
              type="url"
              v-model="localSettings.youtube_url"
              placeholder="https://youtube.com/@..."
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">TikTok Profile URL</label>
            <input
              type="url"
              v-model="localSettings.tiktok_url"
              placeholder="https://tiktok.com/@..."
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>
        </div>
      </div>

      <!-- SEO Metadata -->
      <div class="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div class="flex items-center gap-2.5 border-b border-white/[0.06] pb-3 text-white">
          <Search class="w-4 h-4 text-neutral-400" />
          <h3 class="text-base font-bold tracking-wide">Search Engine Optimization (SEO)</h3>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Page Title</label>
          <input
            type="text"
            v-model="localSettings.meta_title"
            class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-neutral-400 mb-2">Meta Description</label>
          <textarea
            v-model="localSettings.meta_description"
            rows="3"
            class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
          ></textarea>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="px-8 py-3.5 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-yellow-500/20 flex items-center gap-2"
        >
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          <span>{{ saving ? 'Saving Changes...' : 'Save Settings' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
