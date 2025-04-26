document.addEventListener('DOMContentLoaded', function() {
    const customSelectors = document.getElementById('customSelectors');
    const saveSelectorsBtn = document.getElementById('saveSelectors');
    const resetSelectorsBtn = document.getElementById('resetSelectors');
    const sitesList = document.getElementById('sitesList');
    const addSiteBtn = document.getElementById('addSite');
    const totalBlockedEl = document.getElementById('totalBlocked');
    const sitesProtectedEl = document.getElementById('sitesProtected');
    const timeSavedEl = document.getElementById('timeSaved');
    const resetStatsBtn = document.getElementById('resetStats');
    const exportSettingsBtn = document.getElementById('exportSettings');
    const importSettingsBtn = document.getElementById('importSettings');
    const importFileInput = document.getElementById('importFile');
    
    // Advanced settings
    const runOnLoadToggle = document.getElementById('runOnLoad');
    const autoClearToggle = document.getElementById('autoClear');
    const blockCookiesToggle = document.getElementById('blockCookies');
    const autoScrollToggle = document.getElementById('autoScroll');
    
    // Default selectors to use on reset
    const defaultSelectors = [
      '.modal', '.popup', '.overlay', '.login-modal', '.signup-modal',
      '[class*="login"]', '[class*="signup"]', '[class*="paywall"]',
      '[class*="modal"]', '[class*="popup"]', '[class*="overlay"]',
      '[id*="login"]', '[id*="signup"]', '[id*="modal"]',
      '[id*="popup"]', '[id*="overlay"]', '[id*="paywall"]'
    ];
    
    // Load stored settings
    loadSettings();
    
    // Add Minecraft sound effects to buttons
    addSoundEffects();
    
    // Event listeners
    saveSelectorsBtn.addEventListener('click', saveSelectors);
    resetSelectorsBtn.addEventListener('click', resetSelectors);
    addSiteBtn.addEventListener('click', addNewSite);
    resetStatsBtn.addEventListener('click', resetStatistics);
    exportSettingsBtn.addEventListener('click', exportSettings);
    importSettingsBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importSettings);
    
    // Advanced settings event listeners
    runOnLoadToggle.addEventListener('change', saveAdvancedSettings);
    autoClearToggle.addEventListener('change', saveAdvancedSettings);
    blockCookiesToggle.addEventListener('change', saveAdvancedSettings);
    autoScrollToggle.addEventListener('change', saveAdvancedSettings);
    
    // Functions
    function loadSettings() {
      // Load custom selectors
      chrome.storage.local.get({knownSelectors: defaultSelectors}, function(data) {
        customSelectors.value = data.knownSelectors.join('\n');
      });
      
      // Load site-specific settings
      chrome.storage.local.get({siteSettings: {}}, function(data) {
        const sites = data.siteSettings;
        sitesList.innerHTML = '';
        
        for (const domain in sites) {
          addSiteToList(domain, sites[domain]);
        }
        
        // Update sites protected count
        sitesProtectedEl.textContent = Object.keys(sites).length;
      });
      
      // Load statistics
      chrome.storage.local.get({
        blockCount: 0,
        sitesVisited: 0
      }, function(data) {
        totalBlockedEl.textContent = data.blockCount;
        
        // Calculate estimated time saved (assuming 5 seconds per popup)
        const minutes = Math.floor((data.blockCount * 5) / 60);
        timeSavedEl.textContent = `${minutes} min`;
      });
      
      // Load advanced settings
      chrome.storage.local.get({
        runOnLoad: true,
        autoClear: true,
        blockCookies: true,
        autoScroll: false
      }, function(data) {
        runOnLoadToggle.checked = data.runOnLoad;
        autoClearToggle.checked = data.autoClear;
        blockCookiesToggle.checked = data.blockCookies;
        autoScrollToggle.checked = data.autoScroll;
      });
    }
    
    function saveSelectors() {
      const lines = customSelectors.value.split('\n').filter(line => line.trim() !== '');
      
      chrome.storage.local.set({knownSelectors: lines}, function() {
        // Show saved confirmation
        saveSelectorsBtn.textContent = 'Saved!';
        setTimeout(() => {
          saveSelectorsBtn.textContent = 'Save Selectors';
        }, 1500);
        
        // Play save sound
        const audio = new Audio(chrome.runtime.getURL('sounds/click.mp3'));
        audio.play();
      });
    }
    
    function resetSelectors() {
      customSelectors.value = defaultSelectors.join('\n');
      saveSelectors();
    }
    
    function addSiteToList(domain, settings = {aggressiveness: 2}) {
      const siteItem = document.createElement('div');
      siteItem.className = 'site-item';
      siteItem.dataset.domain = domain;
      
      const domainSpan = document.createElement('span');
      domainSpan.className = 'site-domain';
      domainSpan.textContent = domain;
      
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'site-controls';
      
      const selectEl = document.createElement('select');
      selectEl.className = 'aggression-select';
      
      const option1 = document.createElement('option');
      option1.value = '1';
      option1.textContent = 'Low';
      
      const option2 = document.createElement('option');
      option2.value = '2';
      option2.textContent = 'Medium';
      
      const option3 = document.createElement('option');
      option3.value = '3';
      option3.textContent = 'High';
      
      selectEl.appendChild(option1);
      selectEl.appendChild(option2);
      selectEl.appendChild(option3);
      
      selectEl.value = settings.aggressiveness || 2;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-site minecraft-btn';
      removeBtn.textContent = 'Remove';
      
      // Add event listeners
      selectEl.addEventListener('change', function() {
        updateSiteSettings(domain, parseInt(this.value));
      });
      
      removeBtn.addEventListener('click', function() {
        removeSite(domain, siteItem);
      });
      
      controlsDiv.appendChild(selectEl);
      controlsDiv.appendChild(removeBtn);
      
      siteItem.appendChild(domainSpan);
      siteItem.appendChild(controlsDiv);
      
      sitesList.appendChild(siteItem);
    }
    
    function updateSiteSettings(domain, aggressiveness) {
      chrome.storage.local.get({siteSettings: {}}, function(data) {
        const sites = data.siteSettings;
        sites[domain] = {aggressiveness};
        
        chrome.storage.local.set({siteSettings: sites});
      });
    }
    
    function removeSite(domain, element) {
      chrome.storage.local.get({siteSettings: {}}, function(data) {
        const sites = data.siteSettings;
        delete sites[domain];
        
        chrome.storage.local.set({siteSettings: sites}, function() {
          element.remove();
          sitesProtectedEl.textContent = Object.keys(sites).length;
        });
      });
    }
    
    function addNewSite() {
      const domain = prompt('Enter website domain (e.g. example.com):');
      
      if (domain) {
        chrome.storage.local.get({siteSettings: {}}, function(data) {
          const sites = data.siteSettings;
          
          // Check if domain already exists
          if (sites[domain]) {
            alert('This domain is already in the list.');
            return;
          }
          
          sites[domain] = {aggressiveness: 2};
          
          chrome.storage.local.set({siteSettings: sites}, function() {
            addSiteToList(domain, {aggressiveness: 2});
            sitesProtectedEl.textContent = Object.keys(sites).length;
          });
        });
      }
    }
    
    function resetStatistics() {
      if (confirm('Are you sure you want to reset all statistics?')) {
        chrome.storage.local.set({
          blockCount: 0,
          sitesVisited: 0
        }, function() {
          totalBlockedEl.textContent = '0';
          timeSavedEl.textContent = '0 min';
          
          // Play sound effect
          const audio = new Audio(chrome.runtime.getURL('sounds/click.mp3'));
          audio.play();
        });
      }
    }
    
    function saveAdvancedSettings() {
      chrome.storage.local.set({
        runOnLoad: runOnLoadToggle.checked,
        autoClear: autoClearToggle.checked,
        blockCookies: blockCookiesToggle.checked,
        autoScroll: autoScrollToggle.checked
      });
    }
    
    function exportSettings() {
      chrome.storage.local.get(null, function(data) {
        // Create JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'login-shut-up-settings.json';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      });
    }
    
    function importSettings(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const settings = JSON.parse(e.target.result);
          
          // Validate settings
          if (!settings || typeof settings !== 'object') {
            throw new Error('Invalid settings file');
          }
          
          // Import settings
          chrome.storage.local.set(settings, function() {
            alert('Settings imported successfully. Reloading page...');
            location.reload();
          });
        } catch (error) {
          alert('Error importing settings: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
    
    function addSoundEffects() {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
          const audio = new Audio(chrome.runtime.getURL('sounds/hover.mp3'));
          audio.volume = 0.3;
          audio.play();
        });
        
        button.addEventListener('click', function() {
          const audio = new Audio(chrome.runtime.getURL('sounds/click.mp3'));
          audio.play();
        });
      });
    }
  });

  const whitelistTextarea = document.getElementById('whitelistSites');
