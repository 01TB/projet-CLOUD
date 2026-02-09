/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['leaflet']
  },
  server: {
    host: true, // Pour éviter les problèmes de réseau
    port: 8100  // Port Ionic par défaut
  },
  build: {
    target: 'esnext',
    outDir: 'www',
    emptyOutDir: true,
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
