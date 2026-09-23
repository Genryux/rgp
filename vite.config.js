import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'node:fs';
import path from 'node:path';

// Automatically generates dist/404.html from dist/index.html for GitHub Pages SPA routing
function spa404Plugin() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      const fallbackPath = path.join(distDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, fallbackPath);
      }
    },
  };
}

export default defineConfig({
  root: 'src',
  envDir: '../',
  base: '/',
  plugins: [vue(), spa404Plugin()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    host: true, // Expose to local network for mobile testing
    open: true,
    watch: {
      usePolling: true,
    },
  },
  css: {
    postcss: './src/postcss.config.js',
  },
});

