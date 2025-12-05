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

  sitesList.innerHTML = sites.map(site => `
    <div class="site-item">
      <span class="site-name">${escapeHtml(site)}</span>
      <button class="remove-btn" data-site="${escapeHtml(site)}">Remove</button>
    </div>
  `).join('');

  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeSite(btn.dataset.site);
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

    if (enabledSites.includes(site)) {
      alert('This site is already in the list');
      return;
    }

    enabledSites.push(site);
    chrome.storage.sync.set({ enabledSites }, () => {
      renderSitesList(enabledSites);
      siteInput.value = '';
    });
  });
}

// Remove a site
function removeSite(site) {
  chrome.storage.sync.get(['enabledSites'], (result) => {
    const enabledSites = result.enabledSites || [];
    const filtered = enabledSites.filter(s => s !== site);

    chrome.storage.sync.set({ enabledSites: filtered }, () => {
      renderSitesList(filtered);
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
