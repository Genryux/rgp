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
      return null;
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      session.value = currentSession;
      user.value = currentSession?.user || null;

      if (currentSession) {
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        if (verifiedUser) {
          user.value = verifiedUser;
        }
      }

      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession;
        user.value = newSession?.user || null;
      });
      return user.value;
    } catch (err) {
      console.error('[Auth] Error fetching session:', err);
      session.value = null;
      user.value = null;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function checkAuth() {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data: { user: verifiedUser }, error } = await supabase.auth.getUser();
      if (error || !verifiedUser) {
        user.value = null;
        session.value = null;
        return null;
      }
      user.value = verifiedUser;
      return verifiedUser;
    } catch (err) {
      user.value = null;
      session.value = null;
      return null;
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
    checkAuth,
    login,
    logout,
    isAuthenticated: () => Boolean(user.value),
  };
}
