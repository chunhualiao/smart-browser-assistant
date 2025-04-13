// X Reply Assistant - background.js

const CONTEXT_MENU_ID = "generateReplyX";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// --- Initialization ---

// Create context menu item on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Generate Reply Suggestion",
    contexts: ["editable"] // Show for any editable field initially
  });
  console.log("X Reply Assistant context menu created.");
});

// --- Event Listeners ---

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab?.id) {
    console.log("Context menu clicked. Requesting tweet text from content script in tab:", tab.id);
    // Ask content script to verify context and get tweet text
    chrome.tabs.sendMessage(tab.id, { action: "getTweetText", contextInfo: info }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error messaging content script:", chrome.runtime.lastError.message);
        // Handle error - maybe the content script isn't ready or doesn't exist on the page
        return;
      }
      if (response?.status === "success" && response.tweetText) {
        console.log("Received tweet text:", response.tweetText);
        generateReply(response.tweetText, tab.id); // Pass tabId for sending response back
      } else {
        console.log("Content script did not provide tweet text or context was invalid.");
        // Optionally notify user?
      }
    });
  }
});

// Listen for messages (potentially useful for other actions later)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  // Example: Handle other potential messages if needed
  if (message.action === "someOtherAction") {
    // Do something
    sendResponse({ status: "received" });
  }
  return true; // Indicates asynchronous response possible
});


// --- Core Logic ---

async function generateReply(tweetText, tabId) {
  console.log("Attempting to generate reply for:", tweetText);

  // 1. Get API Key (Placeholder - needs implementation with options page)
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error("OpenRouter API Key not found. Please set it in the extension options.");
    // Notify content script or user
    chrome.tabs.sendMessage(tabId, { action: "showError", message: "API Key not set." });
    return;
  }

  // 2. Prepare API Request
  const requestBody = {
    model: "openai/gpt-3.5-turbo", // Example model - make configurable later
    messages: [
      { role: "system", content: "You are an AI assistant helping users draft replies on social media (like X). Be concise and relevant." },
      { role: "user", content: `Generate a concise reply suggestion for the following tweet:\n\n"${tweetText}"` }
    ],
    // Add other parameters like temperature, max_tokens if needed
  };

  // 3. Call OpenRouter API
  try {
    console.log("Sending request to OpenRouter...");
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
        // Add other headers like "HTTP-Referer" if required by OpenRouter/your setup
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

    const suggestion = data.choices?.[0]?.message?.content?.trim();

    if (suggestion) {
      console.log("Generated suggestion:", suggestion);
      // 4. Send suggestion back to content script
      chrome.tabs.sendMessage(tabId, { action: "displaySuggestion", suggestion: suggestion });
    } else {
      console.error("No suggestion found in API response.");
      chrome.tabs.sendMessage(tabId, { action: "showError", message: "Failed to parse suggestion from API." });
    }

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    chrome.tabs.sendMessage(tabId, { action: "showError", message: `API Call Failed: ${error.message}` });
  }
}

// --- Helper Functions ---

// Placeholder for getting API key from storage
async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['openRouterApiKey'], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting API key from storage:", chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(result.openRouterApiKey || null);
      }
    });
  });
}
