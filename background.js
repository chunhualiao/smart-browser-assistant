// Smart Browser Assistant - background.js

import { DEFAULT_PROMPTS, DEFAULT_MODEL } from './constants.js'; // Import DEFAULT_MODEL

const PARENT_MENU_ID = "smartAssistantParent";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// --- Context Menu Management ---

// Function to build/update the context menu
async function updateContextMenu(prompts) {
  await chrome.contextMenus.removeAll(); // Clear existing menus first

  chrome.contextMenus.create({
    id: PARENT_MENU_ID,
    title: "Smart Browser Assistant",
    contexts: ["selection"]
  });

  if (prompts && prompts.length > 0) {
    prompts.forEach(prompt => {
      chrome.contextMenus.create({
        id: prompt.id, // Use prompt's unique ID
        parentId: PARENT_MENU_ID,
        title: prompt.name, // Use prompt's name
        contexts: ["selection"]
      });
    });
  } else {
    // Optionally create a placeholder if no prompts exist
    chrome.contextMenus.create({
        id: "noPromptsAvailable",
        parentId: PARENT_MENU_ID,
        title: "(No prompts configured)",
        contexts: ["selection"],
        enabled: false
      });
  }
  console.log("Smart Browser Assistant context menu updated.");
}

// --- Initialization ---

// Create context menu on installation/update
chrome.runtime.onInstalled.addListener(async (details) => {
  // Initialize storage with defaults if not already set
  const items = await chrome.storage.sync.get(['prompts', 'selectedPromptId', 'selectedModel']);
  const initialPrompts = items.prompts || DEFAULT_PROMPTS;

  const storageUpdates = {};
  if (!items.prompts) {
    storageUpdates.prompts = DEFAULT_PROMPTS;
    console.log("Initialized default prompts in storage.");
  }
  if (!items.selectedPromptId) {
    storageUpdates.selectedPromptId = DEFAULT_PROMPTS[0]?.id || null; // Default to first prompt ID
  }
  if (!items.selectedModel) {
    storageUpdates.selectedModel = DEFAULT_MODEL; // Use constant for default model
  }
  // Also ensure temperature and timeout have defaults if not set
  if (items.temperature === undefined) storageUpdates.temperature = 0.9;
  if (items.timeout === undefined) storageUpdates.timeout = 30;
  if (items.verboseLoggingEnabled === undefined) storageUpdates.verboseLoggingEnabled = false;


  if (Object.keys(storageUpdates).length > 0) {
    await chrome.storage.sync.set(storageUpdates);
    console.log("Applied initial/default settings.");
  }

  // Build the initial context menu
  await updateContextMenu(initialPrompts);
});

// --- Event Listeners ---

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Check if the click is on one of our prompt sub-menus and text is selected
  if (info.parentMenuItemId === PARENT_MENU_ID && info.menuItemId !== "noPromptsAvailable" && info.selectionText) {
    console.log(`Context sub-menu clicked: ${info.menuItemId} with text:`, info.selectionText);

    // Get the specific prompt object that was clicked
    const { prompts } = await chrome.storage.sync.get('prompts');
    const clickedPrompt = (prompts || DEFAULT_PROMPTS).find(p => p.id === info.menuItemId);

    if (clickedPrompt) {
      generateReply(info.selectionText, tab?.id, clickedPrompt); // Pass the specific prompt
    } else {
      console.error(`Clicked prompt with ID ${info.menuItemId} not found in storage.`);
      notifyUser(tab?.id, `Error: Clicked prompt (ID: ${info.menuItemId}) not found.`, "error");
    }
  } else if (info.parentMenuItemId === PARENT_MENU_ID) {
      console.log("Context sub-menu clicked, but no text selected or item was disabled.");
  }
});

// Listen for storage changes (e.g., for debugging or future use, but don't update menu here)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.prompts) {
    // The menu doesn't need to be rebuilt here.
    // The onClicked listener fetches the current prompt details dynamically.
    console.log("Prompts changed in storage. Context menu will use updated prompts on next click.");
    updateContextMenu(changes.prompts.newValue);
  }
});


