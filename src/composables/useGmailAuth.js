import { ref } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const isConnected = ref(false);
const connectedEmail = ref('');
const senderDisplayName = ref('');
const connectedAt = ref(null);
const loading = ref(false);
const error = ref('');

export function useGmailAuth() {
  async function checkStatus() {
    if (!isSupabaseConfigured || !supabase) return;

    loading.value = true;
    error.value = '';

    try {
      // First try invoking the edge function
      const { data, error: funcError } = await supabase.functions.invoke('gmail-auth', {
        body: { action: 'get-status' },
      });

      if (!funcError && data) {
        isConnected.value = Boolean(data.connected);
        connectedEmail.value = data.connectedEmail || '';
        senderDisplayName.value = data.senderDisplayName || '';
        connectedAt.value = data.connectedAt || null;
        return;
      }

      // Fallback: direct database read on gmail_sync_state
      const { data: dbData } = await supabase
        .from('gmail_sync_state')
        .select('connected_email, sender_display_name, connected_at, refresh_token')
        .eq('id', 'studio_sync')
        .maybeSingle();

      if (dbData) {
        isConnected.value = Boolean(dbData.refresh_token || dbData.connected_email);
        connectedEmail.value = dbData.connected_email || '';
        senderDisplayName.value = dbData.sender_display_name || '';
        connectedAt.value = dbData.connected_at || null;
      }
    } catch (err) {
      console.warn('[useGmailAuth] Error checking status:', err);
    } finally {
      loading.value = false;
    }
  }

  async function connectGmail() {
    if (!isSupabaseConfigured || !supabase) {
      error.value = 'Supabase credentials are not configured.';
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      const redirectUri = `${window.location.origin}/admin`;
      const { data, error: funcError } = await supabase.functions.invoke('gmail-auth', {
        body: { action: 'get-auth-url', redirectUri },
      });

      if (funcError || !data?.url) {
        throw new Error(data?.error || funcError?.message || 'Failed to generate Google login URL');
      }

      // Mark pending session and redirect to Google OAuth consent
      sessionStorage.setItem('rgp_gmail_oauth_pending', 'true');
      window.location.href = data.url;
    } catch (err) {
      error.value = err.message || 'Could not initiate Google connection.';
      console.error('[useGmailAuth] Connect error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function handleOAuthCallback() {
    if (!isSupabaseConfigured || !supabase) return false;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) return false;

    loading.value = true;
    error.value = '';

    try {
      const redirectUri = `${window.location.origin}/admin`;
      const { data, error: funcError } = await supabase.functions.invoke('gmail-auth', {
        body: { action: 'exchange-code', code, redirectUri },
      });

      // Clean the code param from browser URL bar without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      sessionStorage.removeItem('rgp_gmail_oauth_pending');

      if (funcError || !data?.success) {
        throw new Error(data?.error || funcError?.message || 'Token exchange failed');
      }

      isConnected.value = true;
      connectedEmail.value = data.connectedEmail || '';
      senderDisplayName.value = data.senderDisplayName || '';
      connectedAt.value = new Date().toISOString();

      return true;
    } catch (err) {
      error.value = err.message || 'Failed to complete Google account connection.';
      console.error('[useGmailAuth] Callback exchange failed:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function disconnectGmail() {
    if (!isSupabaseConfigured || !supabase) return;

    loading.value = true;
    error.value = '';

    try {
      await supabase.functions.invoke('gmail-auth', {
        body: { action: 'disconnect' },
      });

      isConnected.value = false;
      connectedEmail.value = '';
      senderDisplayName.value = '';
      connectedAt.value = null;
    } catch (err) {
      error.value = err.message || 'Failed to disconnect account.';
    } finally {
      loading.value = false;
    }
  }

  return {
    isConnected,
    connectedEmail,
    senderDisplayName,
    connectedAt,
    loading,
    error,
    checkStatus,
    connectGmail,
    handleOAuthCallback,
    disconnectGmail,
  };
}
