<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { usePackages, formatMaskedPrice } from '../../../composables/usePackages';
import { useModalState } from '../../../composables/useModalState';
import { adminModalTokens } from '../../../lib/designTokens';
import {
  Plus,
  Check,
  Edit3,
  Trash2,
  X,
  Tag,
  Sparkles,
  Eye,
  EyeOff,
  Search,
  ListFilter,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FolderPlus,
  FolderKanban,
  ListChecks,
  Layers,
  CheckCircle2,
  Info,
} from '@lucide/vue';

const {
  packages,
  packageCategories,
  masterInclusions,
  masterAddons,
  isGlobalPriceMasked,
  toggleGlobalPriceMask,
  togglePackagePriceMask,
  savePackage,
  deletePackage,
  togglePackageActive,
  addMasterInclusion,
  removeMasterInclusion,
  updateMasterInclusion,
  addMasterAddon,
  updateMasterAddon,
  deleteMasterAddon,
  addCategory,
  deleteCategory,
  renameCategory,
} = usePackages();

const { openModal, closeModal } = useModalState();

// Toast Notification Feedback State
const toast = ref({
  visible: false,
  title: '',
  subtitle: '',
  type: 'success', // 'success' | 'danger' | 'info'
});
let toastTimer = null;

function triggerToast(title, subtitle = '', type = 'success', duration = 3500) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = {
    visible: true,
    title,
    subtitle,
    type,
  };
  toastTimer = setTimeout(() => {
    toast.value.visible = false;
  }, duration);
}

function dismissToast() {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value.visible = false;
}

// Dropdown Actions Menu State
const isActionDropdownOpen = ref(false);

// Package Delete Confirmation State
const packageToDelete = ref(null);

function promptDeletePackage(pkg) {
  packageToDelete.value = pkg;
}

function cancelDeletePackage() {
  packageToDelete.value = null;
}

async function confirmDeletePackage() {
  if (!packageToDelete.value) return;
  const title = packageToDelete.value.title;
  const category = packageToDelete.value.category;
  await deletePackage(packageToDelete.value.id);
  packageToDelete.value = null;
  triggerToast('Package Removed', `"${title}" was deleted from ${category}`, 'info', 3500);
}

// Package Editor State
const editingPackage = ref(null);
const inclusionSearch = ref('');
const inclusionFilterMode = ref('all'); // 'all' | 'selected'
const inlineNewInclusion = ref('');
const showSelectedReorder = ref(false);

// Add Category Modal State
const showAddCategoryModal = ref(false);
const newCategoryInput = ref('');
const addCategoryError = ref('');

// Manage Categories Modal State
const showManageCategoriesModal = ref(false);
const categoryBeingEdited = ref({ oldVal: '', newVal: '' });
const categoryToDelete = ref(null);

function openAddCategory() {
  newCategoryInput.value = '';
  addCategoryError.value = '';
  showAddCategoryModal.value = true;
}

async function handleCreateCategory() {
  addCategoryError.value = '';
  const trimmed = newCategoryInput.value.trim();
  if (!trimmed) {
    addCategoryError.value = 'Category name cannot be empty.';
    return;
  }
  const exists = packageCategories.value.some(
    (c) => c.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    addCategoryError.value = 'A category with this name already exists.';
    return;
  }
  await addCategory(trimmed);
  selectedAdminCategory.value = trimmed;
  newCategoryInput.value = '';
  showAddCategoryModal.value = false;
  triggerToast('Category Created', `"${trimmed}" is now available for packages`, 'success', 3500);
}

function startEditCategory(cat) {
  categoryBeingEdited.value = { oldVal: cat, newVal: cat };
}

async function saveEditCategory() {
  const oldVal = categoryBeingEdited.value.oldVal;
  const newVal = categoryBeingEdited.value.newVal.trim();
  if (!newVal || oldVal.toLowerCase() === newVal.toLowerCase()) {
    categoryBeingEdited.value = { oldVal: '', newVal: '' };
    return;
  }
  await renameCategory(oldVal, newVal);
  categoryBeingEdited.value = { oldVal: '', newVal: '' };
  triggerToast('Category Renamed', `Renamed "${oldVal}" to "${newVal}"`, 'success', 3500);
}

function cancelEditCategory() {
  categoryBeingEdited.value = { oldVal: '', newVal: '' };
}

function promptDeleteCategory(cat) {
  categoryToDelete.value = cat;
}

async function confirmDeleteCategory() {
  if (!categoryToDelete.value) return;
  const deletedCat = categoryToDelete.value;
  await deleteCategory(deletedCat);
  if (selectedAdminCategory.value === deletedCat) {
    selectedAdminCategory.value = 'All';
  }
  categoryToDelete.value = null;
  triggerToast('Category Removed', `Category "${deletedCat}" was deleted`, 'info', 3500);
}

// Master List Manager Modal State
const showMasterListModal = ref(false);
const masterListSearch = ref('');
const newMasterInclusionInput = ref('');
const editingMasterItem = ref({ oldVal: '', newVal: '' });

// Master Inclusion Delete Confirmation State
const inclusionToDelete = ref(null);

const affectedPackagesCount = computed(() => {
  if (!inclusionToDelete.value) return 0;
  const target = inclusionToDelete.value.toLowerCase();
  return packages.value.filter(
    (p) => Array.isArray(p.features) && p.features.some((f) => f.toLowerCase() === target)
  ).length;
});

function promptDeleteInclusion(item) {
  inclusionToDelete.value = item;
}

function cancelDeleteInclusion() {
  inclusionToDelete.value = null;
}

async function confirmDeleteInclusion() {
  if (!inclusionToDelete.value) return;
  const deletedItem = inclusionToDelete.value;
  await removeMasterInclusion(deletedItem);
  inclusionToDelete.value = null;
  triggerToast('Inclusion Removed', `"${deletedItem}" removed from master list`, 'info', 3500);
}

// =========================================================================
// Add-on Creation Form Modal State
// =========================================================================
const showAddAddonModal = ref(false);
const newAddonForm = ref({ title: '', price: '' });
const addAddonError = ref('');

function openAddAddonModal() {
  newAddonForm.value = { title: '', price: '' };
  addAddonError.value = '';
  showAddAddonModal.value = true;
}

async function handleCreateAddon() {
  addAddonError.value = '';
  const trimmed = newAddonForm.value.title.trim();
  if (!trimmed) {
    addAddonError.value = 'Add-on title cannot be empty.';
    return;
  }
  const cleanPrice = Number(newAddonForm.value.price);
  if (isNaN(cleanPrice) || cleanPrice < 0) {
    addAddonError.value = 'Please enter a valid price (0 or greater).';
    return;
  }

  const added = await addMasterAddon({ title: trimmed, price: cleanPrice });
  if (added) {
    newAddonForm.value = { title: '', price: '' };
    showAddAddonModal.value = false;
    triggerToast('Add-on Created', `"${trimmed}" (₱${cleanPrice.toLocaleString('en-PH')}) added to Master Add-ons`, 'success', 3500);
  }
}

// =========================================================================
// Master Add-ons Management Modal State
// =========================================================================
const showMasterAddonsModal = ref(false);
const masterAddonsSearch = ref('');
const inlineNewAddon = ref({ title: '', price: '' });
const editingMasterAddon = ref(null); // { id, title, price }
const addonToDelete = ref(null);

const filteredMasterAddons = computed(() => {
  let list = masterAddons.value || [];
  if (masterAddonsSearch.value.trim()) {
    const q = masterAddonsSearch.value.toLowerCase().trim();
    list = list.filter((a) =>
      (a.title || '').toLowerCase().includes(q) || String(a.price || '').includes(q)
    );
  }
  return list;
});

async function handleAddInlineAddon() {
  const trimmed = inlineNewAddon.value.title.trim();
  if (!trimmed) return;
  const cleanPrice = Math.max(0, Number(inlineNewAddon.value.price) || 0);
  await addMasterAddon({ title: trimmed, price: cleanPrice });
  inlineNewAddon.value = { title: '', price: '' };
  triggerToast('Add-on Added', `"${trimmed}" added to master deliverables`, 'success', 3500);
}

function startEditMasterAddon(addon) {
  editingMasterAddon.value = { id: addon.id, title: addon.title, price: addon.price };
}

function cancelEditMasterAddon() {
  editingMasterAddon.value = null;
}

async function saveEditMasterAddon() {
  if (!editingMasterAddon.value) return;
  const { id, title, price } = editingMasterAddon.value;
  const trimmed = title.trim();
  if (!trimmed) return;
  const cleanPrice = Math.max(0, Number(price) || 0);
  await updateMasterAddon(id, { title: trimmed, price: cleanPrice });
  editingMasterAddon.value = null;
  triggerToast('Add-on Updated', `"${trimmed}" updated successfully`, 'success', 3500);
}

function promptDeleteAddon(addon) {
  addonToDelete.value = addon;
}

function cancelDeleteAddon() {
  addonToDelete.value = null;
}

async function confirmDeleteAddon() {
  if (!addonToDelete.value) return;
  const title = addonToDelete.value.title;
  await deleteMasterAddon(addonToDelete.value.id);
  addonToDelete.value = null;
  triggerToast('Add-on Removed', `"${title}" removed from master list`, 'info', 3500);
}

// =========================================================================
// Input Sanitization Helpers (Strict Numeric Only)
// =========================================================================
function allowOnlyDigits(e) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
  ];
  if (allowedKeys.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'A', 'C', 'V', 'Z'].includes(e.key)) return;
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

function sanitizeNumericInput(e, targetObj, propName) {
  const raw = String(e.target.value ?? '');
  const sanitized = raw.replace(/\D/g, '');
  if (raw !== sanitized) {
    e.target.value = sanitized;
  }
  targetObj[propName] = sanitized;
}

// =========================================================================
// Category Add-on Package Modal State & Logic
// =========================================================================
const activeCategoryDropdown = ref(null);

