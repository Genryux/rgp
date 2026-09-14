<script setup>
import { ref, computed, watch } from 'vue';
import { useSections } from '../../../composables/useSections';
import { useModalState } from '../../../composables/useModalState';
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
  Sparkles,
  Crown,
  BookOpen,
  Diamond,
  Star,
  MessageSquare,
  ListOrdered,
  Search,
  Check,
  LayoutGrid,
} from '@lucide/vue';

const { allSections, saveSection, reorderSections, toggleSectionVisibility, deleteSection } = useSections();
const { openModal, closeModal } = useModalState();

const editingSection = ref(null);
const isAddModalOpen = ref(false);
const isDrawerOpen = ref(false);
const insertAtIndex = ref(null);

watch(
  () => Boolean(isAddModalOpen.value || editingSection.value || isDrawerOpen.value),
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) openModal();
    else if (!isOpen && wasOpen) closeModal();
  }
);

const activeCategoryKey = ref('hero');
const searchQuery = ref('');

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

// =========================================================================
// CATEGORIZED SECTION CATALOG WITH MULTIPLE VISUAL DESIGN VARIATIONS
// =========================================================================
const sectionCategoryCatalog = [
  {
    key: 'hero',
    name: 'Hero Banner',
    icon: Crown,
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    description: 'The commanding opening statement of your studio with headline typography, booking CTAs, and background media.',
    designs: [
      {
        id: 'hero_editorial',
        type: 'hero',
        variant: 'editorial',
        skeletonType: 'hero-editorial',
        name: 'Luxury Editorial & Dual Typography',
        tag: 'Signature Look',
        features: ['Dual font accents (Nuosu + Italianno/Bebas)', 'Dark ambient gradient overlay', 'Dual booking action buttons'],
        defaultContent: {
          variant: 'editorial',
          heading_line1: 'Turning',
          heading_accent1: 'Moments',
          heading_line2: 'into',
          heading_accent2: 'Masterpiece.',
          subheading: 'Professional photography and videography services crafted to preserve your milestones in timeless elegance.',
          bg_image: '/images/hero-bg.jpg',
          cta_text: 'Book a Session',
          cta_link: '#contact',
        },
      },
      {
        id: 'hero_split',
        type: 'hero',
        variant: 'split_card',
        skeletonType: 'hero-split',
        name: 'Split 2-Column with Framed Showcase Card',
        tag: 'High Conversion',
        features: ['Left-aligned headline with gold gradient', 'Right-framed showcase visual with gold border', '5.0 Star trust badge strip'],
        defaultContent: {
          variant: 'split_card',
          badge_text: 'Premium Visual Storytelling',
          heading_line1: 'Capturing',
          heading_accent1: 'Pure Emotion',
          heading_accent2: '& Timeless Elegance.',
          subheading: 'Specialized in editorial wedding cinema, intimate portraits, and high-impact commercial campaigns.',
          bg_image: '/images/hero-bg.jpg',
          cta_text: 'Reserve Your Date',
          cta_link: '#contact',
        },
      },
      {
        id: 'hero_minimalist',
        type: 'hero',
        variant: 'minimalist_cinema',
        skeletonType: 'hero-minimalist',
        name: 'Minimalist Cinema Spotlight',
        tag: 'High Fashion',
        features: ['Oversized centered statement', 'Ambient spotlight lighting glow', 'Sleek luxury capsule buttons'],
        defaultContent: {
          variant: 'minimalist_cinema',
          heading_line1: 'CINEMATIC',
          heading_accent1: 'Artistry',
          heading_accent2: 'FOR YOUR STORY',
          subheading: 'Crafting evocative, documentary-grade films and photography for discerning couples and brands.',
          cta_text: 'CHECK AVAILABILITY',
          cta_link: '#contact',
        },
      },
      {
        id: 'hero_bento',
        type: 'hero',
        variant: 'bento',
        skeletonType: 'hero-bento',
        name: 'Modern Bento Box Hero',
        tag: 'Contemporary',
        features: ['Large hero showcase tile', 'Floating 5-star rating & 4K delivery cards', 'Season booking calendar ticker'],
        defaultContent: {
          variant: 'bento',
          heading_line1: 'Crafting',
          heading_accent1: 'Unforgettable',
          heading_accent2: 'Visual Legacies.',
          subheading: 'Award-winning photo & cinema team preserving weddings, debuts, and milestones.',
          bg_image: '/images/hero-bg.jpg',
          cta_text: 'Book Session',
          cta_link: '#contact',
        },
      },
      {
        id: 'hero_video',
        type: 'hero',
        variant: 'video_reel',
        skeletonType: 'hero-video',
        name: 'Fullscreen Video Reel Hero',
        tag: 'Cinematic',
        features: ['Immersive video backdrop', 'Floating 4K highlight reel play trigger', 'Frosted glass bottom booking bar'],
        defaultContent: {
          variant: 'video_reel',
          heading_line1: 'Capturing Every Heartbeat',
          subheading: 'Documentary wedding cinema and timeless portraits created with passion.',
          bg_image: '/images/hero-bg.jpg',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          cta_text: 'Book Your Date',
          cta_link: '#contact',
        },
      },
    ],
  },
  {
    key: 'showcase',
    name: 'Showcase & Media',
    icon: Sparkles,
    badgeColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    description: 'Interactive sliders, photo galleries, before/after sliders, and video reels for your portfolio.',
    designs: [
      {
        id: 'showcase_carousel',
        type: 'carousel',
        skeletonType: 'carousel',
        name: 'Infinite 3-Card Carousel',
        tag: 'Popular',
        features: ['Infinite auto-scrolling card slider', 'Category switcher pills', 'Lightbox preview on click'],
        defaultContent: {
          title: 'Featured Works',
          subtitle: 'Explore our latest wedding, portrait, and commercial highlights',
        },
      },
      {
        id: 'showcase_grid',
        type: 'gallery_grid',
        skeletonType: 'gallery-grid',
        name: 'Masonry Photo Collection Grid',
        tag: 'Editorial',
        features: ['Multi-column luxury photo wall', 'Hover caption reveals & category filters', 'Optimized client-side WebP loading'],
        defaultContent: {
          title: 'Gallery Collection',
          subtitle: 'Selected moments and creative portraits',
          limit: 8,
        },
      },
      {
        id: 'showcase_video',
        type: 'video',
        skeletonType: 'video',
        name: 'Cinematic 4K Video Reel Player',
        tag: 'Reel Player',
        features: ['Responsive 16:9 4K YouTube/Vimeo embed', 'Glowing gold cinema player frame', 'Custom caption & title badge'],
        defaultContent: {
          title: 'Cinematic Highlights',
          subtitle: 'Relive the most memorable moments captured on film',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          caption: 'Wedding & Event Cinematic Highlight Reel',
        },
      },
      {
        id: 'showcase_before_after',
        type: 'before_after',
        skeletonType: 'before-after',
        name: 'Interactive Retouching Slider',
        tag: 'Color Grading',
        features: ['Interactive drag comparison handle', 'RAW capture vs Master Graded side-by-side', 'Demonstrates studio polish quality'],
        defaultContent: {
          title: 'MASTER RETOUCHING & COLOR GRADING',
          subtitle: 'Slide across to see how our colorists enhance lighting, depth, and skin tones',
          before_image: '/images/5.jpg',
          after_image: '/images/1.jpg',
        },
      },
      {
        id: 'showcase_instagram',
        type: 'instagram',
        skeletonType: 'instagram',
        name: 'Instagram Social Snapshot Wall',
        tag: 'Social Proof',
        features: ['6-photo social snapshot grid', 'Direct profile handle link', 'Follow CTA for daily updates'],
        defaultContent: {
          title: 'FOLLOW OUR VISUAL JOURNEY',
          handle: '@rgpfilmsstudio',
        },
      },
    ],
  },
  {
    key: 'about',
    name: 'About & Creative Team',
    icon: BookOpen,
    badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    description: 'Introduce your studio story, creative directors, photographers, and high-end camera equipment.',
    designs: [
      {
        id: 'about_split',
        type: 'about',
        skeletonType: 'about-split',
        name: 'Split Story & 3 Milestone Stats',
        tag: 'Classic Bio',
        features: ['Photographer portrait with gold border', '5+ Years, 250+ Events, 100% Satisfaction counters', 'Studio bio & philosophy statement'],
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
        id: 'about_team',
        type: 'team',
        skeletonType: 'team',
        name: 'Creative Team Roster',
        tag: 'Studio Crew',
        features: ['Lead Photographer, Cinematographer & Retoucher cards', 'Specialized roles & bio snippets', 'Editorial card styling'],
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
        id: 'about_gear',
        type: 'gear',
        skeletonType: 'gear',
        name: 'Camera & Cinema Gear Arsenal',
        tag: 'Technical Rig',
        features: ['Sony FX cinema bodies & G-Master lenses breakdown', 'DJI Mavic Cine drones & audio gear list', 'Builds deep client confidence in production quality'],
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
        id: 'about_manifesto',
        type: 'text_block',
        skeletonType: 'about-manifesto',
        name: 'Studio Story & Manifesto Block',
        tag: 'Storytelling',
        features: ['Focused clean editorial typography', 'Full-width reading layout', 'Ideal for preparation guidelines or studio philosophy'],
        defaultContent: {
          title: 'Our Studio Philosophy',
          body: 'We believe that every love story, celebration, and portrait is a piece of art waiting to be captured with authentic emotion and timeless color grading.',
        },
      },
    ],
  },
  {
    key: 'rates',
    name: 'Packages & Rates',
    icon: Diamond,
    badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    description: 'Display transparent pricing tiers, inclusions, deliverables, and booking workflows.',
    designs: [
      {
        id: 'rates_tiered',
        type: 'rates',
        skeletonType: 'rates-tiered',
        name: '3-Tier Luxury Pricing Cards',
        tag: 'Best for Sales',
        features: ['Bronze, Silver, Gold package tiers', 'Highlighted "Most Popular" center card', 'Checkmark inclusions & instant inquiry trigger'],
        defaultContent: {
          title: 'Packages & Rates',
          subtitle: 'Transparent pricing crafted for every milestone and celebration',
        },
      },
      {
        id: 'rates_process',
        type: 'process',
        skeletonType: 'process',
        name: '4-Step Booking & Shoot Timeline',
        tag: 'Workflow',
        features: ['Consultation, Planning, Shoot Day, Delivery timeline', 'Numbered gold step badges', 'Sets clear expectations for clients'],
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
    ],
  },
  {
    key: 'trust',
    name: 'Trust & Reviews',
    icon: Star,
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    description: 'Client reviews, partner venue tickers, and FAQ accordions that overcome objections.',
    designs: [
      {
        id: 'trust_reviews',
        type: 'testimonials',
        skeletonType: 'testimonials-dual',
        name: 'Dual Review Cards with 5-Star Badges',
        tag: 'Social Proof',
        features: ['Side-by-side couple review cards', 'Gold 5-star ratings & event milestone tags', 'Client quote spotlight'],
        defaultContent: {
          title: 'WHAT OUR CLIENTS SAY',
          testimonials: [
            { client_name: 'Clarisse & Ethan', event: 'Wedding Coverage', quote: 'Stunning photos and amazing cinematic video! The team made us feel so comfortable throughout our wedding day.', rating: 5 },
            { client_name: 'Jessica Gomez', event: 'Debut Celebration', quote: 'The team was so fun and professional to work with! The same-day edit reel brought tears to our eyes.', rating: 5 },
          ],
        },
      },
      {
        id: 'trust_venues',
        type: 'venues',
        skeletonType: 'venues',
        name: 'Partnered Venues & Hotels Marquee',
        tag: 'Venue Proof',
        features: ['Continuous animated marquee ticker', 'Prestigious hotel & wedding venue names', 'Builds luxury destination credibility'],
        defaultContent: {
          title: 'TRUSTED & FEATURED AT PREMIER VENUES',
          venues: ['Tagaytay Highlands', 'Palacio de Memoria', 'The Manila Hotel', 'Antonio’s Garden', 'Balesin Island Club', 'Shangri-La at The Fort', 'Pinto Art Museum'],
        },
      },
      {
        id: 'trust_faq',
        type: 'faq',
        skeletonType: 'faq',
        name: 'FAQ Accordion Grid',
        tag: 'Objection Buster',
        features: ['Interactive collapsible Q&A items', 'Answers booking deposits, turnaround times, and RAW files', 'Clean 2-column layout'],
        defaultContent: {
          title: 'FREQUENTLY ASKED QUESTIONS',
          faqs: [
            { q: 'How far in advance should we book?', a: 'We recommend booking 3 to 6 months in advance, especially for weekend wedding dates and peak wedding seasons.' },
            { q: 'What is the turnaround time for photos?', a: 'You will receive a 48-hour sneak peek batch, with full enhanced 4K galleries delivered in 3 to 4 weeks.' },
            { q: 'Do you travel for destination events?', a: 'Yes! We cover events throughout the Philippines and worldwide with flexible destination packages.' },
          ],
        },
      },
    ],
  },
  {
    key: 'contact',
    name: 'Contact & Booking',
    icon: MessageSquare,
    badgeColor: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    description: 'Lead capture forms, promotional CTA strips, and physical studio location details.',
    designs: [
      {
        id: 'contact_form',
        type: 'contact',
        skeletonType: 'contact-split',
        name: 'Split Booking Form & Studio Details',
        tag: 'Lead Gen',
        features: ['Direct inquiry lead capture form', 'Service type and event date selector', 'Studio hours & 24-hour response guarantee'],
        defaultContent: {
          title: 'LET’S CREATE MAGIC TOGETHER',
          subtitle: 'Have an upcoming event or want a studio session? Send us your details below.',
        },
      },
      {
        id: 'contact_cta',
        type: 'cta',
        skeletonType: 'cta-banner',
        name: 'Full-Width Gold Promo Banner',
        tag: 'Urgency CTA',
        features: ['High-impact promotional ribbon with gold styling', 'Season calendar urgency hook', 'Instant booking button'],
        defaultContent: {
          heading: 'READY TO TURN YOUR MOMENTS INTO A MASTERPIECE?',
          subheading: 'Dates fill quickly for the upcoming season. Inquire now to secure your schedule.',
          button_text: 'BOOK YOUR SESSION',
          button_link: '#contact',
        },
      },
      {
        id: 'contact_location',
        type: 'location_map',
        skeletonType: 'location-map',
        name: 'Studio Location & Service Areas',
        tag: 'Studio Info',
        features: ['Physical studio address and appointment hours', 'Destination travel radius info', 'Contact numbers & email'],
        defaultContent: {
          title: 'STUDIO LOCATION & SERVICE AREAS',
          subtitle: 'Available for destination weddings across the Philippines and worldwide.',
          hours: 'Mon – Sat: 9:00 AM – 7:00 PM (By Appointment)',
        },
      },
    ],
  },
];

// Active selected category object
const activeCategory = computed(() => {
  return sectionCategoryCatalog.find((c) => c.key === activeCategoryKey.value) || sectionCategoryCatalog[0];
});

// All designs filtered by search query
const filteredCategoryDesigns = computed(() => {
  if (!searchQuery.value.trim()) {
    return activeCategory.value.designs;
  }
  const q = searchQuery.value.toLowerCase();
  return activeCategory.value.designs.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.tag?.toLowerCase().includes(q) ||
      d.features?.some((f) => f.toLowerCase().includes(q))
  );
});

