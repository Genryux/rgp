import { ref, onMounted, onBeforeUnmount } from 'vue';

export const PRODUCTION_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACWoufZYIOSIwagr';
// Official Cloudflare universal dummy test key (Always passes on localhost/testing environments)
export const LOCALHOST_TEST_SITE_KEY = '1x00000000000000000000AA';

export function getTurnstileSiteKey() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Auto-detect local development environments (localhost, 127.0.0.1, etc.)
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local')
    ) {
      return LOCALHOST_TEST_SITE_KEY;
    }
  }
  return PRODUCTION_SITE_KEY;
}

export function useTurnstile() {
  const turnstileContainer = ref(null);
  const turnstileToken = ref('');
  const turnstileWidgetId = ref(null);
  const isTurnstileReady = ref(false);
  const activeSiteKey = getTurnstileSiteKey();

  function renderWidget() {
    if (typeof window === 'undefined' || !window.turnstile || !turnstileContainer.value) {
      return;
    }

    // If widget was already rendered in this container, reset it
    if (turnstileWidgetId.value !== null) {
      try {
        window.turnstile.reset(turnstileWidgetId.value);
        turnstileToken.value = '';
      } catch (err) {
        console.warn('[Turnstile] Error resetting existing widget:', err);
      }
      return;
    }

    try {
      turnstileWidgetId.value = window.turnstile.render(turnstileContainer.value, {
        sitekey: activeSiteKey,
        theme: 'dark',
        callback: (token) => {
          turnstileToken.value = token;
        },
        'expired-callback': () => {
          turnstileToken.value = '';
        },
        'error-callback': () => {
          turnstileToken.value = '';
        },
      });
      isTurnstileReady.value = true;
    } catch (err) {
      console.warn('[Turnstile] Render failed:', err);
    }
  }

  function resetTurnstile() {
    if (typeof window !== 'undefined' && window.turnstile && turnstileWidgetId.value !== null) {
      try {
        window.turnstile.reset(turnstileWidgetId.value);
      } catch (err) {
        console.warn('[Turnstile] Reset failed:', err);
      }
    }
    turnstileToken.value = '';
  }

  onMounted(() => {
    if (typeof window === 'undefined') return;

    if (window.turnstile) {
      renderWidget();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        } else if (attempts >= 40) {
          // Stop checking after 8 seconds
          clearInterval(interval);
        }
      }, 200);
    }
  });

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined' && window.turnstile && turnstileWidgetId.value !== null) {
      try {
        window.turnstile.remove(turnstileWidgetId.value);
      } catch (_) {}
      turnstileWidgetId.value = null;
    }
  });

  return {
    turnstileContainer,
    turnstileToken,
    turnstileWidgetId,
    turnstileSiteKey: activeSiteKey,
    isTurnstileReady,
    resetTurnstile,
  };
}
