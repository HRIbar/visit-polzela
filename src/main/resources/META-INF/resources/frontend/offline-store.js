
/**
 * Offline storage utilities for Visit Polzela application
 */
window.VisitPolzelaOfflineStore = {
    /**
     * Initialize the IndexedDB database
     */
    initDB: function() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                console.warn('IndexedDB not supported');
                resolve(false);
                return;
            }

            const dbPromise = indexedDB.open('visit-polzela-db', 1);

            dbPromise.onupgradeneeded = function(event) {
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('pois')) {
                    db.createObjectStore('pois', { keyPath: 'name' });
                }

                if (!db.objectStoreNames.contains('descriptions')) {
                    db.createObjectStore('descriptions', { keyPath: 'poiName' });
                }
            };

            dbPromise.onsuccess = function(event) {
                console.log('IndexedDB initialized successfully');
                resolve(true);
            };

            dbPromise.onerror = function(event) {
                console.error('Error initializing IndexedDB', event);
                resolve(false);
            };
        });
    },

    /**
     * Store POI data in IndexedDB
     */
    storePOIs: function(pois) {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                resolve(false);
                return;
            }

            const dbPromise = indexedDB.open('visit-polzela-db', 1);

            dbPromise.onsuccess = function(event) {
                const db = event.target.result;
                const tx = db.transaction('pois', 'readwrite');
                const store = tx.objectStore('pois');

                // Clear existing data
                store.clear();

                // Add new data
                pois.forEach(poi => {
                    store.put(poi);
                });

                tx.oncomplete = function() {
                    resolve(true);
                };

                tx.onerror = function(event) {
                    console.error('Error storing POIs', event);
                    resolve(false);
                };
            };

            dbPromise.onerror = function(event) {
                console.error('Error opening database', event);
                resolve(false);
            };
        });
    },

    /**
     * Retrieve POIs from IndexedDB
     */
    getPOIs: function() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                resolve([]);
                return;
            }

            const dbPromise = indexedDB.open('visit-polzela-db', 1);

            dbPromise.onsuccess = function(event) {
                const db = event.target.result;
                const tx = db.transaction('pois', 'readonly');
                const store = tx.objectStore('pois');
                const request = store.getAll();

                request.onsuccess = function() {
                    resolve(request.result || []);
                };

                request.onerror = function(event) {
                    console.error('Error retrieving POIs', event);
                    resolve([]);
                };
            };

            dbPromise.onerror = function(event) {
                console.error('Error opening database', event);
                resolve([]);
            };
        });
    },

    /**
     * Store a POI description in IndexedDB
     */
    storeDescription: function(poiName, description) {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                resolve(false);
                return;
            }

            const dbPromise = indexedDB.open('visit-polzela-db', 1);

            dbPromise.onsuccess = function(event) {
                const db = event.target.result;
                const tx = db.transaction('descriptions', 'readwrite');
                const store = tx.objectStore('descriptions');

                store.put({
                    poiName: poiName,
                    text: description,
                    timestamp: new Date().getTime()
                });

                tx.oncomplete = function() {
                    resolve(true);
                };

                tx.onerror = function(event) {
                    console.error('Error storing description', event);
                    resolve(false);
                };
            };

            dbPromise.onerror = function(event) {
                console.error('Error opening database', event);
                resolve(false);
            };
        });
    },

    /**
     * Get a POI description from IndexedDB
     */
    getDescription: function(poiName) {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                resolve(null);
                return;
            }

            const dbPromise = indexedDB.open('visit-polzela-db', 1);

            dbPromise.onsuccess = function(event) {
                const db = event.target.result;
                const tx = db.transaction('descriptions', 'readonly');
                const store = tx.objectStore('descriptions');
                const request = store.get(poiName);

                request.onsuccess = function() {
                    if (request.result) {
                        resolve(request.result.text);
                    } else {
                        resolve(null);
                    }
                };

                request.onerror = function(event) {
                    console.error('Error retrieving description', event);
                    resolve(null);
                };
            };

            dbPromise.onerror = function(event) {
                console.error('Error opening database', event);
                resolve(null);
            };
        });
    },

    /**
     * Check if the application is online
     */
    isOnline: function() {
        return navigator.onLine;
    },

    /**
     * Register online/offline event listeners
     */
    registerNetworkListeners: function(onlineCallback, offlineCallback) {
        window.addEventListener('online', function() {
            console.log('Application is online');
            if (typeof onlineCallback === 'function') {
                onlineCallback();
            }
        });

        window.addEventListener('offline', function() {
            console.log('Application is offline');
            if (typeof offlineCallback === 'function') {
                offlineCallback();
            }
        });
    }
};

// Initialize the database when the script loads
window.VisitPolzelaOfflineStore.initDB().then(success => {
    console.log('IndexedDB initialization ' + (success ? 'successful' : 'failed'));
});
