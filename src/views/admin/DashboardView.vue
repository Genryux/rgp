<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useInquiries } from '../../composables/useInquiries';
import { usePackages } from '../../composables/usePackages';
import { useGallery } from '../../composables/useGallery';
import { useSections } from '../../composables/useSections';
import { useSettings } from '../../composables/useSettings';

import {
  LayoutDashboard,
  Layers,
  Images,
  Tags,
  Inbox,
  Settings,
  ExternalLink,
  LogOut,
  Sparkles,
} from '@lucide/vue';

import OverviewTab from '../../components/admin/tabs/OverviewTab.vue';
import PageBuilderTab from '../../components/admin/tabs/PageBuilderTab.vue';
import MediaTab from '../../components/admin/tabs/MediaTab.vue';
import PackagesTab from '../../components/admin/tabs/PackagesTab.vue';
import InquiriesTab from '../../components/admin/tabs/InquiriesTab.vue';
import SettingsTab from '../../components/admin/tabs/SettingsTab.vue';

const { user, logout } = useAuth();
const { inquiries, fetchInquiries } = useInquiries();
const { fetchPackages } = usePackages();
const { fetchGallery } = useGallery();
const { fetchSections } = useSections();
const { fetchSettings } = useSettings();

const currentTab = ref('overview');

const unreadCount = computed(
  () => inquiries.value.filter((i) => i.status === 'New').length
);

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'page-builder', label: 'Page Builder', icon: Layers },
  { id: 'media', label: 'Media & Gallery', icon: Images },
  { id: 'packages', label: 'Rates & Packages', icon: Tags },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox, badge: unreadCount },
  { id: 'settings', label: 'Studio Settings', icon: Settings },
];

onMounted(() => {
  fetchInquiries();
  fetchPackages();
  fetchGallery();
  fetchSections();
  fetchSettings();
});
</script>

<template>
  <div class="min-h-screen bg-[#0c0c0c] text-neutral-100 font-manrope selection:bg-[#FFD700] selection:text-black antialiased relative">
    <!-- Top Minimalist Admin Header -->
    <header class="bg-[#121212]/80 border-b border-white/[0.08] sticky top-0 z-40 px-4 md:px-8 py-3.5 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <!-- Brand & Studio Title -->
        <div class="flex items-center gap-3.5">
          <router-link to="/" class="flex items-center gap-3 group">
            <img src="/images/Logo1.png" alt="RGP Studio" class="h-9 transition duration-300 group-hover:scale-105" />
          </router-link>
          <div class="hidden sm:flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse"></span>
            <span class="text-xs font-semibold tracking-wide text-neutral-300">Studio CMS</span>
          </div>
        </div>

        <!-- Right Header Actions -->
        <div class="flex items-center gap-3">
          <router-link
            to="/"
            target="_blank"
            class="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-[#FFD700]/50 hover:bg-[#FFD700]/10 text-neutral-300 hover:text-[#FFD700] text-xs font-medium transition duration-200 flex items-center gap-1.5"
          >
            <span>Live Portfolio</span>
            <ExternalLink class="w-3.5 h-3.5" />
          </router-link>

          <div class="hidden md:block h-4 w-px bg-white/10"></div>

          <span class="hidden md:inline-block text-xs text-neutral-400 font-medium">
            {{ user?.email || 'admin@rgpfilmsstudio.site' }}
          </span>

          <button
            @click="logout"
            class="p-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition duration-200"
            title="Sign Out"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Workspace (with generous bottom padding for the floating taskbar) -->
    <main class="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-36">
      <OverviewTab v-if="currentTab === 'overview'" @switch-tab="currentTab = $event" />
      <PageBuilderTab v-else-if="currentTab === 'page-builder'" />
      <MediaTab v-else-if="currentTab === 'media'" />
      <PackagesTab v-else-if="currentTab === 'packages'" />
      <InquiriesTab v-else-if="currentTab === 'inquiries'" />
      <SettingsTab v-else-if="currentTab === 'settings'" />
    </main>

    <!-- Sleek Floating Bottom Taskbar / Dock -->
    <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[94vw] sm:max-w-none">
      <div class="bg-[#161616]/90 backdrop-blur-2xl border border-white/[0.12] rounded-full p-2 shadow-2xl shadow-black/80 flex items-center gap-1 sm:gap-2 ring-1 ring-black/50">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 group select-none"
          :class="[
            currentTab === tab.id
              ? 'bg-[#FFD700] text-[#121212] shadow-lg shadow-yellow-500/25 font-bold scale-[1.03]'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.07]'
          ]"
        >
          <!-- Tab Icon -->
          <component
            :is="tab.icon"
            class="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:scale-110"
            :stroke-width="currentTab === tab.id ? 2.5 : 2"
          />

          <!-- Label (hidden on very small screens, visible on sm and up) -->
          <span class="hidden sm:inline-block font-manrope whitespace-nowrap">
            {{ tab.label }}
          </span>

          <!-- Unread Badge Indicator -->
          <span
            v-if="tab.badge && tab.badge.value > 0"
            class="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold"
            :class="[
              currentTab === tab.id
                ? 'bg-black text-[#FFD700]'
                : 'bg-[#FFD700] text-black shadow-md shadow-yellow-500/50'
            ]"
          >
            {{ tab.badge.value }}
          </span>
        </button>
      </div>
    </nav>
  </div>
</template>