// Total design count across all categories
const totalDesignsCount = computed(() => {
  return sectionCategoryCatalog.reduce((acc, cat) => acc + cat.designs.length, 0);
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
  searchQuery.value = '';
  isAddModalOpen.value = true;
}

function handleAddDesign(design) {
  const newSec = {
    id: `sec_${Date.now()}`,
    section_type: design.type,
    label: design.name,
    is_visible: true,
    sort_order: insertAtIndex.value !== null ? insertAtIndex.value + 1.5 : allSections.value.length + 1,
    content: JSON.parse(JSON.stringify(design.defaultContent)),
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
    <!-- Page Builder Action Bar -->
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
              <span class="text-[10px] text-neutral-400 uppercase tracking-wider">#{{ index + 1 }} • {{ sec.section_type }} {{ sec.content?.variant ? `(${sec.content.variant})` : '' }}</span>
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

    <!-- FULL PAGE LIVE VISUAL PREVIEW CANVAS -->
    <div class="rounded-3xl border border-white/[0.12] bg-[#141414] overflow-hidden shadow-2xl relative select-none isolate">
      <!-- Embedded Live Navbar -->
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
              :variant="sec.content?.variant"
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

          <!-- Hero Section Specific Fields & Design Variant Switcher -->
          <div v-if="editingSection.section_type === 'hero'" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Hero Visual Design Variant</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  v-for="v in [
                    { id: 'editorial', label: 'Luxury Editorial' },
                    { id: 'split_card', label: 'Split 2-Column' },
                    { id: 'minimalist_cinema', label: 'Minimalist Cinema' },
                    { id: 'bento', label: 'Bento Box' },
                    { id: 'video_reel', label: 'Video Reel' }
                  ]"
                  :key="v.id"
                  type="button"
                  @click="editingSection.content.variant = v.id"
                  class="p-2.5 rounded-xl border text-xs font-bold tracking-wide transition flex items-center justify-between"
                  :class="[
                    (editingSection.content.variant || 'editorial') === v.id
                      ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  ]"
                >
                  <span>{{ v.label }}</span>
                  <Check v-if="(editingSection.content.variant || 'editorial') === v.id" class="w-3.5 h-3.5 text-[#FFD700]" />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1">Heading Line 1</label>
                <input
                  type="text"
                  v-model="editingSection.content.heading_line1"
                  class="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1">Accent Word 1</label>
                <input
                  type="text"
                  v-model="editingSection.content.heading_accent1"
                  class="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1">Heading Line 2</label>
                <input
                  type="text"
                  v-model="editingSection.content.heading_line2"
                  class="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1">Accent Word 2</label>
                <input
                  type="text"
                  v-model="editingSection.content.heading_accent2"
                  class="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1">Subheading / Description</label>
              <textarea
                v-model="editingSection.content.subheading"
                rows="2"
                class="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  v-model="editingSection.content.cta_text"
                  class="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1">Background Image URL</label>
                <input
                  type="text"
                  v-model="editingSection.content.bg_image"
                  class="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>
          </div>

          <!-- Video Section Specific Fields -->
          <div v-else-if="editingSection.section_type === 'video'" class="space-y-3">
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

    <!-- ========================================================================= -->
    <!-- MASTER-DETAIL CATEGORIZED TEMPLATE SELECTION MODAL -->
    <!-- ========================================================================= -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        <!-- Modal Top Header Bar -->
        <div class="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-[#111111]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] flex items-center justify-center font-bold">
              <LayoutGrid class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-extrabold text-white tracking-wide">Section Template Studio</h3>
              <p class="text-xs text-neutral-400">Choose from {{ totalDesignsCount }}+ distinct visual design variations across {{ sectionCategoryCatalog.length }} categories</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Search Bar -->
            <div class="relative hidden sm:block w-64">
              <Search class="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search design layouts..."
                class="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFD700]"
              />
            </div>

            <!-- Close Button -->
            <button
              @click="isAddModalOpen = false"
              class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Master-Detail Body: Category Sidebar (Left) + Design Options Gallery (Right) -->
        <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          <!-- LEFT SIDEBAR: CATEGORIES LIST -->
          <div class="w-full md:w-72 bg-[#111111] border-b md:border-b-0 md:border-r border-white/[0.08] p-4 overflow-y-auto space-y-1.5 flex-shrink-0">
            <div class="px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Section Categories
            </div>

            <button
              v-for="cat in sectionCategoryCatalog"
              :key="cat.key"
              @click="activeCategoryKey = cat.key"
              class="w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 group"
              :class="[
                activeCategoryKey === cat.key
                  ? 'bg-white/[0.08] border border-[#FFD700]/50 shadow-md'
                  : 'hover:bg-white/[0.04] border border-transparent'
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition"
                  :class="[
                    activeCategoryKey === cat.key
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-white/[0.05] text-neutral-300 group-hover:text-white'
                  ]"
                >
                  <component :is="cat.icon" class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <h4
                    class="text-xs font-bold truncate transition"
                    :class="[activeCategoryKey === cat.key ? 'text-[#FFD700]' : 'text-neutral-200 group-hover:text-white']"
                  >
                    {{ cat.name }}
                  </h4>
                  <span class="text-[10px] text-neutral-500 block">{{ cat.designs.length }} visual designs</span>
                </div>
              </div>

              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition"
                :class="[
                  activeCategoryKey === cat.key
                    ? 'bg-[#FFD700]/20 text-[#FFD700]'
                    : 'bg-white/[0.04] text-neutral-500'
                ]"
              >
                {{ cat.designs.length }}
              </span>
            </button>
          </div>

          <!-- RIGHT GALLERY: DESIGN VARIATIONS FOR SELECTED CATEGORY -->
          <div class="flex-1 bg-[#141414] p-6 overflow-y-auto space-y-6">
            <!-- Category Header -->
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-bold text-white tracking-wide">{{ activeCategory.name }}</h3>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border" :class="activeCategory.badgeColor">
                    {{ filteredCategoryDesigns.length }} Designs Available
                  </span>
                </div>
                <p class="text-xs text-neutral-400 max-w-2xl">{{ activeCategory.description }}</p>
              </div>
            </div>

            <!-- Visual Design Variations Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div
                v-for="design in filteredCategoryDesigns"
                :key="design.id"
                @click="handleAddDesign(design)"
                class="p-4 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-[#FFD700] cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4 shadow-xl hover:scale-[1.01]"
              >
                <!-- Wireframe Layout Skeleton Preview -->
                <SectionSkeletonPreview :type="design.skeletonType || design.type" />

                <!-- Design Details -->
                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-sm font-bold text-white group-hover:text-[#FFD700] transition tracking-wide leading-snug">
                      {{ design.name }}
                    </h4>
                    <span
                      v-if="design.tag"
                      class="px-2 py-0.5 rounded-md bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                    >
                      {{ design.tag }}
                    </span>
                  </div>

                  <!-- Feature Bullets -->
                  <ul v-if="design.features" class="space-y-1 pt-1">
                    <li
                      v-for="(feat, fIdx) in design.features"
                      :key="fIdx"
                      class="text-[11px] text-neutral-400 flex items-center gap-1.5"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700]/70 flex-shrink-0"></span>
                      <span>{{ feat }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Footer Action -->
                <div class="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <span class="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
                    {{ design.type }} {{ design.variant ? `• ${design.variant}` : '' }}
                  </span>
                  <button
                    class="px-4 py-1.5 rounded-xl bg-[#FFD700] text-black text-xs font-bold group-hover:bg-yellow-400 transition flex items-center gap-1 shadow-md shadow-yellow-500/10"
                  >
                    <span>Use This Layout</span>
                    <span>+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
