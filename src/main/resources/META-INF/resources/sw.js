const CACHE_NAME = 'visit-polzela-v6'; // Increment version to force update
const urlsToCache = [
  '/',
  '/index.html',
  // Points of interest data files
  '/pointsofinterest/pois.txt',
  '/pointsofinterest/poititles.txt',
  '/pointsofinterest/pois.json',
  '/pointsofinterest/pois-complete.json',
  // POI description files
  '/poi-descriptions/cajhnhayrack.txt',
  '/poi-descriptions/castle.txt',
  '/poi-descriptions/clayfigurines.txt',
  '/poi-descriptions/icecream.txt',
  '/poi-descriptions/jelovsekgranary.txt',
  '/poi-descriptions/maurerhouse.txt',
  '/poi-descriptions/mesicmill.txt',
  '/poi-descriptions/mountoljka.txt',
  '/poi-descriptions/noviklostermanor.txt',
  '/poi-descriptions/park.txt',
  '/poi-descriptions/plaguememorial.txt',
  '/poi-descriptions/riverloznica.txt',
  '/poi-descriptions/romancamp.txt',
  '/poi-descriptions/standrewchurch.txt',
  '/poi-descriptions/stmargharetachurch.txt',
  '/poi-descriptions/stnicholaschurch.txt',
  '/poi-descriptions/tractormuseum.txt',
  // Offline scripts
  '/frontend/offline-handler.js',
  '/frontend/offline-router.js',
  '/frontend/offline-store.js',
  '/js/offline-store.js',
  // Manifest and icons
  '/manifest.webmanifest',
  '/favicon.ico',
  // Flag images
  '/images/siflag.webp',
  '/images/ukflag.webp',
  '/images/deflag.webp',
  '/images/nlflag.webp',
  // UI images
  '/images/polzela.webp',
  '/images/grbpolzela.webp',
  '/images/navigationbutton.webp',
  '/images/applenavigationbutton.webp',
  '/images/applenavigationbutton.png',
  '/images/placeholder.png',
  // POI images
  '/images/cajhnhayrack.webp',
  '/images/castle.webp',
  '/images/castle1.webp',
  '/images/castle2.webp',
  '/images/castle3.webp',
  '/images/clayfigurines.webp',
  '/images/icecream.webp',
  '/images/icecream1.webp',
  '/images/icecream2.webp',
  '/images/jelovsekgranary.webp',
  '/images/maurerhouse.webp',
  '/images/maurerhouse1.webp',
  '/images/maurerhouse2.webp',
  '/images/maurerhouse3.webp',
  '/images/mesicmill.webp',
  '/images/mountoljka.webp',
  '/images/mountoljka1.webp',
  '/images/mountoljka2.webp',
  '/images/mountoljka3.webp',
  '/images/noviklostermanor.webp',
  '/images/park.webp',
  '/images/park1.webp',
  '/images/park2.webp',
  '/images/park3.webp',
  '/images/plaguememorial.webp',
  '/images/riverloznica.webp',
  '/images/romancamp.webp',
  '/images/romancamp1.webp',
  '/images/romancamp2.webp',
  '/images/standrewchurch.webp',
  '/images/standrewchurch1.webp',
  '/images/standrewchurch2.webp',
  '/images/stmargharetachurch.webp',
  '/images/stmargharetachurch1.webp',
  '/images/stnicholaschurch.webp',
  '/images/stnicholaschurch1.webp',
  '/images/stnicholaschurch2.webp',
  '/images/tractormuseum.webp'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Skip waiting to activate immediately');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests (e.g., chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // For navigation requests (page loads), always serve index.html from cache
  // This allows React Router to handle routing client-side when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online and successful, return the response
          if (response && response.ok) {
            return response;
          }
          // If failed, serve cached index.html
          return caches.match('/index.html');
        })
        .catch(() => {
          // If offline, serve cached index.html
          console.log('[SW] Offline - serving cached index.html for navigation');
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For all other requests, use cache-first strategy with runtime caching
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', url.pathname);
          return cachedResponse;
        }

        // If not in cache, try network and cache the response
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache non-successful responses or non-GET requests
            if (!networkResponse || networkResponse.status !== 200 || request.method !== 'GET') {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();

            // Cache JavaScript, CSS, images, and JSON responses
            const contentType = networkResponse.headers.get('content-type') || '';
            if (
              contentType.includes('javascript') ||
              contentType.includes('css') ||
              contentType.includes('image') ||
              contentType.includes('json') ||
              url.pathname.endsWith('.js') ||
              url.pathname.endsWith('.css') ||
              url.pathname.endsWith('.webp') ||
              url.pathname.endsWith('.png') ||
              url.pathname.endsWith('.jpg') ||
              url.pathname.endsWith('.json')
            ) {
              caches.open(CACHE_NAME).then((cache) => {
                console.log('[SW] Runtime caching:', url.pathname);
                cache.put(request, responseToCache);
              });
            }

            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed for:', url.pathname, error);
            // Return a meaningful offline response for failed requests
            if (url.pathname.endsWith('.html')) {
              return caches.match('/index.html');
            }
            return new Response('Offline - resource not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
