document.addEventListener('DOMContentLoaded', () => {
    const offlineRouter = new OfflineRouter();
    offlineRouter.init();

    // Handle offline/online events
    window.addEventListener('online', () => {
        console.log('Application is online');
        // You can add additional online handling here
    });

    window.addEventListener('offline', () => {
        console.log('Application is offline');
        // You can add additional offline handling here
    });
});
