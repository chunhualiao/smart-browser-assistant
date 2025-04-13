// X Reply Assistant - options.js (v0.2)

// --- DOM Elements ---
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('modelSelect');
const promptListDiv = document.getElementById('promptList');
const promptPreviewDiv = document.getElementById('promptPreview');
const temperatureInput = document.getElementById('temperature'); // Temperature input
const timeoutInput = document.getElementById('timeout'); // Timeout input
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');
const historyListDiv = document.getElementById('historyList'); // History display area
const clearHistoryButton = document.getElementById('clearHistory'); // Clear history button
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"; // API endpoint for models

// --- Default/Predefined Data ---

// Example list of common OpenRouter models. - REMOVED, will fetch dynamically
/* const PREDEFINED_MODELS = [
  "openai/gpt-4o",
  "openai/gpt-4-turbo",
  "openai/gpt-3.5-turbo",
  "anthropic/claude-3-opus",
  "anthropic/claude-3-sonnet",
  "anthropic/claude-3-haiku",
  "google/gemini-pro",
  "google/gemini-flash",
  "mistralai/mistral-7b-instruct",
  "meta-llama/llama-3-8b-instruct",
  "meta-llama/llama-3-70b-instruct",
]; */

// Default prompts (should match background.js)
const DEFAULT_PROMPTS = [
  { id: "prompt1", name: "Constitutional Counter-Argument", text: "Critically analyze the following text based on US Constitutional principles. Generate a concise counter-argument (under 280 characters):\n\n\"%TEXT%\"" },
  { id: "prompt2", name: "Logical Fallacy Check", text: "Identify any logical fallacies in the following text and explain them very briefly (under 280 characters total):\n\n\"%TEXT%\"" },
  { id: "prompt3", name: "Alternative Perspective", text: "Provide a concise alternative perspective (under 280 characters) to the argument presented in the following text:\n\n\"%TEXT%\"" }
];

let currentPrompts = []; // To hold loaded prompts

// --- Functions ---

// Fetch models from OpenRouter API
async function fetchModels(apiKey) {
  if (!apiKey) {
    console.warn("No API key found, cannot fetch models.");
    // Keep the "Loading..." or show an error message in the dropdown
    modelSelect.innerHTML = '<option value="">Enter API Key to load models</option>';
    return []; // Return empty array
  }

  console.log("Fetching models from OpenRouter...");
  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        // OpenRouter might require Referer or X-Title for identification even for GET /models
        // "HTTP-Referer": chrome.runtime.getURL("options.html"),
        // "X-Title": "X Reply Assistant"
      },
    });

    if (!response.ok) {
      // Handle specific errors like 401 Unauthorized
      if (response.status === 401) {
         console.error("Failed to fetch models: Invalid API Key (401).");
         modelSelect.innerHTML = '<option value="">Invalid API Key</option>';
      } else {
        console.error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        modelSelect.innerHTML = `<option value="">API Error ${response.status}</option>`;
      }
      const errorData = await response.json().catch(() => null);
      console.error("API Error details:", errorData);
      return []; // Return empty on error
    }

    const data = await response.json();
    // Assuming the response structure is { data: [ { id: "model/name", ... }, ... ] }
    if (data && Array.isArray(data.data)) {
        const modelIds = data.data.map(model => model.id).sort(); // Extract IDs and sort
        console.log("Fetched models:", modelIds.length);
        return modelIds;
    } else {
        console.error("Unexpected API response structure:", data);
        modelSelect.innerHTML = '<option value="">Invalid API Response</option>';
        return [];
    }
  } catch (error) {
    console.error("Network error fetching models:", error);
    modelSelect.innerHTML = '<option value="">Network Error</option>';
    return []; // Return empty on network error
  }
}


// Populate Model Select Dropdown
function populateModelSelect(models, selectedModelId) {
  modelSelect.innerHTML = ''; // Clear loading/existing options
  if (!models || models.length === 0) {
      // If fetch failed or returned empty, show appropriate message based on prior state
      if (modelSelect.innerHTML === '') { // Avoid overwriting specific error messages from fetchModels
          modelSelect.innerHTML = '<option value="">No models loaded</option>';
      }
      return;
  }
  models.forEach(modelId => {
    const option = document.createElement('option');
    option.value = modelId;
    option.textContent = modelId;
    if (modelId === selectedModelId) {
      option.selected = true;
    }
    modelSelect.appendChild(option);
  });
}

