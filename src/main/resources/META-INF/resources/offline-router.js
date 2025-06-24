const offlineRouter = {
  init() {
    window.addEventListener('offline', () => this.updateOfflineState(true));
    window.addEventListener('online', () => this.updateOfflineState(false));

    // Check initial state
    this.updateOfflineState(!navigator.onLine);
  },

  updateOfflineState(isOffline) {
    document.body.classList.toggle('offline-mode', isOffline);

    // If offline, intercept navigation
    if (isOffline) {
      this.setupOfflineRouting();
    }
  },

  setupOfflineRouting() {
    // Intercept link clicks for offline navigation
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
        const href = link.getAttribute('href');

        // Check if this is a POI detail link
        if (href && href.startsWith('/poi/')) {
          e.preventDefault();
          this.navigateToPOI(href.split('/').pop());
        }
      }
    });
  },

  async navigateToPOI(poiId) {
    // Get POI data from IndexedDB
    const poi = await window.offlineStore.getPOI(poiId);
    if (poi) {
      this.renderOfflinePOIDetail(poi);
    } else {
      alert('This content is not available offline');
    }
  },

  renderOfflinePOIDetail(poi) {
    const outlet = document.getElementById('outlet');
    outlet.innerHTML = `
      <div class="offline-poi-detail">
        <h2>${poi.displayName}</h2>
        <img src="${poi.imageUrl}" alt="${poi.displayName}">
        <p>${poi.description || poi.shortDescription}</p>
        <button onclick="history.back()">Back</button>
      </div>
    `;
  }
};

// Initialize the router
document.addEventListener('DOMContentLoaded', () => offlineRouter.init());