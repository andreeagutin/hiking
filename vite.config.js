import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  optimizeDeps: {
    // Capacitor native plugins have no browser entry — exclude from pre-bundling
    exclude: [
      '@capacitor-community/background-geolocation',
      '@capacitor/geolocation',
      '@capacitor/filesystem',
      '@capacitor/preferences',
      '@capacitor/share',
    ],
  },
  build: {
    rollupOptions: {
      external: [
        '@capacitor-community/background-geolocation',
        '@capacitor/geolocation',
        '@capacitor/filesystem',
        '@capacitor/preferences',
        '@capacitor/share',
      ],
    },
  },
});
