<script setup>
import { ref } from 'vue';
import { useSections } from '../../../composables/useSections';
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  X,
  Layers,
  Sparkles,
} from '@lucide/vue';

const { allSections, saveSection, reorderSections, toggleSectionVisibility, deleteSection } = useSections();

const editingSection = ref(null);
const isAddModalOpen = ref(false);

const sectionTemplates = [
  { type: 'hero', label: 'Hero Banner', defaultContent: { heading_line1: 'Turning', heading_accent1: 'Moments', heading_line2: 'into', heading_accent2: 'Masterpiece.', subheading: 'Professional photography services.', bg_image: '/images/hero-bg.jpg', cta_text: 'Book a Session', cta_link: '#contact' } },
  { type: 'carousel', label: 'Showcase Carousel', defaultContent: { title: 'Featured Works', subtitle: 'Explore our latest wedding and portrait highlights' } },
  { type: 'video', label: 'Cinematic Highlights', defaultContent: { title: 'Cinematic Highlights', subtitle: 'Relive the most memorable moments captured on film', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Wedding & Event Cinematic Highlight Reel' } },
  { type: 'rates', label: 'Packages & Rates', defaultContent: { title: 'Packages & Rates', subtitle: 'Transparent pricing crafted for every milestone' } },
  { type: 'about', label: 'About Studio & Bio', defaultContent: { title: 'Behind the Lens', subtitle: 'Passionate visual storytellers dedicated to preserving your moments forever.', experience_years: '5+', events_covered: '250+', satisfaction_rate: '100%', image_url: '/images/main-shot.jpg' } },
  { type: 'gallery_grid', label: 'Photo Gallery Grid', defaultContent: { title: 'Gallery Collection', subtitle: 'Selected moments and creative portraits', limit: 8 } },
  { type: 'text_block', label: 'Custom Story / Text Block', defaultContent: { title: 'Our Studio Philosophy', body: 'We believe that every love story, celebration, and portrait is a piece of art waiting to be captured.' } },
  { type: 'testimonials', label: 'Client Reviews', defaultContent: { title: 'WHAT OUR CLIENTS SAY', testimonials: [{ client_name: 'Client Name', event: 'Wedding', quote: 'Amazing experience and stunning photos!', rating: 5 }] } },
  { type: 'faq', label: 'FAQ Accordion', defaultContent: { title: 'FREQUENTLY ASKED QUESTIONS', faqs: [{ q: 'How far in advance should we book?', a: 'We recommend booking 3 to 6 months in advance.' }] } },
  { type: 'cta', label: 'Call to Action Banner', defaultContent: { heading: 'READY TO TURN YOUR MOMENTS INTO A MASTERPIECE?', subheading: 'Dates fill quickly for the upcoming season. Inquire now to secure your schedule.', button_text: 'BOOK YOUR SESSION', button_link: '#contact' } },
  { type: 'contact', label: 'Contact & Booking Form', defaultContent: { title: 'LET’S CREATE MAGIC TOGETHER', subtitle: 'Have an upcoming event or want a studio session? Send us your details below.' } },
];

function moveUp(index) {
  if (index <= 0) return;
  const list = [...allSections.value];
  const temp = list[index];
  list[index] = list[index - 1];
  list[index - 1] = temp;
  reorderSections(list.map((s) => s.id));
}

function moveDown(index) {
  if (index >= allSections.value.length - 1) return;
  const list = [...allSections.value];
  const temp = list[index];
  list[index] = list[index + 1];
  list[index + 1] = temp;
  reorderSections(list.map((s) => s.id));
}

function openEdit(section) {
  editingSection.value = JSON.parse(JSON.stringify(section));
}

function handleSaveEdit() {
  if (editingSection.value) {
    saveSection(editingSection.value);
    editingSection.value = null;
  }
}

function handleAddSection(tpl) {
  const newSec = {
    id: `sec_${Date.now()}`,
    section_type: tpl.type,
    label: tpl.label,
    is_visible: true,
    sort_order: allSections.value.length + 1,
    content: JSON.parse(JSON.stringify(tpl.defaultContent)),
  };
  saveSection(newSec);
  isAddModalOpen.value = false;
  openEdit(newSec);
}
</script>

<template>
  <div class="space-y-8 font-manrope">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Page Builder & Layout</h2>
        <p class="text-xs text-neutral-400 mt-0.5">Reorder, configure, or toggle sections appearing on your public landing page</p>
      </div>

      <button
        @click="isAddModalOpen = true"
        class="px-5 py-2.5 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        <span>Add Section</span>
      </button>
    </div>

    <!-- Section List -->
    <div class="space-y-3.5">
      <div
        v-for="(sec, index) in allSections"
        :key="sec.id"
        class="p-5 rounded-2xl bg-[#141414] border border-white/[0.08] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/[0.18] transition shadow-lg"
      >
        <!-- Info & Order Controls -->
        <div class="flex items-center gap-4">
          <div class="flex flex-col gap-1">
            <button
              @click="moveUp(index)"
              :disabled="index === 0"
              class="text-neutral-500 hover:text-[#FFD700] disabled:opacity-20 p-1 transition"
              title="Move Up"
            >
              <ChevronUp class="w-4 h-4" />
            </button>
            <button
              @click="moveDown(index)"
              :disabled="index === allSections.length - 1"
              class="text-neutral-500 hover:text-[#FFD700] disabled:opacity-20 p-1 transition"
              title="Move Down"
            >
              <ChevronDown class="w-4 h-4" />
            </button>
          </div>

          <div>
            <div class="flex items-center gap-3">
              <span class="font-bold text-base text-white tracking-wide">{{ sec.label }}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-neutral-400 uppercase tracking-wider">
                {{ sec.section_type }}
              </span>
            </div>
            <p class="text-xs text-neutral-500 mt-0.5">Display Order: #{{ index + 1 }}</p>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <!-- Visibility Toggle -->
          <button
            @click="toggleSectionVisibility(sec.id)"
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5"
            :class="[
              sec.is_visible
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/[0.04] text-neutral-500 border border-white/[0.08]'
            ]"
          >
            <component :is="sec.is_visible ? Eye : EyeOff" class="w-3.5 h-3.5" />
            <span>{{ sec.is_visible ? 'Visible' : 'Hidden' }}</span>
          </button>

          <!-- Edit Button -->
          <button
            @click="openEdit(sec)"
            class="px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-[#FFD700] hover:text-black text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <!-- Delete Button -->
          <button
            @click="deleteSection(sec.id)"
            class="p-2 text-neutral-500 hover:text-red-400 text-xs transition"
            title="Delete Section"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Section Modal -->
    <div
      v-if="editingSection"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-4">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">Edit {{ editingSection.label }}</h3>
            <span class="text-xs font-semibold text-[#FFD700] uppercase">{{ editingSection.section_type }} block</span>
          </div>
          <button @click="editingSection = null" class="text-neutral-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Section Display Label</label>
            <input
              type="text"
              v-model="editingSection.label"
              class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <!-- Video Section Specific Fields -->
          <div v-if="editingSection.section_type === 'video'" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Title</label>
              <input
                type="text"
                v-model="editingSection.content.title"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">YouTube or Vimeo Video URL</label>
              <input
                type="url"
                v-model="editingSection.content.video_url"
                placeholder="https://www.youtube.com/watch?v=..."
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Subtitle / Caption</label>
              <input
                type="text"
                v-model="editingSection.content.caption"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          <!-- Text Block Specific Fields -->
          <div v-else-if="editingSection.section_type === 'text_block'" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Heading</label>
              <input
                type="text"
                v-model="editingSection.content.title"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Body Text</label>
              <textarea
                v-model="editingSection.content.body"
                rows="5"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              ></textarea>
            </div>
          </div>

          <!-- General Title/Subtitle for other sections -->
          <div v-else class="space-y-3">
            <div v-if="'title' in editingSection.content">
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Section Title</label>
              <input
                type="text"
                v-model="editingSection.content.title"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div v-if="'subtitle' in editingSection.content">
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Subtitle</label>
              <input
                type="text"
                v-model="editingSection.content.subtitle"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            @click="editingSection = null"
            class="px-5 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleSaveEdit"
            class="px-6 py-2 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Add Section Template Modal -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-4">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">Add New Section Block</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Select a layout template to insert</p>
          </div>
          <button @click="isAddModalOpen = false" class="text-neutral-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="tpl in sectionTemplates"
            :key="tpl.type"
            @click="handleAddSection(tpl)"
            class="p-4 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-[#FFD700] cursor-pointer transition group"
          >
            <h4 class="text-sm font-bold text-white group-hover:text-[#FFD700] tracking-wide">{{ tpl.label }}</h4>
            <span class="text-[11px] text-neutral-500 uppercase tracking-wider">{{ tpl.type }} template</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