const saveWhitelistBtn = document.getElementById('saveWhitelist');
const resetWhitelistBtn = document.getElementById('resetWhitelist');

// Default whitelist
const defaultWhitelist = [
  'google.com',
  'gmail.com',
  'accounts.google.com',
  'drive.google.com',
  'docs.google.com',
  'youtube.com',
  'github.com',
  'linkedin.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'amazon.com',
  'netflix.com',
  'outlook.com',
  'office.com',
  'microsoft.com',
  'apple.com',
  'icloud.com',
  'paypal.com',
  'bank',
  'banking'
];

// Load whitelist
function loadWhitelist() {
  chrome.storage.local.get({whitelist: defaultWhitelist}, function(data) {
    whitelistTextarea.value = data.whitelist.join('\n');
  });
}

// Save whitelist
function saveWhitelist() {
  const sites = whitelistTextarea.value.split('\n').filter(site => site.trim() !== '');
  
  chrome.storage.local.set({whitelist: sites}, function() {
    saveWhitelistBtn.textContent = 'Saved!';
    setTimeout(() => {
      saveWhitelistBtn.textContent = 'Save Whitelist';
    }, 1500);
    
    const audio = new Audio(chrome.runtime.getURL('sounds/click.mp3'));
    audio.play();
  });
}

// Reset whitelist
function resetWhitelist() {
  whitelistTextarea.value = defaultWhitelist.join('\n');
  saveWhitelist();
}

// Add these to your event listeners
saveWhitelistBtn.addEventListener('click', saveWhitelist);
resetWhitelistBtn.addEventListener('click', resetWhitelist);

// Add this to your loadSettings function
loadWhitelist();