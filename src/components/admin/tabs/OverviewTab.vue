<script setup>
import { computed } from 'vue';
import { useInquiries } from '../../../composables/useInquiries';
import { usePackages } from '../../../composables/usePackages';
import { useGallery } from '../../../composables/useGallery';
import {
  Inbox,
  Tags,
  Images,
  ArrowRight,
  Mail,
  CheckCircle2,
  Calendar,
  Phone,
  Layers,
  Settings,
  Sparkles,
  ExternalLink,
} from '@lucide/vue';

const emit = defineEmits(['switch-tab']);

const { inquiries, updateStatus } = useInquiries();
const { packages } = usePackages();
const { gallery } = useGallery();

const newInquiriesCount = computed(
  () => inquiries.value.filter((i) => i.status === 'New').length
);
const activePackagesCount = computed(
  () => packages.value.filter((p) => p.is_active).length
);
const totalPhotosCount = computed(() => gallery.value.length);

const recentInquiries = computed(() => inquiries.value.slice(0, 4));
</script>

<template>
  <div class="space-y-8 font-manrope">
    <!-- Top Stat Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Inquiries Stat -->
      <div
        @click="emit('switch-tab', 'inquiries')"
        class="bg-[#141414] border border-white/[0.08] hover:border-[#FFD700]/50 rounded-3xl p-6 cursor-pointer transition-all duration-300 group shadow-xl relative overflow-hidden"
      >
        <div class="flex justify-between items-center mb-4">
          <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">Unread Inquiries</span>
          <div class="p-2.5 rounded-2xl bg-yellow-500/10 text-[#FFD700] border border-yellow-500/20">
            <Inbox class="w-4 h-4" />
          </div>
        </div>
        <div class="flex items-baseline gap-3">
          <span class="text-4xl font-extrabold text-white group-hover:text-[#FFD700] transition duration-200">{{ newInquiriesCount }}</span>
          <span class="text-xs text-neutral-400 font-medium">pending client reply</span>
        </div>
      </div>

      <!-- Active Packages Stat -->
      <div
        @click="emit('switch-tab', 'packages')"
        class="bg-[#141414] border border-white/[0.08] hover:border-[#FFD700]/50 rounded-3xl p-6 cursor-pointer transition-all duration-300 group shadow-xl relative overflow-hidden"
      >
        <div class="flex justify-between items-center mb-4">
          <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">Active Packages</span>
          <div class="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Tags class="w-4 h-4" />
          </div>
        </div>
        <div class="flex items-baseline gap-3">
          <span class="text-4xl font-extrabold text-white group-hover:text-[#FFD700] transition duration-200">{{ activePackagesCount }}</span>
          <span class="text-xs text-neutral-400 font-medium">live in rates section</span>
        </div>
      </div>

      <!-- Photos Stat -->
      <div
        @click="emit('switch-tab', 'media')"
        class="bg-[#141414] border border-white/[0.08] hover:border-[#FFD700]/50 rounded-3xl p-6 cursor-pointer transition-all duration-300 group shadow-xl relative overflow-hidden"
      >
        <div class="flex justify-between items-center mb-4">
          <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">Showcase Photos</span>
          <div class="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Images class="w-4 h-4" />
          </div>
        </div>
        <div class="flex items-baseline gap-3">
          <span class="text-4xl font-extrabold text-white group-hover:text-[#FFD700] transition duration-200">{{ totalPhotosCount }}</span>
          <span class="text-xs text-neutral-400 font-medium">in media gallery</span>
        </div>
      </div>
    </div>

    <!-- Quick Shortcuts & Recent Inquiries -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Inquiries (2 cols) -->
      <div class="lg:col-span-2 bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-xl">
        <div class="flex justify-between items-center mb-6 border-b border-white/[0.06] pb-4">
          <div>
            <h3 class="text-lg font-bold text-white tracking-wide">Recent Client Inquiries</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Direct messages submitted from your website</p>
          </div>
          <button
            @click="emit('switch-tab', 'inquiries')"
            class="text-xs font-semibold text-[#FFD700] hover:underline flex items-center gap-1.5"
          >
            <span>View All</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <div v-if="recentInquiries.length > 0" class="space-y-3.5">
          <div
            v-for="inq in recentInquiries"
            :key="inq.id"
            class="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/[0.15] transition"
          >
            <div class="space-y-1.5">
              <div class="flex items-center gap-2.5">
                <span class="font-bold text-white text-sm">{{ inq.name }}</span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                  :class="[
                    inq.status === 'New' ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  ]"
                >
                  {{ inq.status }}
                </span>
              </div>
              <p class="text-xs text-neutral-400 flex items-center gap-2">
                <span>{{ inq.event_type }}</span>
                <span>•</span>
                <span>{{ inq.event_date || 'Date TBD' }}</span>
                <span>•</span>
                <span>{{ inq.email }}</span>
              </p>
              <p class="text-xs text-neutral-300 line-clamp-1 italic">
                "{{ inq.message }}"
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="inq.status === 'New'"
                @click="updateStatus(inq.id, 'Contacted')"
                class="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium transition"
              >
                Mark Contacted
              </button>
              <a
                :href="`mailto:${inq.email}?subject=Inquiry Response - RGP Films %26 Studio`"
                class="px-3.5 py-1.5 rounded-full bg-[#FFD700] text-[#121212] text-xs font-bold hover:bg-yellow-400 transition flex items-center gap-1.5"
              >
                <Mail class="w-3.5 h-3.5" />
                <span>Reply</span>
              </a>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-neutral-500 text-xs font-medium">
          No client inquiries received yet.
        </div>
      </div>

      <!-- Quick Actions Sidebar -->
      <div class="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-xl">
        <div>
          <h3 class="text-lg font-bold text-white tracking-wide mb-1">Quick Actions</h3>
          <p class="text-xs text-neutral-400 mb-6">Shortcuts to update your studio content</p>

          <div class="space-y-3">
            <button
              @click="emit('switch-tab', 'media')"
              class="w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FFD700]/50 hover:bg-white/[0.06] text-left text-sm font-medium text-white flex items-center justify-between group transition"
            >
              <div class="flex items-center gap-3">
                <Images class="w-4 h-4 text-sky-400" />
                <span>Upload Photos</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFD700] transition" />
            </button>

            <button
              @click="emit('switch-tab', 'packages')"
              class="w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FFD700]/50 hover:bg-white/[0.06] text-left text-sm font-medium text-white flex items-center justify-between group transition"
            >
              <div class="flex items-center gap-3">
                <Tags class="w-4 h-4 text-emerald-400" />
                <span>Manage Rates</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFD700] transition" />
            </button>

            <button
              @click="emit('switch-tab', 'page-builder')"
              class="w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FFD700]/50 hover:bg-white/[0.06] text-left text-sm font-medium text-white flex items-center justify-between group transition"
            >
              <div class="flex items-center gap-3">
                <Layers class="w-4 h-4 text-[#FFD700]" />
                <span>Page Layout Builder</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFD700] transition" />
            </button>

            <button
              @click="emit('switch-tab', 'settings')"
              class="w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FFD700]/50 hover:bg-white/[0.06] text-left text-sm font-medium text-white flex items-center justify-between group transition"
            >
              <div class="flex items-center gap-3">
                <Settings class="w-4 h-4 text-neutral-400" />
                <span>Studio Settings & SEO</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFD700] transition" />
            </button>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 text-center">
          <p class="text-xs text-[#FFD700] font-semibold mb-2">Check how your site looks to clients</p>
          <router-link
            to="/"
            target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700] text-[#121212] text-xs font-bold uppercase tracking-wider hover:bg-yellow-400 transition"
          >
            <span>Live Portfolio</span>
            <ExternalLink class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
