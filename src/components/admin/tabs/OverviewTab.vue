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
  Reply,
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

function handleReply(inq) {
  if (inq?.id) {
    sessionStorage.setItem('rgp_active_inquiry_id', inq.id);
  }
  emit('switch-tab', 'inquiries');
}
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Recent Inquiries (2 cols) -->
      <div class="lg:col-span-2 bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-xl">
        <div class="flex justify-between items-center mb-6 border-b border-white/[0.06] pb-4">
          <div>
            <h3 class="text-lg font-bold text-white tracking-wide">Recent Client Inquiries</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Direct messages submitted from your website</p>
          </div>
          <button
            @click="emit('switch-tab', 'inquiries')"
            class="cursor-pointer text-xs font-semibold text-[#FFD700] hover:underline flex items-center gap-1.5"
          >
            <span>View All</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <div v-if="recentInquiries.length > 0" class="space-y-4">
          <div
            v-for="inq in recentInquiries"
            :key="inq.id"
            class="p-5 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.14] hover:bg-black/60 transition duration-200 group flex flex-col space-y-3.5 shadow-md relative"
          >
            <!-- Card Header: Client Identity & Status / Timestamp -->
            <div class="flex flex-wrap items-start justify-between gap-3">
              <!-- Left: Avatar Initials + Client Name + Event Type Pill -->
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 group-hover:border-[#FFD700]/40 transition">
                  {{ (inq.name || 'C').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="font-bold text-white text-sm tracking-wide truncate">{{ inq.name }}</h4>
                    <span class="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] font-semibold text-neutral-300">
                      {{ inq.event_type || 'General Inquiry' }}
                    </span>
                  </div>
                  <!-- Client contact info row -->
                  <div class="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5 flex-wrap">
                    <span class="flex items-center gap-1 font-mono text-neutral-300">
                      <Mail class="w-3 h-3 text-neutral-500" />
                      <span>{{ inq.email }}</span>
                    </span>
                    <span v-if="inq.phone" class="flex items-center gap-1 text-neutral-400">
                      <Phone class="w-3 h-3 text-neutral-500" />
                      <span>{{ inq.phone }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right: Status Badge & Event Date Pill -->
              <div class="flex items-center gap-2 shrink-0">
                <span
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-neutral-300"
                >
                  <Calendar class="w-3 h-3 text-neutral-400" />
                  <span>{{ inq.event_date || 'No target date' }}</span>
                </span>

                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="[
                    inq.status === 'New'
                      ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                      : inq.status === 'Booked'
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  ]"
                >
                  {{ inq.status }}
                </span>
              </div>
            </div>

            <!-- Message Preview Row with Embedded Actions -->
            <div class="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between gap-3 min-w-0">
              <!-- Left: One-line truncated message preview -->
              <p class="text-xs text-neutral-300 italic truncate min-w-0 flex-1">
                "{{ inq.message || 'No message provided' }}"
              </p>

              <!-- Right: Actions embedded inside message row with matching height -->
              <div class="flex items-center gap-2 shrink-0">
                <button
                  v-if="inq.status === 'New'"
                  @click="updateStatus(inq.id, 'Contacted')"
                  class="cursor-pointer h-8 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition whitespace-nowrap flex items-center justify-center"
                  title="Mark Contacted"
                >
                  Mark Contacted
                </button>
                <button
                  @click="handleReply(inq)"
                  class="cursor-pointer h-8 w-8 rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#121212] transition flex items-center justify-center shadow-md shadow-yellow-500/20 shrink-0"
                  title="Reply in Leads"
                >
                  <Reply class="w-4 h-4 text-black stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-neutral-500 text-xs font-medium">
          No client inquiries received yet.
        </div>
      </div>

      <!-- Quick Actions Sidebar (Content-aware height) -->
      <div class="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-5 shadow-xl h-fit self-start">
        <div>
          <h3 class="text-lg font-bold text-white tracking-wide mb-1">Quick Actions</h3>
          <p class="text-xs text-neutral-400 mb-5">Shortcuts to update your studio content</p>

          <div class="space-y-3">
            <button
              @click="emit('switch-tab', 'media')"
              class="cursor-pointer w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FFD700]/50 hover:bg-white/[0.06] text-left text-sm font-medium text-white flex items-center justify-between group transition"
            >
              <div class="flex items-center gap-3">
                <Images class="w-4 h-4 text-sky-400" />
                <span>Upload Photos</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFD700] transition" />
            </button>

            <button
              @click="emit('switch-tab', 'packages')"
              class="cursor-pointer w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FFD700]/50 hover:bg-white/[0.06] text-left text-sm font-medium text-white flex items-center justify-between group transition"
            >
              <div class="flex items-center gap-3">
                <Tags class="w-4 h-4 text-emerald-400" />
                <span>Manage Rates</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFD700] transition" />
            </button>

            <button
              @click="emit('switch-tab', 'page-builder')"
              class="cursor-pointer w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FFD700]/50 hover:bg-white/[0.06] text-left text-sm font-medium text-white flex items-center justify-between group transition"
            >
              <div class="flex items-center gap-3">
                <Layers class="w-4 h-4 text-[#FFD700]" />
                <span>Page Layout Builder</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFD700] transition" />
            </button>

            <button
              @click="emit('switch-tab', 'settings')"
              class="cursor-pointer w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FFD700]/50 hover:bg-white/[0.06] text-left text-sm font-medium text-white flex items-center justify-between group transition"
            >
              <div class="flex items-center gap-3">
                <Settings class="w-4 h-4 text-neutral-400" />
                <span>Studio Settings & SEO</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FFD700] transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
