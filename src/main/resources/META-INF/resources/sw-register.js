if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Custom SW registered with scope: ', registration.scope);
      })
      .catch(function(error) {
        console.log('Custom SW registration failed: ', error);
      });
  });
}