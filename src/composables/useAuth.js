import { ref } from 'vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useRouter } from 'vue-router';

const user = ref(null);
const session = ref(null);
const loading = ref(true);

export function useAuth() {
  const router = useRouter();

  // Initialize auth state
  async function initAuth() {
    if (!isSupabaseConfigured || !supabase) {
      loading.value = false;
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      session.value = data.session;
      user.value = data.session?.user || null;

      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession;
        user.value = newSession?.user || null;
      });
    } catch (err) {
      console.error('[Auth] Error fetching session:', err);
    } finally {
      loading.value = false;
    }
  }

  async function login(email, password) {
    if (!isSupabaseConfigured || !supabase) {
      // Mock login for demo/offline development
      user.value = { email: email || 'admin@rgpfilmsstudio.site' };
      return { data: { user: user.value }, error: null };
    }

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (result.data?.session) {
      session.value = result.data.session;
      user.value = result.data.user;
    }

    return result;
  }

  async function logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    session.value = null;
    user.value = null;
    if (router) {
      router.push({ name: 'AdminLogin' });
    }
  }

  return {
    user,
    session,
    loading,
    initAuth,
    login,
    logout,
    isAuthenticated: () => Boolean(user.value),
  };
}
