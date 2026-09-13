<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Sparkles,
} from '@lucide/vue';

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';

  const { error } = await login(email.value, password.value);
  loading.value = false;

  if (error) {
    errorMessage.value = error.message || 'Invalid credentials. Please try again.';
  } else {
    const redirectPath = route.query.redirect || '/admin';
    router.push(redirectPath);
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4 font-manrope selection:bg-[#FFD700] selection:text-black antialiased relative">
    <div class="w-full max-w-md bg-[#141414] border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="text-center mb-8">
        <router-link to="/" class="inline-block mb-4 group">
          <img src="/images/Logo1.png" alt="RGP Films & Studio" class="h-14 mx-auto transition duration-300 group-hover:scale-105" />
        </router-link>
        <h1 class="text-xl font-bold text-white tracking-wide">Studio CMS Portal</h1>
        <p class="text-xs text-neutral-400 mt-1">Sign in to manage your portfolio, rates, and inquiries</p>
      </div>

      <!-- Offline / Mock Notice if Supabase is unconfigured -->
      <div
        v-if="!isSupabaseConfigured"
        class="mb-6 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs text-center flex items-center justify-center gap-2"
      >
        <Sparkles class="w-4 h-4 text-[#FFD700] flex-shrink-0" />
        <span>Demo Mode active. Click <strong>Sign In</strong> to enter.</span>
      </div>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="mb-6 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs text-center"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Admin Email</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              v-model="email"
              :required="isSupabaseConfigured"
              placeholder="admin@rgpfilmsstudio.site"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#FFD700] transition"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Password</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              v-model="password"
              :required="isSupabaseConfigured"
              placeholder="••••••••••••"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-white/[0.08] text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#FFD700] transition"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 rounded-full bg-[#FFD700] text-[#121212] font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 mt-2"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <ShieldCheck v-else class="w-4 h-4" />
          <span>{{ loading ? 'Authenticating...' : 'Sign In to Dashboard' }}</span>
        </button>
      </form>

      <div class="mt-8 text-center pt-6 border-t border-white/[0.06]">
        <router-link to="/" class="text-xs text-neutral-500 hover:text-neutral-300 transition flex items-center justify-center gap-1.5">
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Return to Public Portfolio</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
