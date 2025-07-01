/**
 * Offline router for Visit Polzela PWA
 * Handles navigation when the app is offline
 */
class OfflineRouter {
  constructor() {
    this.isOffline = !navigator.onLine;
    this.offlineRoutes = [
      '/',
      '/pois',
      '/poi/castle',
      '/poi/park',
      '/poi/icecream',
      '/poi/mountoljka',
      '/poi/maurerhouse',
      '/poi/romancamp',
      '/poi/tractormuseum',
      '/poi/cajhnhayrack',
      '/poi/clayfigurines',
      '/poi/noviklostermanor',
      '/poi/stmargharetachurch',
      '/poi/stnicholaschurch',
      '/poi/standrewchurch',
      '/poi/plaguememorial',
      '/poi/jelovsekgranary',
      '/poi/bolcinhouse',
      '/poi/stoberhouse',
      '/poi/barbankhouse',
      '/poi/mesicmill',
      '/poi/riverloznica'
    ];
  }

  /**
   * Initialize the offline router
   */
  init() {
    // Set up event listeners for online/offline status
    window.addEventListener('online', () => this.handleConnectionChange(false));
    window.addEventListener('offline', () => this.handleConnectionChange(true));

    // Check initial connection status
    this.handleConnectionChange(this.isOffline);

    // Set up navigation interception
    this.setupNavigationInterception();

    console.log('Offline router initialized');
  }

  /**
   * Handle connection status changes
   * @param {boolean} offline - Whether the app is offline
   */
  handleConnectionChange(offline) {
    this.isOffline = offline;
    document.body.classList.toggle('offline-mode', offline);

    // Show/hide offline indicator
    this.updateOfflineIndicator(offline);

    console.log(`App is ${offline ? 'offline' : 'online'}`);
  }

  /**
   * Update the offline indicator in the UI
   * @param {boolean} show - Whether to show the indicator
   */
  updateOfflineIndicator(show) {
    let indicator = document.querySelector('.offline-indicator');

    if (!indicator && show) {
      // Create indicator if it doesn't exist
      indicator = document.createElement('div');
      indicator.className = 'offline-indicator';
      indicator.textContent = 'You are offline';
      document.body.appendChild(indicator);
    }

    if (indicator) {
      indicator.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Set up interception of navigation events
   */
  setupNavigationInterception() {
    // Intercept link clicks
    document.addEventListener('click', (event) => {
      // Only handle when offline
      if (!this.isOffline) return;

      // Find if the click was on a link or its child
      let target = event.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Handle POI detail links
      if (href.startsWith('/poi/')) {
        event.preventDefault();
        this.navigateToPOI(href.split('/').pop());
      }
      // Handle other app routes
      else if (this.isOfflineRoute(href)) {
        event.preventDefault();
        this.navigateToOfflinePage(href);
      }
    });

    // Handle popstate for back/forward navigation
    window.addEventListener('popstate', (event) => {
      if (this.isOffline) {
        const path = window.location.pathname;
        if (path.startsWith('/poi/')) {
          event.preventDefault();
          this.navigateToPOI(path.split('/').pop());
        } else if (this.isOfflineRoute(path)) {
          event.preventDefault();
          this.navigateToOfflinePage(path);
        }
      }
    });
  }

  /**
   * Check if a route is available offline
   * @param {string} route - The route to check
   * @returns {boolean} - Whether the route is available offline
   */
  isOfflineRoute(route) {
    return this.offlineRoutes.includes(route);
  }

  /**
   * Navigate to a POI detail page when offline
   * @param {string} poiId - The ID of the POI
   */
  async navigateToPOI(poiId) {
    try {
      // Get POI data from IndexedDB
      const poi = await window.offlineStore.getPOI(poiId);

      if (poi) {
        // Update browser history
        const url = `/poi/${poiId}`;
        window.history.pushState({poiId}, poi.displayName, url);

        // Render the offline POI detail view
        this.renderOfflinePOIDetail(poi);
      } else {
        this.showOfflineMessage(`The content for "${poiId}" is not available offline`);
      }
    } catch (error) {
      console.error('Error navigating to POI:', error);
      this.showOfflineMessage('Failed to load offline content');
    }
  }

  /**
   * Navigate to a general offline page
   * @param {string} route - The route to navigate to
   */
  async navigateToOfflinePage(route) {
    try {
      // Update browser history
      window.history.pushState({route}, '', route);

      if (route === '/' || route === '/pois') {
        // Render the POI list page
        await this.renderOfflinePOIList();
      } else {
        // For other routes, show a generic offline page
        this.showOfflineMessage('This page is available in limited functionality while offline');
      }
    } catch (error) {
      console.error('Error navigating to offline page:', error);
      this.showOfflineMessage('Failed to load offline content');
    }
  }

  /**
   * Render a POI detail view in offline mode
   * @param {Object} poi - The POI data
   */
  renderOfflinePOIDetail(poi) {
    const outlet = document.getElementById('outlet') || document.body;

    // Create offline POI detail view
    outlet.innerHTML = `
      <div class="offline-poi-detail">
        <header>
          <button onclick="history.back()" class="back-button">← Back</button>
          <h1>${poi.displayName}</h1>
        </header>

        <div class="poi-content">
          <img src="${poi.imageUrl}" alt="${poi.displayName}" class="main-image">

          <div class="poi-description">
            ${poi.description || poi.shortDescription || 'No description available offline'}
          </div>

          ${poi.additionalImages ? `
            <div class="additional-images">
              <h3>More Images</h3>
              <div class="image-gallery">
                ${poi.additionalImages.map(img =>
                  `<img src="${img}" alt="${poi.displayName}" class="gallery-image">`
                ).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="offline-notice">
          <p>You're viewing cached content while offline</p>
        </div>
      </div>
    `;
  }

  /**
   * Render the POI list in offline mode
   */
  async renderOfflinePOIList() {
    try {
      const pois = await window.offlineStore.getAllPOIs();
      const outlet = document.getElementById('outlet') || document.body;

      outlet.innerHTML = `
        <div class="offline-poi-list">
          <header>
            <h1>Points of Interest</h1>
            <div class="offline-badge">Offline Mode</div>
          </header>

          <div class="poi-grid">
            ${pois.length > 0 ? pois.map(poi => `
              <div class="poi-card" data-poi-id="${poi.id}">
                <img src="${poi.imageUrl}" alt="${poi.displayName}">
                <h3>${poi.displayName}</h3>
                <p>${poi.shortDescription || ''}</p>
                <button class="view-details-btn" data-poi-id="${poi.id}">View Details</button>
              </div>
            `).join('') : '<p>No points of interest available offline</p>'}
          </div>
        </div>
      `;

      // Add event listeners to the POI cards
      document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', () => {
          const poiId = button.getAttribute('data-poi-id');
          this.navigateToPOI(poiId);
        });
      });

    } catch (error) {
      console.error('Error rendering POI list:', error);
      this.showOfflineMessage('Failed to load offline content');
    }
  }

  /**
   * Show an offline message to the user
   * @param {string} message - The message to display
   */
  showOfflineMessage(message) {
    const outlet = document.getElementById('outlet') || document.body;

    outlet.innerHTML = `
      <div class="offline-message">
        <div class="offline-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8s8 3.6 8 8s-3.6 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
        <h2>Offline Mode</h2>
        <p>${message}</p>
        <button onclick="history.back()" class="back-button">Go Back</button>
      </div>
    `;
  }
}

// Initialize and export the router
window.OfflineRouter = OfflineRouter;