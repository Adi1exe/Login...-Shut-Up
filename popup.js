document.addEventListener('DOMContentLoaded', function() {
    const enabledToggle = document.getElementById('enabledToggle');
    const autofillToggle = document.getElementById('autofillToggle');
    const blockCount = document.getElementById('blockCount');
    const clearListBtn = document.getElementById('clearListBtn');
    const optionsBtn = document.getElementById('optionsBtn');
    const levelBtns = [
      document.getElementById('level1'),
      document.getElementById('level2'),
      document.getElementById('level3')
    ];
  
    // Load settings from storage
    chrome.storage.local.get({
      enabled: true,
      blockCount: 0,
      aggressiveness: 1,
      autofill: false
    }, function(data) {
      enabledToggle.checked = data.enabled;
      blockCount.textContent = data.blockCount;
      autofillToggle.checked = data.autofill;
      
      // Set the correct level button
      levelBtns.forEach(btn => btn.classList.remove('selected'));
      levelBtns[data.aggressiveness - 1].classList.add('selected');
    });
  
    // Toggle extension enabled/disabled
    enabledToggle.addEventListener('change', function() {
      chrome.storage.local.set({enabled: this.checked});
      
      // Send message to update content scripts
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateState',
            enabled: enabledToggle.checked
          });
        }
      });
    });
  
    // Toggle autofill
    autofillToggle.addEventListener('change', function() {
      chrome.storage.local.set({autofill: this.checked});
    });
  
    // Level buttons
    levelBtns.forEach((btn, index) => {
      btn.addEventListener('click', function() {
        levelBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const level = index + 1;
        chrome.storage.local.set({aggressiveness: level});
        
        // Send message to update content scripts
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateAggressiveness',
              level: level
            });
          }
        });
      });
    });
  
    // Clear stats button
    clearListBtn.addEventListener('click', function() {
      chrome.storage.local.set({blockCount: 0});
      blockCount.textContent = '0';
      
      // Play Minecraft click sound effect
      const audio = new Audio(chrome.runtime.getURL('sounds/click.mp3'));
      audio.play();
    });
  
    // Options button
    optionsBtn.addEventListener('click', function() {
      chrome.runtime.openOptionsPage();
    });
  
    // Add Minecraft hover sound effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        const audio = new Audio(chrome.runtime.getURL('sounds/hover.mp3'));
        audio.volume = 0.3;
        audio.play();
      });
    });
  });
