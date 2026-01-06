import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './routes';

// Initialize the React app
const container = document.getElementById('outlet') || document.body;
const root = createRoot(container);

root.render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);

// Capture the beforeinstallprompt event for PWA installation
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  (window as any).deferredPrompt = deferredPrompt;
  console.log('beforeinstallprompt event captured');
});

// Listen for the app installed event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
  (window as any).deferredPrompt = null;
});

// Capture the beforeinstallprompt event for PWA installation
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  (window as any).deferredPrompt = deferredPrompt;
  console.log('beforeinstallprompt event captured');
});

// Listen for the app installed event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
  (window as any).deferredPrompt = null;
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
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
