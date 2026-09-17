/**
 * RGP Films & Studio - Admin UI & Modal Design Tokens
 * 
 * Reusable design patterns, container styling, and component tokens
 * for Admin Drawers, Modals, Page Builder editors, and Form controls.
 */

export const adminModalTokens = {
  // =========================================================================
  // Standard Modal Architecture (Fixed Header, Scrollable Body, Fixed Footer)
  // =========================================================================
  modalOverlay: 'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none',
  modalContainer: 'bg-[#141414] border border-white/[0.12] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden',
  modalContainerMd: 'bg-[#141414] border border-white/[0.12] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden',
  modalContainerSm: 'bg-[#141414] border border-white/[0.12] rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden',
  modalContainerLg: 'bg-[#141414] border border-white/[0.12] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden',

  // Modal Fixed Header
  modalHeader: 'flex justify-between items-center border-b border-white/[0.08] p-6 md:px-8 py-5 shrink-0 bg-[#141414]',
  modalTitle: 'text-xl font-bold text-white tracking-wide',
  modalSubtitle: 'text-xs text-neutral-400 mt-0.5',
  modalCloseBtn: 'w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm',

  // Modal Scrollable Body
  modalBody: 'flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-6',
  modalBodySpacious: 'flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-8',
  modalBodyCompact: 'flex-1 overflow-y-auto p-5 md:px-6 py-5 space-y-4',

  // Modal Form Layout Grids & Inputs
  modalGrid2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  modalGrid3: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  modalInputLabel: 'block text-xs font-medium text-neutral-300 mb-1.5',
  modalInput: 'w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition',
  modalSelect: 'w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition',
  modalTextarea: 'w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition leading-relaxed',

  // Modal Sub-Section Cards, Inclusions & Checkboxes
  modalSectionCard: 'p-5 rounded-3xl bg-black/40 border border-white/[0.08] space-y-4',
  modalSectionCardHeader: 'flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3',
  modalSectionTitle: 'text-sm font-semibold text-white tracking-wide',
  modalCheckboxCard: 'p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]',
  modalInclusionCard: 'p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer',
  modalInclusionCardDefault: 'bg-transparent border-white/[0.12] text-neutral-300 hover:bg-white/[0.04] hover:border-white/25',
  modalInclusionCardSelected: 'bg-[#FFD700]/10 border-[#FFD700]/40 text-white shadow-sm',
  modalFilterPillActive: 'bg-white/20 text-white font-semibold',
  modalFilterPillInactive: 'bg-white/[0.03] text-neutral-400 hover:text-white',
  modalBtnAddInline: 'px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0',

  // Modal Fixed Footer & Matched Action Buttons
  modalFooter: 'flex justify-end items-center gap-3 p-6 md:px-8 py-4 border-t border-white/[0.08] bg-[#141414] shrink-0',
  modalBtnCancel: 'cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center flex items-center justify-center',
  modalBtnSave: 'cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/20 text-center flex items-center justify-center',
  modalBtnPrimary: 'cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/20 text-center flex items-center justify-center',
  modalBtnSecondary: 'cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center flex items-center justify-center',
  modalBtnDanger: 'cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-semibold transition text-center flex items-center justify-center',

  // =========================================================================
  // Drawer & Sidebar Spacing Containers
  // =========================================================================
  drawerBody: 'flex-1 overflow-y-auto p-8 space-y-8',
  sectionSpacing: 'space-y-8',
  innerSectionSpacing: 'space-y-5',

  // Card Containers
  card: 'p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4',
  cardSpacious: 'p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5',
  cardCompact: 'p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]',

  // Card Headers
  cardHeader: 'flex items-center justify-between border-b border-white/[0.06] pb-3',
  cardHeaderWrap: 'flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3',
  cardLabel: 'block text-xs font-semibold uppercase tracking-wider text-neutral-300',
  cardSubtitle: 'text-[11px] text-neutral-500 mt-0.5',
  cardCounterBadge: 'text-[11px] text-[#FFD700] uppercase font-mono tracking-wider font-semibold',

  // Form Labels & Inputs
  inputLabel: 'block text-xs font-medium text-neutral-300 mb-1.5',
  inputLabelUppercase: 'block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2',
  input: 'w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition',
  textarea: 'w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition leading-relaxed',

  // Visual Layout Variant Selector Buttons
  variantGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-3.5',
  variantCard: 'p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 group cursor-pointer',
  variantCardActive: 'bg-white/[0.08] border-white/30 text-white shadow-sm',
  variantCardInactive: 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200',
  variantNameActive: 'text-xs font-bold text-white',
  variantNameInactive: 'text-xs font-bold text-neutral-300 group-hover:text-white',
  variantDotActive: 'w-2.5 h-2.5 rounded-full bg-[#FFD700] transition',
  variantDotInactive: 'w-2.5 h-2.5 rounded-full bg-transparent border border-white/20 transition',
  variantDescription: 'text-[11px] text-neutral-400 leading-relaxed',

  // General Action Buttons
  btnPrimary: 'px-6 py-2.5 rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-yellow-500/20',
  btnSecondary: 'px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm',
  btnManage: 'px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm',
  btnGhost: 'p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer',

  // Notice & Info Boxes
  noticeBox: 'p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-300 leading-relaxed font-nuosu',
  noticeFooter: 'flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px]',

  // Item List Strips (e.g. connected packages, albums, media items)
  listContainer: 'space-y-2.5 max-h-56 overflow-y-auto pr-1',
  listItem: 'p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs',
  itemDotActive: 'w-2 h-2 rounded-full shrink-0 bg-neutral-400',
  itemDotInactive: 'w-2 h-2 rounded-full shrink-0 bg-neutral-600',
  itemCheckIcon: 'w-3.5 h-3.5 text-neutral-400 shrink-0',
  priceTag: 'text-white font-bold font-mono text-sm',
  priceStrikethrough: 'text-[10px] text-neutral-500 line-through ml-1 font-mono block',
  badgeGold: 'px-2 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider shrink-0',
};

export default adminModalTokens;
