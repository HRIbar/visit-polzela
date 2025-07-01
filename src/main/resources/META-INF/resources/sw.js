// Cache names
const CACHE_NAME = 'visit-polzela-cache-v1';
const DATA_CACHE_NAME = 'visit-polzela-data-cache-v1';
const STATIC_CACHE_NAME = 'visit-polzela-static-cache-v1';

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/main.css',
  '/styles/offline.css',
  '/frontend/offline-store.js',
  '/frontend/offline-router.js',
  '/images/logo.png'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Add event listener for the fetch event
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('Navigation fetch failed, falling back to cache');
          // If offline and navigating, check if it's a POI route
          if (url.pathname.startsWith('/poi/')) {
            // Return the main page and let the offline-router.js handle the routing
            return caches.match('/');
          }

          // For other navigation failures, serve the offline page
          return caches.match('/offline.html') || caches.match('/');
        })
    );
    return;
  }

  // Handle POI description requests specifically
  if (url.pathname.includes('/poi-descriptions/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // If online, update the cache
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // If offline, try to return cached data
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Handle pointsofinterest/pois.txt specifically
  if (url.pathname.includes('/pointsofinterest/pois.txt')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Handle image requests
  if (url.pathname.endsWith('.webp') || url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') || url.pathname.endsWith('.jpeg')) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Handle JavaScript files
  if (url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Handle CSS files
  if (url.pathname.endsWith('.css')) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Default fetch handler - network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Try to get from cache if network fails
        return caches.match(event.request);
      })
  );
});

// Add an activate event to clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME, STATIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim any clients immediately
  return self.clients.claim();
});

// Handle offline/online status changes
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'OFFLINE_STATUS_CHANGE') {
    // Notify all clients about the offline status change
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'OFFLINE_STATUS_UPDATE',
          offline: event.data.offline
        });
      });
    });
  }
});

console.log('Service Worker loaded');