function toggleCategoryDropdown(cat) {
  if (activeCategoryDropdown.value === cat) {
    activeCategoryDropdown.value = null;
  } else {
    activeCategoryDropdown.value = cat;
  }
}

const showCategoryAddonsModal = ref(false);
const categoryAddonPackageForm = ref({
  id: '',
  category: '',
  title: 'ADDITIONALS',
  badge: '',
  selectedAddonIds: [],
});
const categoryAddonSearch = ref('');
const categoryAddonFilterMode = ref('all'); // 'all' | 'selected'
const categoryAddonError = ref('');

const selectedCategoryAddonsCount = computed(() => {
  return (categoryAddonPackageForm.value.selectedAddonIds || []).length;
});

const computedCategoryAddonsTotal = computed(() => {
  const selectedSet = new Set(categoryAddonPackageForm.value.selectedAddonIds || []);
  let total = 0;
  (masterAddons.value || []).forEach((item) => {
    if (selectedSet.has(item.id)) {
      total += Number(item.price) || 0;
    }
  });
  return total;
});

const filteredCategoryMasterAddons = computed(() => {
  let list = masterAddons.value || [];
  const selectedSet = new Set(categoryAddonPackageForm.value.selectedAddonIds || []);

  if (categoryAddonFilterMode.value === 'selected') {
    list = list.filter((item) => selectedSet.has(item.id));
  }

  if (categoryAddonSearch.value.trim()) {
    const q = categoryAddonSearch.value.toLowerCase().trim();
    list = list.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(q) ||
        String(item.price || '').includes(q)
    );
  }

  return list;
});

function openCreateCategoryAddons(category) {
  categoryAddonSearch.value = '';
  categoryAddonFilterMode.value = 'all';
  categoryAddonError.value = '';

  // If this category already has an ADDITIONALS package, open in edit mode
  const existing = (packages.value || []).find(
    (p) => p.category === category && (p.is_addon || (p.title && p.title.toUpperCase().includes('ADDITIONAL')))
  );

  if (existing) {
    openEditCategoryAddons(existing);
    return;
  }

  categoryAddonPackageForm.value = {
    id: '',
    category,
    title: 'ADDITIONALS',
    badge: '',
    selectedAddonIds: [],
  };

  showCategoryAddonsModal.value = true;
}

function openEditCategoryAddons(pkg) {
  categoryAddonSearch.value = '';
  categoryAddonFilterMode.value = 'all';
  categoryAddonError.value = '';

  const selectedIds = [];
  const existingFeatures = Array.isArray(pkg.features) ? pkg.features : [];

  existingFeatures.forEach((feat) => {
    const featClean = feat.split('+')[0].trim().toLowerCase();
    const match = (masterAddons.value || []).find(
      (a) => (a.title || '').trim().toLowerCase() === featClean
    );
    if (match) {
      if (!selectedIds.includes(match.id)) {
        selectedIds.push(match.id);
      }
    }
  });

  categoryAddonPackageForm.value = {
    id: pkg.id,
    category: pkg.category,
    title: pkg.title || 'ADDITIONALS',
    badge: pkg.badge || '',
    selectedAddonIds: selectedIds,
  };

  showCategoryAddonsModal.value = true;
}

function toggleCategoryAddonSelection(addonId) {
  const list = categoryAddonPackageForm.value.selectedAddonIds;
  const idx = list.indexOf(addonId);
  if (idx !== -1) {
    list.splice(idx, 1);
  } else {
    list.push(addonId);
  }
}

function isCategoryAddonSelected(addonId) {
  return (categoryAddonPackageForm.value.selectedAddonIds || []).includes(addonId);
}

function selectAllCategoryAddons() {
  categoryAddonPackageForm.value.selectedAddonIds = (masterAddons.value || []).map((a) => a.id);
}

function clearAllCategoryAddons() {
  categoryAddonPackageForm.value.selectedAddonIds = [];
}

async function handleSaveCategoryAddons() {
  categoryAddonError.value = '';
  const form = categoryAddonPackageForm.value;
  const title = (form.title || '').trim() || 'ADDITIONALS';
  const category = form.category;

  if (!category) {
    categoryAddonError.value = 'Please provide a valid category.';
    return;
  }

  if (form.selectedAddonIds.length === 0) {
    categoryAddonError.value = 'Please select at least one add-on item from the master list.';
    return;
  }

  const idMap = new Map((masterAddons.value || []).map((a) => [a.id, a]));
  const features = form.selectedAddonIds
    .map((id) => idMap.get(id))
    .filter(Boolean)
    .map((item) => `${item.title} + ₱${Number(item.price || 0).toLocaleString('en-PH')}`);

  const isNew = !form.id || form.id.startsWith('pkg_temp_');
  const pkgId = form.id || `pkg_addon_${Date.now()}`;

  const payload = {
    id: pkgId,
    category,
    title,
    badge: (form.badge || '').trim(),
    price: computedCategoryAddonsTotal.value,
    promo_price: null,
    features,
    is_addon: true,
    is_active: true,
    is_featured: false,
    hide_price: false,
  };

  const res = await savePackage(payload);
  if (res?.error) {
    categoryAddonError.value = res.error.message || 'Failed to save add-on package.';
    triggerToast('Save Failed', res.error.message || 'Please check your admin session.', 'danger', 4500);
    return;
  }

  showCategoryAddonsModal.value = false;
  if (isNew) {
    triggerToast('Add-ons Created', `"${title}" added to ${category}`, 'success', 3500);
  } else {
    triggerToast('Add-ons Updated', `Updated "${title}" for ${category}`, 'success', 3500);
  }
}

function isAddonPackage(pkg) {
  if (!pkg) return false;
  return Boolean(
    pkg.is_addon ||
    (typeof pkg.title === 'string' && pkg.title.toUpperCase().includes('ADDITIONAL'))
  );
}

function parseAddonFeature(feat) {
  if (!feat) return { title: '', price: '' };
  if (typeof feat === 'object') {
    const title = feat.title || feat.name || '';
    const price = feat.price ? `₱${Number(feat.price).toLocaleString('en-PH')}` : '';
    return { title, price };
  }
  if (typeof feat !== 'string') return { title: String(feat), price: '' };
  if (feat.includes('+')) {
    const parts = feat.split('+');
    const title = parts[0].trim();
    let pricePart = parts.slice(1).join('+').trim();
    if (!pricePart.startsWith('₱') && !pricePart.startsWith('PHP')) {
      const num = Number(pricePart.replace(/[^\d.]/g, ''));
      if (!isNaN(num) && num > 0) {
        pricePart = `₱${num.toLocaleString('en-PH')}`;
      } else {
        pricePart = `+ ${pricePart}`;
      }
    }
    return { title, price: pricePart };
  }
  return { title: feat.trim(), price: '' };
}

watch(
  () => Boolean(
    editingPackage.value ||
    showMasterListModal.value ||
    inclusionToDelete.value ||
    showAddCategoryModal.value ||
    showManageCategoriesModal.value ||
    categoryToDelete.value ||
    packageToDelete.value ||
    showAddAddonModal.value ||
    showMasterAddonsModal.value ||
    showCategoryAddonsModal.value ||
    addonToDelete.value
  ),
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) openModal();
    else if (!isOpen && wasOpen) closeModal();
  }
);

onUnmounted(() => {
  if (
    editingPackage.value ||
    showMasterListModal.value ||
    inclusionToDelete.value ||
    showAddCategoryModal.value ||
    showManageCategoriesModal.value ||
    categoryToDelete.value ||
    packageToDelete.value ||
    showAddAddonModal.value ||
    showMasterAddonsModal.value ||
    showCategoryAddonsModal.value ||
    addonToDelete.value
  ) {
    closeModal();
  }
});

const selectedAdminCategory = ref('All');

// List of category filters including 'All'
const activeCategoryFilters = computed(() => {
  const set = new Set();
  (packageCategories.value || []).forEach((c) => set.add(c));
  (packages.value || []).forEach((p) => {
    if (p.category) set.add(p.category);
  });
  return ['All', ...Array.from(set)];
});

function getCategoryPackageCount(cat) {
  if (cat === 'All') return packages.value.length;
  return packages.value.filter((p) => p.category === cat).length;
}

const groupedPackages = computed(() => {
  const groups = {};
  
  packages.value.forEach((pkg) => {
    const cat = pkg.category || 'Other';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(pkg);
  });

  const result = [];
  const knownCategories = [...(packageCategories.value || [])];

  // Include known categories
  knownCategories.forEach((cat) => {
    if (selectedAdminCategory.value === 'All' || selectedAdminCategory.value === cat) {
      result.push({
        category: cat,
        items: groups[cat] || [],
      });
    }
  });

  // Include any extra categories present in existing packages
  Object.keys(groups).forEach((cat) => {
    if (!knownCategories.includes(cat)) {
      if (selectedAdminCategory.value === 'All' || selectedAdminCategory.value === cat) {
        result.push({
          category: cat,
          items: groups[cat],
        });
      }
    }
  });

  return result;
});

// Category expand / collapse state (all expanded by default)
const collapsedCategories = ref(new Set());

function toggleCategoryCollapse(cat) {
  const next = new Set(collapsedCategories.value);
  if (next.has(cat)) {
    next.delete(cat);
  } else {
    next.add(cat);
  }
  collapsedCategories.value = next;
}

function isCategoryExpanded(cat) {
  return !collapsedCategories.value.has(cat);
}

function openNewPackage(defaultCategory = 'Weddings') {
  inclusionSearch.value = '';
  inclusionFilterMode.value = 'all';
  inlineNewInclusion.value = '';
  showSelectedReorder.value = false;
  const cats = packageCategories.value || [];
  const initialCategory = typeof defaultCategory === 'string' && cats.includes(defaultCategory)
    ? defaultCategory
    : (selectedAdminCategory.value !== 'All' && cats.includes(selectedAdminCategory.value)
        ? selectedAdminCategory.value
        : (cats[0] || 'Weddings'));
  editingPackage.value = {
    id: `pkg_temp_${Date.now()}`,
    category: initialCategory,
    title: '',
    price: 15000,
    promo_price: null,
    badge: '',
    features: [
      '1 Professional Photographer',
      'Full Day Coverage (Prep to Reception)',
      '150 Enhanced Digital High-Res Photos',
      'Online Private Cloud Gallery (1 Year Access)',
    ],
    is_featured: false,
    is_active: true,
    hide_price: false,
  };
}

