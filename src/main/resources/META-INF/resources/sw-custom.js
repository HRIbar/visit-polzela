// This will be merged with Vaadin's generated service worker

// Cache names
const CACHE_NAME = 'visit-polzela-cache-v1';
const DATA_CACHE_NAME = 'visit-polzela-data-cache-v1';

// Add event listener for the fetch event
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

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
});

// Add an activate event to clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
