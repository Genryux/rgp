<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useSections } from '../../../composables/useSections';
import { useGallery } from '../../../composables/useGallery';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';
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
  Diamond,
  Star,
  Film,
  Images,
  Tags,
  ArrowUpRight,
  PanelBottom,
  PanelTop,
  MessageSquare,
  ListOrdered,
  Search,
  Check,
  LayoutGrid,
  Image as ImageIcon,
  Folder as FolderIcon,
  Building2,
  Quote,
} from '@lucide/vue';
import { adminModalTokens } from '../../../lib/designTokens';

const emit = defineEmits(['switch-tab']);

const { allSections, saveSection, reorderSections, toggleSectionVisibility, deleteSection } = useSections();
const { gallery, folders, folderCounts } = useGallery();
const { packages, isGlobalPriceMasked } = usePackages();
const { openModal, closeModal } = useModalState();

const activePackagesList = computed(() => {
  return (packages.value || []).filter((p) => p.is_active);
});

function goToPackagesTab() {
  if (editingSection.value || isAddModalOpen.value || isDrawerOpen.value || isMediaPickerOpen.value) {
    closeModal();
  }
  editingSection.value = null;
  isDrawerOpen.value = false;
  isAddModalOpen.value = false;
  isMediaPickerOpen.value = false;
  emit('switch-tab', 'packages');
}

const editingSection = ref(null);
const isAddModalOpen = ref(false);
const isDrawerOpen = ref(false);
const insertAtIndex = ref(null);

// Media Picker Modal State for Hero & other background media selection
const isMediaPickerOpen = ref(false);
const mediaPickerActiveFolder = ref('All');
const mediaPickerSearch = ref('');

