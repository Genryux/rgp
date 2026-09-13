<script setup>
import { ref, computed } from 'vue';
import { useSections } from '../../../composables/useSections';
import SectionSkeletonPreview from '../SectionSkeletonPreview.vue';

// Section components for full-page live rendering
import Navbar from '../../public/Navbar.vue';
import Footer from '../../public/Footer.vue';
import HeroSection from '../../public/sections/HeroSection.vue';
import CarouselSection from '../../public/sections/CarouselSection.vue';
import VideoSection from '../../public/sections/VideoSection.vue';
import RatesSection from '../../public/sections/RatesSection.vue';
import AboutSection from '../../public/sections/AboutSection.vue';
import GalleryGridSection from '../../public/sections/GalleryGridSection.vue';
import TextBlockSection from '../../public/sections/TextBlockSection.vue';
import TestimonialsSection from '../../public/sections/TestimonialsSection.vue';
import FaqSection from '../../public/sections/FaqSection.vue';
import CtaSection from '../../public/sections/CtaSection.vue';
import ContactSection from '../../public/sections/ContactSection.vue';
import ProcessSection from '../../public/sections/ProcessSection.vue';
import TeamSection from '../../public/sections/TeamSection.vue';
import VenuesMarqueeSection from '../../public/sections/VenuesMarqueeSection.vue';
import GearSection from '../../public/sections/GearSection.vue';
import InstagramFeedSection from '../../public/sections/InstagramFeedSection.vue';
import LocationMapSection from '../../public/sections/LocationMapSection.vue';
import BeforeAfterSection from '../../public/sections/BeforeAfterSection.vue';

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
  Sliders,
  ExternalLink,
  ListOrdered,
} from '@lucide/vue';

const { allSections, saveSection, reorderSections, toggleSectionVisibility, deleteSection } = useSections();

const editingSection = ref(null);
const isAddModalOpen = ref(false);
const isDrawerOpen = ref(false);
const insertAtIndex = ref(null);
const selectedTemplateCategory = ref('All');

const templateCategories = ['All', 'Showcase & Media', 'Services & Rates', 'About & Team', 'Trust & Reviews', 'Contact & Booking'];

const sectionComponents = {
  hero: HeroSection,
  carousel: CarouselSection,
  video: VideoSection,
  rates: RatesSection,
  about: AboutSection,
  gallery_grid: GalleryGridSection,
  text_block: TextBlockSection,
  testimonials: TestimonialsSection,
  faq: FaqSection,
  cta: CtaSection,
  contact: ContactSection,
  process: ProcessSection,
  team: TeamSection,
  venues: VenuesMarqueeSection,
  gear: GearSection,
  instagram: InstagramFeedSection,
  location_map: LocationMapSection,
  before_after: BeforeAfterSection,
};