// Populate Prompt Radio Buttons
function populatePromptList(prompts, selectedPromptId) {
  promptListDiv.innerHTML = ''; // Clear loading/existing prompts
  prompts.forEach(prompt => {
    const div = document.createElement('div');
    div.className = 'prompt-selection';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = prompt.id;
    radio.name = 'selectedPrompt';
    radio.value = prompt.id;
    radio.checked = (prompt.id === selectedPromptId);

    const label = document.createElement('label');
    label.htmlFor = prompt.id;
    label.textContent = prompt.name;

    div.appendChild(radio);
    div.appendChild(label);
    promptListDiv.appendChild(div);

    // Add listener to update preview when this prompt is selected
    radio.addEventListener('change', () => {
      if (radio.checked) {
        updatePromptPreview(prompt.text);
      }
    });
  });
   // Initial preview update after populating
   const initiallySelectedPrompt = prompts.find(p => p.id === selectedPromptId) || prompts[0];
   if (initiallySelectedPrompt) {
       updatePromptPreview(initiallySelectedPrompt.text);
   } else {
       updatePromptPreview("No prompt selected or available.");
   }
}

// Update Prompt Preview Area (now a textarea)
function updatePromptPreview(promptText) {
  // promptPreviewDiv is now a textarea, so set its value
  promptPreviewDiv.value = promptText || "Error loading prompt text.";
}

// Saves all options to chrome.storage.sync
function saveOptions() {
  const apiKey = apiKeyInput.value;
  const selectedModel = modelSelect.value;
  const selectedPromptRadio = document.querySelector('input[name="selectedPrompt"]:checked');
  const selectedPromptId = selectedPromptRadio ? selectedPromptRadio.value : null;
  const editedPromptText = promptPreviewDiv.value; // Get text from textarea
  const temperature = parseFloat(temperatureInput.value); // Get temperature value
  const timeout = parseInt(timeoutInput.value, 10); // Get timeout value
  const MIN_TIMEOUT = 5; // Minimum allowed timeout in seconds

  if (isNaN(temperature) || temperature < 0 || temperature > 2) {
      showStatus('Error: Temperature must be between 0 and 2.', 'red');
      return;
  }
  if (isNaN(timeout) || timeout < MIN_TIMEOUT) {
      showStatus(`Error: Timeout must be a number and at least ${MIN_TIMEOUT} seconds.`, 'red');
      return;
  }
  if (!selectedPromptId) {
      showStatus('Error: No prompt selected.', 'red');
      return;
  }
   if (!selectedModel) {
      showStatus('Error: No model selected.', 'red');
      return;
  }

  // Find the prompt in the currentPrompts array and update its text
  const promptIndex = currentPrompts.findIndex(p => p.id === selectedPromptId);
  if (promptIndex !== -1) {
      currentPrompts[promptIndex].text = editedPromptText;
      console.log(`Updated prompt text for ID: ${selectedPromptId}`);
  } else {
      console.error(`Could not find prompt with ID ${selectedPromptId} to update text.`);
      showStatus('Error finding prompt to update.', 'red');
      return; // Don't save if we couldn't find the prompt
  }

  // Save the updated prompts array along with other settings
  chrome.storage.sync.set(
    {
      openRouterApiKey: apiKey,
      selectedModel: selectedModel,
      selectedPromptId: selectedPromptId,
      temperature: temperature, // Save temperature
      timeout: timeout, // Save timeout
      prompts: currentPrompts // Save the potentially modified prompts array
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving settings:", chrome.runtime.lastError);
        showStatus('Error saving settings.', 'red');
      } else {
        console.log("Settings saved.");
        showStatus('Settings saved successfully.', 'green');
      }
    }
  );
}

