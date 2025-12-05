// Tab Close Guard - shows confirmation dialog when closing tabs
// Runs in the page's main context

let isEnabled = false;

console.log('[Tab Close Guard] Protection loaded');

// Listen for settings from content script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type === 'CTRL_W_BLOCKER_UPDATE') {
    isEnabled = event.data.isEnabled;
    console.log('[Tab Close Guard] Protection', isEnabled ? 'ENABLED ✓' : 'disabled');
  }
});

// beforeunload - shows confirmation dialog when closing tab
window.addEventListener('beforeunload', (event) => {
  if (isEnabled) {
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
});

// Signal ready
window.postMessage({ type: 'CTRL_W_BLOCKER_READY' }, '*');
