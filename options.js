// X Reply Assistant - options.js (v0.2)

// --- DOM Elements ---
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('modelSelect');
const promptListDiv = document.getElementById('promptList');
const promptPreviewDiv = document.getElementById('promptPreview');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// --- Default/Predefined Data ---

// Example list of common OpenRouter models.
// Fetching dynamically would require an API call here.
const PREDEFINED_MODELS = [
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
];

// Default prompts (should match background.js)
const DEFAULT_PROMPTS = [
  { id: "prompt1", name: "Constitutional Counter-Argument", text: "Critically analyze the following text based on US Constitutional principles. Generate a concise counter-argument (under 280 characters):\n\n\"%TEXT%\"" },
  { id: "prompt2", name: "Logical Fallacy Check", text: "Identify any logical fallacies in the following text and explain them very briefly (under 280 characters total):\n\n\"%TEXT%\"" },
  { id: "prompt3", name: "Alternative Perspective", text: "Provide a concise alternative perspective (under 280 characters) to the argument presented in the following text:\n\n\"%TEXT%\"" }
];

let currentPrompts = []; // To hold loaded prompts

// --- Functions ---

// Populate Model Select Dropdown
function populateModelSelect(models, selectedModelId) {
  modelSelect.innerHTML = ''; // Clear loading/existing options
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
      prompts: DEFAULT_PROMPTS // Load saved prompts or use default
    },
    (items) => {
       if (chrome.runtime.lastError) {
         console.error("Error restoring settings:", chrome.runtime.lastError);
         showStatus('Error loading saved settings.', 'red');
         // Populate with defaults even on error?
         currentPrompts = DEFAULT_PROMPTS;
         populateModelSelect(PREDEFINED_MODELS, "openai/gpt-3.5-turbo");
         populatePromptList(currentPrompts, DEFAULT_PROMPTS[0]?.id);

       } else {
         apiKeyInput.value = items.openRouterApiKey;
         currentPrompts = items.prompts; // Use saved or default prompts

         // Populate UI elements
         populateModelSelect(PREDEFINED_MODELS, items.selectedModel);
         populatePromptList(currentPrompts, items.selectedPromptId);

         console.log("Settings restored.");
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


// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', restoreOptions);
saveButton.addEventListener('click', saveOptions);
