document.getElementById("showInfo").addEventListener("click", function() {
    let infoDiv = document.getElementById("info");
    infoDiv.style.display = (infoDiv.style.display === "none") ? "block" : "none";
});
document.addEventListener("DOMContentLoaded", function () {
    let toggle = document.getElementById("toggleExtension");
    let statusText = document.getElementById("statusText");

    
    chrome.storage.sync.get("extensionEnabled", function (data) {
        let isEnabled = data.extensionEnabled ?? true;
        toggle.checked = isEnabled;
        updateStatusText(isEnabled);
    });

    toggle.addEventListener("change", function () {
        let isEnabled = toggle.checked;
        chrome.storage.sync.set({ extensionEnabled: isEnabled });
        updateStatusText(isEnabled);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: setExtensionState,
                args: [isEnabled]
            });
        });
    });

    function updateStatusText(enabled) {
        statusText.innerHTML = `Extension is <b>${enabled ? "Enabled" : "Disabled"}</b>`;
    }
});

function setExtensionState(enabled) {
    if (!enabled) {
        document.body.style.pointerEvents = "none";
    } else {
        document.body.style.pointerEvents = "";
    }
}
