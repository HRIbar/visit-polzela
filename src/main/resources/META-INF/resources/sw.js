const CACHE_NAME = 'visit-polzela-v4'; // Increment version to force update
const urlsToCache = [
  '/',
  '/index.html',
  // Points of interest data files
  '/pointsofinterest/pois.txt',
  '/pointsofinterest/poititles.txt',
  '/pointsofinterest/pois.json',
  '/pointsofinterest/pois-complete.json',
  // POI description files
  '/poi-descriptions/barbankhouse.txt',
  '/poi-descriptions/bolcinhouse.txt',
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
  '/poi-descriptions/stoberhouse.txt',
  '/poi-descriptions/tractormuseum.txt',
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
  '/images/barbankhouse.webp',
  '/images/bolcinhouse.webp',
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
  '/images/stoberhouse.webp',
  '/images/tractormuseum.webp'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For navigation requests (page loads), serve index.html from cache
  // This allows React Router to handle routing client-side when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).catch(() => {
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((networkResponse) => {
          // Cache valid responses for future use
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Return a fallback for failed requests if needed
        return new Response('Offline - resource not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});