// Restores options using preferences stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get(
    { // Defaults
      openRouterApiKey: '',
      selectedModel: "openai/gpt-3.5-turbo", // Default model
      selectedPromptId: DEFAULT_PROMPTS[0]?.id || null, // Default to first prompt ID
      temperature: 0.9, // Default temperature
      timeout: 30, // Default timeout in seconds
      prompts: DEFAULT_PROMPTS // Load saved prompts or use default
    },
    (items) => {
       if (chrome.runtime.lastError) {
         console.error("Error restoring settings:", chrome.runtime.lastError);
         showStatus('Error loading saved settings.', 'red');
         // Attempt to populate prompts even on error, but models will likely fail
         currentPrompts = DEFAULT_PROMPTS;
         populatePromptList(currentPrompts, DEFAULT_PROMPTS[0]?.id);
         // Clear model list or show error
         modelSelect.innerHTML = '<option value="">Error loading settings</option>';

       } else {
         apiKeyInput.value = items.openRouterApiKey;
         temperatureInput.value = items.temperature; // Restore temperature
         timeoutInput.value = items.timeout; // Restore timeout
         currentPrompts = items.prompts; // Use saved or default prompts

         // Fetch models dynamically using the restored API key
         fetchModels(items.openRouterApiKey).then(fetchedModels => {
             // Populate UI elements
             populateModelSelect(fetchedModels, items.selectedModel); // Use fetched models
             populatePromptList(currentPrompts, items.selectedPromptId);
             console.log("Settings restored, models fetched (if API key valid).");
         }); // No catch here, fetchModels handles its own errors internally by updating dropdown

       }
    }
  );
}

// Display status messages
function showStatus(message, color = 'black') {
    statusDiv.textContent = message;
    statusDiv.style.color = color;
    setTimeout(() => {
        statusDiv.textContent = '';
    }, 2500); // Clear status after 2.5 seconds
}

// Display history entries
function displayHistory(history) {
    historyListDiv.innerHTML = ''; // Clear loading message or previous content

    if (!history || history.length === 0) {
        historyListDiv.innerHTML = '<p>No history yet.</p>';
        return;
    }

    history.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.style.borderBottom = '1px solid #eee';
        entryDiv.style.marginBottom = '10px';
        entryDiv.style.paddingBottom = '10px';

        const time = new Date(entry.timestamp).toLocaleString();
        const model = entry.model || 'N/A';
        const duration = entry.duration ? `${entry.duration}s` : 'N/A'; // Display duration if available

        // Display full text using <pre> for formatting and potential scroll
        entryDiv.innerHTML = `
            <p style="margin: 2px 0;"><small><strong>Time:</strong> ${time}</small></p>
            <p style="margin: 2px 0;"><small><strong>Model:</strong> ${model}</small></p>
            <p style="margin: 2px 0;"><small><strong>Duration:</strong> ${duration}</small></p>
            <p style="margin: 5px 0 2px 0;"><strong>Input:</strong></p>
            <pre style="margin: 0; padding: 5px; background-color: #f0f0f0; border: 1px solid #ddd; max-height: 100px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;">${entry.input}</pre>
            <p style="margin: 5px 0 2px 0;"><strong>Output:</strong></p>
            <pre style="margin: 0; padding: 5px; background-color: #f0f0f0; border: 1px solid #ddd; max-height: 150px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;">${entry.output}</pre>
        `;
        // No need for title attribute anymore as full text is shown

        historyListDiv.appendChild(entryDiv);
    });
}

// Clear history from storage and update display
async function clearHistory() {
    if (!confirm("Are you sure you want to clear the entire generation history? This cannot be undone.")) {
        return;
    }
    try {
        await chrome.storage.local.set({ history: [] });
        console.log("History cleared from storage.");
        displayHistory([]); // Update the UI immediately
        showStatus('History cleared.', 'green');
    } catch (error) {
        console.error("Error clearing history:", error);
        showStatus('Error clearing history.', 'red');
    }
}


// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();
    // Also load and display history on initial load
    chrome.storage.local.get({ history: [] }, (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error loading history:", chrome.runtime.lastError);
            historyListDiv.innerHTML = '<p>Error loading history.</p>';
        } else {
            displayHistory(result.history);
        }
    });
});
saveButton.addEventListener('click', saveOptions);
clearHistoryButton.addEventListener('click', clearHistory); // Add listener for clear button

// Add listener to API key input to refresh models on change
apiKeyInput.addEventListener('change', (event) => {
    const newApiKey = event.target.value;
    console.log("API Key changed, attempting to fetch models...");
    // Fetch models with the new key, but don't change the saved selection yet
    fetchModels(newApiKey).then(fetchedModels => {
        // Get the currently selected model value *before* repopulating
        const previouslySelectedModel = modelSelect.value;
        populateModelSelect(fetchedModels, previouslySelectedModel); // Try to keep the selection if the model still exists
    });
});
