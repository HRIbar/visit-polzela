import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Standalone Vite config for building mobile app with Capacitor
// This config is completely independent from Vaadin's build system
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [],
      },
    })
  ],
  root: path.resolve(__dirname, 'src/main/frontend'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'target/classes/META-INF/resources'),
    emptyOutDir: true, // Clean the output directory before building
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main/frontend/index.html'),
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'leaflet': ['leaflet'],
          'idb': ['idb']
        }
      }
    },
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/main/frontend')
    }
  },
  // Copy static resources from the resources folder
  publicDir: path.resolve(__dirname, 'src/main/resources/META-INF/resources'),
  server: {
    port: 3000,
    strictPort: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'idb', 'leaflet'],
    exclude: ['@vaadin/bundles', '@vaadin/react-components']
  }
});
