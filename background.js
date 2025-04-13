// X Reply Assistant - background.js

const CONTEXT_MENU_ID = "generateReplyX";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// --- Initialization ---

// Default prompts - these will be loaded/saved from storage later
const DEFAULT_PROMPTS = [
  { id: "prompt1", name: "Constitutional Counter-Argument", text: "Critically analyze the following text based on US Constitutional principles and generate a concise counter-argument:\n\n\"%TEXT%\"" },
  { id: "prompt2", name: "Logical Fallacy Check", text: "Identify any logical fallacies in the following text and explain them briefly:\n\n\"%TEXT%\"" },
  { id: "prompt3", name: "Alternative Perspective", text: "Provide a concise alternative perspective to the argument presented in the following text:\n\n\"%TEXT%\"" }
];

// --- Initialization ---

// Create context menu item on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Generate Counter-Argument", // Updated title
    contexts: ["selection"] // Show only when text is selected
  });
  console.log("X Reply Assistant context menu created for selection.");

  // Initialize storage with default prompts if not already set
  chrome.storage.sync.get(['prompts', 'selectedPromptId', 'selectedModel'], (items) => {
    if (!items.prompts) {
      chrome.storage.sync.set({ prompts: DEFAULT_PROMPTS });
      console.log("Initialized default prompts in storage.");
    }
    if (!items.selectedPromptId) {
      chrome.storage.sync.set({ selectedPromptId: DEFAULT_PROMPTS[0].id }); // Default to first prompt
    }
    if (!items.selectedModel) {
      chrome.storage.sync.set({ selectedModel: "openai/gpt-3.5-turbo" }); // Default model
    }
  });
});

// --- Event Listeners ---

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    console.log("Context menu clicked with selected text:", info.selectionText);
    generateReply(info.selectionText, tab?.id); // Pass tabId for potential notifications
  } else {
      console.log("Context menu clicked, but no text selected or other issue.");
  }
});

// Listen for messages (e.g., from options page or content script if needed later)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  // Example: Handle potential messages if needed
  // if (message.action === "someAction") { ... }
  return true; // Indicates asynchronous response possible
});


// --- Core Logic ---

async function generateReply(selectedText, tabId) {
  console.log("Attempting to generate reply for selected text:", selectedText);

  // 1. Get Settings (API Key, Model, Prompt)
  const settings = await getSettings();
  if (!settings.apiKey) {
    console.error("OpenRouter API Key not found. Please set it in the extension options.");
    notifyUser(tabId, "API Key not set. Please configure it in extension options.", "error");
    return;
  }
  if (!settings.selectedModel || !settings.selectedPrompt) {
    console.error("Model or Prompt not configured. Please check extension options.");
     notifyUser(tabId, "Model or Prompt not configured. Please check extension options.", "error");
    return;
  }

  // 2. Prepare API Request using selected prompt
  const userPrompt = settings.selectedPrompt.text.replace("%TEXT%", selectedText); // Inject selected text

  const requestBody = {
    model: settings.selectedModel,
    messages: [
      // System prompt could also be part of the configurable prompt object
      { role: "system", content: "You are an AI assistant focused on critical analysis and counter-arguments." },
      { role: "user", content: userPrompt }
    ],
    // Add other parameters like temperature, max_tokens if needed
  };

  // 3. Call OpenRouter API
  try {
    console.log(`Sending request to OpenRouter (Model: ${settings.selectedModel})...`);
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.apiKey}`,
        // Add "HTTP-Referer": "YOUR_SITE_URL" or "X-Title": "YOUR_APP_NAME" if required by OpenRouter for identification
        // e.g., "HTTP-Referer": chrome.runtime.getURL("options.html"),
        // e.g., "X-Title": "X Reply Assistant"
      },
      body: JSON.stringify(requestBody)
    });

    console.log("OpenRouter response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenRouter response data:", data);

    const resultText = data.choices?.[0]?.message?.content?.trim();

    if (resultText) {
      console.log("Generated result:", resultText);
      // 4. Copy result to clipboard
      await copyToClipboard(resultText);
      notifyUser(tabId, "Counter-argument copied to clipboard!", "success");

    } else {
      console.error("No result text found in API response.");
      notifyUser(tabId, "Failed to parse result from API.", "error");
    }

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    notifyUser(tabId, `API Call Failed: ${error.message}`, "error");
  }
}

// --- Helper Functions ---

// Gets all required settings from storage
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['openRouterApiKey', 'selectedModel', 'selectedPromptId', 'prompts'], (items) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting settings from storage:", chrome.runtime.lastError);
        resolve({ apiKey: null, selectedModel: null, selectedPrompt: null });
      } else {
        const prompts = items.prompts || DEFAULT_PROMPTS;
        const selectedPrompt = prompts.find(p => p.id === items.selectedPromptId) || prompts[0]; // Fallback
        resolve({
          apiKey: items.openRouterApiKey || null,
          selectedModel: items.selectedModel || "openai/gpt-3.5-turbo", // Fallback model
          selectedPrompt: selectedPrompt
        });
      }
    });
  });
}

// Copies text to the clipboard
async function copyToClipboard(text) {
  try {
    // Use the modern clipboard API if available (requires HTTPS context or extension)
    await navigator.clipboard.writeText(text);
    console.log("Text copied to clipboard.");
  } catch (err) {
    // Fallback for older contexts or if the API fails
    console.warn("navigator.clipboard.writeText failed, attempting fallback:", err);
    try {
        // Create a temporary textarea element
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px"; // Move off-screen
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        console.log("Fallback copy successful.");
    } catch (fallbackErr) {
        console.error("Fallback clipboard copy failed:", fallbackErr);
        // Cannot copy automatically, maybe notify user to copy manually?
        throw new Error("Failed to copy text to clipboard."); // Re-throw or handle differently
    }
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
            args: [`X Reply Assistant\n${prefix}${message}`]
        }).catch(err => console.error("Failed to execute script for notification:", err));
    } else {
        // Fallback if tabId is not available (e.g., called from options page)
        // Could use chrome.notifications API here for a richer notification
        console.warn("Cannot show alert, tabId not available.");
    }
}
