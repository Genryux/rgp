<script setup>
import { onMounted } from 'vue';
import Navbar from '../components/public/Navbar.vue';
import Footer from '../components/public/Footer.vue';

// Section components
import HeroSection from '../components/public/sections/HeroSection.vue';
import CarouselSection from '../components/public/sections/CarouselSection.vue';
import VideoSection from '../components/public/sections/VideoSection.vue';
import RatesSection from '../components/public/sections/RatesSection.vue';
import AboutSection from '../components/public/sections/AboutSection.vue';
import GalleryGridSection from '../components/public/sections/GalleryGridSection.vue';
import TextBlockSection from '../components/public/sections/TextBlockSection.vue';
import TestimonialsSection from '../components/public/sections/TestimonialsSection.vue';
import FaqSection from '../components/public/sections/FaqSection.vue';
import CtaSection from '../components/public/sections/CtaSection.vue';
import ContactSection from '../components/public/sections/ContactSection.vue';
import ProcessSection from '../components/public/sections/ProcessSection.vue';
import TeamSection from '../components/public/sections/TeamSection.vue';
import VenuesMarqueeSection from '../components/public/sections/VenuesMarqueeSection.vue';
import GearSection from '../components/public/sections/GearSection.vue';
import InstagramFeedSection from '../components/public/sections/InstagramFeedSection.vue';
import LocationMapSection from '../components/public/sections/LocationMapSection.vue';
import BeforeAfterSection from '../components/public/sections/BeforeAfterSection.vue';

import { useSections } from '../composables/useSections';
import { usePackages } from '../composables/usePackages';
import { useGallery } from '../composables/useGallery';
import { useSettings } from '../composables/useSettings';

const { visibleSections, fetchSections } = useSections();
const { fetchPackages } = usePackages();
const { fetchGallery } = useGallery();
const { fetchSettings } = useSettings();

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

onMounted(() => {
  fetchSections();
  fetchPackages();
  fetchGallery();
  fetchSettings();
});
</script>

<template>
  <div class="bg-[#141414] min-h-screen text-[#f8f8f8] selection:bg-[#FFD700] selection:text-black">
    <!-- Top Navigation Bar -->
    <Navbar />

    <!-- Dynamic Section Blocks in Configured Order -->
    <main>
      <component
        v-for="sec in visibleSections"
        :key="sec.id"
        :is="sectionComponents[sec.section_type] || TextBlockSection"
        :content="sec.content"
      />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>
