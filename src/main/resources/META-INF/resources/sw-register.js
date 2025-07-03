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
    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.textContent = 'Install App';
    installButton.style.display = 'none'; // Initially hidden
    installButton.style.position = 'fixed';
    installButton.style.bottom = '1rem';
    installButton.style.right = '1rem';
    installButton.style.zIndex = '9999';
    document.body.appendChild(installButton);

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI to notify the user they can install the PWA
      installButton.style.display = 'block';
      console.log('`beforeinstallprompt` event was fired.');
    });

    installButton.addEventListener('click', async () => {
      // Hide the app provided install promotion
      installButton.style.display = 'none';
      // Show the install prompt
      if (deferredPrompt) {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
      }
    });

    window.addEventListener('appinstalled', () => {
      // Hide the install button
      installButton.style.display = 'none';
      // Clear the deferredPrompt so it can be garbage collected
      deferredPrompt = null;
      console.log('PWA was installed');
    });
  });
}