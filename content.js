// Content script to manage settings
// Runs in ISOLATED world, communicates with injected.js in MAIN world

// Check if we're in app/standalone mode (PWA or installed app)
function isAppMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: minimal-ui)').matches ||
         window.navigator.standalone === true;
}

// Check if the extension should be active on this site
function checkAndUpdate() {
  chrome.storage.sync.get(['enabledSites', 'blockAllSites'], (result) => {
    const enabledSites = result.enabledSites || [];
    const blockAllSites = result.blockAllSites || false;
    const currentHostname = window.location.hostname;
    const inAppMode = isAppMode();

    let isEnabled = false;

    if (blockAllSites) {
      isEnabled = true;
    } else {
      // Check if current site matches any pattern
      isEnabled = enabledSites.some(site => {
        // Handle both old string format and new object format
        const pattern = typeof site === 'string' ? site : site.pattern;
        const appModeOnly = typeof site === 'object' ? site.appModeOnly : false;

        // Convert wildcard pattern to regex
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*');
        const regex = new RegExp('^' + regexPattern + '$');
        const matches = regex.test(currentHostname);

        // Only enable if pattern matches AND (not appModeOnly OR we're in app mode)
        return matches && (!appModeOnly || inAppMode);
      });
    }

    // Send the enabled state to the injected script
    window.postMessage({
      type: 'CTRL_W_BLOCKER_UPDATE',
      isEnabled: isEnabled
    }, '*');
  });
}

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data.type === 'CTRL_W_BLOCKER_READY') {
    checkAndUpdate();
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.enabledSites || changes.blockAllSites)) {
    checkAndUpdate();
  }
});