// Listen for messages (e.g., from options page)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.action === "testModelPerformance") {
    const { modelId, apiKey } = message;
    if (!modelId || !apiKey) {
      console.error("Missing required parameters (modelId or apiKey) for testModelPerformance.");
      sendResponse({ success: false, error: "Missing modelId or apiKey" });
      return false; // No async response needed
    }

    console.log(`Background: Testing model ${modelId}...`);
    const testPrompt = "What model are you?";
    const testTimeoutSeconds = 20; // Use a fixed timeout for the test

    const requestBody = {
      model: modelId,
      messages: [{ role: "user", content: testPrompt }],
      temperature: 0.1, // Low temperature for consistent test
      max_tokens: 50 // Limit response size for test
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log(`Test request for ${modelId} timed out after ${testTimeoutSeconds} seconds.`);
        controller.abort();
    }, testTimeoutSeconds * 1000);

    fetch(OPENROUTER_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": chrome.runtime.getURL("options.html"),
        "X-Title": "Smart Browser Assistant"
      },
      body: JSON.stringify(requestBody)
    })
    .then(async (response) => {
      clearTimeout(timeoutId);
      console.log(`Test response status for ${modelId}: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }
      const data = await response.json();
      // Basic check if response seems valid (contains choices)
      if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
        console.log(`Test success for ${modelId}.`);
        sendResponse({ success: true });
      } else {
        console.error(`Test failed for ${modelId}: Invalid response structure.`);
        sendResponse({ success: false, error: "Invalid response structure" });
      }
    })
    .catch(error => {
      clearTimeout(timeoutId);
      let errorMessage = error.message;
      if (error.name === 'AbortError') {
          errorMessage = `Timeout after ${testTimeoutSeconds}s`;
      }
      console.error(`Test failed for ${modelId}: ${errorMessage}`);
      sendResponse({ success: false, error: errorMessage });
    });

    return true; // Indicates asynchronous response
  }

  // Handle other potential messages here if needed

  return true; // Keep true for other potential async messages
});


// --- Core Logic ---

// Modified to accept the specific prompt object to use
async function generateReply(selectedText, tabId, clickedPrompt) {
  console.log(`Attempting to generate reply using prompt "${clickedPrompt.name}" for text:`, selectedText);

  // 1. Get Settings (API Key, Model, Temp, Timeout etc. - *excluding* selectedPromptId)
  const settings = await getSettings(); // getSettings now primarily fetches config *other* than the prompt itself
  if (!settings.apiKey) {
    console.error("OpenRouter API Key not found. Please set it in the extension options.");
    notifyUser(tabId, "API Key not set. Please configure it in extension options.", "error");
    return;
  }
   if (!settings.selectedModel) {
     console.error("Model not configured. Please check extension options.");
     notifyUser(tabId, "Model not configured. Please check extension options.", "error");
     return;
   }
   // clickedPrompt is passed directly, so we don't need settings.selectedPrompt here

  // 2. Prepare API Request using the *clicked* prompt
  const userPrompt = clickedPrompt.text.replace("%TEXT%", selectedText); // Inject selected text into the clicked prompt's text

  const requestBody = {
    model: settings.selectedModel, // Use model from general settings
    messages: [
      // System prompt could also be part of the configurable prompt object
      { role: "system", content: "You are an AI assistant focused on critical analysis and counter-arguments." },
      { role: "user", content: userPrompt }
    ],
    temperature: settings.temperature, // Use temperature from settings
    // Add other parameters like max_tokens if needed
  };

  // 3. Call OpenRouter API with timeout
  const startTime = performance.now(); // Record start time
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
      console.log(`API request timed out after ${settings.timeout} seconds.`);
      controller.abort();
  }, settings.timeout * 1000); // Convert seconds to milliseconds

  try {
    console.log(`Sending request to OpenRouter (Model: ${settings.selectedModel}, Timeout: ${settings.timeout}s)...`);
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      signal: controller.signal, // Pass the abort signal
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.apiKey}`,
        "HTTP-Referer": chrome.runtime.getURL("options.html"),
        "X-Title": "Smart Browser Assistant"
      },
      body: JSON.stringify(requestBody)
    });

    clearTimeout(timeoutId); // Clear the timeout if the request completes

    console.log("OpenRouter response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Log confirmation
    console.log("Received successful response from OpenRouter."); 
    // Conditionally log full response if verbose logging is enabled
    if (settings.verboseLoggingEnabled) {
        console.log("Full API response data (Verbose Logging Enabled):", JSON.stringify(data, null, 2));
    }

    const resultText = data.choices?.[0]?.message?.content?.trim();

    if (resultText) {
      console.log("Generated result:", resultText);

      const endTime = performance.now(); // Record end time
      const duration = ((endTime - startTime) / 1000).toFixed(2); // Calculate duration in seconds

      // 4. Log the successful generation (including duration)
      const logEntry = {
        timestamp: new Date().toISOString(),
        model: settings.selectedModel,
        input: selectedText,
        output: resultText,
        duration: duration // Add duration
      };
      await addLogEntry(logEntry);

      // 5. Copy result to clipboard (pass tabId)
      await copyToClipboard(resultText, tabId);
      // Notification is now handled within copyToClipboard on success/failure

    } else {
      console.error("No result text found in API response.");
      notifyUser(tabId, "Failed to parse result from API.", "error");
    }

  } catch (error) {
    clearTimeout(timeoutId); // Ensure timeout is cleared on error too
    if (error.name === 'AbortError') {
        console.error("API request aborted due to timeout.");
        notifyUser(tabId, `API request timed out after ${settings.timeout} seconds.`, "error");
    } else {
        console.error("Error calling OpenRouter API:", error);
        notifyUser(tabId, `API Call Failed: ${error.message}`, "error");
    }
  }
}

// --- Helper Functions ---

