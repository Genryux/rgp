import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/admin/LoginView.vue';
import DashboardView from '../views/admin/DashboardView.vue';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'RGP Films & Studio | Professional Photography & Videography' },
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: LoginView,
    meta: { title: 'Admin Login | RGP Studio CMS' },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: DashboardView,
    meta: { requiresAuth: true, title: 'Dashboard | RGP Studio CMS' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { top: 0 };
  },
});

// Navigation Guard / Supabase Auth & Authorization Middleware
router.beforeEach(async (to, from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  if (to.meta.requiresAuth) {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('[Auth Middleware] Supabase is not configured. Redirecting to login.');
      return next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.warn('[Auth Middleware] Unauthenticated access attempt. Redirecting to login:', error?.message);
        return next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
      }
      // User is verified and authenticated by Supabase
      return next();
    } catch (err) {
      console.error('[Auth Middleware] Exception during auth check:', err);
      return next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
    }
  }

  if (to.name === 'AdminLogin' && isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return next({ name: 'AdminDashboard' });
      }
    } catch {
      // Continue to login page if check fails
    }
  }

  next();
});

export default router;
