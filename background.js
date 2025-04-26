// Keep track of extension state
let extensionState = {
    enabled: true,
    aggressiveness: 1,
    blockCount: 0,
    knownSelectors: []
  };
  
  // Initialize default settings
  chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({
      enabled: true,
      aggressiveness: 1,
      blockCount: 0,
      autofill: false,
      knownSelectors: [
        // Common login popup selectors
        '.modal', '.popup', '.overlay', '.login-modal', '.signup-modal',
        '[class*="login"]', '[class*="signup"]', '[class*="paywall"]',
        '[class*="modal"]', '[class*="popup"]', '[class*="overlay"]',
        '[id*="login"]', '[id*="signup"]', '[id*="modal"]',
        '[id*="popup"]', '[id*="overlay"]', '[id*="paywall"]'
      ]
    });
  });
  
  // Load state from storage
  chrome.storage.local.get(null, function(data) {
    if (data) {
      extensionState = {
        enabled: data.enabled !== undefined ? data.enabled : true,
        aggressiveness: data.aggressiveness || 1,
        blockCount: data.blockCount || 0,
        knownSelectors: data.knownSelectors || []
      };
    }
  });
  
  // Listen for changes in storage
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local') {
      for (let key in changes) {
        extensionState[key] = changes[key].newValue;
      }
    }
  });
  
  // Handle icon click (toggle enabled state) - This is redundant with popup.html but kept for compatibility
  chrome.action.onClicked.addListener(function(tab) {
    // Toggle the extension state
    extensionState.enabled = !extensionState.enabled;
    
    // Save to storage
    chrome.storage.local.set({enabled: extensionState.enabled});
    
    // Update icon (green when enabled, gray when disabled)
    updateIcon();
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'updateState',
      enabled: extensionState.enabled
    });
  });
  
  // Update extension icon based on state
  function updateIcon() {
    const iconPath = extensionState.enabled ? 
      {
        16: "images/icon16.png",
        48: "images/icon48.png",
        128: "images/icon128.png"
      } :
      {
        16: "images/icon16-disabled.png",
        48: "images/icon48-disabled.png",
        128: "images/icon128-disabled.png"
      };
    
    chrome.action.setIcon({path: iconPath});
  }
  
  // Handle navigation events to inject content script
  chrome.webNavigation.onCompleted.addListener(function(details) {
    if (extensionState.enabled) {
      chrome.tabs.sendMessage(details.tabId, {
        action: 'updateState',
        enabled: extensionState.enabled
      }, function(response) {
        // If there's no response, the content script might not be loaded
        if (chrome.runtime.lastError) {
          // No need to handle the error
        }
      });
    }
  });
