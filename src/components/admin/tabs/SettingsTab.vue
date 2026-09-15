<script setup>
import { ref } from 'vue';
import { useSettings } from '../../../composables/useSettings';
import {
  Save,
  CheckCircle2,
  Building,
  Share2,
  Search,
  Globe,
  Loader2,
} from '@lucide/vue';

const { settings, updateSettings } = useSettings();

const localSettings = ref({ ...settings.value });
const saving = ref(false);
const saveSuccess = ref(false);

async function handleSave() {
  saving.value = true;
  saveSuccess.value = false;

  await updateSettings(localSettings.value);

  saving.value = false;
  saveSuccess.value = true;
  setTimeout(() => {
    saveSuccess.value = false;
  }, 4000);
}
</script>

<template>
  <div class="space-y-8 max-w-4xl font-manrope">
    <div>
      <h2 class="text-2xl font-bold text-white tracking-wide">Studio Settings & Branding</h2>
      <p class="text-xs text-neutral-400 mt-0.5">Configure studio details, social accounts, and search engine metadata</p>
    </div>

    <!-- Success Toast -->
    <div
      v-if="saveSuccess"
      class="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2"
    >
      <CheckCircle2 class="w-4 h-4" />
      <span>Studio settings updated successfully!</span>
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
