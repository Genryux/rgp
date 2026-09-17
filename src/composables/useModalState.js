import { ref, computed, watch } from 'vue';

const modalCount = ref(0);

// Global body scroll lock handler
function updateBodyScrollLock(isLocked) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const body = document.body;
  const html = document.documentElement;

  if (isLocked) {
    if (!body.classList.contains('rgp-modal-locked')) {
      const scrollbarWidth = window.innerWidth - html.clientWidth;
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
      body.classList.add('rgp-modal-locked');
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    }
  } else {
    body.classList.remove('rgp-modal-locked');
    body.style.overflow = '';
    html.style.overflow = '';
    body.style.paddingRight = '';
  }
}

// Watch modal count and toggle body lock reactively
watch(
  modalCount,
  (count) => {
    updateBodyScrollLock(count > 0);
  },
  { immediate: true }
);

export function useModalState() {
  const isAnyModalOpen = computed(() => modalCount.value > 0);

  function openModal() {
    modalCount.value++;
  }

  function closeModal() {
    modalCount.value = Math.max(0, modalCount.value - 1);
  }

  function resetModals() {
    modalCount.value = 0;
  }

  return {
    modalCount,
    isAnyModalOpen,
    openModal,
    closeModal,
    resetModals,
  };
}
