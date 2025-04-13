# X Reply Assistant Chrome Extension (v0.2)

This Chrome extension helps generate counter-arguments or critical analyses for **any selected text** on a webpage using the OpenRouter API. It adds a context menu item when you right-click on highlighted text. The generated response is copied to your clipboard.

## Prerequisites

*   Google Chrome browser installed.
*   An API key from [OpenRouter.ai](https://openrouter.ai/).

## Installation and Setup (Developer Mode)

1.  **Get the Code:** Ensure you have this `x-reply-assistant` folder containing the extension files (`manifest.json`, `background.js`, `options.html`, etc.) on your local machine.

2.  **Replace Placeholder Icons (Optional but Recommended):**
    *   Navigate to the `x-reply-assistant/icons/` directory.
    *   Replace the placeholder files (`icon16.png`, `icon48.png`, `icon128.png`) with your own actual PNG images of the corresponding sizes (16x16, 48x48, 128x128 pixels).

3.  **Load the Extension in Chrome:**
    *   Open Chrome.
    *   Navigate to the extensions page by typing `chrome://extensions/` in the address bar and pressing Enter.
    *   Enable "Developer mode". You should see a toggle switch for this, usually in the top-right corner of the page.
    *   Click the "Load unpacked" button (usually appears on the top-left after enabling Developer mode).
    *   In the file dialog that opens, navigate to and select the **entire `x-reply-assistant` folder** (the one containing `manifest.json`). Click "Select Folder" or "Open".
    *   The "X Reply Assistant" extension should now appear in your list of installed extensions. If you had a previous version loaded, you might need to click the refresh icon on the extension's card.

4.  **Configure Settings:**
    *   Find the "X Reply Assistant" extension card on the `chrome://extensions/` page.
    *   Click the "Details" button.
    *   Scroll down and click "Extension options".
    *   Alternatively, click the puzzle piece icon in your Chrome toolbar, find "X Reply Assistant", click the three dots next to it, and select "Options".
    *   On the options page:
        *   Enter your **OpenRouter API Key**.
        *   Select the desired **AI Model** from the dropdown.
        *   Choose the **Active Prompt** you want the context menu to use. You can preview the selected prompt's text.
    *   Click the "Save Settings" button. You should see a confirmation message.

## How to Use

1.  Navigate to any webpage containing text you want to analyze.
2.  **Select (highlight) the text** with your mouse.
3.  **Right-click** on the highlighted text.
4.  Select "Generate Counter-Argument" (or similar, based on the menu title) from the context menu that appears.
5.  The extension will send the selected text and your configured prompt/model to OpenRouter.
6.  A notification should appear indicating the result has been **copied to your clipboard**.
7.  Paste the result wherever you need it (e.g., a reply box, a document).

## Troubleshooting & Maintenance

*   **Context Menu Not Appearing:** Ensure you are right-clicking *directly on the text you have selected*. Make sure the extension is enabled in `chrome://extensions/`.
*   **"API Key not set" Error:** Go to the extension options and ensure your OpenRouter API key is entered correctly and saved.
*   **"Model or Prompt not configured" Error:** Go to the extension options and make sure you have selected a model and a prompt, then save settings.
*   **API Errors (e.g., 4xx, 5xx):** Ensure your OpenRouter API key is valid and has credits/correct permissions for the selected model. Check the background script console for specific error messages from the API (go to `chrome://extensions/`, find the extension, click the "Service worker" link, and look at the "Console" tab).
*   **Result Not Copied / Other Errors:** Check the background script console for errors related to the API call or clipboard access.
