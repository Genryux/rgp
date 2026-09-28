import { ref } from 'vue';

const ATTACHMENT_STORAGE_KEY = 'rgp_attached_inquiry_bundle';

export function extractNumericPrice(val) {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function normalizePackage(pkg) {
  if (!pkg) return null;
  const title = pkg.title || pkg.name || 'Selected Package';
  const rawPriceVal = pkg.price !== undefined ? pkg.price : (pkg.raw_price !== undefined ? pkg.raw_price : 0);
  const price = extractNumericPrice(rawPriceVal);
  const rawPromoVal = pkg.promo_price !== undefined ? pkg.promo_price : pkg.raw_promo_price;
  const promo_price = rawPromoVal !== undefined && rawPromoVal !== null ? extractNumericPrice(rawPromoVal) : null;
  const features = Array.isArray(pkg.features)
    ? [...pkg.features]
    : (typeof pkg.features === 'string' && pkg.features ? [pkg.features] : []);
  const hide_price = Boolean(pkg.hide_price);
  const badge = pkg.badge || pkg.discountBadge || null;
  const category = pkg.category || '';

  return {
    id: pkg.id || 'custom-pkg',
    title,
    name: title,
    price,
    raw_price: price,
    promo_price,
    raw_promo_price: promo_price,
    features,
    hide_price,
    badge,
    category,
  };
}

// Persistent reactive state across components
const attachedBundle = ref({
  package: null,
  addons: [],
  category: '',
  timestamp: Date.now(),
});

// Load initial state from sessionStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = sessionStorage.getItem(ATTACHMENT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        attachedBundle.value = {
          package: parsed.package ? normalizePackage(parsed.package) : null,
          addons: Array.isArray(parsed.addons) ? parsed.addons : [],
          category: parsed.category || '',
          timestamp: parsed.timestamp || Date.now(),
        };
      }
    }
  } catch (e) {
    // Ignore error
  }
}

function persistBundle() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(ATTACHMENT_STORAGE_KEY, JSON.stringify(attachedBundle.value));
      window.dispatchEvent(new CustomEvent('rgp:bundle_selected', { detail: attachedBundle.value }));
    } catch (e) {
      // Ignore error
    }
  }
}

function scrollToContact() {
  if (typeof document !== 'undefined') {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

export function useInquiryAttachment() {
  function attachPackage(pkg, category = '') {
    if (!pkg) return;
    const normalized = normalizePackage(pkg);
    if (category && normalized && !normalized.category) {
      normalized.category = category;
    }
    attachedBundle.value = {
      package: normalized,
      addons: [],
      category: category || normalized?.category || '',
      timestamp: Date.now(),
    };
    persistBundle();
    scrollToContact();
  }

  function attachPackageWithAddons(pkg, addons = [], category = '') {
    const normalized = pkg ? normalizePackage(pkg) : null;
    if (category && normalized && !normalized.category) {
      normalized.category = category;
    }
    attachedBundle.value = {
      package: normalized,
      addons: Array.isArray(addons) ? addons : [],
      category: category || normalized?.category || '',
      timestamp: Date.now(),
    };
    persistBundle();
    scrollToContact();
  }

  function clearAttachment() {
    attachedBundle.value = {
      package: null,
      addons: [],
      category: '',
      timestamp: Date.now(),
    };
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(ATTACHMENT_STORAGE_KEY);
      } catch (e) {}
    }
  }

  return {
    attachedBundle,
    attachPackage,
    attachPackageWithAddons,
    clearAttachment,
    scrollToContact,
    extractNumericPrice,
    normalizePackage,
  };
}
