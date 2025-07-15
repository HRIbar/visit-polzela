// src/main/resources/META-INF/resources/sw-register.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Register the service worker
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Custom SW registered with scope: ', registration.scope);
      })
      .catch(function(error) {
        console.log('Custom SW registration failed: ', error);
      });

    // --- Install Prompt Logic ---
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Notify the Vaadin app that the PWA is installable
      document.body.dispatchEvent(new CustomEvent('vaadin-pwa-installable'));
      console.log('`beforeinstallprompt` event was fired.');
    });

    window.pwaInstall = async () => {
      // Show the install prompt
      if (deferredPrompt) {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
        // Notify Vaadin to hide the button
        document.body.dispatchEvent(new CustomEvent('vaadin-pwa-installed'));
      }
    };

    window.addEventListener('appinstalled', () => {
      // Clear the deferredPrompt so it can be garbage collected
      deferredPrompt = null;
      // Notify Vaadin to hide the button
      document.body.dispatchEvent(new CustomEvent('vaadin-pwa-installed'));
      console.log('PWA was installed');
    });
  });
}