import { UserConfigFn, PluginOption } from 'vite';
import { overrideVaadinConfig } from './vite.generated';

// Custom plugin to disable problematic stats collection in production
const disableStatsPlugin = (): PluginOption => ({
  name: 'vaadin:stats-override',
  enforce: 'pre',
  config(config, env) {
    // Remove the stats plugin in production mode
    if (env.mode === 'production') {
      return {
        build: {
          rollupOptions: {
            onwarn(warning, warn) {
              // Suppress warnings about stats
              if (warning.code === 'PLUGIN_WARNING' && warning.plugin === 'vaadin:stats') {
                return;
              }
              warn(warning);
            }
          }
        }
      };
    }
  }
});

const customConfig: UserConfigFn = (env) => ({
  // Configure for both development and production builds
  build: {
    sourcemap: env.command === 'serve',
    emptyOutDir: false,
    // Increase chunk size warning limit for mobile apps
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn: (warning, warn) => {
        // Suppress common warnings that don't affect functionality
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'EVAL') return; // Suppress eval warnings from Vaadin
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
  },
  server: {
    // Ensure proper CORS for development
    cors: true,
  }
});

export default overrideVaadinConfig(customConfig);
