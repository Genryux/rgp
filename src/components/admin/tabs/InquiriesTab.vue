<script setup>
import { ref, computed } from 'vue';
import { useInquiries } from '../../../composables/useInquiries';
import {
  Calendar,
  Mail,
  Phone,
  Trash2,
  Inbox,
  Clock,
  CheckCircle2,
  FileText,
  User,
} from '@lucide/vue';

const { inquiries, updateStatus, updateNotes, deleteInquiry } = useInquiries();

const selectedFilter = ref('All');
const filterStatuses = ['All', 'New', 'Contacted', 'Booked', 'Archived'];

const filteredInquiries = computed(() => {
  if (selectedFilter.value === 'All') return inquiries.value;
  return inquiries.value.filter((i) => i.status === selectedFilter.value);
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
</script>

<template>
  <div class="space-y-8 font-manrope">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Client Inquiries & Leads Inbox</h2>
        <p class="text-xs text-neutral-400 mt-0.5">Manage incoming contact submissions and booking status</p>
      </div>

      <!-- Filter Buttons -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="status in filterStatuses"
          :key="status"
          @click="selectedFilter = status"
          class="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition"
          :class="[
            selectedFilter === status
              ? 'bg-[#FFD700] text-[#121212] font-bold shadow-md shadow-yellow-500/20'
              : 'bg-white/[0.04] text-neutral-400 hover:text-white'
          ]"
        >
          {{ status }}
        </button>
      </div>
    </div>

    <!-- Inquiries Feed -->
    <div v-if="filteredInquiries.length > 0" class="space-y-4">
      <div
        v-for="inq in filteredInquiries"
        :key="inq.id"
        class="bg-[#141414] border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 hover:border-white/[0.18] transition shadow-xl"
      >
        <!-- Card Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold text-white tracking-wide">{{ inq.name }}</h3>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20">
                {{ inq.event_type }}
              </span>
            </div>
            <p class="text-xs text-neutral-400 flex items-center gap-1.5 mt-1">
              <Clock class="w-3 h-3" />
              <span>Received on {{ formatDate(inq.created_at) }}</span>
            </p>
          </div>

          <!-- Status Dropdown -->
          <div class="flex items-center gap-3">
            <label class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status:</label>
            <select
              :value="inq.status"
              @change="updateStatus(inq.id, $event.target.value)"
              class="px-3.5 py-1.5 rounded-xl bg-black/50 border border-white/[0.08] text-xs font-semibold focus:outline-none focus:border-[#FFD700]"
              :class="[
                inq.status === 'New' ? 'text-yellow-300' : inq.status === 'Contacted' ? 'text-blue-300' : inq.status === 'Booked' ? 'text-green-300' : 'text-neutral-400'
              ]"
            >
              <option value="New" class="bg-neutral-900 text-yellow-300">New</option>
              <option value="Contacted" class="bg-neutral-900 text-blue-300">Contacted</option>
              <option value="Booked" class="bg-neutral-900 text-green-300">Booked</option>
              <option value="Archived" class="bg-neutral-900 text-neutral-400">Archived</option>
            </select>

            <button
              @click="deleteInquiry(inq.id)"
              class="text-neutral-500 hover:text-red-400 p-1.5 transition"
              title="Delete Lead"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Contact & Event Details -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span class="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold flex items-center gap-1.5">
              <Calendar class="w-3 h-3" />
              <span>Event Date</span>
            </span>
            <span class="text-white text-sm font-semibold block">{{ inq.event_date ? formatDate(inq.event_date) : 'Flexible / TBD' }}</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span class="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold flex items-center gap-1.5">
              <Mail class="w-3 h-3" />
              <span>Email Address</span>
            </span>
            <a :href="`mailto:${inq.email}`" class="text-[#FFD700] hover:underline font-semibold block">{{ inq.email }}</a>
          </div>

          <div class="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span class="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold flex items-center gap-1.5">
              <Phone class="w-3 h-3" />
              <span>Phone / Viber</span>
            </span>
            <a v-if="inq.phone" :href="`tel:${inq.phone}`" class="text-white hover:text-[#FFD700] font-semibold block">{{ inq.phone }}</a>
            <span v-else class="text-neutral-600 block">Not provided</span>
          </div>
        </div>

        <!-- Client Message -->
        <div class="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">Message:</span>
          <p class="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">{{ inq.message }}</p>
        </div>

        <!-- Internal Notes Field -->
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Internal Private Notes (Studio Only)</label>
          <input
            type="text"
            :value="inq.internal_notes || ''"
            @blur="updateNotes(inq.id, $event.target.value)"
            placeholder="Add internal notes (e.g. Quoted ₱22k on Viber, deposit confirmed)..."
            class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#FFD700] transition"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 bg-[#141414] border border-white/[0.08] rounded-3xl text-neutral-500 text-xs font-medium">
      No inquiries found in this category.
    </div>
  </div>
</template>
