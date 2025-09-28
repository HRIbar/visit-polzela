import { UserConfigFn } from 'vite';
import { overrideVaadinConfig } from './vite.generated';

const customConfig: UserConfigFn = (env) => ({
  // Simple configuration that works with Vaadin's existing build system
  build: {
    sourcemap: env.command === 'serve',
    rollupOptions: {
      onwarn: (warning, warn) => {
        // Suppress common warnings that don't affect functionality
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'idb'],
  },
  // Exclude service worker from main build
  worker: {
    format: 'es'
  }
});

export default overrideVaadinConfig(customConfig);
