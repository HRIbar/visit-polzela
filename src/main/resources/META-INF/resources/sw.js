self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('visit-polzela-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/manifest.json',
                '/poi-descriptions/polzela-castle.txt',
                '/poi-descriptions/local-park.txt',
                '/poi-descriptions/ice-cream-seller.txt',
                // Add other resources you want to cache
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});