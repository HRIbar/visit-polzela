import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Standalone Vite config for building mobile app with Capacitor.
// Key differences from vite.config.ts:
//   - publicDir → public-mobile/ (only UI-chrome assets; POI images are fetched at runtime)
//   - VITE_API_BASE_URL is injected so DataService calls https://visit-polzela.com
//   - Leaflet is NOT bundled (still loaded via CDN in index.html)
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

  define: {
    // Tells DataService to prefix all /api/… and /images/… fetches with the remote origin
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://visit-polzela.com'),
  },

  build: {
    outDir: path.resolve(__dirname, 'target/classes/META-INF/resources'),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main/frontend/index.html'),
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
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

  // Only the UI-chrome assets ship inside the APK.
  // POI images, description files, and legacy scripts are excluded.
  publicDir: path.resolve(__dirname, 'src/main/frontend/public-mobile'),

  server: {
    port: 3000,
    strictPort: false
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'idb'],
    exclude: ['@vaadin/bundles', '@vaadin/react-components']
  }
});
