# Tab Close Guard

A Chrome extension that protects you from accidentally closing important tabs by showing a confirmation dialog on specified websites.

## How It Works

Chrome doesn't allow extensions to silently block Ctrl+W (by design, to protect users). Instead, Tab Close Guard shows a **browser confirmation dialog** when you try to close a tab, giving you a chance to cancel.

**Important:** The confirmation dialog only appears after you've interacted with the page (clicked, typed, etc.). This is a browser security feature to prevent malicious sites from trapping you.

## Features

- Show confirmation dialog on all websites or specific sites
- Add sites using wildcard patterns (e.g., `*.google.com`)
- Easy-to-use popup interface
- Works for all close methods: Ctrl+W, Cmd+W, clicking X, closing window, etc.
- Lightweight and fast

## Installation

### Load as Unpacked Extension (Development Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked"
4. Select this directory
5. The extension should now appear in your extensions list

### Pin the Extension (Optional)

1. Click the puzzle piece icon in Chrome's toolbar
2. Find "Tab Close Guard" in the list
3. Click the pin icon to keep it visible in your toolbar

## Usage

### Protect All Sites

1. Click the extension icon in your toolbar
2. Check the "Block on all websites" checkbox
3. Now all websites will show a confirmation when closing

### Protect Specific Sites

1. Click the extension icon
2. Ensure "Block on all websites" is unchecked
3. Enter a website pattern in the input field:
   - Exact domain: `app.zoom.us`
   - Wildcard subdomain: `*.google.com`
   - Specific subdomain: `mail.google.com`
4. Click "Add Site" or press Enter
5. Alternatively, click "Add Current" to add the current tab's site

### Remove Sites

1. Click the extension icon
2. Find the site you want to remove
3. Click the "Remove" button next to it

## Common Use Cases

Sites you might want to protect:

- `app.zoom.us` - Zoom meetings (prevent accidentally leaving meetings)
- `*.google.com` - All Google sites (Gmail, Docs, etc.)
- `github.com` - GitHub (protect unsaved code)
- `stackoverflow.com` - Stack Overflow
- `*.reddit.com` - All Reddit sites
- `localhost` - Local development servers
- `*.figma.com` - Figma designs
- `notion.so` - Notion workspace

## How the Extension Works

The extension uses:
- **Content scripts** running in both MAIN and ISOLATED worlds
- **beforeunload event** to trigger the browser's native confirmation dialog
- **Chrome storage API** to save your site preferences
- **Wildcard pattern matching** to check if the current site should be protected

When you try to close a tab on a protected site, the browser shows its standard "Leave site?" confirmation dialog.

## Files

- `manifest.json` - Extension configuration
- `injected.js` - Runs in page context, handles beforeunload event
- `content.js` - Manages settings from chrome.storage
- `popup.html` - Extension popup UI
- `popup.css` - Popup styling
- `popup.js` - Popup functionality
- `icon*.png` - Extension icons

## Permissions

This extension requires:
- `storage` - To save your site preferences
- `activeTab` - To get the current tab's URL when using "Add Current"

## Development

To modify the extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Refresh any tabs where you want to test the changes

## Troubleshooting

### Extension not working?

1. **Make sure you've interacted with the page**
   - Click anywhere on the page or type something
   - The confirmation only works after user interaction (browser security feature)

2. **Check the extension is loaded:**
   - Go to `chrome://extensions/`
   - Make sure "Tab Close Guard" is enabled

3. **Verify settings:**
   - Click the extension icon
   - Ensure either "Block on all websites" is checked OR the current site is in your list
   - For specific sites, make sure the pattern matches (use `app.zoom.us`, not `https://app.zoom.us`)

4. **Check the console:**
   - Open DevTools (F12)
   - Go to the Console tab
   - Refresh the page
   - Look for `[Tab Close Guard] Protection loaded`
   - Should also see `[Tab Close Guard] Protection ENABLED ✓`

5. **Refresh the page:**
   - After adding a site or changing settings, refresh the page
   - Content scripts only run when the page loads

### Common Issues

**Problem: No confirmation dialog appears**
- Make sure you clicked or typed on the page first
- Check console to verify protection is enabled
- Verify the site pattern matches (check console for the hostname)
- Try enabling "Block on all websites" to test

**Problem: Extension doesn't work on some pages**
- Chrome internal pages (`chrome://`, `chrome-extension://`) don't allow extensions
- Some pages have strict security policies
- Check your wildcard patterns - `*.zoom.us` won't match `app.zoom.us` (use exact match or `*.zoom.us` + `zoom.us`)

**Problem: Console shows "Protection disabled"**
- The current site isn't in your enabled list
- Check the hostname in the console and add it via the popup
- Or enable "Block on all websites"

## Technical Note

Chrome processes Ctrl+W at the browser level before JavaScript can intercept it. This means we cannot silently prevent the shortcut. The `beforeunload` event is the only reliable way to show a confirmation dialog. This is intentional browser behavior to protect users from malicious sites.

## License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2024 Avinash Joshi
