// Popup script for managing blocked sites

const blockAllCheckbox = document.getElementById('blockAllSites');
const siteInput = document.getElementById('siteInput');
const addSiteBtn = document.getElementById('addSiteBtn');
const addCurrentSiteBtn = document.getElementById('addCurrentSiteBtn');
const sitesList = document.getElementById('sitesList');
const siteManagement = document.getElementById('siteManagement');

// Load settings on popup open
function loadSettings() {
  chrome.storage.sync.get(['enabledSites', 'blockAllSites'], (result) => {
    const enabledSites = result.enabledSites || [];
    const blockAllSites = result.blockAllSites || false;

    blockAllCheckbox.checked = blockAllSites;
    updateSiteManagementVisibility(blockAllSites);
    renderSitesList(enabledSites);
  });
}

// Update visibility of site management section
function updateSiteManagementVisibility(blockAllSites) {
  if (blockAllSites) {
    siteManagement.classList.add('hidden');
  } else {
    siteManagement.classList.remove('hidden');
  }
}

// Render the list of sites
function renderSitesList(sites) {
  if (sites.length === 0) {
    sitesList.innerHTML = '<div class="empty-state">No sites added yet</div>';
    return;
  }

  sitesList.innerHTML = sites.map(site => {
    const pattern = typeof site === 'string' ? site : site.pattern;
    const appModeOnly = typeof site === 'object' ? site.appModeOnly : false;

    return `
      <div class="site-item">
        <div class="site-info">
          <span class="site-name">${escapeHtml(pattern)}</span>
          <label class="app-mode-checkbox">
            <input type="checkbox"
                   class="app-mode-toggle"
                   data-site="${escapeHtml(pattern)}"
                   ${appModeOnly ? 'checked' : ''}>
            <span class="app-mode-label">App/PWA mode only</span>
          </label>
        </div>
        <button class="remove-btn" data-site="${escapeHtml(pattern)}">Remove</button>
      </div>
    `;
  }).join('');

  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeSite(btn.dataset.site);
    });
  });

  // Add event listeners to app mode checkboxes
  document.querySelectorAll('.app-mode-toggle').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      toggleAppMode(e.target.dataset.site, e.target.checked);
    });
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add a new site
function addSite(site) {
  if (!site || site.trim() === '') {
    return;
  }

  site = site.trim().toLowerCase();

  chrome.storage.sync.get(['enabledSites'], (result) => {
    const enabledSites = result.enabledSites || [];

    // Check if site already exists (handle both old string format and new object format)
    const exists = enabledSites.some(s => {
      const pattern = typeof s === 'string' ? s : s.pattern;
      return pattern === site;
    });

    if (exists) {
      alert('This site is already in the list');
      return;
    }

    // Add as object with pattern and appModeOnly flag
    enabledSites.push({ pattern: site, appModeOnly: false });
    chrome.storage.sync.set({ enabledSites }, () => {
      renderSitesList(enabledSites);
      siteInput.value = '';
    });
  });
}

// Remove a site
function removeSite(pattern) {
  chrome.storage.sync.get(['enabledSites'], (result) => {
    const enabledSites = result.enabledSites || [];
    const filtered = enabledSites.filter(s => {
      const sitePattern = typeof s === 'string' ? s : s.pattern;
      return sitePattern !== pattern;
    });

    chrome.storage.sync.set({ enabledSites: filtered }, () => {
      renderSitesList(filtered);
    });
  });
}

// Toggle app mode only setting for a site
function toggleAppMode(pattern, appModeOnly) {
  chrome.storage.sync.get(['enabledSites'], (result) => {
    const enabledSites = result.enabledSites || [];
    const updated = enabledSites.map(s => {
      const sitePattern = typeof s === 'string' ? s : s.pattern;
      if (sitePattern === pattern) {
        return { pattern: sitePattern, appModeOnly };
      }
      return typeof s === 'string' ? { pattern: s, appModeOnly: false } : s;
    });

    chrome.storage.sync.set({ enabledSites: updated }, () => {
      console.log('Updated app mode setting for', pattern, 'to', appModeOnly);
    });
  });
}

// Get current tab's hostname
function addCurrentSite() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      try {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        siteInput.value = hostname;
        addSite(hostname);
      } catch (e) {
        alert('Cannot add this type of page');
      }
    }
  });
}

// Event listeners
blockAllCheckbox.addEventListener('change', (e) => {
  const blockAllSites = e.target.checked;
  chrome.storage.sync.set({ blockAllSites }, () => {
    updateSiteManagementVisibility(blockAllSites);
  });
});

addSiteBtn.addEventListener('click', () => {
  addSite(siteInput.value);
});

siteInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addSite(siteInput.value);
  }
});

addCurrentSiteBtn.addEventListener('click', addCurrentSite);

// Initialize
loadSettings();
