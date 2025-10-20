import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Вимикаємо sourcemap для зменшення розміру build'у
    outDir: 'dist',
    assetsDir: 'assets',
    // Налаштування для оптимізації bundle size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Розбивка на менші chunks для оптимізації пам'яті
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          ui: ['framer-motion', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5179,
    strictPort: true,
  },
  // Вимікаємо base для правильного deploy на Vercel
  // base: './',
});
