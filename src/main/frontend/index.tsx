import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

// Initialize the React app - use 'root' to match index.html
const container = document.getElementById('root') || document.getElementById('outlet') || document.body;
const root = createRoot(container);

root.render(<RouterProvider router={router} />);

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
