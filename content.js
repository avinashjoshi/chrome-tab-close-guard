// Content script to manage settings
// Runs in ISOLATED world, communicates with injected.js in MAIN world

// Check if the extension should be active on this site
function checkAndUpdate() {
  chrome.storage.sync.get(['enabledSites', 'blockAllSites'], (result) => {
    const enabledSites = result.enabledSites || [];
    const blockAllSites = result.blockAllSites || false;
    const currentHostname = window.location.hostname;

    let isEnabled = false;

    if (blockAllSites) {
      isEnabled = true;
    } else {
      // Check if current site matches any pattern
      isEnabled = enabledSites.some(pattern => {
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*');
        const regex = new RegExp('^' + regexPattern + '$');
        return regex.test(currentHostname);
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
