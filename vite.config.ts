import { defineConfig, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }: ConfigEnv) => ({
  plugins: [react()],

  // Frontend source is in src/main/frontend
  root: 'src/main/frontend',

  // In dev mode, also serve static assets (images, icons, etc.) from META-INF/resources
  // so they are accessible during local Vite dev server sessions
  publicDir:
    command === 'serve'
      ? path.resolve(__dirname, 'src/main/resources/META-INF/resources')
      : false,

  build: {
    // Output directly into the Quarkus static-resources directory
    outDir: path.resolve(__dirname, 'src/main/resources/META-INF/resources'),
    // Do NOT empty the output dir — that would delete images, sw.js, manifest, etc.
    emptyOutDir: false,
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      onwarn: (warning, warn) => {
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to Quarkus running on 8080
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'idb'],
  },
}));
