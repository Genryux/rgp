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

// Navigation Guard for Admin Routes
router.beforeEach(async (to, from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  if (to.meta.requiresAuth) {
    if (!isSupabaseConfigured || !supabase) {
      // Allow local development preview if Supabase is not yet connected
      return next();
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
    }
  }

  if (to.name === 'AdminLogin' && isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return next({ name: 'AdminDashboard' });
    }
  }

  next();
});

export default router;
