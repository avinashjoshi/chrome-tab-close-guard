// Tab Close Guard - shows confirmation dialog when closing tabs
// Runs in the page's main context

let isEnabled = false;
let navigationIntent = false;
let intentTimer = null;

console.log('[Tab Close Guard] Protection loaded');

// Listen for settings from content script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type === 'CTRL_W_BLOCKER_UPDATE') {
    isEnabled = event.data.isEnabled;
    console.log('[Tab Close Guard] Protection', isEnabled ? 'ENABLED ✓' : 'disabled');
  }
});

// Mark that the user is intentionally navigating, so beforeunload skips the prompt.
// Reset shortly after — if real navigation happens, beforeunload fires synchronously first.
function markNavigationIntent() {
  navigationIntent = true;
  if (intentTimer) clearTimeout(intentTimer);
  intentTimer = setTimeout(() => { navigationIntent = false; }, 50);
}

// F5 / Ctrl+R / Cmd+R
window.addEventListener('keydown', (e) => {
  if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'))) {
    markNavigationIntent();
  }
}, true);

// Same-tab link clicks (skip new-tab variants — those don't trigger beforeunload anyway)
document.addEventListener('click', (e) => {
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  const link = e.target.closest && e.target.closest('a[href]');
  if (!link || link.target === '_blank') return;
  markNavigationIntent();
}, true);

// Form submits navigate the current frame
document.addEventListener('submit', () => {
  markNavigationIntent();
}, true);

// Programmatic reloads via location.reload()
try {
  const origReload = Location.prototype.reload;
  Location.prototype.reload = function (...args) {
    markNavigationIntent();
    return origReload.apply(this, args);
  };
} catch (_) {}

// beforeunload - prompt only when it looks like a tab close, not a refresh/navigation
window.addEventListener('beforeunload', (event) => {
  if (isEnabled && !navigationIntent) {
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
});

// Signal ready
window.postMessage({ type: 'CTRL_W_BLOCKER_READY' }, '*');