const pickerFilteredMedia = computed(() => {
  let list = gallery.value || [];
  if (mediaPickerActiveFolder.value !== 'All') {
    list = list.filter((item) => (item.category || 'General') === mediaPickerActiveFolder.value);
  }
  if (mediaPickerSearch.value.trim()) {
    const q = mediaPickerSearch.value.toLowerCase().trim();
    list = list.filter((item) => {
      const name = (item.title || item.image_url || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }
  return list;
});

const mediaPickerTargetField = ref('bg_image');

function openMediaPicker(targetField = 'bg_image') {
  mediaPickerTargetField.value = typeof targetField === 'string' ? targetField : 'bg_image';
  mediaPickerSearch.value = '';
  mediaPickerActiveFolder.value = 'All';
  isMediaPickerOpen.value = true;
}

function selectImageForHero(imageUrl) {
  if (editingSection.value && editingSection.value.content) {
    const target = typeof mediaPickerTargetField.value === 'string' ? mediaPickerTargetField.value : 'bg_image';
    if (target === 'image_url') {
      editingSection.value.content.image_url = imageUrl;
    } else if (target === 'featured_bg_image') {
      editingSection.value.content.featured_bg_image = imageUrl;
    } else if (target === 'before_image') {
      editingSection.value.content.before_image = imageUrl;
    } else if (target === 'after_image') {
      editingSection.value.content.after_image = imageUrl;
    } else if (target === 'carousel_add_image') {
      const items = getCarouselItems(editingSection.value.content);
      if (items.length < 10) {
        const defaultCategory = getCarouselCategories(editingSection.value.content)[0] || 'Weddings';
        items.push({
          id: 'curated_' + Date.now(),
          image_url: imageUrl,
          category: defaultCategory
        });
      }
    } else if (target.startsWith('carousel_item_image_')) {
      const idx = parseInt(target.replace('carousel_item_image_', ''), 10);
      const items = getCarouselItems(editingSection.value.content);
      if (items[idx]) {
        items[idx].image_url = imageUrl;
      }
    } else if (target.startsWith('testimonial_card_image_')) {
      const idx = parseInt(target.replace('testimonial_card_image_', ''), 10);
      const list = getTestimonialsList(editingSection.value.content);
      if (list[idx]) {
        list[idx].card_image = imageUrl;
        list[idx].image_url = imageUrl;
      }
    } else {
      editingSection.value.content.bg_source = 'image';
      editingSection.value.content.bg_image = imageUrl;
    }
  }
  isMediaPickerOpen.value = false;
}

function isCurrentPickerImage(imageUrl) {
  if (!editingSection.value?.content || !imageUrl) return false;
  const target = typeof mediaPickerTargetField.value === 'string' ? mediaPickerTargetField.value : 'bg_image';
  if (target === 'image_url') return editingSection.value.content.image_url === imageUrl;
  if (target === 'featured_bg_image') return editingSection.value.content.featured_bg_image === imageUrl;
  if (target === 'before_image') return editingSection.value.content.before_image === imageUrl;
  if (target === 'after_image') return editingSection.value.content.after_image === imageUrl;
  if (target.startsWith('carousel_item_image_')) {
    const idx = parseInt(target.replace('carousel_item_image_', ''), 10);
    const items = getCarouselItems(editingSection.value.content);
    return items[idx]?.image_url === imageUrl;
  }
  if (target.startsWith('testimonial_card_image_')) {
    const idx = parseInt(target.replace('testimonial_card_image_', ''), 10);
    const list = getTestimonialsList(editingSection.value.content);
    return (list[idx]?.card_image === imageUrl || list[idx]?.image_url === imageUrl);
  }
  return editingSection.value.content.bg_image === imageUrl;
}

function selectFolderForHero(folderName) {
  if (editingSection.value && editingSection.value.content) {
    editingSection.value.content.bg_source = 'folder';
    editingSection.value.content.bg_folder = folderName;
  }
}

function getFolderPreviewPhotos(folderName, limit = 4) {
  if (!gallery.value) return [];
  return gallery.value.filter((i) => i.category === folderName).slice(0, limit);
}

// Testimonials & Venues default state & helpers
const defaultTestimonialsList = [
  {
    client_name: 'Clarisse & Ethan',
    event: 'Church Wedding at Tagaytay Highlands',
    location: 'Tagaytay Highlands',
    card_image: '/images/1.jpg',
    quote: 'RGP Films captured the warmth and genuine joy of our wedding day so flawlessly. Looking back at the photos brings tears to our eyes!',
    rating: 5,
  },
  {
    client_name: 'Jessica & Marcus',
    event: 'Grand Debut at Palacio de Memoria',
    location: 'Palacio de Memoria',
    card_image: '/images/2.jpg',
    quote: 'The team was so fun and professional to work with! The same-day edit reel brought everyone to tears at our reception.',
    rating: 5,
  },
  {
    client_name: 'Patricia & Daniel',
    event: 'Beach Wedding at Balesin Island Club',
    location: 'Balesin Island Club',
    card_image: '/images/3.jpg',
    quote: 'Their attention to detail and ability to capture candid emotion without feeling intrusive was extraordinary.',
    rating: 5,
  },
  {
    client_name: 'Sophia & Miguel',
    event: 'Vineyard Vows at Antonio’s Tagaytay',
    location: 'Antonio’s Tagaytay',
    card_image: '/images/4.jpg',
    quote: 'From pre-nup preparations to the final sparkler send-off, every single moment was preserved in unforgettable, breathtaking elegance.',
    rating: 5,
  },
];

const defaultVenuesList = [
  'Tagaytay Highlands',
  'Palacio de Memoria',
  'The Manila Hotel',
  'Antonio’s Garden',
  'Balesin Island Club',
  'Shangri-La at The Fort',
  'Pinto Art Museum',
  'Club Ananda Tagaytay',
];

const newVenueInput = ref('');

function getTestimonialsList(content) {
  if (!content) return [];
  if (!content.testimonials || !Array.isArray(content.testimonials)) {
    content.testimonials = JSON.parse(JSON.stringify(defaultTestimonialsList));
  }
  return content.testimonials;
}

function getVenuesList(content) {
  if (!content) return [];
  if (!content.venues || !Array.isArray(content.venues)) {
    content.venues = [...defaultVenuesList];
  }
  return content.venues;
}

function addVenue() {
  if (!newVenueInput.value.trim() || !editingSection.value?.content) return;
  const list = getVenuesList(editingSection.value.content);
  list.push(newVenueInput.value.trim());
  newVenueInput.value = '';
}

function removeVenue(idx) {
  if (!editingSection.value?.content) return;
  const list = getVenuesList(editingSection.value.content);
  list.splice(idx, 1);
}

function addTestimonial() {
  if (!editingSection.value?.content) return;
  const list = getTestimonialsList(editingSection.value.content);
  if (list.length >= 10) return;
  list.push({
    client_name: '',
    event: '',
    location: '',
    card_image: `/images/${(list.length % 6) + 1}.jpg`,
    quote: '',
    rating: 5,
  });
}

function removeTestimonial(idx) {
  if (!editingSection.value?.content) return;
  const list = getTestimonialsList(editingSection.value.content);
  list.splice(idx, 1);
}

// Editorial Quotes (testimonials_featured) default state & helpers
const defaultFeaturedQuotesList = [
  {
    quote: 'Working with RGP Films was the single best decision we made for our wedding. The team made us feel completely natural in front of the lens, and our 4K film feels like a genuine cinematic masterpiece.',
    client_name: 'Clarisse & Ethan Morales',
    event: 'Tagaytay Highlands Church Wedding',
  },
  {
    quote: 'The level of artistry and emotional storytelling blew us away. Watching our wedding film was like reliving the most magical day of our lives all over again.',
    client_name: 'Jessica & Marcus Tan',
    event: 'Palacio de Memoria Grand Reception',
  },
  {
    quote: 'Unobtrusive, supremely professional, and incredibly gifted. They captured glances and tears we didn’t even realize happened. Worth every single cent.',
    client_name: 'Patricia & Daniel Gomez',
    event: 'Balesin Island Club Destination Wedding',
  },
];

function getFeaturedQuotesList(content) {
  if (!content) return [];
  if (!content.featured_quotes || !Array.isArray(content.featured_quotes) || content.featured_quotes.length === 0) {
    if (content.featured_quote) {
      content.featured_quotes = [
        {
          quote: content.featured_quote,
          client_name: content.featured_client || '',
          event: content.featured_event || '',
        },
      ];
    } else {
      content.featured_quotes = JSON.parse(JSON.stringify(defaultFeaturedQuotesList));
    }
  }
  return content.featured_quotes;
}

function syncFeaturedLegacy() {
  if (!editingSection.value?.content) return;
  const list = editingSection.value.content.featured_quotes;
  if (list && list.length > 0) {
    editingSection.value.content.featured_quote = list[0].quote || '';
    editingSection.value.content.featured_client = list[0].client_name || '';
    editingSection.value.content.featured_event = list[0].event || '';
  }
}

function addFeaturedQuote() {
  if (!editingSection.value?.content) return;
  const list = getFeaturedQuotesList(editingSection.value.content);
  if (list.length >= 10) return;
  list.push({
    quote: '',
    client_name: '',
    event: '',
  });
  syncFeaturedLegacy();
}

function removeFeaturedQuote(idx) {
  if (!editingSection.value?.content) return;
  const list = getFeaturedQuotesList(editingSection.value.content);
  if (list.length <= 1) return;
  list.splice(idx, 1);
  syncFeaturedLegacy();
}

// Curated Featured Works (Carousel) Helpers
const newCarouselCategoryInput = ref('');

function getCarouselItems(content) {
  if (!content) return [];
  if (!Array.isArray(content.items)) {
    content.items = [];
  }
  return content.items;
}

function getCarouselCategories(content) {
  if (!content) return [];
  if (!Array.isArray(content.categories)) {
    content.categories = ['Weddings', 'Portraits', 'Commercial'];
  }
  return content.categories;
}

function addCarouselCategory() {
  if (!editingSection.value?.content) return;
  const name = newCarouselCategoryInput.value.trim();
  if (!name) return;
  const categories = getCarouselCategories(editingSection.value.content);
  if (!categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
    categories.push(name);
  }
  newCarouselCategoryInput.value = '';
}

function removeCarouselCategory(index) {
  if (!editingSection.value?.content) return;
  const categories = getCarouselCategories(editingSection.value.content);
  categories.splice(index, 1);
}

function removeCarouselItem(index) {
  if (!editingSection.value?.content) return;
  const items = getCarouselItems(editingSection.value.content);
  items.splice(index, 1);
}

function moveCarouselItem(index, direction) {
  if (!editingSection.value?.content) return;
  const items = getCarouselItems(editingSection.value.content);
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return;
  const temp = items[index];
  items[index] = items[targetIndex];
  items[targetIndex] = temp;
}

let hasOpenedModal = false;
watch(
  () => Boolean(isAddModalOpen.value || editingSection.value || isDrawerOpen.value || isMediaPickerOpen.value),
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      hasOpenedModal = true;
      openModal();
    } else if (!isOpen && wasOpen) {
      hasOpenedModal = false;
      closeModal();
    }
  }
);

onUnmounted(() => {
  if (hasOpenedModal || isAddModalOpen.value || editingSection.value || isDrawerOpen.value || isMediaPickerOpen.value) {
    closeModal();
    hasOpenedModal = false;
  }
});

const activeCategoryKey = ref('navbar');
const searchQuery = ref('');

const sectionComponents = {
  hero: HeroSection,
  carousel: CarouselSection,
  filmstrip: CarouselSection,
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
  venues: TestimonialsSection,
  gear: GearSection,
  instagram: InstagramFeedSection,
  location_map: LocationMapSection,
  before_after: BeforeAfterSection,
  navbar: Navbar,
  footer: Footer,
};

// =========================================================================
// 9 DISTINCT CATEGORIES WITH EXACTLY 4 BLOCKS EACH (36 BLOCKS TOTAL)
// =========================================================================
const sectionCategoryCatalog = [
  // -----------------------------------------------------------------------
  // 1. NAVBAR COMPONENT (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'navbar',
    name: 'Navbar Component',
    icon: PanelTop,
    badgeColor: 'text-neutral-300 bg-white/10 border-white/15',
    description: 'Floating glassmorphism island, simple translucent split bar with center logo, centered monogram, and dynamic translucent bar.',
    designs: [
      {
        id: 'navbar_floating',
        type: 'navbar',
        variant: 'floating',
        skeletonType: 'navbar-floating',
        name: 'Floating Glass Island Navbar',
        tag: 'Modern Island',
        features: ['Floating pill container with frosted backdrop blur', 'Non-negotiable 5 navigation links', 'High-contrast Book Now button'],
        defaultContent: {
          variant: 'floating',
          cta_text: 'Book Now',
        },
      },
      {
        id: 'navbar_fullwidth',
        type: 'navbar',
        variant: 'fullwidth',
        skeletonType: 'navbar-fullwidth',
        name: 'Simple Translucent Split Navbar (Center Logo)',
        tag: 'Translucent Split',
        features: ['Left Portfolio & Pricing links', 'Center Studio Logo as Home button', 'Right Gallery & Contact links'],
        defaultContent: {
          variant: 'fullwidth',
        },
      },
      {
        id: 'navbar_centered',
        type: 'navbar',
        variant: 'centered',
        skeletonType: 'navbar-centered',
        name: 'Centered Luxury Monogram Header',
        tag: 'Clean Monogram',
        features: ['Prominent centered brand logo', 'Non-negotiable 5 symmetrical navigation links', 'High-fashion minimalist aesthetic'],
        defaultContent: {
          variant: 'centered',
        },
      },
      {
        id: 'navbar_dynamic',
        type: 'navbar',
        variant: 'dynamic',
        skeletonType: 'navbar-dynamic',
        name: 'Dynamic Translucent Header',
        tag: 'Translucent Glass',
        features: ['Smooth scroll-aware glass backdrop', 'Non-negotiable 5 navigation links', 'High-contrast Book Now CTA'],
        defaultContent: {
          variant: 'dynamic',
          cta_text: 'Book Now',
        },
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 2. HERO SECTION (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'hero',
    name: 'Hero Section',
    icon: Crown,
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    description: 'The commanding opening statement with headline typography, booking CTAs, and background media.',
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
          cta_text: 'BOOK A SESSION',
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
        features: ['Left-aligned headline with gold radial accent', 'Clean right-framed visual showcase', 'Dynamic milestone credibility stats'],
        defaultContent: {
          variant: 'split_card',
          badge_text: 'Premium Visual Storytelling',
          heading_line1: 'Turning',
          heading_accent1: 'Moments',
          heading_line2: 'into',
          heading_accent2: 'Masterpiece.',
          subheading: 'Specialized in editorial wedding cinema, intimate portraits, and high-impact commercial campaigns.',
          stat1_value: '5+ Years',
          stat1_label: 'Crafting Stories',
          stat2_value: '250+',
          stat2_label: 'Events Captured',
          stat3_value: '100%',
          stat3_label: 'Bespoke Color Graded',
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
          badge_text: 'RGP Films & Studio • Est. 2019',
          heading_line1: 'CINEMATIC',
          heading_accent1: 'Artistry',
          heading_line2: 'into',
          heading_accent2: 'FOR YOUR STORY',
          subheading: 'Crafting evocative, documentary-grade films and photography for discerning couples and brands.',
          cta_text: 'CHECK AVAILABILITY',
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

  // -----------------------------------------------------------------------
  // 2. FEATURES SECTION (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'features',
    name: 'Features Section',
    icon: Sparkles,
    badgeColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    description: 'Studio highlights, milestone statistics, 4-step booking workflow, camera rig arsenal, and philosophy.',
    designs: [
      {
        id: 'features_grid',
        type: 'about',
        variant: 'features_grid',
        skeletonType: 'features-grid',
        name: '3-Column Studio Highlights & Stats',
        tag: 'Milestones',
        features: ['5+ Years, 250+ Events, 100% Satisfaction counters', 'Lead photographer portrait card', 'Studio philosophy statement'],
        defaultContent: {
          title: 'Why Choose RGP Studio',
          subtitle: 'Passionate visual storytellers dedicated to preserving your moments forever in timeless elegance.',
          experience_years: '5+',
          events_covered: '250+',
          satisfaction_rate: '100%',
          image_url: '/images/main-shot.jpg',
        },
      },
      {
        id: 'process_timeline',
        type: 'process',
        variant: 'process',
        skeletonType: 'process-timeline',
        name: 'Step-by-Step Workflow Journey',
        tag: 'Workflow',
        features: ['Numbered gold step badges (01, 02, etc.)', 'Dynamic step builder with add/remove actions', 'Builds clear expectations for clients'],
        defaultContent: {
          badge_text: 'HOW WE WORK',
          title: 'OUR CLIENT PROCESS',
          subtitle: 'From your initial inquiry to the final delivery of your timeless gallery',
          steps: [
            { step: '01', title: 'Consultation & Date Lock', desc: 'We discuss your vision and secure your date with a reservation deposit.' },
            { step: '02', title: 'Pre-Event Planning', desc: 'We coordinate mood boards, shot lists, and lighting strategy.' },
            { step: '03', title: 'The Shoot Day', desc: 'Our experienced team captures every genuine emotion and milestone.' },
            { step: '04', title: 'Master Retouching & Delivery', desc: 'Sneak peeks in 48 hours, followed by complete 4K galleries.' },
          ],
        },
      },
      {
        id: 'gear_arsenal',
        type: 'gear',
        variant: 'gear',
        skeletonType: 'gear-arsenal',
        name: 'Camera & Cinema Gear Arsenal',
        tag: 'Technical Rig',
        features: ['Dynamic equipment category cards', 'Sony cinema bodies, prime lenses & drone lists', 'Builds deep client confidence in production quality'],
        defaultContent: {
          badge_text: 'PRODUCTION STANDARDS',
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
        id: 'story_manifesto',
        type: 'text_block',
        variant: 'manifesto',
        skeletonType: 'story-manifesto',
        name: 'Studio Story & Philosophy Manifesto',
        tag: 'Storytelling',
        features: ['Focused clean editorial typography', 'Full-width reading layout', 'Ideal for preparation guidelines or studio philosophy'],
        defaultContent: {
          title: 'Our Studio Philosophy',
          body: 'We believe that every love story, celebration, and portrait is a piece of art waiting to be captured with authentic emotion and timeless color grading.',
        },
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3. PRICING COMPONENT (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'pricing',
    name: 'Pricing Component',
    icon: Diamond,
    badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    description: 'Display tailored pricing tiers, spotlight packages, deliverables checklists, and comparison matrices.',
    designs: [
      {
        id: 'pricing_tiered',
        type: 'rates',
        variant: 'pricing_tiered',
        skeletonType: 'pricing-tiered',
        name: '3-Tier Luxury Pricing Cards',
        tag: 'Best for Sales',
        features: ['Bronze, Silver, Gold package tiers', 'Highlighted "Most Popular" center card', 'Checkmark inclusions & instant inquiry trigger'],
        defaultContent: {
          title: 'PACKAGES & RATES',
          subtitle: 'Tailored full-coverage packages crafted for weddings, celebrations, and studio portraits.',
          variant: 'pricing_tiered',
        },
      },
      {
        id: 'pricing_spotlight',
        type: 'rates',
        variant: 'pricing_spotlight',
        skeletonType: 'pricing-spotlight',
        name: 'Single All-Inclusive Spotlight',
        tag: 'VIP Signature',
        features: ['Interactive multi-tier plan selector', 'Real-time feature inclusions list', 'Instant purchase CTA with 5% discount toggle'],
        defaultContent: {
          title: 'Find the Perfect Plan for You!',
          subtitle: 'Explore Our Wide Range of Plans, Compare Features, and Select the One That Perfectly Matches Your Needs and Budget',
          button_text: 'Purchase Now',
          variant: 'pricing_spotlight',
        },
      },
      {
        id: 'pricing_addons',
        type: 'rates',
        variant: 'pricing_addons',
        skeletonType: 'pricing-addons',
        name: 'A La Carte Deliverables & Add-ons',
        tag: 'Customizable',
        features: ['Drone coverage, SDE reels & luxury albums checklist', 'Itemized pricing with gold badges', 'Direct add-to-inquiry trigger'],
        defaultContent: {
          title: 'A LA CARTE DELIVERABLES',
          subtitle: 'Personalize your core coverage with specialized drone operations, handcrafted heirlooms, and same-day edits.',
          button_text: 'Inquire Add-on',
          variant: 'pricing_addons',
          bg_type: 'solid_glow',
          bg_image: '/images/hero-bg.jpg',
        },
      },
      {
        id: 'pricing_comparison',
        type: 'rates',
        variant: 'pricing_comparison',
        skeletonType: 'pricing-comparison',
        name: 'Feature Comparison Matrix Table',
        tag: 'Transparent',
        features: ['Side-by-side deliverable matrix', 'Green checkmark indicators for tier inclusions', 'Clear hour counts and shooter breakdown'],
        defaultContent: {
          title: 'COMPREHENSIVE PACKAGE BREAKDOWN',
          subtitle: 'Side-by-side comparison of deliverables across our cinema and photography tiers.',
          variant: 'pricing_comparison',
        },
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4. TESTIMONIALS COMPONENT (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'testimonials',
    name: 'Testimonials Component',
    icon: Star,
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    description: 'Client reviews, dual spotlight cards, full-width editorial quotes, and partner venue tickers.',
    designs: [
      {
        id: 'testimonials_dual',
        type: 'testimonials',
        variant: 'testimonials_dual',
        skeletonType: 'testimonials-dual',
        name: 'Image Review Cards',
        tag: 'Screenshot Proof',
        features: ['Full-bleed review screenshot cards', 'Interactive carousel slider with lightbox zoom', 'Upload client review screenshots (Google, FB, IG)'],
        defaultContent: {
          title: 'WHAT OUR CLIENTS SAY',
          subtitle: 'Honest reviews from couples and clients whose milestones we captured.',
          variant: 'testimonials_dual',
        },
      },
      {
        id: 'testimonials_grid',
        type: 'testimonials',
        variant: 'testimonials_grid',
        skeletonType: 'testimonials-grid',
        name: '3-Column Client Review Wall',
        tag: 'High Volume',
        features: ['3-column luxury masonry review cards', 'Couple names, milestone venues & quote snippets', 'Heart & verified badge accents'],
        defaultContent: {
          title: 'LOVE LETTERS & REVIEWS',
          subtitle: 'Real stories from couples who trusted RGP Studio for their milestones.',
          variant: 'testimonials_grid',
        },
      },
      {
        id: 'testimonials_featured',
        type: 'testimonials',
        variant: 'testimonials_featured',
        skeletonType: 'testimonials-featured',
        name: 'Full-Width Editorial Client Quote',
        tag: 'Editorial Spotlight',
        features: ['Centered large typographic testimonial quote', 'Ambient gold halo backdrop', 'Venue & wedding couple attribution'],
        defaultContent: {
          title: 'WORDS FROM OUR COUPLES',
          subtitle: 'A heartfelt moment from our recent wedding coverage.',
          variant: 'testimonials_featured',
        },
      },
      {
        id: 'trust_venues',
        type: 'testimonials',
        variant: 'trust_venues',
        skeletonType: 'trust-venues',
        name: 'Partnered Venues & Luxury Hotels Marquee',
        tag: 'Venue Proof',
        features: ['Continuous animated marquee ticker', 'Prestigious hotel & wedding venue names', 'Builds luxury destination credibility'],
        defaultContent: {
          title: 'TRUSTED & FEATURED AT PREMIER VENUES',
          badge_text: 'FEATURED LOCATIONS & COLLABORATORS',
          variant: 'trust_venues',
          venues: [
            'Tagaytay Highlands',
            'Palacio de Memoria',
            'The Manila Hotel',
            'Antonio’s Garden',
            'Balesin Island Club',
            'Shangri-La at The Fort',
            'Pinto Art Museum',
            'Club Ananda Tagaytay',
          ],
        },
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5. PORTFOLIO (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'portfolio',
    name: 'Portfolio',
    icon: Film,
    badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    description: '4K cinema video player, interactive retouching comparison slider, curated slider, and filmstrips.',
    designs: [
      {
        id: 'portfolio_video',
        type: 'video',
        variant: 'video',
        skeletonType: 'portfolio-video',
        name: '4K Cinema Video Reel Player',
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
        id: 'portfolio_before_after',
        type: 'before_after',
        variant: 'before_after',
        skeletonType: 'portfolio-before-after',
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
        id: 'portfolio_curated',
        type: 'carousel',
        variant: 'carousel',
        skeletonType: 'portfolio-curated',
        name: 'Curated Featured Works Slider',
        tag: 'Portfolio Carousel',
        features: ['Infinite auto-scrolling card slider', 'Category switcher pills', 'Lightbox preview on click'],
        defaultContent: {
          variant: 'carousel',
          title: 'Featured Works',
          subtitle: 'Explore our latest wedding, portrait, and commercial highlights',
        },
      },
      {
        id: 'portfolio_filmstrip',
        type: 'carousel',
        variant: 'filmstrip',
        skeletonType: 'portfolio-filmstrip',
        name: 'Editorial Filmstrip & Milestone Reels',
        tag: 'Filmstrip Flow',
        features: ['Perforated cinematic filmstrip layout', 'Horizontal smooth track navigation', 'Perfect for documentary vignettes'],
        defaultContent: {
          variant: 'filmstrip',
          title: 'CINEMATIC FILM REELS',
          subtitle: 'Snapshot frames and documentary highlights from recent events',
        },
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6. GALLERY COMPONENT (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'gallery',
    name: 'Gallery Component',
    icon: Images,
    badgeColor: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    description: 'Masonry photo collection, 3D carousel, Instagram social snapshot wall, and edge-to-edge mosaic.',
    designs: [
      {
        id: 'gallery_masonry',
        type: 'gallery_grid',
        variant: 'masonry',
        skeletonType: 'gallery-masonry',
        name: 'Masonry Photo Collection Grid',
        tag: 'Editorial Grid',
        features: ['Multi-column luxury photo wall', 'Hover caption reveals & category filters', 'Optimized client-side WebP loading'],
        defaultContent: {
          title: 'Gallery Collection',
          subtitle: 'Selected moments and creative portraits',
          limit: 8,
          variant: 'masonry',
        },
      },
      {
        id: 'gallery_carousel',
        type: 'carousel',
        variant: 'carousel',
        skeletonType: 'gallery-carousel',
        name: 'Infinite 3-Card 3D Showcase Carousel',
        tag: '3D Flow',
        features: ['Centered active focus slide', 'Left and right faded background cards', 'Smooth touch/swipe gestures'],
        defaultContent: {
          title: 'Visual Showcase',
          subtitle: 'Interactive swipeable gallery cards with category switching',
        },
      },
      {
        id: 'gallery_instagram',
        type: 'instagram',
        variant: 'instagram',
        skeletonType: 'gallery-instagram',
        name: 'Instagram Social Snapshot Wall',
        tag: 'Social Proof',
        features: ['6-photo social snapshot grid', 'Direct profile handle link', 'Follow CTA for daily updates'],
        defaultContent: {
          title: 'FOLLOW OUR VISUAL JOURNEY',
          handle: '@rgpfilmsstudio',
        },
      },
      {
        id: 'gallery_mosaic',
        type: 'gallery_grid',
        variant: 'mosaic',
        skeletonType: 'gallery-mosaic',
        name: 'Edge-to-Edge Mosaic Photo Wall',
        tag: 'Edge-to-Edge',
        features: ['Full-bleed seamless photo mosaic', '12-item compact luxury preview grid', 'Hover glow effects and title badges'],
        defaultContent: {
          title: 'CINEMATIC MOMENTS MOSAIC',
          subtitle: 'A vibrant collection of real emotions, celebrations, and portraits',
          limit: 12,
          variant: 'mosaic',
        },
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7. FOOTER COMPONENT (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'footer',
    name: 'Footer Component',
    icon: PanelBottom,
    badgeColor: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    description: '4-column studio hub, centered minimalist luxury, VIP newsletter lead capture, and split studio map.',
    designs: [
      {
        id: 'footer_multi_column',
        type: 'footer',
        variant: 'multi_column',
        skeletonType: 'footer-multi-column',
        name: '4-Column Studio Hub Footer',
        tag: 'Standard Hub',
        features: ['Brand story & social icons', 'Quick navigation links & booking hours', 'Copyright & developer credits bar'],
        defaultContent: {
          variant: 'multi_column',
          tagline: 'Turning Moments into Masterpiece. Premium wedding cinematography, portraits, and commercial visual production.',
        },
      },
      {
        id: 'footer_minimal',
        type: 'footer',
        variant: 'minimal',
        skeletonType: 'footer-minimal',
        name: 'Centered Minimalist Luxury Footer',
        tag: 'Clean & Modern',
        features: ['Centered gold brand typography', 'Inline sleek navigation links', 'Compact copyright footer'],
        defaultContent: {
          variant: 'minimal',
          tagline: 'RGP FILMS & PHOTOGRAPHY STUDIO',
        },
      },
      {
        id: 'footer_newsletter',
        type: 'footer',
        variant: 'newsletter',
        skeletonType: 'footer-newsletter',
        name: 'VIP Newsletter & Booking CTA Footer',
        tag: 'Lead Capture',
        features: ['VIP email newsletter signup field', 'Seasonal booking notification hook', 'Studio contact channels & social links'],
        defaultContent: {
          variant: 'newsletter',
          tagline: 'Join our private client journal for seasonal booking updates and photography tips.',
        },
      },
      {
        id: 'footer_split_map',
        type: 'footer',
        variant: 'split_map',
        skeletonType: 'footer-split-map',
        name: 'Split Studio Map & Hours Footer',
        tag: 'Local Studio',
        features: ['Studio appointment hours & hotline', 'Embedded interactive location map pin', 'Destination coverage notice'],
        defaultContent: {
          variant: 'split_map',
          tagline: 'Visit our creative studio by appointment.',
        },
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 9. CONTACT US PAGE (4 BLOCKS)
  // -----------------------------------------------------------------------
  {
    key: 'contact',
    name: 'Contact Us Page',
    icon: MessageSquare,
    badgeColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    description: 'Split booking inquiry form, physical studio location details, FAQ accordion objection buster, and full-width promo banner.',
    designs: [
      {
        id: 'contact_split',
        type: 'contact',
        variant: 'split',
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
        id: 'contact_location_map',
        type: 'location_map',
        variant: 'location_map',
        skeletonType: 'contact-location-map',
        name: 'Studio Location & Service Areas',
        tag: 'Studio Info',
        features: ['Physical studio address and appointment hours', 'Destination travel radius info', 'Contact numbers & email'],
        defaultContent: {
          title: 'STUDIO LOCATION & SERVICE AREAS',
          subtitle: 'Available for destination weddings across the Philippines and worldwide.',
          hours: 'Mon – Sat: 9:00 AM – 7:00 PM (By Appointment)',
        },
      },
      {
        id: 'contact_faq',
        type: 'faq',
        variant: 'faq',
        skeletonType: 'contact-faq',
        name: 'FAQ Accordion Objection Buster',
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
      {
        id: 'contact_cta_banner',
        type: 'cta',
        variant: 'cta_banner',
        skeletonType: 'contact-cta-banner',
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

// Total design count across all categories (9 * 4 = 36)
const totalDesignsCount = computed(() => {
  return sectionCategoryCatalog.reduce((acc, cat) => acc + cat.designs.length, 0);
});

const hasNavbarSection = computed(() => allSections.value.some((s) => s.section_type === 'navbar'));
const hasFooterSection = computed(() => allSections.value.some((s) => s.section_type === 'footer'));

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
  if (editingSection.value && (editingSection.value.section_type === 'venues' || (editingSection.value.section_type === 'testimonials' && editingSection.value.content?.variant === 'trust_venues'))) {
    editingSection.value.section_type = 'testimonials';
    if (!editingSection.value.content) editingSection.value.content = {};
    editingSection.value.content.variant = 'trust_venues';
    if (!editingSection.value.content.venues || !Array.isArray(editingSection.value.content.venues) || editingSection.value.content.venues.length === 0) {
      editingSection.value.content.venues = [...defaultVenuesList];
    }
  }
  if (editingSection.value && editingSection.value.section_type === 'process') {
    if (!editingSection.value.content) editingSection.value.content = {};
    if (!Array.isArray(editingSection.value.content.steps) || editingSection.value.content.steps.length === 0) {
      editingSection.value.content.steps = [
        { step: '01', title: 'Consultation & Date Lock', desc: 'We discuss your vision, event timeline, and secure your date with a reservation deposit.' },
        { step: '02', title: 'Pre-Event Planning', desc: 'We coordinate mood boards, shot lists, location scouting, and lighting strategy.' },
        { step: '03', title: 'The Shoot Day', desc: 'Our experienced team captures every genuine emotion, unscripted laugh, and milestone.' },
        { step: '04', title: 'Master Retouching & Delivery', desc: 'Sneak peeks in 48 hours, followed by complete color-graded galleries and 4K reels.' },
      ];
    }
  }
  if (editingSection.value && editingSection.value.section_type === 'gear') {
    if (!editingSection.value.content) editingSection.value.content = {};
    if (!Array.isArray(editingSection.value.content.categories) || editingSection.value.content.categories.length === 0) {
      editingSection.value.content.categories = [
        { group: 'Cameras & Cinema Bodies', items: ['Sony A7S III (4K 120fps Cinema)', 'Sony A7 IV Full-Frame Bodies', 'Blackmagic Cinema Rig'] },
        { group: 'Prime & Zoom Lenses', items: ['Sony G-Master 24-70mm f/2.8 II', 'Sony G-Master 70-200mm f/2.8', 'Sony 50mm & 85mm f/1.4 Primes'] },
        { group: 'Aerial & Stabilization', items: ['DJI Mavic 3 Cine 5.1K Drone', 'DJI RS3 Pro Gimbal Stabilizer', 'Wireless Video Transmitters'] },
        { group: 'Audio & Studio Lighting', items: ['Godox AD600 Pro High-Speed Strobes', 'Sennheiser Wireless Lav Mics', 'Aputure Amaran Studio LED Kits'] },
      ];
    }
  }
  if (editingSection.value && (editingSection.value.section_type === 'carousel' || editingSection.value.section_type === 'filmstrip')) {
    if (!editingSection.value.content) editingSection.value.content = {};
    if (editingSection.value.label?.toLowerCase().includes('filmstrip') && !editingSection.value.content.variant) {
      editingSection.value.content.variant = 'filmstrip';
    }
    if (!editingSection.value.content.variant) {
      editingSection.value.content.variant = 'carousel';
    }
    if (!Array.isArray(editingSection.value.content.categories) || editingSection.value.content.categories.length === 0) {
      editingSection.value.content.categories = ['Weddings', 'Portraits', 'Commercial'];
    }
    if (!Array.isArray(editingSection.value.content.items) || editingSection.value.content.items.length === 0) {
      editingSection.value.content.items = [
        { id: 'curated_1', image_url: '/images/1.jpg', category: 'Weddings', title: 'Sunset Vows Sequence' },
        { id: 'curated_2', image_url: '/images/2.jpg', category: 'Weddings', title: 'Cathedral Processional' },
        { id: 'curated_3', image_url: '/images/3.jpg', category: 'Portraits', title: 'Editorial Bride Silhouette' },
        { id: 'curated_4', image_url: '/images/4.jpg', category: 'Commercial', title: 'Fashion Campaign Motion' },
        { id: 'curated_5', image_url: '/images/5.jpg', category: 'Portraits', title: 'Studio Vignette Master' },
        { id: 'curated_6', image_url: '/images/6.jpg', category: 'Weddings', title: 'First Dance Euphoria' },
      ];
    }
  }
}

function addProcessStep() {
  if (!editingSection.value || !editingSection.value.content) return;
  if (!Array.isArray(editingSection.value.content.steps)) {
    editingSection.value.content.steps = [];
  }
  const nextIdx = editingSection.value.content.steps.length + 1;
  const stepNum = nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`;
  editingSection.value.content.steps.push({
    step: stepNum,
    title: '',
    desc: '',
  });
}

function removeProcessStep(index) {
  if (!editingSection.value || !editingSection.value.content || !Array.isArray(editingSection.value.content.steps)) return;
  editingSection.value.content.steps.splice(index, 1);
}

function moveProcessStep(index, direction) {
  if (!editingSection.value || !editingSection.value.content || !Array.isArray(editingSection.value.content.steps)) return;
  const list = editingSection.value.content.steps;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= list.length) return;
  const item = list.splice(index, 1)[0];
  list.splice(targetIndex, 0, item);
}

function addGearCategory() {
  if (!editingSection.value || !editingSection.value.content) return;
  if (!Array.isArray(editingSection.value.content.categories)) {
    editingSection.value.content.categories = [];
  }
  editingSection.value.content.categories.push({
    group: 'New Gear Category',
    items: ['Equipment item description...'],
  });
}

function removeGearCategory(index) {
  if (!editingSection.value || !editingSection.value.content || !Array.isArray(editingSection.value.content.categories)) return;
  editingSection.value.content.categories.splice(index, 1);
}

function moveGearCategory(index, direction) {
  if (!editingSection.value || !editingSection.value.content || !Array.isArray(editingSection.value.content.categories)) return;
  const list = editingSection.value.content.categories;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= list.length) return;
  const item = list.splice(index, 1)[0];
  list.splice(targetIndex, 0, item);
}

function addGearItem(catIndex) {
  if (!editingSection.value || !editingSection.value.content?.categories?.[catIndex]) return;
  const cat = editingSection.value.content.categories[catIndex];
  if (!Array.isArray(cat.items)) cat.items = [];
  cat.items.push('');
}

function removeGearItem(catIndex, itemIndex) {
  if (!editingSection.value || !editingSection.value.content?.categories?.[catIndex]?.items) return;
  editingSection.value.content.categories[catIndex].items.splice(itemIndex, 1);
}

function handleSaveEdit() {
  if (editingSection.value) {
    if (editingSection.value.section_type === 'testimonials' && editingSection.value.content?.variant === 'testimonials_featured') {
      syncFeaturedLegacy();
    }
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
  if (design.type === 'navbar') {
    // If a navbar section already exists, update its variant and content directly
    const existingNavbarIndex = allSections.value.findIndex((s) => s.section_type === 'navbar');
    if (existingNavbarIndex !== -1) {
      const existingNavbar = allSections.value[existingNavbarIndex];
      const updatedNavbar = {
        ...existingNavbar,
        label: design.name,
        content: JSON.parse(JSON.stringify(design.defaultContent)),
        is_visible: true,
      };
      saveSection(updatedNavbar);
    } else {
      const newSec = {
        id: `sec_${Date.now()}`,
        section_type: 'navbar',
        label: design.name,
        is_visible: true,
        sort_order: 0.5,
        content: JSON.parse(JSON.stringify(design.defaultContent)),
      };
      const list = [newSec, ...allSections.value];
      saveSection(newSec);
      reorderSections(list.map((s) => s.id));
    }

    isAddModalOpen.value = false;
    insertAtIndex.value = null;
    // Directly applied without opening edit modal
    return;
  }

  const newSec = {
    id: `sec_${Date.now()}`,
    section_type: design.type,
    label: design.name,
    is_visible: true,
    sort_order: insertAtIndex.value !== null
      ? insertAtIndex.value + 1.5
      : allSections.value.length + 1,
    content: JSON.parse(JSON.stringify(design.defaultContent)),
  };

  if (design.variant && !newSec.content.variant) {
    newSec.content.variant = design.variant;
  }

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
      <!-- Prompt when no Navbar block exists in active flow -->
      <div v-if="!hasNavbarSection" class="p-4 border-2 border-dashed border-amber-400/30 rounded-2xl bg-amber-400/[0.03] flex flex-wrap items-center justify-between gap-4 px-6 m-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
            <PanelTop class="w-4 h-4" />
          </div>
          <div class="text-left">
            <h4 class="text-xs font-bold text-white">No Navigation Bar in Page Flow</h4>
            <p class="text-[11px] text-neutral-400">Add a luxury floating, full-width, centered, or dynamic navbar to your page</p>
          </div>
        </div>
        <button
          @click="openAddModal(null); activeCategoryKey = 'navbar'"
          class="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-bold text-xs hover:bg-yellow-400 transition flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Navbar Block</span>
        </button>
      </div>

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
            <!-- Floating Inspector Pill Header on Section Hover (Always Top-Level z-[100]) -->
            <div class="absolute top-3 right-4 z-[100] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-auto flex items-center gap-1.5 bg-[#121212]/98 border border-[#FFD700]/50 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl">
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
              :variant="sec.content?.variant || (sec.label?.toLowerCase().includes('filmstrip') ? 'filmstrip' : 'carousel')"
              :is-preview="true"
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

      <!-- Prompt when no Footer block exists in active flow -->
      <div v-if="!hasFooterSection" class="p-4 border-2 border-dashed border-rose-400/30 rounded-2xl bg-rose-400/[0.03] flex flex-wrap items-center justify-between gap-4 px-6 m-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-rose-400/10 text-rose-400 flex items-center justify-center font-bold">
            <PanelBottom class="w-4 h-4" />
          </div>
          <div class="text-left">
            <h4 class="text-xs font-bold text-white">No Footer in Page Flow</h4>
            <p class="text-[11px] text-neutral-400">Add a multi-column, minimal, newsletter, or map footer to your page</p>
          </div>
        </div>
        <button
          @click="openAddModal(allSections.length - 1); activeCategoryKey = 'footer'"
          class="px-4 py-2 rounded-xl bg-[#FFD700] text-black font-bold text-xs hover:bg-yellow-400 transition flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Footer Block</span>
        </button>
      </div>
    </div>

    <!-- Edit Section Side Modal (Slide-Over Drawer) -->
    <div
      v-if="editingSection"
      class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex justify-end"
      @click.self="editingSection = null"
    >
      <div class="bg-[#121212] border-l border-white/[0.12] w-full max-w-xl md:max-w-2xl xl:max-w-3xl h-full flex flex-col shadow-2xl overflow-hidden">
        <!-- Sticky Header -->
        <div class="px-8 py-6 border-b border-white/[0.08] flex items-center justify-between bg-[#151515] shrink-0">
          <div v-if="editingSection.section_type === 'navbar'">
            <h3 class="text-lg font-bold text-white tracking-wide">Edit Navigation Bar</h3>
            <p class="text-xs text-neutral-400 mt-1">Select a layout style and configure header actions.</p>
          </div>
          <div v-else-if="editingSection.section_type === 'hero'">
            <h3 class="text-lg font-bold text-white tracking-wide">Edit Hero Section</h3>
            <p class="text-xs text-neutral-400 mt-1">Customize visual layout, headline typography, and background media.</p>
          </div>
          <div v-else-if="editingSection.section_type === 'about'">
            <h3 class="text-lg font-bold text-white tracking-wide">Edit About Section</h3>
            <p class="text-xs text-neutral-400 mt-1">Customize studio bio, portrait visual, and milestone statistics.</p>
          </div>
          <div v-else-if="editingSection.section_type === 'process'">
            <h3 class="text-lg font-bold text-white tracking-wide">Edit Process Section</h3>
            <p class="text-xs text-neutral-400 mt-1">Customize 4-step workflow journey and section headings.</p>
          </div>
          <div v-else-if="editingSection.section_type === 'gear'">
            <h3 class="text-lg font-bold text-white tracking-wide">Edit Gear Arsenal Section</h3>
            <p class="text-xs text-neutral-400 mt-1">Customize production standards, camera gear, and audio rigs.</p>
          </div>
          <div v-else-if="editingSection.section_type === 'text_block'">
            <h3 class="text-lg font-bold text-white tracking-wide">Edit Studio Story & Philosophy</h3>
            <p class="text-xs text-neutral-400 mt-1">Customize your editorial story, brand philosophy, and manifesto statement.</p>
          </div>
          <div v-else-if="editingSection.section_type === 'testimonials'">
            <h3 class="text-lg font-bold text-white tracking-wide">Edit Testimonials & Social Proof</h3>
            <p class="text-xs text-neutral-400 mt-1">Customize visual variant, client reviews, featured quotes, and venue trust.</p>
          </div>
          <div v-else-if="editingSection.section_type === 'carousel' || editingSection.section_type === 'filmstrip'">
            <template v-if="editingSection.content?.variant === 'filmstrip' || editingSection.label?.toLowerCase().includes('filmstrip')">
              <h3 class="text-lg font-bold text-white tracking-wide">Edit Editorial Filmstrip & Milestone Reels</h3>
              <p class="text-xs text-neutral-400 mt-1">Customize 35mm filmstrip frames (max 10), milestone captions, and documentary sequence.</p>
            </template>
            <template v-else>
              <h3 class="text-lg font-bold text-white tracking-wide">Edit Curated Featured Works Slider</h3>
              <p class="text-xs text-neutral-400 mt-1">Manage showcase photos (max 10), category filter pills, and header typography.</p>
            </template>
          </div>
          <div v-else>
            <h3 class="text-lg font-bold text-white tracking-wide">Edit {{ editingSection.label }}</h3>
            <span class="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mt-1 block">{{ editingSection.section_type }}</span>
          </div>
          <button @click="editingSection = null" class="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Content Body with Generous Spacing -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8">
          <div v-if="!['navbar', 'hero'].includes(editingSection.section_type)">
            <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">Section Display Label</label>
            <input
              type="text"
              v-model="editingSection.label"
              placeholder="e.g. About Studio, Process Timeline..."
              class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <!-- Hero Section Specific Fields & Design Variant Switcher (4 Hero Variants) -->
          <div v-if="editingSection.section_type === 'hero'" class="space-y-8">
            <!-- 1. Layout Variant Selection -->
            <div>
              <div class="flex items-center justify-between mb-3.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Hero Visual Layout</label>
                <span class="text-[11px] text-neutral-500 font-mono">4 Variants</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  v-for="v in [
                    { id: 'editorial', name: 'Luxury Editorial', desc: 'Dual-font typography with script accent & full-bleed backdrop' },
                    { id: 'split_card', name: 'Split 2-Column', desc: 'Left headline with framed visual card & star proof' },
                    { id: 'minimalist_cinema', name: 'Minimalist Cinema', desc: 'Centered typography with ambient spotlight glow' },
                    { id: 'video_reel', name: 'Fullscreen Video Reel', desc: 'Cinematic video backdrop with play highlight trigger' }
                  ]"
                  :key="v.id"
                  type="button"
                  @click="editingSection.content.variant = v.id"
                  class="p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 group cursor-pointer"
                  :class="[
                    (editingSection.content.variant || 'editorial') === v.id
                      ? 'bg-white/[0.08] border-white/30 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold" :class="[(editingSection.content.variant || 'editorial') === v.id ? 'text-white' : 'text-neutral-300']">
                      {{ v.name }}
                    </span>
                    <div
                      class="w-2.5 h-2.5 rounded-full transition"
                      :class="[(editingSection.content.variant || 'editorial') === v.id ? 'bg-[#FFD700]' : 'bg-transparent border border-white/20']"
                    ></div>
                  </div>
                  <span class="text-[11px] text-neutral-400 leading-relaxed">{{ v.desc }}</span>
                </button>
              </div>
            </div>

            <!-- 2. Typography & Headline Fields (Context-Aware per Variant) -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Headline & Copywriting</label>
                <span class="text-[11px] text-neutral-500 capitalize">{{ (editingSection.content.variant || 'editorial').replace('_', ' ') }}</span>
              </div>

              <!-- Variant 1: Luxury Editorial Fields -->
              <template v-if="(editingSection.content.variant || 'editorial') === 'editorial'">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Heading Line 1</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_line1"
                      placeholder="Turning"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Cursive Script Accent</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_accent1"
                      placeholder="Moments"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Heading Line 2</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_line2"
                      placeholder="into"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Headline Word Accent</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_accent2"
                      placeholder="Masterpiece."
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                </div>
              </template>

              <!-- Variant 2: Split 2-Column Fields -->
              <template v-else-if="editingSection.content.variant === 'split_card'">
                <div>
                  <label class="block text-xs font-medium text-neutral-300 mb-2">Trust Badge Text</label>
                  <input
                    type="text"
                    v-model="editingSection.content.badge_text"
                    placeholder="Premium Visual Storytelling"
                    class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                  />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Heading Line 1</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_line1"
                      placeholder="Turning"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Headline Accent 1</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_accent1"
                      placeholder="Moments"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Heading Line 2</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_line2"
                      placeholder="into"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Headline Word Accent 2</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_accent2"
                      placeholder="Masterpiece."
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                </div>

                <!-- Milestone Stats (Flat, clean, unnested) -->
                <div class="space-y-2 pt-1">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Milestone Stats (3 Counters)</label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="space-y-1.5">
                      <input
                        type="text"
                        v-model="editingSection.content.stat1_value"
                        placeholder="Stat 1: 5+ Years"
                        class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-bold"
                      />
                      <input
                        type="text"
                        v-model="editingSection.content.stat1_label"
                        placeholder="Label: Crafting Stories"
                        class="w-full px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-neutral-300 text-xs placeholder-neutral-500 focus:outline-none focus:border-white/20 transition"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <input
                        type="text"
                        v-model="editingSection.content.stat2_value"
                        placeholder="Stat 2: 250+"
                        class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-bold"
                      />
                      <input
                        type="text"
                        v-model="editingSection.content.stat2_label"
                        placeholder="Label: Events Captured"
                        class="w-full px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-neutral-300 text-xs placeholder-neutral-500 focus:outline-none focus:border-white/20 transition"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <input
                        type="text"
                        v-model="editingSection.content.stat3_value"
                        placeholder="Stat 3: 100%"
                        class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-bold"
                      />
                      <input
                        type="text"
                        v-model="editingSection.content.stat3_label"
                        placeholder="Label: Bespoke Color Graded"
                        class="w-full px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-neutral-300 text-xs placeholder-neutral-500 focus:outline-none focus:border-white/20 transition"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <!-- Variant 3: Minimalist Cinema Fields -->
              <template v-else-if="editingSection.content.variant === 'minimalist_cinema'">
                <div>
                  <label class="block text-xs font-medium text-neutral-300 mb-2">Trust Badge Text</label>
                  <input
                    type="text"
                    v-model="editingSection.content.badge_text"
                    placeholder="RGP Films & Studio • Est. 2019"
                    class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                  />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Heading Line 1</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_line1"
                      placeholder="Turning"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Center Script Accent</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_accent1"
                      placeholder="Moments"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Heading Line 2</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_line2"
                      placeholder="into"
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-2">Bottom Headline Accent</label>
                    <input
                      type="text"
                      v-model="editingSection.content.heading_accent2"
                      placeholder="Masterpiece."
                      class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                    />
                  </div>
                </div>
              </template>

              <!-- Variant 4: Video Reel Fields -->
              <template v-else-if="editingSection.content.variant === 'video_reel'">
                <div>
                  <label class="block text-xs font-medium text-neutral-300 mb-2">Headline</label>
                  <input
                    type="text"
                    v-model="editingSection.content.heading_line1"
                    placeholder="Capturing Every Heartbeat"
                    class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-neutral-300 mb-2">Video URL (YouTube/Vimeo)</label>
                  <input
                    type="text"
                    v-model="editingSection.content.video_url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                  />
                </div>
              </template>
            </div>

            <!-- 3. Subheading / Description -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">Subheading / Description</label>
              <textarea
                v-model="editingSection.content.subheading"
                rows="3"
                placeholder="Professional photography and videography services crafted to preserve your milestones in timeless elegance."
                class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition leading-relaxed"
              ></textarea>
            </div>

            <!-- 4. CTA Button Text -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">Primary CTA Button Text</label>
              <input
                type="text"
                v-model="editingSection.content.cta_text"
                placeholder="BOOK A SESSION"
                class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
              />
            </div>

            <!-- 5. Hero Background Media (Media Showcase Selection: Image or Folder - Hidden for Minimalist Cinema & Video Reel) -->
            <div v-if="!['minimalist_cinema', 'video_reel'].includes(editingSection.content.variant)" class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Background Media</label>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Select a photo from showcase or a folder for slideshow</p>
                </div>
                
                <!-- Segmented Mode Control -->
                <div class="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/10">
                  <button
                    type="button"
                    @click="editingSection.content.bg_source = 'image'"
                    class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                    :class="[
                      (editingSection.content.bg_source || 'image') === 'image'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    ]"
                  >
                    <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Single Photo</span>
                  </button>
                  <button
                    type="button"
                    @click="editingSection.content.bg_source = 'folder'; if (!editingSection.content.bg_folder && folders.length) editingSection.content.bg_folder = folders[0]"
                    class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                    :class="[
                      editingSection.content.bg_source === 'folder'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    ]"
                  >
                    <FolderIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Showcase Folder</span>
                  </button>
                </div>
              </div>

              <!-- Mode A: Single Photo Selected -->
              <div v-if="(editingSection.content.bg_source || 'image') === 'image'" class="space-y-3">
                <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3.5 min-w-0">
                    <div class="w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 relative">
                      <img
                        :src="editingSection.content.bg_image || '/images/hero-bg.jpg'"
                        alt="Hero Background Preview"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.src = '/images/hero-bg.jpg'"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-white truncate">
                        {{ editingSection.content.bg_image?.split('/').pop() || 'hero-bg.jpg' }}
                      </p>
                      <p class="text-[11px] text-neutral-400 truncate mt-1 font-mono">
                        {{ editingSection.content.bg_image || '/images/hero-bg.jpg' }}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    @click="openMediaPicker('bg_image')"
                    class="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                  >
                    <ImageIcon class="w-4 h-4 text-[#FFD700]" />
                    <span>Choose Photo</span>
                  </button>
                </div>
              </div>

              <!-- Mode B: Folder Showcase Selected -->
              <div v-else class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-neutral-400 mb-2.5">Select Showcase Folder</label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      v-for="f in folders"
                      :key="f"
                      type="button"
                      @click="selectFolderForHero(f)"
                      class="p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 group cursor-pointer"
                      :class="[
                        editingSection.content.bg_folder === f
                          ? 'bg-white/[0.08] border-white/30 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                      ]"
                    >
                      <div class="flex items-center justify-between">
                        <FolderIcon class="w-4 h-4" :class="[editingSection.content.bg_folder === f ? 'text-[#FFD700]' : 'text-neutral-500']" />
                        <div
                          class="w-1.5 h-1.5 rounded-full transition"
                          :class="[editingSection.content.bg_folder === f ? 'bg-[#FFD700]' : 'bg-transparent']"
                        ></div>
                      </div>
                      <span class="text-xs font-bold truncate">{{ f }}</span>
                      <span class="text-[11px] text-neutral-500">{{ folderCounts[f] || 0 }} photos</span>
                    </button>
                  </div>
                </div>

                <!-- Folder Preview Strip -->
                <div v-if="editingSection.content.bg_folder" class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-neutral-300 font-medium flex items-center gap-2">
                      <FolderIcon class="w-3.5 h-3.5 text-neutral-400" />
                      <span>Dynamic Folder Slideshow</span>
                    </span>
                    <span class="text-[11px] text-[#FFD700] uppercase font-mono tracking-wider font-semibold">
                      {{ folderCounts[editingSection.content.bg_folder] || 0 }} photos in rotation
                    </span>
                  </div>

                  <div class="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
                    <div
                      v-for="(photo, idx) in getFolderPreviewPhotos(editingSection.content.bg_folder, 6)"
                      :key="photo.id || idx"
                      class="w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 shadow-md"
                    >
                      <img :src="photo.image_url" :alt="photo.title" class="w-full h-full object-cover" />
                    </div>
                    <div
                      v-if="(folderCounts[editingSection.content.bg_folder] || 0) === 0"
                      class="text-xs text-neutral-500 italic py-2"
                    >
                      No photos in this folder yet.
                    </div>
                  </div>
                  <p class="text-[11px] text-neutral-400 leading-normal">
                    Hero section will smoothly rotate photos from this folder as its background with smooth crossfades.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pricing / Rates Specific Fields & Visual Layout Switcher (4 Variants) -->
          <div v-else-if="editingSection.section_type === 'rates'" class="space-y-8">
            <!-- 1. Layout Variant Selection -->
            <div>
              <div class="flex items-center justify-between mb-3.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Pricing Visual Layout</label>
                <span class="text-[11px] text-neutral-500 font-mono">4 Variants</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  v-for="v in [
                    { id: 'pricing_tiered', name: '3-Tier Luxury Cards', desc: 'Standard 3-column package tiers with highlighted center card' },
                    { id: 'pricing_spotlight', name: 'Single Spotlight Pricing', desc: '1:1 Interactive plan selector with real-time inclusions' },
                    { id: 'pricing_addons', name: 'A La Carte Deliverables', desc: 'Itemized add-ons, drone ops & luxury photo albums' },
                    { id: 'pricing_comparison', name: 'Feature Matrix Table', desc: 'Side-by-side comprehensive feature comparison matrix' }
                  ]"
                  :key="v.id"
                  type="button"
                  @click="editingSection.content.variant = v.id"
                  class="p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 group cursor-pointer"
                  :class="[
                    (editingSection.content.variant || 'pricing_tiered') === v.id
                      ? 'bg-white/[0.08] border-white/30 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold" :class="[(editingSection.content.variant || 'pricing_tiered') === v.id ? 'text-white' : 'text-neutral-300']">
                      {{ v.name }}
                    </span>
                    <div
                      class="w-2.5 h-2.5 rounded-full transition"
                      :class="[(editingSection.content.variant || 'pricing_tiered') === v.id ? 'bg-[#FFD700]' : 'bg-transparent border border-white/20']"
                    ></div>
                  </div>
                  <span class="text-[11px] text-neutral-400 leading-relaxed">{{ v.desc }}</span>
                </button>
              </div>
            </div>

            <!-- 2. Headline & Copywriting Fields -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Headlines &amp; Copywriting</label>
                <span class="text-[11px] text-neutral-500 capitalize">{{ (editingSection.content.variant || 'pricing_tiered').replace('_', ' ') }}</span>
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1.5">Section Headline</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="PACKAGES & RATES"
                  class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1.5">Subheading / Description</label>
                <textarea
                  v-model="editingSection.content.subtitle"
                  rows="3"
                  placeholder="Tailored full-coverage packages crafted for weddings, celebrations, and studio portraits."
                  class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition leading-relaxed"
                ></textarea>
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1.5">Primary CTA Button Text</label>
                <input
                  type="text"
                  v-model="editingSection.content.button_text"
                  placeholder="Inquire / Book Package"
                  class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
                />
              </div>

              <!-- Only show Bottom Footnote input when variant is Feature Matrix Table (pricing_comparison) -->
              <div v-if="editingSection.content.variant === 'pricing_comparison'">
                <label class="block text-xs font-medium text-neutral-300 mb-1.5">Bottom Footnote / Matrix Disclaimer</label>
                <input
                  type="text"
                  v-model="editingSection.content.footer_note"
                  placeholder="Custom add-ons and bespoke upgrades available upon consultation."
                  class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
                />
              </div>
            </div>

            <!-- 2.5 Choose background type (Solid with Glowing Gradient Accent vs Background Image) -->
            <div
              v-if="editingSection.content.variant === 'pricing_addons'"
              class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5"
            >
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Choose background type</label>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Select background styling applied behind the cards</p>
                </div>
              </div>

              <!-- Option Selector -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  @click="editingSection.content.bg_type = 'solid_glow'"
                  class="p-4 rounded-2xl border text-left transition-all duration-200 flex items-start justify-between cursor-pointer group"
                  :class="[
                    (editingSection.content.bg_type || 'solid_glow') === 'solid_glow'
                      ? 'bg-white/[0.08] border-white/30 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                  ]"
                >
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full bg-[#FFD700]"></div>
                      <span class="text-xs font-bold" :class="[(editingSection.content.bg_type || 'solid_glow') === 'solid_glow' ? 'text-white' : 'text-neutral-300 group-hover:text-white']">
                        Solid + Glowing Gradient Accent
                      </span>
                    </div>
                    <p class="text-[11px] text-neutral-400 leading-relaxed">
                      Deep luxury solid background with radiant golden glowing ambient gradients.
                    </p>
                  </div>
                  <div
                    class="w-2.5 h-2.5 rounded-full ml-3 shrink-0 mt-0.5"
                    :class="[(editingSection.content.bg_type || 'solid_glow') === 'solid_glow' ? 'bg-[#FFD700]' : 'border border-white/20']"
                  ></div>
                </button>

                <button
                  type="button"
                  @click="editingSection.content.bg_type = 'image'"
                  class="p-4 rounded-2xl border text-left transition-all duration-200 flex items-start justify-between cursor-pointer group"
                  :class="[
                    editingSection.content.bg_type === 'image'
                      ? 'bg-white/[0.08] border-white/30 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                  ]"
                >
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2">
                      <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                      <span class="text-xs font-bold" :class="[editingSection.content.bg_type === 'image' ? 'text-white' : 'text-neutral-300 group-hover:text-white']">
                        Background Image
                      </span>
                    </div>
                    <p class="text-[11px] text-neutral-400 leading-relaxed">
                      Cinematic backdrop photograph with dark overlay applied across the section.
                    </p>
                  </div>
                  <div
                    class="w-2.5 h-2.5 rounded-full ml-3 shrink-0 mt-0.5"
                    :class="[editingSection.content.bg_type === 'image' ? 'bg-[#FFD700]' : 'border border-white/20']"
                  ></div>
                </button>
              </div>

              <!-- Media Selection (when bg_type === 'image') following Edit Hero Modal -->
              <div v-if="editingSection.content.bg_type === 'image'" class="space-y-4 pt-1">
                <!-- Segmented Mode Control -->
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-neutral-300">Media Source</span>
                  <div class="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/10">
                    <button
                      type="button"
                      @click="editingSection.content.bg_source = 'image'"
                      class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                      :class="[
                        (editingSection.content.bg_source || 'image') === 'image'
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      ]"
                    >
                      <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Single Photo</span>
                    </button>
                    <button
                      type="button"
                      @click="editingSection.content.bg_source = 'folder'; if (!editingSection.content.bg_folder && folders.length) editingSection.content.bg_folder = folders[0]"
                      class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                      :class="[
                        editingSection.content.bg_source === 'folder'
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      ]"
                    >
                      <FolderIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Showcase Folder</span>
                    </button>
                  </div>
                </div>

                <!-- Mode A: Single Photo Selected -->
                <div v-if="(editingSection.content.bg_source || 'image') === 'image'" class="space-y-3">
                  <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3.5 min-w-0">
                      <div class="w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 relative">
                        <img
                          :src="editingSection.content.bg_image || '/images/hero-bg.jpg'"
                          alt="Section Background Preview"
                          class="w-full h-full object-cover"
                          @error="(e) => e.target.src = '/images/hero-bg.jpg'"
                        />
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-white truncate">
                          {{ editingSection.content.bg_image?.split('/').pop() || 'hero-bg.jpg' }}
                        </p>
                        <p class="text-[11px] text-neutral-400 truncate mt-1 font-mono">
                          {{ editingSection.content.bg_image || '/images/hero-bg.jpg' }}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="openMediaPicker('bg_image')"
                      class="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                    >
                      <ImageIcon class="w-4 h-4 text-[#FFD700]" />
                      <span>Choose Photo</span>
                    </button>
                  </div>
                </div>

                <!-- Mode B: Folder Showcase Selected -->
                <div v-else class="space-y-4">
                  <div>
                    <label class="block text-xs font-medium text-neutral-400 mb-2.5">Select Showcase Folder</label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <button
                        v-for="f in folders"
                        :key="f"
                        type="button"
                        @click="selectFolderForHero(f)"
                        class="p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 group cursor-pointer"
                        :class="[
                          editingSection.content.bg_folder === f
                            ? 'bg-white/[0.08] border-white/30 text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                        ]"
                      >
                        <div class="flex items-center justify-between">
                          <FolderIcon class="w-4 h-4" :class="[editingSection.content.bg_folder === f ? 'text-[#FFD700]' : 'text-neutral-500']" />
                          <div
                            class="w-1.5 h-1.5 rounded-full transition"
                            :class="[editingSection.content.bg_folder === f ? 'bg-[#FFD700]' : 'bg-transparent']"
                          ></div>
                        </div>
                        <span class="text-xs font-bold truncate">{{ f }}</span>
                        <span class="text-[11px] text-neutral-500">{{ folderCounts[f] || 0 }} photos</span>
                      </button>
                    </div>
                  </div>

                  <!-- Folder Preview Strip -->
                  <div v-if="editingSection.content.bg_folder" class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-neutral-300 font-medium flex items-center gap-2">
                        <FolderIcon class="w-3.5 h-3.5 text-neutral-400" />
                        <span>Dynamic Folder Slideshow</span>
                      </span>
                      <span class="text-[11px] text-[#FFD700] uppercase font-mono tracking-wider font-semibold">
                        {{ folderCounts[editingSection.content.bg_folder] || 0 }} photos in rotation
                      </span>
                    </div>

                    <div class="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
                      <div
                        v-for="(photo, idx) in getFolderPreviewPhotos(editingSection.content.bg_folder, 6)"
                        :key="photo.id || idx"
                        class="w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 shadow-md"
                      >
                        <img :src="photo.image_url" :alt="photo.title" class="w-full h-full object-cover" />
                      </div>
                      <div
                        v-if="(folderCounts[editingSection.content.bg_folder] || 0) === 0"
                        class="text-xs text-neutral-500 italic py-2"
                      >
                        No photos in this folder yet.
                      </div>
                    </div>
                    <p class="text-[11px] text-neutral-400 leading-normal">
                      Section will smoothly rotate photos from this folder in the background.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Subtle Configure Packages & Rates Trigger -->
            <div class="pt-1 flex items-center justify-center">
              <button
                type="button"
                @click="goToPackagesTab"
                class="cursor-pointer px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 text-neutral-400 hover:text-white text-xs font-medium transition flex items-center gap-2.5 shadow-sm group"
              >
                <Tags class="w-3.5 h-3.5 text-neutral-400 group-hover:text-white group-hover:scale-110 transition-transform" />
                <span>Configure packages and rates in Packages Manager</span>
                <ArrowUpRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
              </button>
            </div>
          </div>

          <!-- Testimonials Specific Fields (4 Variants) -->
          <div v-else-if="editingSection.section_type === 'testimonials' || editingSection.section_type === 'venues'" class="space-y-8">
            <!-- 1. Layout Variant Selection -->
            <div>
              <div class="flex items-center justify-between mb-3.5">
                <label :class="adminModalTokens.inputLabelUppercase">Testimonial Visual Layout</label>
                <span class="text-[11px] text-neutral-500 font-mono">4 Variants</span>
              </div>
              <div :class="adminModalTokens.variantGrid">
                <button
                  v-for="v in [
                    { id: 'testimonials_dual', name: 'Image Review Cards', desc: 'Full-bleed uploaded screenshots of reviews with subtle tilt, carousel slider, and lightbox' },
                    { id: 'testimonials_grid', name: '3-Column Review Wall', desc: 'Comprehensive masonry grid displaying multiple client experiences' },
                    { id: 'testimonials_featured', name: 'Editorial Quote', desc: 'Full-width cinematic statement quote with atmospheric backdrop' },
                    { id: 'trust_venues', name: 'Venues Marquee', desc: 'Infinite scrolling marquee of premier partnered hotels & venues' }
                  ]"
                  :key="v.id"
                  type="button"
                  @click="editingSection.content.variant = v.id; editingSection.section_type = 'testimonials'"
                  :class="[
                    adminModalTokens.variantCard,
                    (editingSection.content.variant || (editingSection.section_type === 'venues' ? 'trust_venues' : 'testimonials_dual')) === v.id
                      ? adminModalTokens.variantCardActive
                      : adminModalTokens.variantCardInactive
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <span :class="(editingSection.content.variant || (editingSection.section_type === 'venues' ? 'trust_venues' : 'testimonials_dual')) === v.id ? adminModalTokens.variantNameActive : adminModalTokens.variantNameInactive">
                      {{ v.name }}
                    </span>
                    <div
                      :class="[
                        (editingSection.content.variant || (editingSection.section_type === 'venues' ? 'trust_venues' : 'testimonials_dual')) === v.id
                          ? adminModalTokens.variantDotActive
                          : adminModalTokens.variantDotInactive
                      ]"
                    ></div>
                  </div>
                  <span :class="adminModalTokens.variantDescription">{{ v.desc }}</span>
                </button>
              </div>
            </div>

            <!-- 2. Section Header & Copywriting -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <label :class="adminModalTokens.cardLabel">Header & Copywriting</label>
                <span class="text-[11px] text-neutral-500 capitalize">{{ (editingSection.content.variant || (editingSection.section_type === 'venues' ? 'trust_venues' : 'testimonials_dual')).replace('_', ' ') }}</span>
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Eyebrow / Badge Text</label>
                <input
                  type="text"
                  v-model="editingSection.content.badge_text"
                  :placeholder="editingSection.content.variant === 'trust_venues' || editingSection.section_type === 'venues' ? 'FEATURED LOCATIONS & COLLABORATORS' : 'Real Stories'"
                  :class="adminModalTokens.input"
                />
              </div>

              <div v-if="(editingSection.content.variant || 'testimonials_dual') === 'testimonials_dual'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label :class="adminModalTokens.inputLabel">Title Prefix</label>
                  <input
                    type="text"
                    v-model="editingSection.content.title_prefix"
                    placeholder="e.g. Real Stories."
                    :class="adminModalTokens.input"
                  />
                </div>
                <div>
                  <label :class="adminModalTokens.inputLabel">Title Accent (Underlined)</label>
                  <input
                    type="text"
                    v-model="editingSection.content.title_accent"
                    placeholder="e.g. Real People"
                    :class="adminModalTokens.input"
                  />
                </div>
              </div>
              <div v-else>
                <label :class="adminModalTokens.inputLabel">Section Title</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  :placeholder="editingSection.content.variant === 'trust_venues' || editingSection.section_type === 'venues' ? 'TRUSTED & FEATURED AT PREMIER VENUES' : (editingSection.content.variant === 'testimonials_featured' ? 'Words from Our Couples' : 'CLIENT LOVE & REVIEWS')"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Section Subtitle / Description (Optional)</label>
                <textarea
                  v-model="editingSection.content.subtitle"
                  rows="2"
                  :placeholder="editingSection.content.variant === 'trust_venues' || editingSection.section_type === 'venues' ? 'Optional subtitle or venue trust description' : (editingSection.content.variant === 'testimonials_featured' ? 'Optional subtitle or brief narrative introduction' : 'Read firsthand experiences from couples and clients whose milestones we had the honor to capture.')"
                  :class="adminModalTokens.textarea"
                ></textarea>
              </div>
            </div>

            <!-- 3. Featured Editorial Quotes Carousel (Only for testimonials_featured) -->
            <div v-if="editingSection.content.variant === 'testimonials_featured'" :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Editorial Quotes Carousel</label>
                  <p :class="adminModalTokens.cardSubtitle">
                    Add up to 10 cinematic quote reviews for couples to cycle through with left/right arrows.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="adminModalTokens.cardCounterBadge">
                    {{ getFeaturedQuotesList(editingSection.content).length }}/10 Quotes
                  </span>
                  <button
                    type="button"
                    @click="addFeaturedQuote"
                    :disabled="getFeaturedQuotesList(editingSection.content).length >= 10"
                    :class="[
                      adminModalTokens.btnSecondary,
                      getFeaturedQuotesList(editingSection.content).length >= 10 ? 'opacity-40 cursor-not-allowed' : ''
                    ]"
                  >
                    <Plus class="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Add Quote</span>
                  </button>
                </div>
              </div>

              <!-- List of Editorial Quotes -->
              <div class="space-y-4">
                <div
                  v-for="(fq, idx) in getFeaturedQuotesList(editingSection.content)"
                  :key="idx"
                  class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition space-y-3 relative group"
                >
                  <div class="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-md bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-mono font-bold">
                        Quote #{{ idx + 1 }}
                      </span>
                      <span v-if="idx === 0" class="text-[10px] text-neutral-500 font-mono">
                        (Initial Quote)
                      </span>
                    </div>
                    <button
                      v-if="getFeaturedQuotesList(editingSection.content).length > 1"
                      type="button"
                      @click="removeFeaturedQuote(idx)"
                      class="p-1 text-neutral-500 hover:text-red-400 transition cursor-pointer"
                      title="Remove Quote"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label :class="adminModalTokens.inputLabel">Cinematic Quote Statement</label>
                    <textarea
                      v-model="fq.quote"
                      @input="syncFeaturedLegacy"
                      rows="3"
                      placeholder="Working with RGP Films was the single best decision we made for our wedding. The team made us feel completely natural in front of the lens..."
                      :class="adminModalTokens.textarea"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label :class="adminModalTokens.inputLabel">Client Name(s)</label>
                      <input
                        type="text"
                        v-model="fq.client_name"
                        @input="syncFeaturedLegacy"
                        placeholder="e.g. Clarisse & Ethan Morales"
                        :class="adminModalTokens.input"
                      />
                    </div>
                    <div>
                      <label :class="adminModalTokens.inputLabel">Event / Venue Detail</label>
                      <input
                        type="text"
                        v-model="fq.event"
                        @input="syncFeaturedLegacy"
                        placeholder="e.g. Tagaytay Highlands Church Wedding"
                        :class="adminModalTokens.input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Optional Backdrop Photo -->
              <div class="pt-3 border-t border-white/[0.06] space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <label :class="adminModalTokens.inputLabel">Backdrop Atmospheric Image</label>
                    <p class="text-[10px] text-neutral-500">Dark ambient cinematic background image with subtle opacity</p>
                  </div>
                  <button
                    type="button"
                    @click="openMediaPicker('featured_bg_image')"
                    :class="adminModalTokens.btnSecondary"
                  >
                    <ImageIcon class="w-3.5 h-3.5 text-neutral-400" />
                    <span>Choose Photo</span>
                  </button>
                </div>
                <div v-if="editingSection.content.featured_bg_image" class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <img :src="editingSection.content.featured_bg_image" class="w-16 h-12 object-cover rounded-lg border border-white/10" />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-white truncate font-medium">{{ editingSection.content.featured_bg_image }}</p>
                    <p class="text-[10px] text-neutral-500">Overlay backdrop with 15% opacity and gradient vignette</p>
                  </div>
                  <button
                    type="button"
                    @click="editingSection.content.featured_bg_image = ''"
                    class="p-2 text-neutral-500 hover:text-red-400 transition cursor-pointer"
                    title="Remove Backdrop"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 4. Partnered Venues Manager (Only for trust_venues) -->
            <div v-else-if="editingSection.content.variant === 'trust_venues' || editingSection.section_type === 'venues'" :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Partnered Venues & Hotels</label>
                  <p :class="adminModalTokens.cardSubtitle">Add or remove venues appearing in the continuous marquee</p>
                </div>
                <span :class="adminModalTokens.cardCounterBadge">
                  {{ getVenuesList(editingSection.content).length }} Venues
                </span>
              </div>

              <!-- Add New Venue Input -->
              <div class="flex gap-2">
                <input
                  type="text"
                  v-model="newVenueInput"
                  @keyup.enter="addVenue"
                  placeholder="Add venue or hotel name..."
                  :class="adminModalTokens.input"
                />
                <button
                  type="button"
                  @click="addVenue"
                  :class="adminModalTokens.btnSecondary"
                >
                  <Plus class="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <!-- Venues Chips / Tag Cloud -->
              <div class="flex flex-wrap gap-2 pt-1">
                <div
                  v-for="(venue, vIdx) in getVenuesList(editingSection.content)"
                  :key="vIdx"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-neutral-200 group"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] shrink-0"></span>
                  <span>{{ venue }}</span>
                  <button
                    type="button"
                    @click="removeVenue(vIdx)"
                    class="text-neutral-500 hover:text-red-400 transition ml-0.5 cursor-pointer"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 5. Testimonials Reviews List Manager (For dual cards & 3-col grid) -->
            <div v-else :class="adminModalTokens.cardSpacious">
              <!-- Header for Screenshot Cards (Dual Review Cards) -->
              <div v-if="(editingSection.content.variant || 'testimonials_dual') === 'testimonials_dual'" :class="adminModalTokens.cardHeader">
                <div>
                  <div class="flex items-center gap-2">
                    <label :class="adminModalTokens.cardLabel">Image Review Cards</label>
                    <span :class="adminModalTokens.cardCounterBadge">
                      {{ getTestimonialsList(editingSection.content).length }}/10 Cards
                    </span>
                  </div>
                  <p :class="adminModalTokens.cardSubtitle">
                    Upload or select screenshots of client reviews (Google, Facebook, Instagram DMs, etc.). Maximum 10 cards.
                  </p>
                </div>
                <button
                  type="button"
                  @click="addTestimonial"
                  :disabled="getTestimonialsList(editingSection.content).length >= 10"
                  :class="[
                    adminModalTokens.btnSecondary,
                    getTestimonialsList(editingSection.content).length >= 10 ? 'opacity-40 cursor-not-allowed hover:bg-white/[0.04]' : ''
                  ]"
                  :title="getTestimonialsList(editingSection.content).length >= 10 ? 'Maximum 10 cards limit reached' : 'Add Screenshot Card'"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add Screenshot Card</span>
                </button>
              </div>

              <!-- Header for Standard Text Reviews (Grid Wall) -->
              <div v-else :class="adminModalTokens.cardHeader">
                <div>
                  <div class="flex items-center gap-2">
                    <label :class="adminModalTokens.cardLabel">Client Reviews & Stories</label>
                    <span :class="adminModalTokens.cardCounterBadge">
                      {{ getTestimonialsList(editingSection.content).length }}/10 Cards
                    </span>
                  </div>
                  <p :class="adminModalTokens.cardSubtitle">
                    All reviews are displayed across the 3-column review wall. Maximum 10 reviews.
                  </p>
                </div>
                <button
                  type="button"
                  @click="addTestimonial"
                  :disabled="getTestimonialsList(editingSection.content).length >= 10"
                  :class="[
                    adminModalTokens.btnSecondary,
                    getTestimonialsList(editingSection.content).length >= 10 ? 'opacity-40 cursor-not-allowed hover:bg-white/[0.04]' : ''
                  ]"
                  :title="getTestimonialsList(editingSection.content).length >= 10 ? 'Maximum 10 reviews limit reached' : 'Add Review'"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add Review</span>
                </button>
              </div>

              <!-- DUAL REVIEW CARDS: FULL IMAGE SCREENSHOT CARDS LIST -->
              <div v-if="(editingSection.content.variant || 'testimonials_dual') === 'testimonials_dual'" class="space-y-4">
                <div
                  v-for="(t, idx) in getTestimonialsList(editingSection.content)"
                  :key="idx"
                  class="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3.5"
                >
                  <div class="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-[#FFD700]/15 text-[#FFD700] text-[10px] font-mono flex items-center justify-center font-bold">
                        {{ idx + 1 }}
                      </span>
                      <span class="text-xs font-bold text-white">
                        {{ t.client_name || `Review Screenshot #${idx + 1}` }}
                      </span>
                    </div>
                    <button
                      type="button"
                      @click="removeTestimonial(idx)"
                      class="p-1.5 text-neutral-500 hover:text-red-400 transition rounded-lg hover:bg-white/[0.04] cursor-pointer"
                      title="Delete Screenshot Card"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <!-- Screenshot Media Selector Area -->
                  <div class="flex flex-col sm:flex-row gap-4 items-start">
                    <!-- Screenshot Preview Box -->
                    <div class="w-full sm:w-36 h-48 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 shrink-0 shadow-inner flex items-center justify-center relative group">
                      <img
                        :src="t.card_image || t.image_url || `/images/${(idx % 6) + 1}.jpg`"
                        :alt="t.client_name || `Screenshot ${idx + 1}`"
                        class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        @error="(e) => e.target.src = `/images/${(idx % 6) + 1}.jpg`"
                      />
                      <span class="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-neutral-300">
                        Full Bleed
                      </span>
                    </div>

                    <!-- Fields & Actions -->
                    <div class="flex-1 min-w-0 w-full space-y-3">
                      <div>
                        <div class="flex items-center justify-between mb-1.5">
                          <label :class="adminModalTokens.inputLabel" class="!mb-0 flex items-center gap-1.5 font-semibold text-white">
                            <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                            <span>Review Screenshot Image</span>
                          </label>
                          <button
                            type="button"
                            @click="openMediaPicker(`testimonial_card_image_${idx}`)"
                            :class="adminModalTokens.btnSecondary"
                            class="!py-1.5 !px-3 text-xs"
                          >
                            <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                            <span>Choose Photo</span>
                          </button>
                        </div>
                        <div class="flex items-center gap-2">
                          <input
                            type="text"
                            v-model="t.card_image"
                            :placeholder="`/images/${(idx % 6) + 1}.jpg or paste image URL...`"
                            :class="adminModalTokens.input"
                            class="!py-1.5 text-xs font-mono"
                          />
                          <button
                            v-if="t.card_image"
                            type="button"
                            @click="t.card_image = ''"
                            class="p-2 text-neutral-500 hover:text-red-400 transition shrink-0"
                            title="Reset Image"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                        <p class="text-[10px] text-neutral-500 mt-1">
                          Images automatically fill the entire card edge-to-edge with unified sizing (cropped/zoomed).
                        </p>
                      </div>

                      <!-- Optional Label/Caption -->
                      <div>
                        <label :class="adminModalTokens.inputLabel">Client / Review Source Note (Optional)</label>
                        <input
                          type="text"
                          v-model="t.client_name"
                          placeholder="e.g. Google Review - Clarisse & Ethan, Facebook Recommendation"
                          :class="adminModalTokens.input"
                          class="!py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- GRID WALL: STANDARD TEXT REVIEWS LIST -->
              <div v-else class="space-y-3">
                <div
                  v-for="(t, idx) in getTestimonialsList(editingSection.content)"
                  :key="idx"
                  class="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3"
                >
                  <div class="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-white/[0.08] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                        {{ idx + 1 }}
                      </span>
                      <span class="text-xs font-semibold text-white">{{ t.client_name || 'Anonymous Couple' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <!-- Star rating selector -->
                      <div class="flex items-center gap-0.5 mr-2">
                        <button
                          v-for="star in 5"
                          :key="star"
                          type="button"
                          @click="t.rating = star"
                          class="p-0.5 text-neutral-600 hover:text-[#FFD700] transition cursor-pointer"
                        >
                          <Star
                            class="w-3.5 h-3.5"
                            :class="[star <= (t.rating || 5) ? 'text-[#FFD700] fill-[#FFD700]' : 'text-neutral-600']"
                          />
                        </button>
                      </div>
                      <button
                        type="button"
                        @click="removeTestimonial(idx)"
                        class="p-1.5 text-neutral-500 hover:text-red-400 transition rounded-lg hover:bg-white/[0.04] cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label :class="adminModalTokens.inputLabel">Client Name(s)</label>
                      <input
                        type="text"
                        v-model="t.client_name"
                        placeholder="e.g. Clarisse & Ethan"
                        :class="adminModalTokens.input"
                      />
                    </div>
                    <div>
                      <label :class="adminModalTokens.inputLabel">Event / Milestone</label>
                      <input
                        type="text"
                        v-model="t.event"
                        placeholder="e.g. Church Wedding Coverage"
                        :class="adminModalTokens.input"
                      />
                    </div>
                  </div>

                  <div>
                    <label :class="adminModalTokens.inputLabel">Location / Venue</label>
                    <input
                      type="text"
                      v-model="t.location"
                      placeholder="e.g. Tagaytay Highlands"
                      :class="adminModalTokens.input"
                    />
                  </div>



                  <div>
                    <label :class="adminModalTokens.inputLabel">Client Review Quote</label>
                    <textarea
                      v-model="t.quote"
                      rows="2"
                      placeholder="Write the quote from the couple..."
                      :class="adminModalTokens.textarea"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gallery Grid Specific Fields (Masonry vs Mosaic) -->
          <div v-else-if="editingSection.section_type === 'gallery_grid'" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Gallery Layout Variant</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="v in [
                    { id: 'masonry', label: 'Masonry Photo Grid' },
                    { id: 'mosaic', label: 'Edge-to-Edge Mosaic Wall' }
                  ]"
                  :key="v.id"
                  type="button"
                  @click="editingSection.content.variant = v.id"
                  class="p-2.5 rounded-xl border text-xs font-bold tracking-wide transition flex items-center justify-between"
                  :class="[
                    (editingSection.content.variant || 'masonry') === v.id
                      ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  ]"
                >
                  <span>{{ v.label }}</span>
                  <Check v-if="(editingSection.content.variant || 'masonry') === v.id" class="w-3.5 h-3.5 text-[#FFD700]" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Title</label>
              <input
                type="text"
                v-model="editingSection.content.title"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Subtitle</label>
              <input
                type="text"
                v-model="editingSection.content.subtitle"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Max Photos to Display</label>
              <input
                type="number"
                v-model.number="editingSection.content.limit"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          <!-- Navbar Specific Fields (4 Navbar Variants) -->
          <div v-else-if="editingSection.section_type === 'navbar'" class="space-y-6">
            <div>
              <div class="flex items-center justify-between mb-3.5">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Header Layout Style</label>
                <span class="text-[11px] text-neutral-500 font-mono">4 Designs</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  v-for="v in [
                    { id: 'floating', name: 'Floating Glass Island', desc: 'Pill-shaped floating glass bar with booking CTA' },
                    { id: 'fullwidth', name: 'Simple Translucent Split', desc: 'Center brand with clean split navigation' },
                    { id: 'centered', name: 'Centered Luxury Monogram', desc: 'Signature gold monogram with dual dividers' },
                    { id: 'dynamic', name: 'Dynamic Translucent Header', desc: 'Edge-to-edge backdrop with solid scroll effect' }
                  ]"
                  :key="v.id"
                  type="button"
                  @click="editingSection.content.variant = v.id"
                  class="p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 group cursor-pointer"
                  :class="[
                    (editingSection.content.variant || 'floating') === v.id
                      ? 'bg-white/[0.08] border-white/30 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold" :class="[(editingSection.content.variant || 'floating') === v.id ? 'text-white' : 'text-neutral-300']">
                      {{ v.name }}
                    </span>
                    <div
                      class="w-2.5 h-2.5 rounded-full transition"
                      :class="[(editingSection.content.variant || 'floating') === v.id ? 'bg-[#FFD700]' : 'bg-transparent border border-white/20']"
                    ></div>
                  </div>
                  <span class="text-[11px] text-neutral-400 leading-relaxed">{{ v.desc }}</span>
                </button>
              </div>
            </div>

            <!-- CTA Button Field (When applicable: floating, dynamic) -->
            <div v-if="['floating', 'dynamic'].includes(editingSection.content.variant || 'floating')" class="space-y-2 pt-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Call-to-Action (CTA) Text</label>
              <input
                type="text"
                v-model="editingSection.content.cta_text"
                placeholder="Book Now"
                class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
              />
            </div>

            <!-- Included Core Navigation Links Note -->
            <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
              <span class="text-[11px] text-neutral-500 font-medium">Auto-synced Links</span>
              <span class="text-[11px] font-mono text-neutral-300">Home • Portfolio • Pricing • Gallery • Contact</span>
            </div>
          </div>

          <!-- Footer Specific Fields (4 Footer Variants) -->
          <div v-else-if="editingSection.section_type === 'footer'" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Footer Visual Variant</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="v in [
                    { id: 'multi_column', label: '4-Column Studio Hub' },
                    { id: 'minimal', label: 'Centered Minimalist Luxury' },
                    { id: 'newsletter', label: 'VIP Newsletter Lead Capture' },
                    { id: 'split_map', label: 'Split Studio Map & Hours' }
                  ]"
                  :key="v.id"
                  type="button"
                  @click="editingSection.content.variant = v.id"
                  class="p-2.5 rounded-xl border text-xs font-bold tracking-wide transition flex items-center justify-between"
                  :class="[
                    (editingSection.content.variant || 'multi_column') === v.id
                      ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  ]"
                >
                  <span>{{ v.label }}</span>
                  <Check v-if="(editingSection.content.variant || 'multi_column') === v.id" class="w-3.5 h-3.5 text-[#FFD700]" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Brand Tagline</label>
              <textarea
                v-model="editingSection.content.tagline"
                rows="3"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              ></textarea>
            </div>
          </div>

          <!-- Video Section Specific Fields (4K Cinema Video Reel Player) -->
          <div v-else-if="editingSection.section_type === 'video'" :class="adminModalTokens.sectionSpacing">
            <!-- 1. Header & Copywriting -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Header & Copywriting</label>
                  <p :class="adminModalTokens.cardSubtitle">Titles, subtitles, and captions for your cinema highlight reel</p>
                </div>
                <span class="text-[11px] text-[#FFD700] uppercase font-mono tracking-wider font-semibold">4K Cinema Reel</span>
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Top Eyebrow / Badge Text</label>
                <input
                  type="text"
                  v-model="editingSection.content.badge_text"
                  placeholder="e.g. FEATURED REEL or POST-PRODUCTION MASTERY"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Section Title</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="CINEMATIC HIGHLIGHTS"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Top Subtitle (Under Heading)</label>
                <input
                  type="text"
                  v-model="editingSection.content.subtitle"
                  placeholder="Every emotion, speech, and glance preserved in 4K cinematic clarity."
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Bottom Subtitle / Caption (Under Video Player)</label>
                <input
                  type="text"
                  v-model="editingSection.content.caption"
                  placeholder="Wedding & Event Cinematic Highlight Reel"
                  :class="adminModalTokens.input"
                />
              </div>
            </div>

            <!-- 2. Video Player Stream Embed -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Video Stream Source</label>
                  <p :class="adminModalTokens.cardSubtitle">Direct YouTube or Vimeo video link</p>
                </div>
                <span class="text-[11px] text-neutral-500 font-mono">16:9 Embed</span>
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">YouTube or Vimeo Video URL</label>
                <input
                  type="url"
                  v-model="editingSection.content.video_url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  :class="adminModalTokens.input"
                />
              </div>

              <!-- Format Support Helper Box -->
              <div :class="adminModalTokens.noticeBox">
                <div class="flex items-start gap-2.5">
                  <Film class="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                  <div class="space-y-1">
                    <p class="text-xs text-white font-medium">Supported Video URL Formats:</p>
                    <p class="text-[11px] text-neutral-400 font-sans">
                      Standard YouTube (<code class="text-[#FFD700] text-[10px]">youtube.com/watch?v=...</code>), short links (<code class="text-[#FFD700] text-[10px]">youtu.be/...</code>), and Vimeo (<code class="text-[#FFD700] text-[10px]">vimeo.com/...</code>). Renders with privacy-enhanced mode and clean player branding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Before / After Slider Specific Fields (Interactive Retouching Slider) -->
          <div v-else-if="editingSection.section_type === 'before_after'" :class="adminModalTokens.sectionSpacing">
            <!-- 1. Header & Copywriting Card -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Header & Copywriting</label>
                  <p :class="adminModalTokens.cardSubtitle">Titles and instructions for the retouching comparison slider</p>
                </div>
                <span class="text-[11px] text-[#FFD700] uppercase font-mono tracking-wider font-semibold">Retouching Slider</span>
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Top Eyebrow / Badge Text</label>
                <input
                  type="text"
                  v-model="editingSection.content.badge_text"
                  placeholder="POST-PRODUCTION MASTERY"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Section Title</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="BEFORE & AFTER RETOUCHING"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Section Subtitle / Instructions</label>
                <input
                  type="text"
                  v-model="editingSection.content.subtitle"
                  placeholder="Drag the interactive slider to compare straight-out-of-camera RAW vs master edit."
                  :class="adminModalTokens.input"
                />
              </div>
            </div>

            <!-- 2. Before & After Images Selection Card -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Comparison Image Pair</label>
                  <p :class="adminModalTokens.cardSubtitle">Choose RAW (Before) and Master Graded (After) photos</p>
                </div>
                <span class="text-[11px] text-neutral-500 font-mono">Side-by-Side</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Left: Before (RAW) -->
                <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Before (RAW)</span>
                    <span class="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded">Left Side</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 relative">
                      <img
                        :src="editingSection.content.before_image || '/images/5.jpg'"
                        alt="Before Preview"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.src = '/images/5.jpg'"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-white truncate">
                        {{ editingSection.content.before_image?.split('/').pop() || '5.jpg' }}
                      </p>
                      <p class="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                        {{ editingSection.content.before_image || '/images/5.jpg' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      v-model="editingSection.content.before_image"
                      placeholder="Image URL or choose photo..."
                      :class="adminModalTokens.input"
                      class="flex-1"
                    />
                    <button
                      type="button"
                      @click="openMediaPicker('before_image')"
                      class="px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                    >
                      <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Choose</span>
                    </button>
                  </div>

                  <div>
                    <label :class="adminModalTokens.inputLabel">Badge Label</label>
                    <input
                      type="text"
                      v-model="editingSection.content.before_label"
                      placeholder="Raw Capture"
                      :class="adminModalTokens.input"
                    />
                  </div>
                </div>

                <!-- Right: After (Master Grade) -->
                <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-[#FFD700] uppercase tracking-wider">After (Master Grade)</span>
                    <span class="text-[10px] font-mono text-[#FFD700]/70 bg-[#FFD700]/10 px-2 py-0.5 rounded">Right Side</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 relative">
                      <img
                        :src="editingSection.content.after_image || '/images/1.jpg'"
                        alt="After Preview"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.src = '/images/1.jpg'"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-white truncate">
                        {{ editingSection.content.after_image?.split('/').pop() || '1.jpg' }}
                      </p>
                      <p class="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                        {{ editingSection.content.after_image || '/images/1.jpg' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      v-model="editingSection.content.after_image"
                      placeholder="Image URL or choose photo..."
                      :class="adminModalTokens.input"
                      class="flex-1"
                    />
                    <button
                      type="button"
                      @click="openMediaPicker('after_image')"
                      class="px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                    >
                      <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Choose</span>
                    </button>
                  </div>

                  <div>
                    <label :class="adminModalTokens.inputLabel">Badge Label</label>
                    <input
                      type="text"
                      v-model="editingSection.content.after_label"
                      placeholder="Master Grade"
                      :class="adminModalTokens.input"
                    />
                  </div>
                </div>
              </div>

              <!-- Interactive Slider Notice Box -->
              <div :class="adminModalTokens.noticeBox">
                <div class="flex items-start gap-2.5">
                  <Sparkles class="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                  <div class="space-y-1">
                    <p class="text-xs text-white font-medium">Interactive Comparison Tips:</p>
                    <p class="text-[11px] text-neutral-400 font-sans">
                      Ensure both RAW and Master Graded images have matching aspect ratios (e.g. 16:10 or 3:2) and aligned crop framing so clients can seamlessly drag the divider to inspect skin tones, lighting, and depth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Editorial Filmstrip & Milestone Reels Specific Fields -->
          <div
            v-else-if="editingSection.section_type === 'filmstrip' || (editingSection.section_type === 'carousel' && (editingSection.content?.variant === 'filmstrip' || editingSection.label?.toLowerCase().includes('filmstrip')))"
            :class="adminModalTokens.sectionSpacing"
          >
            <!-- 1. Header & Copywriting -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Header & Copywriting</label>
                  <p :class="adminModalTokens.cardSubtitle">Titles and subtitles displayed above the 35mm filmstrip</p>
                </div>
                <span class="text-[11px] text-[#FFD700] uppercase font-mono tracking-wider font-semibold">35mm Filmstrip</span>
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Badge / Eyebrow Text (Optional)</label>
                <input
                  type="text"
                  v-model="editingSection.content.badge_text"
                  placeholder="35MM DOCUMENTARY ARCHIVE"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Section Title</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="EDITORIAL FILMSTRIP & MILESTONE REELS"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Section Subtitle / Description</label>
                <textarea
                  v-model="editingSection.content.subtitle"
                  rows="2"
                  placeholder="Snapshot frames and documentary highlights from recent events"
                  :class="adminModalTokens.textarea"
                ></textarea>
              </div>
            </div>

            <!-- 2. Filmstrip Milestone Frames (Max 10) -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">35mm Filmstrip Frames</label>
                  <p :class="adminModalTokens.cardSubtitle">Select up to 10 milestone frames. Each frame features 35mm casing, FR stamp, and lightbox zoom.</p>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="adminModalTokens.cardCounterBadge">
                    {{ getCarouselItems(editingSection.content).length }} / 10 Frames
                  </span>
                  <button
                    type="button"
                    @click="openMediaPicker('carousel_add_image')"
                    :disabled="getCarouselItems(editingSection.content).length >= 10"
                    :class="[
                      adminModalTokens.btnSecondary,
                      getCarouselItems(editingSection.content).length >= 10 ? 'opacity-40 cursor-not-allowed' : ''
                    ]"
                  >
                    <Plus class="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Add Frame</span>
                  </button>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="getCarouselItems(editingSection.content).length === 0" class="text-center py-10 text-neutral-500 space-y-2">
                <Film class="w-8 h-8 mx-auto text-neutral-600" />
                <p class="text-xs">No filmstrip frames added yet.</p>
                <button
                  type="button"
                  @click="openMediaPicker('carousel_add_image')"
                  :class="adminModalTokens.btnPrimary"
                  class="!py-2 !px-4 text-xs inline-flex items-center gap-1.5"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Choose from Media Library</span>
                </button>
              </div>

              <!-- Frames List -->
              <div v-else class="space-y-3">
                <div
                  v-for="(item, itemIdx) in getCarouselItems(editingSection.content)"
                  :key="item.id || itemIdx"
                  class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition space-y-3 group"
                >
                  <div class="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-mono text-[#FFD700] flex items-center justify-center font-bold">
                        {{ itemIdx + 1 < 10 ? '0' + (itemIdx + 1) : itemIdx + 1 }}
                      </span>
                      <span class="text-xs font-bold text-white">FR // {{ itemIdx + 1 < 10 ? '0' + (itemIdx + 1) : itemIdx + 1 }}</span>
                    </div>

                    <!-- Actions: Reorder & Delete -->
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        :disabled="itemIdx === 0"
                        @click="moveCarouselItem(itemIdx, -1)"
                        title="Move Left/Earlier"
                        class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronUp class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        :disabled="itemIdx === getCarouselItems(editingSection.content).length - 1"
                        @click="moveCarouselItem(itemIdx, 1)"
                        title="Move Right/Later"
                        class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronDown class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        @click="removeCarouselItem(itemIdx)"
                        title="Delete Frame"
                        class="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer ml-1"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Frame Details: Thumbnail + Sequence Title + Tag -->
                  <div class="flex flex-col sm:flex-row items-start gap-4">
                    <!-- Photo Thumbnail (3:2 classic film ratio) -->
                    <div class="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0 relative group/thumb">
                      <img
                        :src="item.image_url"
                        alt="Frame Preview"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.src = '/images/1.jpg'"
                      />
                      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          @click="openMediaPicker(`carousel_item_image_${itemIdx}`)"
                          class="px-2.5 py-1 rounded-lg bg-[#FFD700] text-black text-[11px] font-bold uppercase transition cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <!-- Title and Tag inputs -->
                    <div class="flex-1 min-w-0 w-full space-y-2">
                      <div>
                        <label :class="adminModalTokens.inputLabel">Milestone Title / Caption</label>
                        <input
                          type="text"
                          v-model="item.title"
                          placeholder="e.g. Sunset Ceremony Vows"
                          :class="adminModalTokens.input"
                        />
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                          <label :class="adminModalTokens.inputLabel">Stamp / Category</label>
                          <input
                            type="text"
                            v-model="item.category"
                            placeholder="e.g. 35MM RAW or Weddings"
                            :class="adminModalTokens.input"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            @click="openMediaPicker(`carousel_item_image_${itemIdx}`)"
                            :class="adminModalTokens.btnSecondary"
                            class="w-full justify-center !py-2.5"
                          >
                            <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                            <span>Replace Photo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Notice Box for Filmstrip -->
            <div :class="adminModalTokens.noticeBox">
              <div class="flex items-start gap-2.5">
                <Film class="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <p class="text-xs text-white font-medium">Editorial Filmstrip Tips:</p>
                  <p class="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    The Editorial Filmstrip renders authentic Kodak 400 sprocket ribbons, vintage frame stamp numbers (FR // XX), and 24 FPS markers. Visitors can scroll smoothly along the documentary track with navigation arrows or touch gestures, and click any frame to expand it in high resolution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Curated Featured Works Slider Specific Fields -->
          <div v-else-if="editingSection.section_type === 'carousel'" :class="adminModalTokens.sectionSpacing">
            <!-- 1. Header & Copywriting -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Header & Copywriting</label>
                  <p :class="adminModalTokens.cardSubtitle">Titles and subtitles displayed above the showcase slider</p>
                </div>
                <span class="text-[11px] text-[#FFD700] uppercase font-mono tracking-wider font-semibold">Featured Works</span>
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Top Eyebrow / Badge Text (Optional)</label>
                <input
                  type="text"
                  v-model="editingSection.content.badge_text"
                  placeholder="e.g. CURATED SHOWCASE"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Section Title</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="PORTFOLIO SHOWCASE"
                  :class="adminModalTokens.input"
                />
              </div>

              <div>
                <label :class="adminModalTokens.inputLabel">Section Subtitle / Description</label>
                <textarea
                  v-model="editingSection.content.subtitle"
                  rows="2"
                  placeholder="A visual collection of timeless weddings, portraits, and milestones."
                  :class="adminModalTokens.textarea"
                ></textarea>
              </div>
            </div>

            <!-- 2. Category Filter Buttons -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Category Filter Buttons</label>
                  <p :class="adminModalTokens.cardSubtitle">Add custom categories to filter photos ('All' is included automatically)</p>
                </div>
                <span :class="adminModalTokens.cardCounterBadge">
                  {{ getCarouselCategories(editingSection.content).length }} Categories
                </span>
              </div>

              <!-- List of Active Categories (Pills) -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Static 'All' pill preview -->
                <div class="px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-60 cursor-default">
                  <span>All</span>
                  <span class="text-[10px] text-neutral-400 font-mono">(System)</span>
                </div>

                <div
                  v-for="(cat, cIdx) in getCarouselCategories(editingSection.content)"
                  :key="cIdx"
                  class="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 group hover:border-[#FFD700]/40 transition"
                >
                  <span>{{ cat }}</span>
                  <button
                    type="button"
                    @click="removeCarouselCategory(cIdx)"
                    class="w-4 h-4 rounded-full text-neutral-400 hover:text-red-400 hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
                    title="Remove Category"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Add New Category Form -->
              <div class="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <input
                  type="text"
                  v-model="newCarouselCategoryInput"
                  @keydown.enter.prevent="addCarouselCategory"
                  placeholder="New category name (e.g. Editorial, Drone, Pre-Nup)..."
                  :class="adminModalTokens.input"
                  class="flex-1"
                />
                <button
                  type="button"
                  @click="addCarouselCategory"
                  :disabled="!newCarouselCategoryInput.trim()"
                  :class="[
                    adminModalTokens.btnSecondary,
                    !newCarouselCategoryInput.trim() ? 'opacity-40 cursor-not-allowed' : ''
                  ]"
                >
                  <Plus class="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            <!-- 3. Curated Showcase Cards (Max 10) -->
            <div :class="adminModalTokens.cardSpacious">
              <div :class="adminModalTokens.cardHeader">
                <div>
                  <label :class="adminModalTokens.cardLabel">Curated Showcase Photos</label>
                  <p :class="adminModalTokens.cardSubtitle">Select up to 10 photos from media library. Cards loop seamlessly and open image viewer.</p>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="adminModalTokens.cardCounterBadge">
                    {{ getCarouselItems(editingSection.content).length }} / 10 Photos
                  </span>
                  <button
                    type="button"
                    @click="openMediaPicker('carousel_add_image')"
                    :disabled="getCarouselItems(editingSection.content).length >= 10"
                    :class="[
                      adminModalTokens.btnSecondary,
                      getCarouselItems(editingSection.content).length >= 10 ? 'opacity-40 cursor-not-allowed' : ''
                    ]"
                  >
                    <Plus class="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Add Photo</span>
                  </button>
                </div>
              </div>

              <!-- Photos List -->
              <div v-if="getCarouselItems(editingSection.content).length === 0" class="text-center py-10 text-neutral-500 space-y-2">
                <ImageIcon class="w-8 h-8 mx-auto text-neutral-600" />
                <p class="text-xs">No showcase photos added yet.</p>
                <button
                  type="button"
                  @click="openMediaPicker('carousel_add_image')"
                  :class="adminModalTokens.btnPrimary"
                  class="!py-2 !px-4 text-xs inline-flex items-center gap-1.5"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Choose from Media Library</span>
                </button>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="(item, itemIdx) in getCarouselItems(editingSection.content)"
                  :key="item.id || itemIdx"
                  class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition space-y-3 group"
                >
                  <div class="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-mono text-[#FFD700] flex items-center justify-center font-bold">
                        {{ itemIdx + 1 }}
                      </span>
                      <span class="text-xs font-bold text-white">Card #{{ itemIdx + 1 }}</span>
                    </div>

                    <!-- Actions: Reorder & Delete -->
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        :disabled="itemIdx === 0"
                        @click="moveCarouselItem(itemIdx, -1)"
                        title="Move Up"
                        class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronUp class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        :disabled="itemIdx === getCarouselItems(editingSection.content).length - 1"
                        @click="moveCarouselItem(itemIdx, 1)"
                        title="Move Down"
                        class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronDown class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        @click="removeCarouselItem(itemIdx)"
                        title="Delete Card"
                        class="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer ml-1"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Card Content: Image Preview + Category -->
                  <div class="flex flex-col sm:flex-row items-start gap-4">
                    <!-- Photo Thumbnail -->
                    <div class="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0 relative group/thumb">
                      <img
                        :src="item.image_url"
                        alt="Showcase Preview"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.src = '/images/1.jpg'"
                      />
                      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          @click="openMediaPicker(`carousel_item_image_${itemIdx}`)"
                          class="px-2.5 py-1 rounded-lg bg-[#FFD700] text-black text-[11px] font-bold uppercase transition cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <!-- Details: Category & Media Selection -->
                    <div class="flex-1 min-w-0 w-full flex flex-col justify-center">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                          <label :class="adminModalTokens.inputLabel">Category Tag</label>
                          <select
                            v-model="item.category"
                            :class="adminModalTokens.modalSelect"
                          >
                            <option
                              v-for="cat in getCarouselCategories(editingSection.content)"
                              :key="cat"
                              :value="cat"
                            >
                              {{ cat }}
                            </option>
                          </select>
                        </div>
                        <div>
                          <label :class="adminModalTokens.inputLabel">Replace Photo</label>
                          <button
                            type="button"
                            @click="openMediaPicker(`carousel_item_image_${itemIdx}`)"
                            :class="adminModalTokens.btnSecondary"
                            class="w-full justify-center !py-2.5"
                          >
                            <ImageIcon class="w-3.5 h-3.5 text-[#FFD700]" />
                            <span>Media Library</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Notice Box -->
            <div :class="adminModalTokens.noticeBox">
              <div class="flex items-start gap-2.5">
                <Sparkles class="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <p class="text-xs text-white font-medium">Curated Works Slider Tips:</p>
                  <p class="text-[11px] text-neutral-400 font-sans">
                    The showcase cards are expanded to panoramic format and support smooth infinite looping without gaps. Clicking on any card opens the fullscreen high-resolution image viewer with arrow navigation and keyboard support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- About / Studio Highlights Specific Fields -->
          <div v-else-if="editingSection.section_type === 'about'" class="space-y-6">
            <!-- 1. Headline & Bio Information -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">About Studio Copywriting</label>
                <span class="text-[11px] text-neutral-500 font-mono">Highlights</span>
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Top Badge Text</label>
                <input
                  type="text"
                  v-model="editingSection.content.badge_text"
                  placeholder="ABOUT RGP FILMS & STUDIO"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Section Title</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="BEHIND THE LENS"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Studio Bio / Story</label>
                <textarea
                  v-model="editingSection.content.subtitle"
                  rows="3"
                  placeholder="We believe that every love story, every milestone, and every human celebration is art..."
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition leading-relaxed"
                ></textarea>
              </div>
            </div>

            <!-- 2. Studio Portrait Media Selection -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Studio Portrait Media</label>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Select a photo from your media showcase</p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 shrink-0 relative">
                    <img
                      :src="editingSection.content.image_url || '/images/main-shot.jpg'"
                      alt="About Studio Image Preview"
                      class="w-full h-full object-cover"
                      @error="(e) => e.target.src = '/images/main-shot.jpg'"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-white truncate">
                      {{ editingSection.content.image_url?.split('/').pop() || 'main-shot.jpg' }}
                    </p>
                    <p class="text-[11px] text-neutral-400 truncate mt-1 font-mono">
                      {{ editingSection.content.image_url || '/images/main-shot.jpg' }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  @click="openMediaPicker('image_url')"
                  class="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                >
                  <ImageIcon class="w-4 h-4 text-[#FFD700]" />
                  <span>Choose Photo</span>
                </button>
              </div>
            </div>

            <!-- 3. Milestone Stats Counters -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div class="border-b border-white/[0.06] pb-3">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Milestone Stats (3 Counters)</label>
                <p class="text-[11px] text-neutral-500 mt-0.5">Key numerical milestones displayed underneath the bio</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="space-y-1.5">
                  <input
                    type="text"
                    v-model="editingSection.content.stat1_value"
                    placeholder="Stat 1: 5+"
                    class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-bold"
                  />
                  <input
                    type="text"
                    v-model="editingSection.content.stat1_label"
                    placeholder="Label: Years Experience"
                    class="w-full px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-neutral-300 text-xs placeholder-neutral-500 focus:outline-none focus:border-white/20 transition"
                  />
                </div>
                <div class="space-y-1.5">
                  <input
                    type="text"
                    v-model="editingSection.content.stat2_value"
                    placeholder="Stat 2: 250+"
                    class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-bold"
                  />
                  <input
                    type="text"
                    v-model="editingSection.content.stat2_label"
                    placeholder="Label: Events Documented"
                    class="w-full px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-neutral-300 text-xs placeholder-neutral-500 focus:outline-none focus:border-white/20 transition"
                  />
                </div>
                <div class="space-y-1.5">
                  <input
                    type="text"
                    v-model="editingSection.content.stat3_value"
                    placeholder="Stat 3: 100%"
                    class="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-bold"
                  />
                  <input
                    type="text"
                    v-model="editingSection.content.stat3_label"
                    placeholder="Label: Client Satisfaction"
                    class="w-full px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-neutral-300 text-xs placeholder-neutral-500 focus:outline-none focus:border-white/20 transition"
                  />
                </div>
              </div>
            </div>

            <!-- 4. CTA Button & Destination -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div class="border-b border-white/[0.06] pb-3">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Call to Action Button</label>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-neutral-300 mb-2">Button Label</label>
                  <input
                    type="text"
                    v-model="editingSection.content.cta_text"
                    placeholder="GET IN TOUCH"
                    class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-neutral-300 mb-2">Target Link Destination</label>
                  <input
                    type="text"
                    v-model="editingSection.content.cta_link"
                    placeholder="#contact"
                    class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Process Timeline Specific Fields -->
          <div v-else-if="editingSection.section_type === 'process'" class="space-y-6">
            <!-- 1. Header Copywriting -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Process Header Copywriting</label>
                <span class="text-[11px] text-neutral-500 font-mono">{{ (editingSection.content.steps || []).length }} Steps</span>
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Top Badge Text</label>
                <input
                  type="text"
                  v-model="editingSection.content.badge_text"
                  placeholder="HOW WE WORK"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Section Title</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="OUR CLIENT PROCESS"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Subtitle / Overview</label>
                <textarea
                  v-model="editingSection.content.subtitle"
                  rows="3"
                  placeholder="A seamless, stress-free experience crafted around your milestones."
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition leading-relaxed"
                ></textarea>
              </div>
            </div>

            <!-- 2. Dynamic Workflow Steps Builder -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Workflow Steps</label>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Add, edit, reorder, or remove steps in your timeline</p>
                </div>
                <button
                  type="button"
                  @click="addProcessStep"
                  class="px-3.5 py-2 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </div>

              <!-- Steps List -->
              <div class="space-y-3">
                <div
                  v-for="(stepItem, sIdx) in (editingSection.content.steps || [])"
                  :key="sIdx"
                  class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 hover:border-white/20 transition group"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-mono text-[#FFD700] flex items-center justify-center font-bold">
                        {{ sIdx + 1 }}
                      </span>
                      <span class="text-xs font-bold text-white">Step {{ sIdx + 1 }}</span>
                    </div>

                    <!-- Actions: Move Up / Down / Remove -->
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        :disabled="sIdx === 0"
                        @click="moveProcessStep(sIdx, -1)"
                        title="Move Up"
                        class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronUp class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        :disabled="sIdx === (editingSection.content.steps.length - 1)"
                        @click="moveProcessStep(sIdx, 1)"
                        title="Move Down"
                        class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronDown class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        @click="removeProcessStep(sIdx)"
                        title="Delete Step"
                        class="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer ml-1"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div class="sm:col-span-1">
                      <label class="block text-[11px] font-medium text-neutral-400 mb-1">Badge</label>
                      <input
                        type="text"
                        v-model="stepItem.step"
                        :placeholder="sIdx + 1 < 10 ? '0' + (sIdx + 1) : String(sIdx + 1)"
                        class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs font-mono placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                      />
                    </div>
                    <div class="sm:col-span-3">
                      <label class="block text-[11px] font-medium text-neutral-400 mb-1">Title</label>
                      <input
                        type="text"
                        v-model="stepItem.title"
                        placeholder="e.g. Consultation & Date Lock"
                        class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-medium text-neutral-400 mb-1">Description</label>
                    <textarea
                      v-model="stepItem.desc"
                      rows="2"
                      placeholder="Briefly describe what happens during this step..."
                      class="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition leading-relaxed"
                    ></textarea>
                  </div>
                </div>

                <div v-if="!editingSection.content.steps || editingSection.content.steps.length === 0" class="text-center py-6 text-neutral-500 text-xs border border-dashed border-white/10 rounded-2xl">
                  No steps yet. Click "+ Add Step" above to create your first workflow step.
                </div>
              </div>
            </div>
          </div>

          <!-- Gear Arsenal Specific Fields -->
          <div v-else-if="editingSection.section_type === 'gear'" class="space-y-6">
            <!-- 1. Header Copywriting -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Gear Arsenal Copywriting</label>
                <span class="text-[11px] text-neutral-500 font-mono">{{ (editingSection.content.categories || []).length }} Cards</span>
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Top Badge Text</label>
                <input
                  type="text"
                  v-model="editingSection.content.badge_text"
                  placeholder="PRODUCTION STANDARDS"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Section Title</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="OUR PRODUCTION GEAR & ARSENAL"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Subtitle / Overview</label>
                <textarea
                  v-model="editingSection.content.subtitle"
                  rows="3"
                  placeholder="We invest in top-tier camera and audio gear to ensure your story is captured in breathtaking cinematic quality."
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition leading-relaxed"
                ></textarea>
              </div>
            </div>

            <!-- 2. Dynamic Gear Category Cards Builder -->
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Gear Category Cards</label>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Add equipment groups, camera bodies, lenses, and lighting rigs</p>
                </div>
                <button
                  type="button"
                  @click="addGearCategory"
                  class="px-3.5 py-2 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add Gear Card</span>
                </button>
              </div>

              <!-- Categories List -->
              <div class="space-y-4">
                <div
                  v-for="(catItem, cIdx) in (editingSection.content.categories || [])"
                  :key="cIdx"
                  class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5 hover:border-white/20 transition group"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-mono text-[#FFD700] flex items-center justify-center font-bold">
                        {{ cIdx + 1 }}
                      </span>
                      <span class="text-xs font-bold text-white">Card {{ cIdx + 1 }}</span>
                    </div>

                    <!-- Actions: Move Up / Down / Remove Category -->
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        :disabled="cIdx === 0"
                        @click="moveGearCategory(cIdx, -1)"
                        title="Move Up"
                        class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronUp class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        :disabled="cIdx === (editingSection.content.categories.length - 1)"
                        @click="moveGearCategory(cIdx, 1)"
                        title="Move Down"
                        class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronDown class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        @click="removeGearCategory(cIdx)"
                        title="Delete Card"
                        class="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer ml-1"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Category Title -->
                  <div>
                    <label class="block text-[11px] font-medium text-neutral-400 mb-1">Category Title</label>
                    <input
                      type="text"
                      v-model="catItem.group"
                      placeholder="e.g. Cameras & Cinema Bodies"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-medium"
                    />
                  </div>

                  <!-- Equipment Items inside Category -->
                  <div class="space-y-2 pt-1 border-t border-white/[0.06]">
                    <div class="flex items-center justify-between">
                      <label class="block text-[11px] font-medium text-neutral-400">Equipment List Items</label>
                      <button
                        type="button"
                        @click="addGearItem(cIdx)"
                        class="text-[11px] text-[#FFD700] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Plus class="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div class="space-y-2">
                      <div
                        v-for="(eqItem, eqIdx) in (catItem.items || [])"
                        :key="eqIdx"
                        class="flex items-center gap-2"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-[#FFD700] shrink-0"></span>
                        <input
                          type="text"
                          v-model="catItem.items[eqIdx]"
                          placeholder="e.g. Sony A7S III (4K 120fps Cinema)"
                          class="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                        />
                        <button
                          type="button"
                          @click="removeGearItem(cIdx, eqIdx)"
                          class="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                          title="Remove item"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div
                        v-if="!catItem.items || catItem.items.length === 0"
                        class="text-neutral-500 text-[11px] italic py-1"
                      >
                        No equipment items yet. Click "+ Add Item" above.
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="!editingSection.content.categories || editingSection.content.categories.length === 0" class="text-center py-6 text-neutral-500 text-xs border border-dashed border-white/10 rounded-2xl">
                  No gear cards yet. Click "+ Add Gear Card" above to create your first equipment category.
                </div>
              </div>
            </div>
          </div>

          <!-- Text Block / Studio Philosophy Manifesto Specific Fields -->
          <div v-else-if="editingSection.section_type === 'text_block'" class="space-y-6">
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
              <div class="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">Manifesto Copywriting</label>
                <span class="text-[11px] text-neutral-500 font-mono">Philosophy</span>
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Heading</label>
                <input
                  type="text"
                  v-model="editingSection.content.title"
                  placeholder="Our Studio Philosophy"
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-2">Body Text</label>
                <textarea
                  v-model="editingSection.content.body"
                  rows="6"
                  placeholder="We believe that every love story, celebration, and portrait is a piece of art waiting to be captured with authentic emotion and timeless color grading."
                  class="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition leading-relaxed"
                ></textarea>
              </div>
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
            <div v-if="'heading' in editingSection.content">
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Heading</label>
              <input
                type="text"
                v-model="editingSection.content.heading"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div v-if="'subheading' in editingSection.content">
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Subheading</label>
              <input
                type="text"
                v-model="editingSection.content.subheading"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div v-if="'button_text' in editingSection.content">
              <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Button Text</label>
              <input
                type="text"
                v-model="editingSection.content.button_text"
                class="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>
        </div>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-white/[0.08] bg-[#151515] flex items-center justify-between shrink-0">
          <button
            @click="editingSection = null"
            class="px-5 py-2.5 rounded-xl border border-white/10 text-neutral-400 hover:text-white text-xs font-medium hover:bg-white/[0.05] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="handleSaveEdit"
            class="px-6 py-2.5 rounded-xl bg-[#FFD700] text-[#121212] font-bold text-xs uppercase hover:bg-yellow-400 transition shadow-md shadow-yellow-500/20 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MEDIA SHOWCASE PICKER MODAL -->
    <!-- ========================================== -->
    <div
      v-if="isMediaPickerOpen"
      class="fixed inset-0 bg-black/85 backdrop-blur-md z-[80] flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-5">
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-4">
          <div>
            <h3 class="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <ImageIcon class="w-5 h-5 text-[#FFD700]" />
              <span>Select Media from Showcase</span>
            </h3>
            <p class="text-xs text-neutral-400 mt-0.5">
              {{ mediaPickerTargetField === 'carousel_add_image' ? 'Add a curated showcase photo to your slider (max 10).' : (typeof mediaPickerTargetField === 'string' && mediaPickerTargetField.startsWith('carousel_item_image_') ? 'Replace photo for this curated showcase card.' : (mediaPickerTargetField === 'image_url' ? 'Choose an image from your media library for this section.' : 'Choose an image from your media library for the background.')) }}
            </p>
          </div>
          <button @click="isMediaPickerOpen = false" class="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Search & Folder Tabs -->
        <div class="space-y-3">
          <!-- Search Bar -->
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              v-model="mediaPickerSearch"
              placeholder="Search by title or category..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <!-- Folder Category Chips -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              @click="mediaPickerActiveFolder = 'All'"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer"
              :class="[
                mediaPickerActiveFolder === 'All'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-white/[0.02] text-neutral-400 hover:text-white border border-white/[0.05]'
              ]"
            >
              <span>All Media</span>
              <span class="text-[10px] opacity-70">({{ gallery.length }})</span>
            </button>
            <button
              v-for="f in folders"
              :key="f"
              type="button"
              @click="mediaPickerActiveFolder = f"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer"
              :class="[
                mediaPickerActiveFolder === f
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-white/[0.02] text-neutral-400 hover:text-white border border-white/[0.05]'
              ]"
            >
              <FolderIcon class="w-3 h-3 text-neutral-500" />
              <span>{{ f }}</span>
              <span class="text-[10px] opacity-70">({{ folderCounts[f] || 0 }})</span>
            </button>
          </div>
        </div>

        <!-- Media Grid (Scrollable) -->
        <div class="flex-1 overflow-y-auto pr-1 min-h-[280px] max-h-[380px]">
          <div v-if="pickerFilteredMedia.length === 0" class="flex flex-col items-center justify-center py-16 text-neutral-500 space-y-2">
            <ImageIcon class="w-10 h-10 text-neutral-600" />
            <p class="text-xs">No media found matching your criteria.</p>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              v-for="item in pickerFilteredMedia"
              :key="item.id"
              type="button"
              @click="selectImageForHero(item.image_url)"
              class="group relative rounded-2xl overflow-hidden border text-left transition aspect-[4/3] bg-neutral-900 focus:outline-none cursor-pointer"
              :class="[
                isCurrentPickerImage(item.image_url)
                  ? 'border-white/40 ring-2 ring-[#FFD700]/50'
                  : 'border-white/10 hover:border-white/30'
              ]"
            >
              <img
                :src="item.image_url"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <!-- Category Badge -->
              <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-mono text-neutral-300 uppercase tracking-wider border border-white/10">
                {{ item.category || 'General' }}
              </span>

              <!-- Selected Checkmark Dot -->
              <div
                v-if="isCurrentPickerImage(item.image_url)"
                class="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FFD700] text-black flex items-center justify-center shadow-lg"
              >
                <Check class="w-3 h-3 stroke-[3]" />
              </div>

              <!-- Title on Bottom -->
              <div class="absolute bottom-2 left-2 right-2 truncate">
                <p class="text-[11px] font-medium text-white truncate">{{ item.title || item.image_url.split('/').pop() }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            @click="isMediaPickerOpen = false"
            class="px-5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 text-xs font-semibold transition cursor-pointer"
          >
            Close
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
              <p class="text-xs text-neutral-400">Choose from {{ totalDesignsCount }} distinct visual design variations across {{ sectionCategoryCatalog.length }} categories (4 designs each)</p>
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
          
          <!-- LEFT SIDEBAR: CATEGORIES LIST (9 CATEGORIES) -->
          <div class="w-full md:w-72 bg-[#111111] border-b md:border-b-0 md:border-r border-white/[0.08] p-4 overflow-y-auto space-y-1.5 flex-shrink-0">
            <div class="px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Section Categories ({{ sectionCategoryCatalog.length }})
            </div>

            <button
              v-for="cat in sectionCategoryCatalog"
              :key="cat.key"
              @click="activeCategoryKey = cat.key"
              class="w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 group"
              :class="[
                activeCategoryKey === cat.key
                  ? 'bg-white/[0.08] border border-white/20 shadow-md'
                  : 'hover:bg-white/[0.04] border border-transparent'
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition"
                  :class="[
                    activeCategoryKey === cat.key
                      ? 'bg-white/90 text-black'
                      : 'bg-white/[0.05] text-neutral-300 group-hover:text-white'
                  ]"
                >
                  <component :is="cat.icon" class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <h4
                    class="text-xs font-bold truncate transition"
                    :class="[activeCategoryKey === cat.key ? 'text-white' : 'text-neutral-300 group-hover:text-white']"
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
                    ? 'bg-white/10 text-neutral-200'
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
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase border" :class="activeCategory.badgeColor">
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
                class="p-4 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-white/25 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4 shadow-xl hover:scale-[1.01]"
              >
                <!-- Wireframe Layout Skeleton Preview -->
                <SectionSkeletonPreview :type="design.skeletonType || design.type" />

                <!-- Design Details -->
                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-sm font-bold text-white group-hover:text-neutral-100 transition tracking-wide leading-snug">
                      {{ design.name }}
                    </h4>
                    <span
                      v-if="design.tag"
                      class="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-neutral-300 text-[10px] font-medium tracking-wider flex-shrink-0"
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
                      <span class="w-1.5 h-1.5 rounded-full bg-neutral-500 flex-shrink-0"></span>
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
                    class="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-[#FFD700] hover:text-black text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
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