function openEditPackage(pkg) {
  if (pkg.is_addon || (pkg.title && pkg.title.toUpperCase().includes('ADDITIONAL'))) {
    openEditCategoryAddons(pkg);
    return;
  }
  inclusionSearch.value = '';
  inclusionFilterMode.value = 'all';
  inlineNewInclusion.value = '';
  showSelectedReorder.value = false;
  editingPackage.value = JSON.parse(JSON.stringify(pkg));
  if (!Array.isArray(editingPackage.value.features)) {
    editingPackage.value.features = [];
  }
  if (editingPackage.value.hide_price === undefined) {
    editingPackage.value.hide_price = false;
  }
}

// Inclusions logic for package editor
function isFeatureSelected(feat) {
  if (!editingPackage.value?.features) return false;
  const target = feat.toLowerCase().trim();
  return editingPackage.value.features.some((f) => f.toLowerCase().trim() === target);
}

function toggleFeature(feat) {
  if (!editingPackage.value) return;
  if (!Array.isArray(editingPackage.value.features)) {
    editingPackage.value.features = [];
  }
  const target = feat.toLowerCase().trim();
  const idx = editingPackage.value.features.findIndex((f) => f.toLowerCase().trim() === target);
  if (idx !== -1) {
    editingPackage.value.features.splice(idx, 1);
  } else {
    editingPackage.value.features.push(feat);
  }
}

function removeSelectedFeature(index) {
  if (editingPackage.value?.features) {
    editingPackage.value.features.splice(index, 1);
  }
}

function moveFeatureUp(index) {
  if (!editingPackage.value?.features || index <= 0) return;
  const items = editingPackage.value.features;
  const temp = items[index];
  items[index] = items[index - 1];
  items[index - 1] = temp;
}

function moveFeatureDown(index) {
  if (!editingPackage.value?.features || index >= editingPackage.value.features.length - 1) return;
  const items = editingPackage.value.features;
  const temp = items[index];
  items[index] = items[index + 1];
  items[index + 1] = temp;
}

const filteredMasterInclusions = computed(() => {
  let list = masterInclusions.value;
  if (inclusionFilterMode.value === 'selected') {
    list = list.filter((feat) => isFeatureSelected(feat));
  }
  if (inclusionSearch.value.trim()) {
    const q = inclusionSearch.value.toLowerCase().trim();
    list = list.filter((feat) => feat.toLowerCase().includes(q));
  }
  return list;
});

async function handleAddInlineInclusion() {
  const trimmed = inlineNewInclusion.value.trim();
  if (!trimmed) return;
  const added = await addMasterInclusion(trimmed);
  if (added && editingPackage.value) {
    if (!isFeatureSelected(added)) {
      editingPackage.value.features.push(added);
    }
  }
  inlineNewInclusion.value = '';
  triggerToast('Inclusion Added', `"${trimmed}" added to master list and selected`, 'success', 3500);
}

// Master List Manager logic
const filteredManagerMasterList = computed(() => {
  if (!masterListSearch.value.trim()) return masterInclusions.value;
  const q = masterListSearch.value.toLowerCase().trim();
  return masterInclusions.value.filter((i) => i.toLowerCase().includes(q));
});

async function handleAddMasterInclusion() {
  const trimmed = newMasterInclusionInput.value.trim();
  if (!trimmed) return;
  await addMasterInclusion(trimmed);
  newMasterInclusionInput.value = '';
  triggerToast('Inclusion Added', `"${trimmed}" added to master deliverables`, 'success', 3500);
}

function startEditMasterItem(item) {
  editingMasterItem.value = { oldVal: item, newVal: item };
}

async function saveEditMasterItem() {
  const oldVal = editingMasterItem.value.oldVal;
  const newVal = editingMasterItem.value.newVal.trim();
  if (oldVal && newVal && oldVal.toLowerCase() !== newVal.toLowerCase()) {
    await updateMasterInclusion(oldVal, newVal);
    triggerToast('Inclusion Updated', `Updated deliverable to "${newVal}"`, 'success', 3500);
  }
  editingMasterItem.value = { oldVal: '', newVal: '' };
}

function cancelEditMasterItem() {
  editingMasterItem.value = { oldVal: '', newVal: '' };
}

async function handleSave() {
  if (!editingPackage.value.title) return;
  if (editingPackage.value.hide_price) {
    editingPackage.value.promo_price = null;
  }
  const isNew = !editingPackage.value.id || editingPackage.value.id.startsWith('pkg_temp_');
  const pkgTitle = editingPackage.value.title;
  const pkgCategory = editingPackage.value.category;

  const res = await savePackage(editingPackage.value);
  if (res?.error) {
    triggerToast('Save Failed', res.error.message || 'Please check your admin session.', 'danger', 4500);
    return;
  }
  editingPackage.value = null;
  if (isNew) {
    triggerToast('Package Created', `"${pkgTitle}" created in ${pkgCategory}`, 'success', 3500);
  } else {
    triggerToast('Package Updated', `Saved changes to "${pkgTitle}"`, 'success', 3500);
  }
}
</script>