// Add entry to the log history in local storage
async function addLogEntry(entry) {
  // console.log("DEBUG: Attempting to add log entry:", JSON.stringify(entry)); // Remove debug log
  try {
    const result = await chrome.storage.local.get({ history: [] }); // Default to empty array
    // console.log("DEBUG: Current history length before add:", result.history.length); // Remove debug log
    let history = result.history;

    // Add new entry to the beginning
    history.unshift(entry);

    // Limit history size (e.g., 100 entries)
    const MAX_HISTORY_SIZE = 100;
    if (history.length > MAX_HISTORY_SIZE) {
      history = history.slice(0, MAX_HISTORY_SIZE);
    }

    // console.log("DEBUG: History length after add/slice:", history.length); // Remove debug log
    await chrome.storage.local.set({ history: history });
    console.log("Log entry added. History size:", history.length); // Keep original success log
  } catch (error) {
    console.error("Error saving log entry:", error); // Keep error log
  }
}


// Gets general settings from storage (API Key, Model, Temp, Timeout, etc.)
// Note: It still fetches selectedPromptId and prompts for potential use elsewhere (like options page),
// but generateReply now relies on the passed 'clickedPrompt'.
async function getSettings() {
  const MIN_TIMEOUT = 5; // Minimum allowed timeout in seconds
  const DEFAULT_TIMEOUT = 30; // Default timeout

  return new Promise((resolve) => {
    // Fetch all settings, including those not directly used by generateReply via context menu anymore
    chrome.storage.sync.get([
        'openRouterApiKey',
        'selectedModel',
        'selectedPromptId', // Still needed for options page default selection
        'prompts',          // Still needed for options page list
        'temperature',
        'timeout',
        'verboseLoggingEnabled'
      ], (items) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting settings from storage:", chrome.runtime.lastError);
        // Provide defaults on error
        resolve({
            apiKey: null,
            selectedModel: DEFAULT_MODEL, // Use constant for default model
            selectedPromptId: null, // No specific prompt selected in this context
            prompts: DEFAULT_PROMPTS, // Default prompts list
            temperature: 0.9,
            timeout: DEFAULT_TIMEOUT,
            verboseLoggingEnabled: false
        });
      } else {
        // Validate temperature or use default
        const temperature = (typeof items.temperature === 'number' && items.temperature >= 0 && items.temperature <= 2)
                            ? items.temperature
                            : 0.9; // Default temperature if invalid or not set

        // Validate timeout or use default
        const timeout = (typeof items.timeout === 'number' && items.timeout >= MIN_TIMEOUT)
                        ? items.timeout
                        : DEFAULT_TIMEOUT; // Default timeout if invalid or not set

        resolve({
          apiKey: items.openRouterApiKey || null,
          selectedModel: items.selectedModel || DEFAULT_MODEL, // Use constant for fallback model
          selectedPromptId: items.selectedPromptId || DEFAULT_PROMPTS[0]?.id || null, // For options page
          prompts: items.prompts || DEFAULT_PROMPTS, // For options page
          temperature: temperature,
          timeout: timeout,
          verboseLoggingEnabled: items.verboseLoggingEnabled || false
        });
      }
    });
  });
}

// Copies text to the clipboard by injecting a script into the target tab
async function copyToClipboard(text, tabId) {
  if (!tabId) {
    console.error("Cannot copy to clipboard: tabId is missing.");
    // Optionally notify the user via other means if possible
    return;
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: async (textToCopy) => {
        try {
          await navigator.clipboard.writeText(textToCopy);
          // Optionally, could send a message back to background if confirmation is needed
          // Or show a brief visual confirmation on the page itself
        } catch (err) {
          console.error('Failed to copy text in content script:', err);
          // Rethrow or handle the error in the content script context if needed
          // Maybe alert the user from here? alert('Failed to copy text.');
          throw err; // Propagate error back to background script's catch block
        }
      },
      args: [text]
    });
    console.log("Clipboard write command sent to tab:", tabId);
      // Notify success *after* the script executes successfully
    notifyUser(tabId, "Result copied to clipboard!", "success"); // More generic message

  } catch (error) {
    console.error("Failed to execute clipboard script or copy failed in tab:", error);
    // Notify failure
    notifyUser(tabId, `Failed to copy to clipboard: ${error.message}`, "error");
  }
}


// Basic notification (can be improved)
function notifyUser(tabId, message, type = "info") {
    const prefix = type === "error" ? "Error: " : type === "success" ? "Success: " : "";
    console.log(`Notification: ${prefix}${message}`);
    if (tabId) {
        // Use scripting API to show an alert in the tab where the action originated
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (msg) => alert(msg),
            args: [`Smart Browser Assistant\n${prefix}${message}`]
        }).catch(err => console.error("Failed to execute script for notification:", err));
    } else {
        // Fallback if tabId is not available (e.g., called from options page)
        // Could use chrome.notifications API here for a richer notification
        console.warn("Cannot show alert, tabId not available.");
    }
}
