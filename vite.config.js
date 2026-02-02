import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
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
