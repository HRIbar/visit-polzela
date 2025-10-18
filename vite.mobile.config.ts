import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Standalone Vite config for building mobile app with Capacitor
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/main/frontend'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'target/classes/META-INF/resources'),
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main/frontend/index.html'),
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/main/frontend')
    }
  },
  publicDir: path.resolve(__dirname, 'src/main/resources/META-INF/resources')
});
