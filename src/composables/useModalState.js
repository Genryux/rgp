import { ref, computed } from 'vue';

const modalCount = ref(0);

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
