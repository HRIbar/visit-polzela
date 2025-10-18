import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { App as CapacitorApp } from '@capacitor/app';

// Initialize the React app - use 'root' to match index.html
const container = document.getElementById('root') || document.getElementById('outlet') || document.body;
const root = createRoot(container);

root.render(<RouterProvider router={router} />);

// Handle Android back button
if (window.Capacitor?.isNativePlatform()) {
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      // If we can go back in the browser history, do so
      window.history.back();
    } else {
      // If we're at the root, minimize the app instead of closing it
      CapacitorApp.minimizeApp();
    }
  });
}

// Register service worker for PWA functionality (disabled for Capacitor)
if ('serviceWorker' in navigator && !window.Capacitor) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
