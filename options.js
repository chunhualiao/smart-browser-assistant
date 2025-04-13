// X Reply Assistant - options.js

const apiKeyInput = document.getElementById('apiKey');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// --- Functions ---

// Saves options to chrome.storage.sync
function saveOptions() {
  const apiKey = apiKeyInput.value;

  chrome.storage.sync.set(
    { openRouterApiKey: apiKey },
    () => {
      // Update status to let user know options were saved.
      if (chrome.runtime.lastError) {
        console.error("Error saving API key:", chrome.runtime.lastError);
        statusDiv.textContent = 'Error saving key.';
        statusDiv.style.color = 'red';
      } else {
        console.log("API Key saved.");
        statusDiv.textContent = 'Options saved.';
        statusDiv.style.color = 'green';
      }
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 1500); // Clear status after 1.5 seconds
    }
  );
}

// Restores API key input field state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get(
    { openRouterApiKey: '' }, // Default to empty string if not set
    (items) => {
       if (chrome.runtime.lastError) {
         console.error("Error restoring API key:", chrome.runtime.lastError);
         statusDiv.textContent = 'Error loading saved key.';
         statusDiv.style.color = 'red';
       } else {
         apiKeyInput.value = items.openRouterApiKey;
         console.log("Restored API Key (partially hidden/not shown).");
       }
    }
  );
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', restoreOptions);
saveButton.addEventListener('click', saveOptions);