const sectionTemplates = [
  // Showcase & Media
  {
    type: 'hero',
    category: 'Showcase & Media',
    label: 'Hero Banner',
    description: 'Prominent headline, subtext, booking buttons, and background photography or video.',
    defaultContent: {
      heading_line1: 'Turning',
      heading_accent1: 'Moments',
      heading_line2: 'into',
      heading_accent2: 'Masterpiece.',
      subheading: 'Professional photography and videography services.',
      bg_image: '/images/hero-bg.jpg',
      cta_text: 'Book a Session',
      cta_link: '#contact',
    },
  },
  {
    type: 'carousel',
    category: 'Showcase & Media',
    label: 'Showcase Carousel',
    description: 'Infinite centered slider for your top featured works with category filters.',
    defaultContent: {
      title: 'Featured Works',
      subtitle: 'Explore our latest wedding and portrait highlights',
    },
  },
  {
    type: 'gallery_grid',
    category: 'Showcase & Media',
    label: 'Photo Gallery Grid',
    description: 'Multi-column photo grid collection with hover captions and category filters.',
    defaultContent: {
      title: 'Gallery Collection',
      subtitle: 'Selected moments and creative portraits',
      limit: 8,
    },
  },
  {
    type: 'video',
    category: 'Showcase & Media',
    label: 'Cinematic Highlights',
    description: 'Responsive YouTube/Vimeo 4K video player for highlight reels and teasers.',
    defaultContent: {
      title: 'Cinematic Highlights',
      subtitle: 'Relive the most memorable moments captured on film',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      caption: 'Wedding & Event Cinematic Highlight Reel',
    },
  },
  {
    type: 'before_after',
    category: 'Showcase & Media',
    label: 'Before & After Retouching',
    description: 'Interactive comparison slider demonstrating RAW capture vs master color grade.',
    defaultContent: {
      title: 'MASTER RETOUCHING & COLOR GRADING',
      subtitle: 'Slide across to see how our colorists enhance lighting, depth, and skin tones',
      before_image: '/images/5.jpg',
      after_image: '/images/1.jpg',
    },
  },
  {
    type: 'instagram',
    category: 'Showcase & Media',
    label: 'Instagram Social Feed',
    description: 'Social snapshot grid with profile link and follow CTA.',
    defaultContent: {
      title: 'FOLLOW OUR VISUAL JOURNEY',
      handle: '@rgpfilmsstudio',
    },
  },

  // Services & Rates
  {
    type: 'rates',
    category: 'Services & Rates',
    label: 'Packages & Rates',
    description: 'Tiered pricing cards with checkmark inclusions, badges, and direct inquiry triggers.',
    defaultContent: {
      title: 'Packages & Rates',
      subtitle: 'Transparent pricing crafted for every milestone',
    },
  },
  {
    type: 'process',
    category: 'Services & Rates',
    label: '4-Step Process & Workflow',
    description: 'Step-by-step timeline explaining your booking, shooting, and delivery process.',
    defaultContent: {
      title: 'OUR 4-STEP PROCESS',
      subtitle: 'From your initial inquiry to the final delivery of your timeless gallery',
      steps: [
        { step: '01', title: 'Consultation & Date Lock', desc: 'We discuss your vision and secure your date with a reservation deposit.' },
        { step: '02', title: 'Pre-Event Planning', desc: 'We coordinate mood boards, shot lists, and lighting strategy.' },
        { step: '03', title: 'The Shoot Day', desc: 'Our experienced team captures every genuine emotion and milestone.' },
        { step: '04', title: 'Master Retouching & Delivery', desc: 'Sneak peeks in 48 hours, followed by complete 4K galleries.' },
      ],
    },
  },

  // About & Team
  {
    type: 'about',
    category: 'About & Team',
    label: 'About Studio & Bio',
    description: 'Side-by-side photographer bio with experience counters and studio portrait.',
    defaultContent: {
      title: 'Behind the Lens',
      subtitle: 'Passionate visual storytellers dedicated to preserving your moments forever.',
      experience_years: '5+',
      events_covered: '250+',
      satisfaction_rate: '100%',
      image_url: '/images/main-shot.jpg',
    },
  },
  {
    type: 'team',
    category: 'About & Team',
    label: 'Meet the Creative Team',
    description: 'Photographer and cinematographer team profiles with bios and roles.',
    defaultContent: {
      title: 'MEET THE CREATIVE TEAM',
      subtitle: 'Passionate directors, lead photographers, and cinematic colorists',
      members: [
        { name: 'Lead Director', role: 'Principal Photographer', image_url: '/images/1.jpg', bio: 'Specializing in editorial wedding photography with 8+ years experience.' },
        { name: 'Senior Cinematographer', role: 'Head of Video & Drone Ops', image_url: '/images/2.jpg', bio: 'Master of movement, intentional lighting, and 4K same-day-edit reels.' },
        { name: 'Creative Retoucher', role: 'Studio Retoucher & Stylist', image_url: '/images/3.jpg', bio: 'Ensures color accuracy and magazine-worthy polish.' },
      ],
    },
  },
  {
    type: 'gear',
    category: 'About & Team',
    label: 'Camera Gear & Equipment',
    description: 'Technical equipment breakdown (Sony cinema cameras, G-Master lenses, DJI drones).',
    defaultContent: {
      title: 'OUR PRODUCTION GEAR & ARSENAL',
      subtitle: 'We invest in top-tier camera and audio gear to ensure cinematic fidelity in any lighting condition.',
      categories: [
        { group: 'Cameras & Cinema Bodies', items: ['Sony A7S III (4K 120fps Cinema)', 'Sony A7 IV Full-Frame Bodies', 'Blackmagic Cinema Rig'] },
        { group: 'Prime & Zoom Lenses', items: ['Sony G-Master 24-70mm f/2.8 II', 'Sony G-Master 70-200mm f/2.8', 'Sony 50mm & 85mm f/1.4 Primes'] },
        { group: 'Aerial & Stabilization', items: ['DJI Mavic 3 Cine 5.1K Drone', 'DJI RS3 Pro Gimbal Stabilizer', 'Wireless Video Transmitters'] },
        { group: 'Audio & Studio Lighting', items: ['Godox AD600 Pro High-Speed Strobes', 'Sennheiser Wireless Lav Mics', 'Aputure Amaran Studio LED Kits'] },
      ],
    },
  },
  {
    type: 'text_block',
    category: 'About & Team',
    label: 'Custom Story / Policy Block',
    description: 'Clean typography layout for studio stories, photography philosophies, or preparation guides.',
    defaultContent: {
      title: 'Our Studio Philosophy',
      body: 'We believe that every love story, celebration, and portrait is a piece of art waiting to be captured.',
    },
  },

  // Trust & Reviews
  {
    type: 'testimonials',
    category: 'Trust & Reviews',
    label: 'Client Reviews & Love',
    description: 'Client review cards with star ratings, quotes, and client names.',
    defaultContent: {
      title: 'WHAT OUR CLIENTS SAY',
      testimonials: [
        { client_name: 'Clarisse & Ethan', event: 'Wedding Coverage', quote: 'Stunning photos and amazing cinematic video!', rating: 5 },
        { client_name: 'Jessica Gomez', event: 'Debut Celebration', quote: 'The team was so fun and professional to work with!', rating: 5 },
      ],
    },
  },
  {
    type: 'venues',
    category: 'Trust & Reviews',
    label: 'Partnered Venues Marquee',
    description: 'Animated marquee ticker showcasing trusted wedding venues, hotels, and resorts.',
    defaultContent: {
      title: 'TRUSTED & FEATURED AT PREMIER VENUES',
      venues: ['Tagaytay Highlands', 'Palacio de Memoria', 'The Manila Hotel', 'Antonio’s Garden', 'Balesin Island Club', 'Shangri-La at The Fort', 'Pinto Art Museum'],
    },
  },
  {
    type: 'faq',
    category: 'Trust & Reviews',
    label: 'FAQ Accordion',
    description: 'Collapsible questions and answers for booking policies and turnaround times.',
    defaultContent: {
      title: 'FREQUENTLY ASKED QUESTIONS',
      faqs: [
        { q: 'How far in advance should we book?', a: 'We recommend booking 3 to 6 months in advance.' },
        { q: 'What is the turnaround time for photos?', a: 'Enhanced galleries are delivered in 3 to 4 weeks.' },
      ],
    },
  },

  // Contact & Booking
  {
    type: 'cta',
    category: 'Contact & Booking',
    label: 'Call to Action Banner',
    description: 'Full-width gold-accented promotional banner encouraging immediate booking.',
    defaultContent: {
      heading: 'READY TO TURN YOUR MOMENTS INTO A MASTERPIECE?',
      subheading: 'Dates fill quickly for the upcoming season. Inquire now to secure your schedule.',
      button_text: 'BOOK YOUR SESSION',
      button_link: '#contact',
    },
  },
  {
    type: 'location_map',
    category: 'Contact & Booking',
    label: 'Studio Location & Hours',
    description: 'Physical studio address, business hours, and destination service areas.',
    defaultContent: {
      title: 'STUDIO LOCATION & SERVICE AREAS',
      subtitle: 'Available for destination weddings across the Philippines and worldwide.',
      hours: 'Mon – Sat: 9:00 AM – 7:00 PM (By Appointment)',
    },
  },
  {
    type: 'contact',
    category: 'Contact & Booking',
    label: 'Contact & Booking Form',
    description: 'Lead generation inquiry form with event date picker and security validation.',
    defaultContent: {
      title: 'LET’S CREATE MAGIC TOGETHER',
      subtitle: 'Have an upcoming event or want a studio session? Send us your details below.',
    },
  },
];

