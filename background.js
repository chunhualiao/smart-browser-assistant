// X Reply Assistant - background.js

const CONTEXT_MENU_ID = "generateReplyX";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// --- Initialization ---

// Default prompts - these will be loaded/saved from storage later
const DEFAULT_PROMPTS = [
  {
    id: "prompt_const_amendment",
    name: "Analyze via Specific Amendment",
    text: "Analyze the following text through the lens of the [Specify Amendment, e.g., First Amendment] of the US Constitution. Identify potential conflicts or alignments. Keep it concise (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_const_sep_powers",
    name: "Analyze via Separation of Powers",
    text: "Evaluate the following text regarding the US Constitution's principle of separation of powers (legislative, executive, judicial). Note any potential imbalances or checks. Concise analysis (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_crit_assumptions",
    name: "Identify Underlying Assumptions",
    text: "What are the key underlying assumptions in the following text? Briefly list them (under 280 chars total):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_crit_evidence",
    name: "Evaluate Evidence/Support",
    text: "Briefly assess the strength and type of evidence or support used in the following text (e.g., anecdotal, statistical, logical). Note any weaknesses (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_crit_counter",
    name: "Generate Counter-Argument",
    text: "Generate a concise, logical counter-argument or opposing viewpoint to the main point of the following text (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_crit_implications",
    name: "Explore Potential Implications",
    text: "Briefly outline one significant potential implication or consequence (intended or unintended) of the idea presented in the following text (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_custom_students",
    name: "Counter-Argument (Students/Einstein)",
    text: "Critically analyze the following text based on US Constitutional principles and facts. \nDraw parallel to how USA admited German scientists like Einstein even in a real war condition.  \nUse the facts that Chinese students pay much higher fees to US universities, bringing in much needed revenues to US, besides filling in talent pipelines.\n\nGenerate a concise counter-argument (under 460 characters so I can post two segments):\n\n\"%TEXT%\""
  }
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
        // Add "HTTP-Referer": "YOUR_SITE_URL" or "X-Title": "YOUR_APP_NAME" if required by OpenRouter for identification
        // e.g., "HTTP-Referer": chrome.runtime.getURL("options.html"),
        // e.g., "X-Title": "X Reply Assistant"
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
    // Log the full response data for potential future debugging
    console.log("Full API response data:", JSON.stringify(data, null, 2));
    // console.log("OpenRouter response data:", data); // Can likely remove the less detailed log now

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


// Gets all required settings from storage
async function getSettings() {
  const MIN_TIMEOUT = 5; // Minimum allowed timeout in seconds
  const DEFAULT_TIMEOUT = 30; // Default timeout

  return new Promise((resolve) => {
    // Include 'temperature' and 'timeout' in the keys to retrieve
    chrome.storage.sync.get(['openRouterApiKey', 'selectedModel', 'selectedPromptId', 'prompts', 'temperature', 'timeout'], (items) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting settings from storage:", chrome.runtime.lastError);
        // Ensure all expected fields are returned, even on error (as null/default)
        resolve({ apiKey: null, selectedModel: null, selectedPrompt: null, temperature: 0.9, timeout: DEFAULT_TIMEOUT }); // Default temp/timeout on error
      } else {
        const prompts = items.prompts || DEFAULT_PROMPTS;
        const selectedPrompt = prompts.find(p => p.id === items.selectedPromptId) || prompts[0]; // Fallback

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
          selectedModel: items.selectedModel || "openai/gpt-3.5-turbo", // Fallback model
          selectedPrompt: selectedPrompt,
          temperature: temperature, // Use validated or default temperature
          timeout: timeout // Use validated or default timeout
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
    notifyUser(tabId, "Counter-argument copied to clipboard!", "success");

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
            args: [`X Reply Assistant\n${prefix}${message}`]
        }).catch(err => console.error("Failed to execute script for notification:", err));
    } else {
        // Fallback if tabId is not available (e.g., called from options page)
        // Could use chrome.notifications API here for a richer notification
        console.warn("Cannot show alert, tabId not available.");
    }
}