<template>
  <div class="space-y-8 font-manrope">
    <!-- Header with Master List Button, Price Masking Switch & Add Button -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-wide">Services & Rates Manager</h2>
        <p class="text-xs text-neutral-400 mt-0.5">
          Create, update, and manage studio pricing packages and master deliverables
        </p>
      </div>

      <!-- Top-right Action Buttons (Unified Dropdown Plus Button & Price Mask Toggle) -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Global Price Mask Toggle Button -->
        <button
          v-if="packages.length > 0"
          @click="toggleGlobalPriceMask"
          class="cursor-pointer px-4 sm:px-5 py-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-2 shadow-sm"
          :class="[
            isGlobalPriceMasked
              ? 'bg-white/20 border-white/30 text-white shadow-sm'
              : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-neutral-300 hover:text-white'
          ]"
          :title="isGlobalPriceMasked ? 'Public prices currently masked as 2?,???' : 'Public prices show full amount'"
        >
          <component :is="isGlobalPriceMasked ? EyeOff : Eye" class="w-4 h-4 text-neutral-300" />
          <span class="hidden sm:inline">{{ isGlobalPriceMasked ? 'Mask All Prices Active' : 'Mask All Prices' }}</span>
        </button>

        <!-- Unified Actions Dropdown Plus Button -->
        <div class="relative">
          <button
            type="button"
            @click="isActionDropdownOpen = !isActionDropdownOpen"
            class="cursor-pointer px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#141414] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            <span>Actions</span>
            <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': isActionDropdownOpen }" />
          </button>

          <!-- Dropdown Backdrop to close on click outside -->
          <div v-if="isActionDropdownOpen" @click="isActionDropdownOpen = false" class="fixed inset-0 z-40"></div>

          <!-- Dropdown Action Menu -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="isActionDropdownOpen"
              class="absolute right-0 mt-2 w-72 rounded-2xl bg-[#141414]/98 backdrop-blur-2xl border border-white/[0.14] shadow-2xl p-1.5 z-50 space-y-1 ring-1 ring-black/80 font-manrope select-none"
            >
              <!-- 1. Add Package -->
              <button
                type="button"
                @click="openNewPackage(); isActionDropdownOpen = false"
                class="w-full text-left p-3 rounded-xl hover:bg-white/[0.08] transition flex items-center gap-3 group cursor-pointer"
              >
                <div class="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Tag class="w-4 h-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-xs font-bold text-white group-hover:text-[#FFD700] transition">Add New Package</h4>
                  <p class="text-[11px] text-neutral-400">Create a pricing tier or rate plan</p>
                </div>
              </button>

              <!-- 2. Add Category -->
              <button
                type="button"
                @click="openAddCategory(); isActionDropdownOpen = false"
                class="w-full text-left p-3 rounded-xl hover:bg-white/[0.08] transition flex items-center gap-3 group cursor-pointer"
              >
                <div class="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FolderPlus class="w-4 h-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-xs font-bold text-white group-hover:text-white transition">Add New Category</h4>
                  <p class="text-[11px] text-neutral-400">Create a custom event or service</p>
                </div>
              </button>

              <!-- 3. Add New Add-on -->
              <button
                type="button"
                @click="openAddAddonModal(); isActionDropdownOpen = false"
                class="w-full text-left p-3 rounded-xl hover:bg-white/[0.08] transition flex items-center gap-3 group cursor-pointer"
              >
                <div class="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles class="w-4 h-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-xs font-bold text-white group-hover:text-white transition">Add New Add-ons</h4>
                  <p class="text-[11px] text-neutral-400">Create extra service or deliverable</p>
                </div>
              </button>

              <div class="h-px bg-white/[0.08] my-1 mx-2"></div>

              <!-- 4. Manage Categories -->
              <button
                type="button"
                @click="showManageCategoriesModal = true; isActionDropdownOpen = false"
                class="w-full text-left p-3 rounded-xl hover:bg-white/[0.08] transition flex items-center gap-3 group cursor-pointer"
              >
                <div class="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FolderKanban class="w-4 h-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-white">Manage Categories</h4>
                    <span class="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-neutral-300">{{ packageCategories.length }}</span>
                  </div>
                  <p class="text-[11px] text-neutral-400">Rename or delete event types</p>
                </div>
              </button>

              <!-- 5. Master Inclusions Library -->
              <button
                type="button"
                @click="showMasterListModal = true; isActionDropdownOpen = false"
                class="w-full text-left p-3 rounded-xl hover:bg-white/[0.08] transition flex items-center gap-3 group cursor-pointer"
              >
                <div class="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ListChecks class="w-4 h-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-white">Master Inclusions</h4>
                    <span class="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300">{{ masterInclusions.length }}</span>
                  </div>
                  <p class="text-[11px] text-neutral-400">Standard studio deliverables</p>
                </div>
              </button>

              <!-- 6. Master Add-ons Library -->
              <button
                type="button"
                @click="showMasterAddonsModal = true; isActionDropdownOpen = false"
                class="w-full text-left p-3 rounded-xl hover:bg-white/[0.08] transition flex items-center gap-3 group cursor-pointer"
              >
                <div class="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Layers class="w-4 h-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-white">Master add-ons</h4>
                    <span class="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300">{{ masterAddons.length }}</span>
                  </div>
                  <p class="text-[11px] text-neutral-400">Standard studio add-ons & extras</p>
                </div>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Category Filter Pills Bar (When packages exist) -->
    <div v-if="packages.length > 0" class="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
      <button
        v-for="cat in activeCategoryFilters"
        :key="cat"
        @click="selectedAdminCategory = cat"
        class="px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2"
        :class="[
          selectedAdminCategory === cat
            ? 'bg-white/15 text-white font-bold border border-white/30 shadow-sm'
            : 'bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]'
        ]"
      >
        <span>{{ cat }}</span>
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-mono"
          :class="[
            selectedAdminCategory === cat
              ? 'bg-white/20 text-white font-bold'
              : 'bg-white/[0.08] text-neutral-400'
          ]"
        >
          {{ getCategoryPackageCount(cat) }}
        </span>
      </button>
    </div>

    <!-- Categorized Package Groups (When packages exist) -->
    <div v-if="packages.length > 0" class="space-y-10">
      <div
        v-for="group in groupedPackages"
        :key="group.category"
        class="space-y-4"
      >
        <!-- Category Section Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] hover:border-white/15 px-5 py-3 rounded-2xl transition">
          <div class="flex items-center gap-3">
            <!-- Expand / Collapse Arrow Button (Neutral Background) -->
            <button
              type="button"
              @click="toggleCategoryCollapse(group.category)"
              class="cursor-pointer p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition flex items-center justify-center border border-white/[0.08]"
              :title="isCategoryExpanded(group.category) ? 'Collapse ' + group.category : 'Expand ' + group.category"
            >
              <ChevronUp v-if="isCategoryExpanded(group.category)" class="w-4 h-4 stroke-[2.5]" />
              <ChevronDown v-else class="w-4 h-4 stroke-[2.5]" />
            </button>

            <!-- Clickable Category Title -->
            <button
              type="button"
              @click="toggleCategoryCollapse(group.category)"
              class="cursor-pointer text-left flex items-center gap-2.5 group/cat"
            >
              <h3 class="text-sm font-bold uppercase tracking-wider text-white group-hover/cat:text-[#FFD700] transition">
                {{ group.category }}
              </h3>
            </button>

            <!-- Neutral Packages Count Badge -->
            <span class="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/[0.08] text-xs font-mono font-medium">
              {{ group.items.length }} {{ group.items.length === 1 ? 'Package' : 'Packages' }}
            </span>
          </div>

          <!-- Add to Category Dropdown Menu -->
          <div class="relative">
            <button
              type="button"
              @click="toggleCategoryDropdown(group.category)"
              class="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-white/[0.06]"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add to {{ group.category }}</span>
              <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': activeCategoryDropdown === group.category }" />
            </button>

            <!-- Dropdown Backdrop to close on click outside -->
            <div
              v-if="activeCategoryDropdown === group.category"
              @click="activeCategoryDropdown = null"
              class="fixed inset-0 z-40"
            ></div>

            <!-- Dropdown Action Menu -->
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 scale-95 -translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="activeCategoryDropdown === group.category"
                class="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141414]/98 backdrop-blur-2xl border border-white/[0.14] shadow-2xl p-1.5 z-50 space-y-1 ring-1 ring-black/80 font-manrope select-none"
              >
                <!-- 1. Add Package -->
                <button
                  type="button"
                  @click="openNewPackage(group.category); activeCategoryDropdown = null"
                  class="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.08] transition flex items-center gap-3 group cursor-pointer"
                >
                  <div class="w-8 h-8 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Tag class="w-4 h-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-xs font-bold text-white group-hover:text-[#FFD700] transition">Add Package</h4>
                    <p class="text-[11px] text-neutral-400">Rate plan for {{ group.category }}</p>
                  </div>
                </button>

                <!-- 2. Add Add-ons -->
                <button
                  type="button"
                  @click="openCreateCategoryAddons(group.category); activeCategoryDropdown = null"
                  class="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.08] transition flex items-center gap-3 group cursor-pointer"
                >
                  <div class="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles class="w-4 h-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-xs font-bold text-white group-hover:text-white transition">Add Add-ons</h4>
                    <p class="text-[11px] text-neutral-400">Additionals for {{ group.category }}</p>
                  </div>
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Cards Grid for this Category (Collapsible & Content-Aware Height) -->
        <div
          v-if="isCategoryExpanded(group.category)"
          class="transition-all duration-300"
        >
          <!-- Empty Category Placeholder -->
          <div
            v-if="group.items.length === 0"
            class="p-8 rounded-3xl bg-[#141414]/50 border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-3"
          >
            <p class="text-xs text-neutral-400">No packages created in <span class="text-white font-semibold">{{ group.category }}</span> yet.</p>
            <button
              @click="openNewPackage(group.category)"
              class="cursor-pointer px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus class="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Create First {{ group.category }} Package</span>
            </button>
          </div>

          <!-- Cards Grid -->
          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
          >
            <template v-for="pkg in group.items" :key="pkg.id">
              <!-- Case A: Add-ons / Additionals Card (Noticeably Lighter Graphite Surface) -->
              <div
                v-if="isAddonPackage(pkg)"
                class="rounded-3xl p-6 bg-gradient-to-b from-[#30323a] to-[#23252c] border flex flex-col justify-between relative group transition shadow-xl h-fit self-start"
                :class="[
                  pkg.badge
                    ? 'border-[#FFD700]/50 hover:border-[#FFD700]/80'
                    : 'border-white/[0.18] hover:border-white/[0.32]'
                ]"
              >
                <!-- Badge if present -->
                <div
                  v-if="pkg.badge"
                  class="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#FFD700] text-[#141414] text-[10px] font-bold uppercase tracking-wider shadow-md"
                >
                  {{ pkg.badge }}
                </div>

                <div>
                  <!-- Title -->
                  <h3 class="text-lg font-bold text-white tracking-wide mb-2">
                    {{ pkg.title }}
                  </h3>

                  <!-- Unmasked Total Price (No Eye Mask Toggle) -->
                  <div class="mb-4 p-3 rounded-2xl bg-black/35 border border-white/[0.08] flex items-baseline justify-between gap-2">
                    <span class="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Value</span>
                    <span class="text-xl font-extrabold text-[#FFD700] font-mono">
                      ₱{{ Number(pkg.price || 0).toLocaleString('en-PH') }}
                    </span>
                  </div>

                  <!-- Add-on Items List -->
                  <div class="mb-6 space-y-2">
                    <div class="flex items-center justify-between text-[11px] text-neutral-400 border-b border-white/[0.08] pb-1.5">
                      <span class="font-medium text-neutral-200">Add-on Items</span>
                      <span class="font-mono text-neutral-400">{{ pkg.features ? pkg.features.length : 0 }} items</span>
                    </div>
                    <ul v-if="pkg.features && pkg.features.length > 0" class="space-y-1.5 text-xs pr-1">
                      <li
                        v-for="(feat, idx) in pkg.features"
                        :key="idx"
                        class="flex items-center justify-between gap-2.5 py-1.5 px-2.5 rounded-xl bg-black/35 border border-white/[0.08] hover:border-white/20 transition"
                      >
                        <span class="truncate text-neutral-200 text-xs font-medium min-w-0 flex-1" :title="parseAddonFeature(feat).title">
                          {{ parseAddonFeature(feat).title }}
                        </span>
                        <span v-if="parseAddonFeature(feat).price" class="shrink-0 font-mono text-[#FFD700] text-xs font-bold pl-2 text-right">
                          {{ parseAddonFeature(feat).price }}
                        </span>
                      </li>
                    </ul>
                    <div v-else class="py-5 px-3 rounded-2xl bg-black/20 border border-dashed border-white/15 text-center space-y-1">
                      <p class="text-xs text-neutral-400">No add-on items configured yet</p>
                      <button
                        type="button"
                        @click="openEditCategoryAddons(pkg)"
                        class="text-[11px] text-[#FFD700] hover:underline font-medium cursor-pointer"
                      >
                        + Add items
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Action Controls -->
                <div class="pt-4 border-t border-white/[0.10] flex justify-between items-center">
                  <button
                    @click="openEditCategoryAddons(pkg)"
                    class="cursor-pointer px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-100 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                    <span>Edit Add-ons</span>
                  </button>

                  <button
                    @click="promptDeletePackage(pkg)"
                    class="cursor-pointer text-neutral-400 hover:text-red-400 p-1.5 text-xs transition rounded-xl hover:bg-red-500/10"
                    title="Delete Add-ons"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

            <!-- Case B: Standard Package Card -->
            <div
              v-else
              class="rounded-3xl p-6 bg-[#141414] border flex flex-col justify-between relative group transition shadow-xl h-fit self-start"
              :class="[
                pkg.badge
                  ? 'border-[#FFD700]/40 bg-gradient-to-b from-[#FFD700]/[0.03] to-[#141414] hover:border-[#FFD700]/70'
                  : 'border-white/[0.08] hover:border-white/[0.18]'
              ]"
            >
              <!-- Badge if present (With matching gold border highlight) -->
              <div
                v-if="pkg.badge"
                class="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#FFD700] text-[#141414] text-[10px] font-bold uppercase tracking-wider shadow-md"
              >
                {{ pkg.badge }}
              </div>

              <div>
                <h3 class="text-lg font-bold text-white tracking-wide mb-2">{{ pkg.title }}</h3>

                <!-- Price Display (with Eye Mask Toggle Button directly beside it) -->
                <div class="flex items-center gap-2.5 mb-4">
                  <div class="flex items-baseline gap-2">
                    <!-- If Masked: Show 2?,??? and hide promo price -->
                    <template v-if="pkg.hide_price || isGlobalPriceMasked">
                      <span class="text-2xl font-extrabold text-[#FFD700]">₱{{ formatMaskedPrice(pkg.price) }}</span>
                    </template>

                    <!-- Standard Full Price & Promo Price -->
                    <template v-else>
                      <span class="text-2xl font-extrabold text-[#FFD700]">
                        ₱{{ Number(pkg.promo_price || pkg.price).toLocaleString('en-PH') }}
                      </span>
                      <span v-if="pkg.promo_price" class="text-xs text-neutral-500 line-through font-medium">
                        ₱{{ Number(pkg.price).toLocaleString('en-PH') }}
                      </span>
                    </template>
                  </div>

                  <!-- Eye Mask Toggle Button -->
                  <button
                    @click="togglePackagePriceMask(pkg.id)"
                    class="cursor-pointer p-1 rounded-lg transition"
                    :class="[
                      (pkg.hide_price || isGlobalPriceMasked)
                        ? 'text-neutral-200 hover:text-white hover:bg-white/10'
                        : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                    ]"
                    :title="pkg.hide_price ? 'Price is masked (Click to reveal)' : 'Price is visible (Click to mask)'"
                  >
                    <component :is="(pkg.hide_price || isGlobalPriceMasked) ? EyeOff : Eye" class="w-4 h-4" />
                  </button>
                </div>

                <!-- Inclusions Count & List -->
                <div class="mb-6 space-y-2.5">
                  <div class="flex items-center justify-between text-[11px] text-neutral-400 border-b border-white/[0.06] pb-1.5">
                    <span>Inclusions</span>
                    <span class="font-mono text-neutral-400">{{ pkg.features ? pkg.features.length : 0 }} items</span>
                  </div>
                  <ul v-if="pkg.features && pkg.features.length > 0" class="space-y-1.5 text-xs text-neutral-300 pr-1">
                    <li v-for="(feat, idx) in pkg.features" :key="idx" class="flex items-start gap-2 leading-snug">
                      <Check class="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                      <span>{{ feat }}</span>
                    </li>
                  </ul>
                  <div v-else class="py-5 px-3 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-1">
                    <p class="text-xs text-neutral-400">No inclusions configured yet</p>
                    <button
                      type="button"
                      @click="openEditPackage(pkg)"
                      class="text-[11px] text-[#FFD700] hover:underline font-medium cursor-pointer"
                    >
                      + Add inclusions
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action Controls -->
              <div class="pt-4 border-t border-white/[0.08] flex justify-between items-center">
                <button
                  @click="openEditPackage(pkg)"
                  class="cursor-pointer px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-neutral-200 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                  <span>Edit Package</span>
                </button>

                <button
                  @click="promptDeletePackage(pkg)"
                  class="cursor-pointer text-neutral-400 hover:text-red-400 p-1.5 text-xs transition rounded-xl hover:bg-red-500/10"
                  title="Delete Package"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    </div>

    <!-- Empty State UI when no packages exist -->
    <div
      v-else
      class="flex justify-center items-center py-12 w-full"
    >
      <div class="text-center py-16 px-8 bg-[#141414] border border-white/[0.08] rounded-3xl space-y-4 max-w-lg w-full shadow-2xl">
        <div class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-400">
          <Tag class="w-6 h-6 text-neutral-400" />
        </div>
        <div class="space-y-1.5">
          <h3 class="text-base font-bold text-white">No Service Packages Created Yet</h3>
          <p class="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Create customized pricing packages for Weddings, Birthdays, Debuts, and Studio Sessions with toggleable master inclusions.
          </p>
        </div>
        <div class="pt-2">
          <button
            @click="openNewPackage"
            class="cursor-pointer px-6 py-2.5 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 inline-flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            <span>Add First Package</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- PACKAGE ADD / EDIT MODAL WITH TOGGLEABLE MASTER INCLUSIONS -->
    <!-- ======================================================== -->
    <div
      v-if="editingPackage"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] p-6 md:px-8 py-5 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">
              {{ editingPackage.id.startsWith('pkg_temp_') ? 'Add New Package' : 'Edit Package' }}
            </h3>
            <p class="text-xs text-neutral-400 mt-0.5">Configure package pricing, metadata, and select inclusions from the master list</p>
          </div>
          <button
            @click="editingPackage = null"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
            title="Close modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Body Content -->
        <div class="flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-medium text-neutral-300">Category</label>
                <button
                  type="button"
                  @click="openAddCategory"
                  class="text-[11px] text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus class="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>
              <select
                v-model="editingPackage.category"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition cursor-pointer"
              >
                <option v-for="cat in packageCategories" :key="cat" :value="cat" class="bg-[#1a1a1a] text-white">{{ cat }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Package Title <span class="text-[#FFD700]">*</span></label>
              <input
                type="text"
                v-model="editingPackage.title"
                required
                placeholder="e.g. Gold Cinematic Wedding Package"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
            </div>
          </div>

          <!-- Pricing & Badge -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Regular Price (₱) <span class="text-[#FFD700]">*</span></label>
              <input
                type="number"
                v-model="editingPackage.price"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">
                Promo Price (₱)
                <span v-if="editingPackage.hide_price" class="text-[10px] text-neutral-500 font-normal">(disabled)</span>
              </label>
              <input
                type="number"
                v-model="editingPackage.promo_price"
                :disabled="editingPackage.hide_price"
                placeholder="Leave blank if none"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Badge (Optional)</label>
              <input
                type="text"
                v-model="editingPackage.badge"
                placeholder="e.g. Most Popular"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
            </div>
          </div>

          <!-- Hide / Mask Price Checkbox -->
          <div class="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="editingPackage.hide_price"
                class="w-4 h-4 rounded-md border border-white/20 bg-black/50 accent-[#FFD700] cursor-pointer"
              />
              <span class="text-xs text-neutral-300">
                Hide / Mask price on website (shows as <strong class="text-[#FFD700]">₱{{ formatMaskedPrice(editingPackage.price || 25000) }}</strong> with "Inquire to unlock" CTA)
              </span>
            </label>
          </div>

          <!-- ============================================== -->
          <!-- TOGGLEABLE INCLUSIONS FROM PACKAGE MASTER LIST -->
          <!-- ============================================== -->
          <div class="p-5 rounded-3xl bg-black/40 border border-white/[0.08] space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <label class="block text-sm font-semibold text-white">
                  <span>Select inclusion from the master list</span>
                </label>
              </div>

              <!-- Selected count & Reorder toggle -->
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full bg-white/10 text-neutral-200 text-xs font-mono font-semibold">
                  {{ editingPackage.features ? editingPackage.features.length : 0 }} Selected
                </span>
                <button
                  type="button"
                  @click="showSelectedReorder = !showSelectedReorder"
                  class="px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition cursor-pointer"
                  :class="[
                    showSelectedReorder
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                  ]"
                >
                  {{ showSelectedReorder ? 'Done Ordering' : 'Arrange Order' }}
                </button>
              </div>
            </div>

            <!-- Reorder / Selected Preview Tray (when activated) -->
            <div v-if="showSelectedReorder && editingPackage.features.length > 0" class="p-4 rounded-2xl bg-[#141414] border border-[#FFD700]/30 space-y-2">
              <div class="flex items-center justify-between text-xs text-neutral-300 mb-2 font-semibold">
                <span>Selected Inclusions Display Order:</span>
                <span class="text-[11px] text-neutral-500">Move up/down to adjust presentation order</span>
              </div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <div
                  v-for="(feat, idx) in editingPackage.features"
                  :key="idx"
                  class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="font-mono text-[#FFD700] text-[11px] w-5">{{ idx + 1 }}.</span>
                    <span class="truncate">{{ feat }}</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      @click="moveFeatureUp(idx)"
                      :disabled="idx === 0"
                      class="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="moveFeatureDown(idx)"
                      :disabled="idx === editingPackage.features.length - 1"
                      class="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="removeSelectedFeature(idx)"
                      class="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer"
                      title="Remove from package"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Search & Filter Controls -->
            <div class="flex flex-col sm:flex-row items-center gap-2.5">
              <div class="relative flex-1 w-full">
                <Search class="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  v-model="inclusionSearch"
                  placeholder="Search master inclusions..."
                  class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
                />
              </div>

              <!-- Filter pills -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="inclusionFilterMode = 'all'"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  :class="[
                    inclusionFilterMode === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/[0.03] text-neutral-400 hover:text-white'
                  ]"
                >
                  All ({{ masterInclusions.length }})
                </button>
                <button
                  type="button"
                  @click="inclusionFilterMode = 'selected'"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  :class="[
                    inclusionFilterMode === 'selected'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'bg-white/[0.03] text-neutral-400 hover:text-white'
                  ]"
                >
                  Selected ({{ editingPackage.features ? editingPackage.features.length : 0 }})
                </button>
              </div>
            </div>

            <!-- Toggleable Master Inclusions List -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              <button
                v-for="feat in filteredMasterInclusions"
                :key="feat"
                type="button"
                @click="toggleFeature(feat)"
                class="p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer"
                :class="[
                  isFeatureSelected(feat)
                    ? 'bg-[#FFD700]/10 border-[#FFD700]/40 text-white shadow-sm'
                    : 'bg-transparent border-white/[0.12] text-neutral-300 hover:bg-white/[0.04] hover:border-white/25'
                ]"
              >
                <span class="text-xs leading-snug break-words flex-1" :class="{ 'font-semibold text-white': isFeatureSelected(feat) }">
                  {{ feat }}
                </span>

                <!-- Checkbox / Indicator -->
                <div
                  class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition"
                  :class="[
                    isFeatureSelected(feat)
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'border border-white/20 group-hover:border-white/40'
                  ]"
                >
                  <Check v-if="isFeatureSelected(feat)" class="w-3 h-3 stroke-[3]" />
                </div>
              </button>

              <!-- Rich Empty State for Package Inclusion Picker -->
              <div
                v-if="filteredMasterInclusions.length === 0"
                class="col-span-full py-8 px-4 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-2.5"
              >
                <!-- Case A: Search has no results -->
                <template v-if="inclusionSearch.trim()">
                  <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                    <Search class="w-4 h-4 text-neutral-400" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-semibold text-white">No matching inclusions</p>
                    <p class="text-[11px] text-neutral-400 max-w-xs mx-auto">
                      No results for "<span class="text-neutral-200">{{ inclusionSearch }}</span>". Add it as a new inclusion below.
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="inclusionSearch = ''"
                    class="cursor-pointer px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] text-neutral-300 hover:text-white transition"
                  >
                    Clear search
                  </button>
                </template>

                <!-- Case B: 'selected' filter is active but nothing selected -->
                <template v-else-if="inclusionFilterMode === 'selected'">
                  <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                    <Check class="w-4 h-4 text-neutral-400" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-semibold text-white">No inclusions selected yet</p>
                    <p class="text-[11px] text-neutral-400 max-w-xs mx-auto">
                      Toggle inclusions from the 'All' tab to attach them to this package.
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="inclusionFilterMode = 'all'"
                    class="cursor-pointer px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] text-neutral-300 hover:text-white transition"
                  >
                    View all inclusions
                  </button>
                </template>

                <!-- Case C: Master list is completely empty -->
                <template v-else>
                  <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                    <ListFilter class="w-4 h-4 text-neutral-400" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-semibold text-white">No master inclusions available</p>
                    <p class="text-[11px] text-neutral-400 max-w-xs mx-auto">
                      Type an inclusion below and click 'Add & Select' to add it to your master list.
                    </p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Quick Add New Inclusion to Master List -->
            <div class="pt-3 border-t border-white/[0.06] flex items-center gap-2">
              <input
                type="text"
                v-model="inlineNewInclusion"
                @keyup.enter="handleAddInlineInclusion"
                placeholder="Can't find an inclusion? Add new to master list..."
                class="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
              <button
                type="button"
                @click="handleAddInlineInclusion"
                class="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add & Select</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Fixed Footer Actions -->
        <div class="flex justify-end items-center gap-3 p-6 md:px-8 py-4 border-t border-white/[0.08] bg-[#141414] shrink-0">
          <button
            @click="editingPackage = null"
            class="cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            class="cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/20 text-center flex items-center justify-center"
          >
            Save Package
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- PACKAGE MASTER LIST MANAGEMENT MODAL -->
    <!-- ======================================================== -->
    <div
      v-if="showMasterListModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] p-6 md:px-8 py-5 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">
              <span>Package Master List</span>
            </h3>
            <p class="text-xs text-neutral-400 mt-0.5">
              Standardized inclusions and deliverables used across studio packages
            </p>
          </div>
          <button
            @click="showMasterListModal = false"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
            title="Close modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Body Content -->
        <div class="flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-4">
          <!-- Add New Master Inclusion -->
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Add New Master Inclusion</label>
            <div class="flex gap-2">
              <input
                type="text"
                v-model="newMasterInclusionInput"
                @keyup.enter="handleAddMasterInclusion"
                placeholder="e.g. 2 Professional Videographers..."
                class="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
              <button
                @click="handleAddMasterInclusion"
                type="button"
                class="cursor-pointer px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#141414] text-xs font-bold uppercase tracking-wider hover:bg-yellow-400 transition flex items-center gap-1.5 shrink-0"
              >
                <Plus class="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="relative">
            <Search class="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              v-model="masterListSearch"
              placeholder="Search master inclusions..."
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
            />
          </div>

          <!-- Master List Items -->
          <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <div
              v-for="item in filteredManagerMasterList"
              :key="item"
              class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 text-xs text-neutral-200 hover:border-white/20 transition"
            >
              <!-- In-place edit mode -->
              <template v-if="editingMasterItem.oldVal === item">
                <input
                  type="text"
                  v-model="editingMasterItem.newVal"
                  @keyup.enter="saveEditMasterItem"
                  class="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.08] border border-white/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                  autofocus
                />
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    @click="saveEditMasterItem"
                    class="px-3 py-1 rounded-lg bg-[#FFD700] text-[#141414] font-bold text-[11px] cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    @click="cancelEditMasterItem"
                    class="px-2.5 py-1 rounded-lg bg-white/10 text-neutral-300 text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </template>

              <!-- Standard view mode -->
              <template v-else>
                <div class="flex items-center gap-2.5 min-w-0">
                  <Check class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span class="break-words">{{ item }}</span>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    @click="startEditMasterItem(item)"
                    class="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                    title="Edit Master Inclusion"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="promptDeleteInclusion(item)"
                    class="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete from Master List"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </template>
            </div>

            <!-- Rich Empty State for Master List Manager -->
            <div
              v-if="filteredManagerMasterList.length === 0"
              class="py-12 px-4 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-3"
            >
              <!-- Case 1: Search has no results -->
              <template v-if="masterListSearch.trim()">
                <div class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                  <Search class="w-5 h-5 text-neutral-400" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-sm font-semibold text-white">No matching inclusions</h4>
                  <p class="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    No deliverables found matching "<span class="text-neutral-200 font-medium">{{ masterListSearch }}</span>".
                  </p>
                </div>
                <button
                  type="button"
                  @click="masterListSearch = ''"
                  class="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition mt-1"
                >
                  Clear search filter
                </button>
              </template>

              <!-- Case 2: Master list has 0 items -->
              <template v-else>
                <div class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                  <ListFilter class="w-5 h-5 text-neutral-400" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-sm font-semibold text-white">No Master Inclusions Yet</h4>
                  <p class="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    Your studio deliverables list is currently empty. Use the input box above to add your standardized package features.
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Fixed Footer Actions -->
        <div class="flex justify-end p-6 md:px-8 py-4 border-t border-white/[0.08] bg-[#141414] shrink-0">
          <button
            @click="showMasterListModal = false"
            class="cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-md text-center flex items-center justify-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MASTER ADD-ONS MANAGEMENT MODAL                          -->
    <!-- ======================================================== -->
    <div
      v-if="showMasterAddonsModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Fixed Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] p-6 md:px-8 py-5 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">
              <span>Master Add-ons List</span>
            </h3>
            <p class="text-xs text-neutral-400 mt-0.5">
              Standardized add-on services and extra deliverables with itemized pricing
            </p>
          </div>
          <button
            @click="showMasterAddonsModal = false"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
            title="Close modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Body Content -->
        <div class="flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-4">
          <!-- Add New Master Add-on Form -->
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Add New Master Add-on</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                v-model="inlineNewAddon.title"
                @keyup.enter="handleAddInlineAddon"
                placeholder="Add-on title (e.g. SDE Highlight Reel)..."
                class="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
              <div class="relative w-full sm:w-36">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">₱</span>
                <input
                  type="text"
                  inputmode="numeric"
                  v-model="inlineNewAddon.price"
                  @keydown="allowOnlyDigits"
                  @input="sanitizeNumericInput($event, inlineNewAddon, 'price')"
                  @keyup.enter="handleAddInlineAddon"
                  placeholder="Price"
                  class="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition font-mono"
                />
              </div>
              <button
                @click="handleAddInlineAddon"
                type="button"
                class="cursor-pointer px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#141414] text-xs font-bold uppercase tracking-wider hover:bg-yellow-400 transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
              >
                <Plus class="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="relative">
            <Search class="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              v-model="masterAddonsSearch"
              placeholder="Search master add-ons by title or price..."
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
            />
          </div>

          <!-- Master Add-ons Items List -->
          <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <div
              v-for="addon in filteredMasterAddons"
              :key="addon.id"
              class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 text-xs text-neutral-200 hover:border-white/20 transition"
            >
              <!-- In-place edit mode -->
              <template v-if="editingMasterAddon && editingMasterAddon.id === addon.id">
                <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    v-model="editingMasterAddon.title"
                    @keyup.enter="saveEditMasterAddon"
                    @keyup.esc="cancelEditMasterAddon"
                    class="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.08] border border-white/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="Add-on title"
                    autofocus
                  />
                  <div class="relative w-full sm:w-32">
                    <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">₱</span>
                    <input
                      type="text"
                      inputmode="numeric"
                      v-model="editingMasterAddon.price"
                      @keydown="allowOnlyDigits"
                      @input="sanitizeNumericInput($event, editingMasterAddon, 'price')"
                      @keyup.enter="saveEditMasterAddon"
                      @keyup.esc="cancelEditMasterAddon"
                      class="w-full pl-6 pr-2 py-1.5 rounded-lg bg-white/[0.08] border border-white/30 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                      placeholder="Price"
                    />
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    @click="saveEditMasterAddon"
                    class="px-3 py-1 rounded-lg bg-[#FFD700] text-[#141414] font-bold text-[11px] cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    @click="cancelEditMasterAddon"
                    class="px-2.5 py-1 rounded-lg bg-white/10 text-neutral-300 text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </template>

              <!-- Normal display mode -->
              <template v-else>
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <span class="font-medium text-white truncate">{{ addon.title }}</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-[11px] font-mono font-bold shrink-0">
                    ₱{{ Number(addon.price || 0).toLocaleString('en-PH') }}
                  </span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    @click="startEditMasterAddon(addon)"
                    class="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                    title="Edit Add-on"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="promptDeleteAddon(addon)"
                    class="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete from Master Add-ons"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </template>
            </div>

            <!-- Rich Empty State for Master Add-ons Manager -->
            <div
              v-if="filteredMasterAddons.length === 0"
              class="py-12 px-4 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-3"
            >
              <!-- Case 1: Search has no results -->
              <template v-if="masterAddonsSearch.trim()">
                <div class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                  <Search class="w-5 h-5 text-neutral-400" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-sm font-semibold text-white">No matching add-ons</h4>
                  <p class="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    No add-on deliverables found matching "<span class="text-neutral-200 font-medium">{{ masterAddonsSearch }}</span>".
                  </p>
                </div>
                <button
                  type="button"
                  @click="masterAddonsSearch = ''"
                  class="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition mt-1"
                >
                  Clear search filter
                </button>
              </template>

              <!-- Case 2: Master add-ons list has 0 items -->
              <template v-else>
                <div class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                  <Layers class="w-5 h-5 text-neutral-400" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-sm font-semibold text-white">No Master Add-ons Yet</h4>
                  <p class="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    Your studio master add-on list is currently empty. Use the input box above to add your standard add-ons and extra deliverables.
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Fixed Footer Actions -->
        <div class="flex justify-end p-6 md:px-8 py-4 border-t border-white/[0.08] bg-[#141414] shrink-0">
          <button
            @click="showMasterAddonsModal = false"
            class="cursor-pointer px-6 py-2.5 min-w-[120px] rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-md text-center flex items-center justify-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MASTER INCLUSION DELETE CONFIRMATION MODAL               -->
    <!-- ======================================================== -->
    <div
      v-if="inclusionToDelete"
      class="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4 select-none"
    >
      <div class="bg-[#141414] border border-white/[0.14] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl overflow-hidden">
        <!-- Icon & Header -->
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>

          <div class="space-y-1 flex-1 min-w-0">
            <h3 class="text-base font-bold text-white tracking-wide">Delete Master Inclusion?</h3>
            <p class="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to remove <strong class="text-white font-semibold">"{{ inclusionToDelete }}"</strong> from the master deliverables list?
            </p>
          </div>
        </div>

        <!-- Warning Callout Box -->
        <div class="p-3.5 rounded-2xl bg-red-500/[0.08] border border-red-500/20 text-xs text-red-300 leading-relaxed space-y-1.5">
          <p class="font-bold text-red-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <AlertTriangle class="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Warning: Cascade Removal</span>
          </p>
          <p class="text-[11px] text-neutral-300">
            Deleting this inclusion will permanently remove it from the master list and <strong class="text-red-300 font-semibold">remove it from every package</strong> where it is currently included ({{ affectedPackagesCount }} active {{ affectedPackagesCount === 1 ? 'package' : 'packages' }} affected).
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end items-center gap-2.5 pt-2">
          <button
            type="button"
            @click="cancelDeleteInclusion"
            class="cursor-pointer px-5 py-2.5 min-w-[100px] rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeleteInclusion"
            class="cursor-pointer px-5 py-2.5 min-w-[110px] rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MASTER ADD-ON DELETE CONFIRMATION MODAL                  -->
    <!-- ======================================================== -->
    <div
      v-if="addonToDelete"
      class="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4 select-none"
    >
      <div class="bg-[#141414] border border-white/[0.14] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl overflow-hidden">
        <!-- Icon & Header -->
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>

          <div class="space-y-1 flex-1 min-w-0">
            <h3 class="text-base font-bold text-white tracking-wide">Delete Master Add-on?</h3>
            <p class="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to remove <strong class="text-white font-semibold">"{{ addonToDelete.title }}"</strong> (₱{{ Number(addonToDelete.price || 0).toLocaleString('en-PH') }}) from the master add-ons list?
            </p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end items-center gap-2.5 pt-2">
          <button
            type="button"
            @click="cancelDeleteAddon"
            class="cursor-pointer px-5 py-2.5 min-w-[100px] rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeleteAddon"
            class="cursor-pointer px-5 py-2.5 min-w-[110px] rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- ADD CATEGORY MODAL -->
    <!-- ======================================================== -->
    <div
      v-if="showAddCategoryModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl">
        <!-- Header -->
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <h3 class="text-xl font-bold text-white tracking-wide">Add New Category</h3>
            <p class="text-xs text-neutral-400">Create a dynamic service/event category for your packages</p>
          </div>
          <button
            type="button"
            @click="showAddCategoryModal = false"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Input Field -->
        <div class="space-y-2">
          <label class="block text-xs font-medium text-neutral-300">Category Name <span class="text-[#FFD700]">*</span></label>
          <input
            type="text"
            v-model="newCategoryInput"
            @keyup.enter="handleCreateCategory"
            placeholder="e.g., Corporate & Headshots, Maternity..."
            class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
            autofocus
          />
          <p v-if="addCategoryError" class="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ addCategoryError }}</span>
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end items-center gap-3 pt-2">
          <button
            type="button"
            @click="showAddCategoryModal = false"
            class="cursor-pointer px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleCreateCategory"
            class="cursor-pointer px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/20 flex items-center gap-1.5"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Create Category</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- ADD NEW ADD-ON MODAL                                     -->
    <!-- ======================================================== -->
    <div
      v-if="showAddAddonModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl">
        <!-- Header -->
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <h3 class="text-xl font-bold text-white tracking-wide">Add New Add-on</h3>
            <p class="text-xs text-neutral-400">Create an itemized extra service or deliverable</p>
          </div>
          <button
            type="button"
            @click="showAddAddonModal = false"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Add-on Title -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-neutral-300">Add-on Title <span class="text-[#FFD700]">*</span></label>
            <input
              type="text"
              v-model="newAddonForm.title"
              @keyup.enter="handleCreateAddon"
              placeholder="e.g., Same Day Edit (SDE), Aerial Drone..."
              class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              autofocus
            />
          </div>

          <!-- Add-on Price -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-neutral-300">Add-on Price (₱) <span class="text-[#FFD700]">*</span></label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">₱</span>
              <input
                type="text"
                inputmode="numeric"
                v-model="newAddonForm.price"
                @keydown="allowOnlyDigits"
                @input="sanitizeNumericInput($event, newAddonForm, 'price')"
                @keyup.enter="handleCreateAddon"
                placeholder="7000"
                class="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition font-mono"
              />
            </div>
          </div>

          <p v-if="addAddonError" class="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ addAddonError }}</span>
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end items-center gap-3 pt-2">
          <button
            type="button"
            @click="showAddAddonModal = false"
            class="cursor-pointer px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleCreateAddon"
            class="cursor-pointer px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/20 flex items-center gap-1.5"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Create Add-on</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MANAGE CATEGORIES MODAL -->
    <!-- ======================================================== -->
    <div
      v-if="showManageCategoriesModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] p-6 md:px-8 py-5 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">Manage Categories</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Rename or remove service categories. Changes persist to cloud instantly.</p>
          </div>
          <button
            @click="showManageCategoriesModal = false"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-4">
          <!-- Add Category Shortcut Form inside modal -->
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Add New Category</label>
            <div class="flex gap-2">
              <input
                type="text"
                v-model="newCategoryInput"
                @keyup.enter="handleCreateCategory"
                placeholder="Type new category name..."
                class="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
              <button
                type="button"
                @click="handleCreateCategory"
                class="px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <p v-if="addCategoryError" class="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
              <span>{{ addCategoryError }}</span>
            </p>
          </div>

          <!-- Existing Categories List -->
          <div class="space-y-2 pt-2">
            <label class="block text-xs font-medium text-neutral-400 uppercase tracking-wider">Existing Categories ({{ packageCategories.length }})</label>
            <div class="space-y-1.5">
              <div
                v-for="cat in packageCategories"
                :key="cat"
                class="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 flex items-center justify-between gap-3 transition"
              >
                <!-- Inline Edit Form -->
                <div v-if="categoryBeingEdited.oldVal === cat" class="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    v-model="categoryBeingEdited.newVal"
                    @keyup.enter="saveEditCategory"
                    @keyup.esc="cancelEditCategory"
                    class="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.08] border border-white/20 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                    autofocus
                  />
                  <button
                    type="button"
                    @click="saveEditCategory"
                    class="p-1.5 rounded-lg bg-[#FFD700] text-[#141414] hover:bg-yellow-400 transition cursor-pointer"
                    title="Save rename"
                  >
                    <Check class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="cancelEditCategory"
                    class="p-1.5 rounded-lg bg-white/10 text-neutral-300 hover:text-white transition cursor-pointer"
                    title="Cancel"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Display Row -->
                <div v-else class="flex items-center gap-2.5 flex-1 min-w-0">
                  <span class="text-sm font-semibold text-white truncate">{{ cat }}</span>
                  <span class="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-neutral-400 font-mono">
                    {{ getCategoryPackageCount(cat) }} {{ getCategoryPackageCount(cat) === 1 ? 'pkg' : 'pkgs' }}
                  </span>
                </div>

                <!-- Actions -->
                <div v-if="categoryBeingEdited.oldVal !== cat" class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="startEditCategory(cat)"
                    class="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                    title="Rename category"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="promptDeleteCategory(cat)"
                    class="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end items-center p-6 md:px-8 py-4 border-t border-white/[0.08] bg-[#141414] shrink-0">
          <button
            type="button"
            @click="showManageCategoriesModal = false"
            class="cursor-pointer px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/10 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- DELETE CATEGORY CONFIRMATION MODAL -->
    <!-- ======================================================== -->
    <div
      v-if="categoryToDelete"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl">
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>

          <div class="space-y-1 flex-1 min-w-0">
            <h3 class="text-base font-bold text-white tracking-wide">Delete Category?</h3>
            <p class="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete category <strong class="text-white font-semibold">"{{ categoryToDelete }}"</strong>?
            </p>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300 leading-relaxed space-y-1">
          <p class="font-semibold text-neutral-200">Safe Reassignment:</p>
          <p class="text-[11px] text-neutral-400">
            Any packages currently assigned to this category ({{ getCategoryPackageCount(categoryToDelete) }} packages) will be safely reassigned to <strong>"Other"</strong> so no package data is lost.
          </p>
        </div>

        <div class="flex justify-end items-center gap-2.5 pt-2">
          <button
            type="button"
            @click="categoryToDelete = null"
            class="cursor-pointer px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeleteCategory"
            class="cursor-pointer px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- DELETE PACKAGE CONFIRMATION MODAL -->
    <!-- ======================================================== -->
    <div
      v-if="packageToDelete"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#141414] border border-white/[0.12] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl">
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Trash2 class="w-5 h-5" />
          </div>

          <div class="space-y-1 flex-1 min-w-0">
            <h3 class="text-base font-bold text-white tracking-wide">Delete Package?</h3>
            <p class="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete <strong class="text-white font-semibold">"{{ packageToDelete.title }}"</strong> from <strong class="text-white font-semibold">{{ packageToDelete.category }}</strong>?
            </p>
          </div>
        </div>

        <div class="flex justify-end items-center gap-2.5 pt-2">
          <button
            type="button"
            @click="cancelDeletePackage"
            class="cursor-pointer px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeletePackage"
            class="cursor-pointer px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete Package</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- CREATE / EDIT CATEGORY ADD-ONS MODAL                      -->
    <!-- ======================================================== -->
    <div
      v-if="showCategoryAddonsModal"
      class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-manrope select-none"
    >
      <div class="bg-[#141414] border border-white/[0.14] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] p-6 md:px-8 py-5 shrink-0">
          <div>
            <h3 class="text-xl font-bold text-white tracking-wide">
              <span>{{ categoryAddonPackageForm.id ? 'Edit Add-ons for ' : 'Create Add-ons for ' }}<span class="text-[#FFD700]">{{ categoryAddonPackageForm.category }}</span></span>
            </h3>
            <p class="text-xs text-neutral-400 mt-0.5">
              Select and bundle master add-on deliverables and extra options for this category
            </p>
          </div>
          <button
            type="button"
            @click="showCategoryAddonsModal = false"
            class="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center shadow-sm"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto p-6 md:px-8 py-6 space-y-5">
          <!-- Form Fields Grid: Category (Auto-select), Add-on Title, Badge -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Category (Auto-selected) -->
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Category</label>
              <div class="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-200 text-xs font-bold flex items-center justify-between">
                <span>{{ categoryAddonPackageForm.category }}</span>
                <span class="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-neutral-400 font-normal">Auto-selected</span>
              </div>
            </div>

            <!-- Add-on Package Title -->
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Add-on Package Title <span class="text-[#FFD700]">*</span></label>
              <input
                type="text"
                v-model="categoryAddonPackageForm.title"
                placeholder="e.g., ADDITIONALS"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition font-semibold"
              />
            </div>

            <!-- Optional Badge -->
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Badge (Optional)</label>
              <input
                type="text"
                v-model="categoryAddonPackageForm.badge"
                placeholder="e.g., Popular Extras"
                class="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
              />
            </div>
          </div>

          <!-- Add-ons Master List Selection Container -->
          <div class="p-5 rounded-3xl bg-black/40 border border-white/[0.08] space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <label class="block text-sm font-semibold text-white">
                  Select add-ons from master list
                </label>
                <p class="text-[11px] text-neutral-400">Choose the extra deliverables to bundle for this category</p>
              </div>

              <!-- Selected Count & Quick Actions -->
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 text-xs font-mono font-bold">
                  {{ selectedCategoryAddonsCount }} Selected
                </span>
                <button
                  type="button"
                  @click="selectAllCategoryAddons"
                  class="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white/5 border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  Select All
                </button>
                <button
                  v-if="selectedCategoryAddonsCount > 0"
                  type="button"
                  @click="clearAllCategoryAddons"
                  class="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white/5 border border-white/10 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <!-- Search & Filter Controls -->
            <div class="flex flex-col sm:flex-row items-center gap-2.5">
              <div class="relative flex-1 w-full">
                <Search class="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  v-model="categoryAddonSearch"
                  placeholder="Search master add-ons by title or price..."
                  class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition"
                />
              </div>

              <!-- Filter pills -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="categoryAddonFilterMode = 'all'"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  :class="[
                    categoryAddonFilterMode === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/[0.03] text-neutral-400 hover:text-white'
                  ]"
                >
                  All ({{ masterAddons.length }})
                </button>
                <button
                  type="button"
                  @click="categoryAddonFilterMode = 'selected'"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  :class="[
                    categoryAddonFilterMode === 'selected'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'bg-white/[0.03] text-neutral-400 hover:text-white'
                  ]"
                >
                  Selected ({{ selectedCategoryAddonsCount }})
                </button>
              </div>
            </div>

            <!-- Multi-selection Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              <button
                v-for="addon in filteredCategoryMasterAddons"
                :key="addon.id"
                type="button"
                @click="toggleCategoryAddonSelection(addon.id)"
                class="p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer"
                :class="[
                  isCategoryAddonSelected(addon.id)
                    ? 'bg-[#FFD700]/10 border-[#FFD700]/40 text-white shadow-sm'
                    : 'bg-transparent border-white/[0.12] text-neutral-300 hover:bg-white/[0.04] hover:border-white/25'
                ]"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-xs leading-snug break-words" :class="{ 'font-bold text-white': isCategoryAddonSelected(addon.id) }">
                    {{ addon.title }}
                  </p>
                  <p class="text-[11px] font-mono font-semibold text-[#FFD700] mt-0.5">
                    ₱{{ Number(addon.price || 0).toLocaleString('en-PH') }}
                  </p>
                </div>

                <!-- Checkbox / Indicator -->
                <div
                  class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition"
                  :class="[
                    isCategoryAddonSelected(addon.id)
                      ? 'bg-[#FFD700] text-[#141414] shadow-sm'
                      : 'border border-white/20 group-hover:border-white/40'
                  ]"
                >
                  <Check v-if="isCategoryAddonSelected(addon.id)" class="w-3 h-3 stroke-[3]" />
                </div>
              </button>

              <!-- Empty State -->
              <div
                v-if="filteredCategoryMasterAddons.length === 0"
                class="col-span-full py-8 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-2"
              >
                <template v-if="categoryAddonSearch.trim()">
                  <p class="text-xs text-neutral-400">No add-ons matching "{{ categoryAddonSearch }}"</p>
                  <button
                    type="button"
                    @click="categoryAddonSearch = ''"
                    class="text-[11px] text-[#FFD700] hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                </template>
                <template v-else-if="categoryAddonFilterMode === 'selected'">
                  <p class="text-xs text-neutral-400">No add-ons selected yet</p>
                  <button
                    type="button"
                    @click="categoryAddonFilterMode = 'all'"
                    class="text-[11px] text-[#FFD700] hover:underline cursor-pointer"
                  >
                    Browse all add-ons
                  </button>
                </template>
                <template v-else>
                  <p class="text-xs text-neutral-400">Master add-ons list is currently empty.</p>
                  <button
                    type="button"
                    @click="openAddAddonModal()"
                    class="text-[11px] text-[#FFD700] hover:underline font-medium cursor-pointer"
                  >
                    + Create New Add-on
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Total Computation Card -->
          <div class="p-4 rounded-2xl bg-[#FFD700]/[0.06] border border-[#FFD700]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div>
                <span class="text-xs font-bold text-white uppercase tracking-wider">Total Computation</span>
              </div>
              <p class="text-[11px] text-neutral-400">
                Calculated total value of all <span class="text-neutral-200 font-semibold">{{ selectedCategoryAddonsCount }}</span> selected add-on deliverables
              </p>
            </div>
            <div class="flex items-baseline gap-2 shrink-0">
              <span class="text-xs text-neutral-400">Total Value:</span>
              <span class="text-xl font-extrabold text-[#FFD700] font-mono">
                ₱{{ computedCategoryAddonsTotal.toLocaleString('en-PH') }}
              </span>
            </div>
          </div>

          <!-- Error Alert if any -->
          <p v-if="categoryAddonError" class="text-xs text-red-400 flex items-center gap-1.5">
            <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ categoryAddonError }}</span>
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end items-center gap-3 p-6 md:px-8 py-4 border-t border-white/[0.08] bg-[#141414] shrink-0">
          <button
            type="button"
            @click="showCategoryAddonsModal = false"
            class="cursor-pointer px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.10] text-neutral-300 hover:text-white text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSaveCategoryAddons"
            class="cursor-pointer px-6 py-2.5 rounded-xl bg-[#FFD700] hover:bg-yellow-400 text-[#141414] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/20 flex items-center gap-1.5"
          >
            <span>{{ categoryAddonPackageForm.id ? 'Save Changes' : 'Create Add-ons' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- VISUAL TOAST FEEDBACK NOTIFICATION                        -->
    <!-- ========================================================= -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-6 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-6 scale-95"
      >
        <div
          v-if="toast.visible"
          class="fixed bottom-6 left-6 z-[10001] max-w-md w-[calc(100vw-3rem)] sm:w-auto bg-[#1a1a1a]/95 backdrop-blur-md border border-white/15 text-white px-4 py-3 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3.5 font-manrope select-none"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              :class="[
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : toast.type === 'danger'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-white/10 text-neutral-300 border border-white/15'
              ]"
            >
              <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4" />
              <AlertTriangle v-else-if="toast.type === 'danger'" class="w-4 h-4" />
              <Info v-else class="w-4 h-4" />
            </div>

            <div class="min-w-0">
              <p class="text-xs font-bold text-white truncate">{{ toast.title }}</p>
              <p v-if="toast.subtitle" class="text-[11px] text-neutral-400 truncate mt-0.5">{{ toast.subtitle }}</p>
            </div>
          </div>

          <button
            @click="dismissToast"
            type="button"
            class="cursor-pointer p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition shrink-0 ml-2"
            title="Dismiss"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>