const filteredTemplates = computed(() => {
  if (selectedTemplateCategory.value === 'All') return sectionTemplates;
  return sectionTemplates.filter((t) => t.category === selectedTemplateCategory.value);
});

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

function openAddModal(index = null) {
  insertAtIndex.value = index;
  isAddModalOpen.value = true;
}

function handleAddSection(tpl) {
  const newSec = {
    id: `sec_${Date.now()}`,
    section_type: tpl.type,
    label: tpl.label,
    is_visible: true,
    sort_order: insertAtIndex.value !== null ? insertAtIndex.value + 1.5 : allSections.value.length + 1,
    content: JSON.parse(JSON.stringify(tpl.defaultContent)),
  };

  const list = [...allSections.value];
  if (insertAtIndex.value !== null) {
    list.splice(insertAtIndex.value + 1, 0, newSec);
  } else {
    list.push(newSec);
  }

  saveSection(newSec);
  reorderSections(list.map((s) => s.id));
  isAddModalOpen.value = false;
  insertAtIndex.value = null;
  openEdit(newSec);
}
</script>

<template>
  <div class="space-y-6 font-manrope">
    <!-- Page Builder Action Bar (Non-competing, nicely spaced) -->
    <div class="bg-[#141414] border border-white/[0.08] rounded-3xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <!-- Drawer Toggle Button -->
        <button
          @click="isDrawerOpen = !isDrawerOpen"
          class="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-bold tracking-wide flex items-center gap-2 border border-white/[0.08] transition"
        >
          <ListOrdered class="w-4 h-4 text-[#FFD700]" />
          <span>Layout Flow ({{ allSections.length }} Sections)</span>
        </button>

        <div class="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-medium pl-2 border-l border-white/10">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Hover over any section below to edit, reorder, or toggle</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Add Section Button -->
        <button
          @click="openAddModal(null)"
          class="px-5 py-2.5 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>
    </div>

    <!-- Side Slide-Over Drawer for Layout Reordering & Overview -->
    <div
      v-if="isDrawerOpen"
      class="fixed inset-y-0 left-0 w-full sm:w-[420px] bg-[#121212] border-r border-white/[0.12] z-50 p-6 shadow-2xl overflow-y-auto space-y-6"
    >
      <div class="flex justify-between items-center border-b border-white/[0.08] pb-4">
        <div>
          <h3 class="text-lg font-bold text-white tracking-wide">Active Page Flow</h3>
          <p class="text-xs text-neutral-400 mt-0.5">Reorder or toggle sections</p>
        </div>
        <button @click="isDrawerOpen = false" class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Drawer Section List -->
      <div class="space-y-3">
        <div
          v-for="(sec, index) in allSections"
          :key="sec.id"
          class="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center justify-between gap-3 hover:border-[#FFD700]/50 transition shadow-lg"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex flex-col gap-0.5">
              <button
                @click="moveUp(index)"
                :disabled="index === 0"
                class="text-neutral-500 hover:text-[#FFD700] disabled:opacity-20 p-0.5 transition"
                title="Move Up"
              >
                <ChevronUp class="w-3.5 h-3.5" />
              </button>
              <button
                @click="moveDown(index)"
                :disabled="index === allSections.length - 1"
                class="text-neutral-500 hover:text-[#FFD700] disabled:opacity-20 p-0.5 transition"
                title="Move Down"
              >
                <ChevronDown class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="min-w-0">
              <h4 class="font-bold text-sm text-white truncate">{{ sec.label }}</h4>
              <span class="text-[10px] text-neutral-400 uppercase tracking-wider">#{{ index + 1 }} • {{ sec.section_type }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              @click="toggleSectionVisibility(sec.id)"
              class="p-1.5 rounded-lg text-xs font-semibold transition"
              :class="[sec.is_visible ? 'text-emerald-400' : 'text-neutral-600']"
              :title="sec.is_visible ? 'Visible' : 'Hidden'"
            >
              <component :is="sec.is_visible ? Eye : EyeOff" class="w-4 h-4" />
            </button>
            <button
              @click="openEdit(sec); isDrawerOpen = false"
              class="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#FFD700] hover:text-black text-neutral-300 text-xs transition"
              title="Edit Content"
            >
              <Edit3 class="w-4 h-4" />
            </button>
            <button
              @click="deleteSection(sec.id)"
              class="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 text-xs transition"
              title="Delete Section"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        @click="openAddModal(null); isDrawerOpen = false"
        class="w-full py-3 rounded-2xl bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
      >
        <Plus class="w-4 h-4" />
        <span>Add New Section</span>
      </button>
    </div>

    <!-- FULL PAGE LIVE VISUAL PREVIEW CANVAS (Confined & Isolated) -->
    <div class="rounded-3xl border border-white/[0.12] bg-[#141414] overflow-hidden shadow-2xl relative select-none isolate">
      <!-- Embedded Live Navbar (Positioned properly with isPreview prop) -->
      <Navbar :is-preview="true" />

      <!-- Full-Width Live Section Stack with Visual Inspector Controls -->
      <div class="space-y-0 relative">
        <template v-for="(sec, index) in allSections" :key="sec.id">
          <!-- Visual Section Block Wrapper with Admin Controls -->
          <div
            class="relative group transition-all duration-300 border-2"
            :class="[
              sec.is_visible ? 'border-transparent hover:border-[#FFD700]/70' : 'border-dashed border-red-500/30 opacity-40 hover:opacity-80'
            ]"
          >
            <!-- Floating Inspector Pill Header on Section Hover -->
            <div class="absolute top-4 right-6 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 flex items-center gap-1.5 bg-[#121212]/95 border border-white/[0.18] backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl">
              <!-- Label Tag -->
              <span class="px-2.5 py-1 rounded-xl bg-white/[0.06] text-[11px] font-bold text-white flex items-center gap-1.5">
                <span class="text-[#FFD700]">#{{ index + 1 }}</span>
                <span>{{ sec.label }}</span>
              </span>

              <!-- Move Up -->
              <button
                @click="moveUp(index)"
                :disabled="index === 0"
                class="p-1.5 rounded-xl text-neutral-400 hover:text-[#FFD700] hover:bg-white/[0.08] disabled:opacity-20 transition"
                title="Move Up"
              >
                <ChevronUp class="w-4 h-4" />
              </button>

              <!-- Move Down -->
              <button
                @click="moveDown(index)"
                :disabled="index === allSections.length - 1"
                class="p-1.5 rounded-xl text-neutral-400 hover:text-[#FFD700] hover:bg-white/[0.08] disabled:opacity-20 transition"
                title="Move Down"
              >
                <ChevronDown class="w-4 h-4" />
              </button>

              <!-- Toggle Visibility -->
              <button
                @click="toggleSectionVisibility(sec.id)"
                class="p-1.5 rounded-xl transition"
                :class="[sec.is_visible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-neutral-500 hover:bg-white/10']"
                :title="sec.is_visible ? 'Hide from public' : 'Show on public'"
              >
                <component :is="sec.is_visible ? Eye : EyeOff" class="w-4 h-4" />
              </button>

              <!-- Edit Content Button -->
              <button
                @click="openEdit(sec)"
                class="px-3 py-1.5 rounded-xl bg-[#FFD700] text-[#121212] text-xs font-bold hover:bg-yellow-400 transition flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
              >
                <Edit3 class="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <!-- Delete Button -->
              <button
                @click="deleteSection(sec.id)"
                class="p-1.5 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition"
                title="Delete Section"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- The Rendered Section Component (Full Page Width) -->
            <component
              :is="sectionComponents[sec.section_type] || TextBlockSection"
              :content="sec.content"
            />
          </div>

          <!-- Inline "Insert Section Here" Divider Button -->
          <div class="relative py-2 flex items-center justify-center group/insert z-20">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-dashed border-white/10 group-hover/insert:border-[#FFD700]/50 transition"></div>
            </div>
            <button
              @click="openAddModal(index)"
              class="relative z-10 px-4 py-1 rounded-full bg-[#161616] border border-white/15 hover:border-[#FFD700] text-neutral-400 hover:text-[#FFD700] text-[11px] font-bold tracking-wider uppercase transition shadow-lg opacity-25 group-hover/insert:opacity-100 flex items-center gap-1.5 transform hover:scale-105"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Insert Section Here</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Embedded Live Footer -->
      <Footer />
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

          <!-- Before / After Slider Specific Fields -->
          <div v-else-if="editingSection.section_type === 'before_after'" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Section Title</label>
              <input
                type="text"
                v-model="editingSection.content.title"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Before (Raw) Image URL</label>
                <input
                  type="text"
                  v-model="editingSection.content.before_image"
                  class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">After (Graded) Image URL</label>
                <input
                  type="text"
                  v-model="editingSection.content.after_image"
                  class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>
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

    <!-- Add Section Template Modal (With Visual Skeleton Previews & Category Tabs) -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 md:p-8 max-w-5xl w-full max-h-[88vh] overflow-y-auto space-y-6 shadow-2xl">
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-4">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">Choose a Section Template</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Explore 18+ studio-grade layout blocks with visual wireframe previews</p>
          </div>
          <button @click="isAddModalOpen = false" class="text-neutral-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Category Filters -->
        <div class="flex flex-wrap gap-2 pb-2">
          <button
            v-for="cat in templateCategories"
            :key="cat"
            @click="selectedTemplateCategory = cat"
            class="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition"
            :class="[
              selectedTemplateCategory === cat
                ? 'bg-[#FFD700] text-[#121212] font-bold'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            ]"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Visual Template Grid with Skeleton Previews -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="tpl in filteredTemplates"
            :key="tpl.type"
            @click="handleAddSection(tpl)"
            class="p-4 rounded-2xl bg-black/50 border border-white/[0.08] hover:border-[#FFD700] cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-3 shadow-lg hover:scale-[1.02]"
          >
            <!-- Visual Wireframe Skeleton Preview -->
            <SectionSkeletonPreview :type="tpl.type" />

            <!-- Template Info -->
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold text-white group-hover:text-[#FFD700] transition tracking-wide">
                  {{ tpl.label }}
                </h4>
                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  {{ tpl.category }}
                </span>
              </div>
              <p class="text-xs text-neutral-400 leading-relaxed">
                {{ tpl.description }}
              </p>
            </div>

            <!-- Action Button -->
            <div class="pt-2 border-t border-white/[0.04] flex justify-end">
              <span class="text-xs font-bold text-[#FFD700] group-hover:underline flex items-center gap-1">
                <span>Add Template</span>
                <span>+</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
