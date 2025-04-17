# Smart Browser Assistant Chrome Extension (v0.2)

This Chrome extension acts as an AI assistant for **any selected text** on a webpage using the OpenRouter API. Some models available through OpenRouter, such as `openai/gpt-4o-mini`, support web search by default, which can be especially useful for tasks like fact-checking posts on X. It adds a context menu item when you right-click on highlighted text, allowing you to perform various actions like generating replies, proofreading, translating, or performing critical analysis. The generated response is copied to your clipboard. It's useful for tasks like drafting social media responses, improving writing, or understanding text from different perspectives.

## Prerequisites

*   Google Chrome browser installed.
*   https://chromewebstore.google.com/detail/ljnkjogcdagiakilefpifeonipbmcdgf?utm_source=item-share-cb Public release version of this extension
*   An API key from [OpenRouter.ai](https://openrouter.ai/).

## Installation and Setup (Developer Mode)

1.  **Get the Code:** Ensure you have this `smart-browser-assistant` folder containing the extension files (`manifest.json`, `background.js`, `options.html`, etc.) on your local machine.

2.  **Replace Placeholder Icons (Optional but Recommended):**
    *   Navigate to the `smart-browser-assistant/icons/` directory.
    *   Replace the placeholder files (`icon16.png`, `icon48.png`, `icon128.png`) with your own actual PNG images of the corresponding sizes (16x16, 48x48, 128x128 pixels).

3.  **Load the Extension in Chrome:**
    *   Open Chrome.
    *   Navigate to the extensions page by typing `chrome://extensions/` in the address bar and pressing Enter.
    *   Enable "Developer mode". You should see a toggle switch for this, usually in the top-right corner of the page.
    *   Click the "Load unpacked" button (usually appears on the top-left after enabling Developer mode).
    *   In the file dialog that opens, navigate to and select the **entire `smart-browser-assistant` folder** (the one containing `manifest.json`). Click "Select Folder" or "Open".
    *   The "Smart Browser Assistant" extension should now appear in your list of installed extensions. If you had a previous version loaded, you might need to click the refresh icon on the extension's card.

4.  **Configure Settings:**
    *   Find the "Smart Browser Assistant" extension card on the `chrome://extensions/` page.
    *   Click the "Details" button.
    *   Scroll down and click "Extension options".
    *   Alternatively, click the puzzle piece icon in your Chrome toolbar, find "Smart Browser Assistant", click the three dots next to it, and select "Options".
    *   On the options page:
        *   Enter your **OpenRouter API Key**. The list of AI models will load dynamically once a valid key is entered (you might need to click out of the field).
        *   Select the desired **AI Model** from the dropdown.
        *   Adjust the **Temperature (Creativity)** setting (0=focused, 1+=creative).
        *   Set the **API Timeout** in seconds (default 30, min 5). This is the maximum time the extension will wait for a response from the API before showing an error.
        *   Choose the **Active Prompt** you want the context menu to use.
        *   You can **edit the text** of the selected prompt directly in the text area below the prompt list.
    *   Click the "Save Settings" button to save the API key, selected model, temperature, timeout, and any prompt edits. You should see a confirmation message.

## Deployment to Marketplaces (e.g., Chrome Web Store)

Publishing your extension allows users to install it directly from the browser's official store. Here's a general outline for the Chrome Web Store:

1.  **Prepare Assets:**
    *   Ensure your `manifest.json` is complete and accurate (version, description, permissions, icons).
    *   Have your final icons ready (16x16, 48x48, 128x128 PNGs are required).
    *   Prepare promotional images/screenshots and a detailed description for the store listing.

2.  **Package the Extension:**
    *   Navigate to `chrome://extensions/`.
    *   Ensure "Developer mode" is enabled.
    *   Click the "Pack extension" button.
    *   For "Extension root directory", browse and select your `smart-browser-assistant` folder.
    *   (Optional) For "Private key file", you can leave this blank for the first packaging. **Save this `.pem` file securely!** You'll need it to update the extension later. If you already have a `.pem` file from a previous packaging, browse and select it here.
    *   Click "Pack extension". This will create a `.crx` file (the packaged extension) and a `.pem` file (the private key, if it was the first time).

3.  **Create a Developer Account:**
    *   Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
    *   You'll need a Google account. There's a small, one-time registration fee. Follow the instructions to set up your account.

4.  **Upload and Configure:**
    *   In the Developer Dashboard, click "Add new item".
    *   Upload the `.crx` file you created. **Do NOT upload the `.pem` file.**
    *   Fill out the store listing details: description, icons, promotional images, category, language, etc.
    *   Configure privacy practices and content ratings.
    *   Save the draft and preview the listing.

5.  **Submit for Review:**
    *   Once you're satisfied, submit the extension for review. Google's team will review it for policy compliance. This can take anywhere from a few hours to several days.
    *   You'll be notified once the review is complete. If approved, it will be published to the Chrome Web Store.

**Note:** The process for other browser marketplaces (e.g., Firefox Add-ons, Microsoft Edge Add-ons) is similar but will have specific requirements and dashboards. Consult their respective documentation.

## Installation (Published Version)

Once the extension is published on a browser marketplace like the Chrome Web Store:

1.  **Visit the Store Listing:** Navigate to the extension's page on the Chrome Web Store (or the relevant marketplace for other browsers). [Link](https://chromewebstore.google.com/detail/ljnkjogcdagiakilefpifeonipbmcdgf?utm_source=item-share-cb) 
3.  **Add to Browser:** Click the "Add to Chrome" (or similar) button.
4.  **Confirm Permissions:** A dialog will appear asking for necessary permissions. Review them and click "Add extension" to confirm.
5.  **Configuration:** After installation, follow the steps in the "Configure Settings" section above (accessing options via the Extensions menu) to add your API key and select your preferred model/prompt. Some models available through OpenRouter, such as `openai/gpt-4o-mini-search-preview`, support web search by default, which can be especially useful for tasks like fact-checking.

## Features

*   Adds a **two-level context menu** when right-clicking selected text:
    *   Top Level: "Smart Browser Assistant"
    *   Second Level: Lists all available prompts (from defaults or user edits).
*   Uses your configured OpenRouter API key, selected model, temperature, and timeout settings for all prompts.
*   Generates a response based on the selected text and the **specific prompt clicked** in the context menu.
*   Aborts the API request and shows an error if the response takes longer than the configured timeout.
*   Copies the generated response directly to your clipboard.
*   Comes with a set of default prompts for various tasks:
    *   **Generate Reply:** Automatically draft a reply to the selected text.
    *   **Proofread Text:** Check the selected text for grammar, spelling, and clarity.
    *   **Translate to Chinese (Simplified):** Translate the selected text into Simplified Chinese.
    *   **Critical Analysis:** Prompts focused on constitutional analysis and critical thinking (e.g., Analyze via Specific Amendment, Identify Assumptions, Evaluate Evidence, Generate Counter-Argument, Explore Implications, Custom Students/Einstein Analogy).
*   Allows editing of any prompt text within the options page.
*   Dynamically loads available models from OpenRouter (requires valid API key).
*   Logs generation history (timestamp, model, duration, input, output) locally.
*   Provides an option to view and clear the generation history.
*   **Model Performance Testing:** Allows testing the response time of randomly sampled models directly from the options page. 

## How to Use

1.  Navigate to any webpage containing text you want to interact with.
2.  **Select (highlight) the text** with your mouse.
3.  **Right-click** on the highlighted text.
4.  Hover over the **"Smart Browser Assistant"** item in the context menu.
5.  A sub-menu will appear listing all available prompts (e.g., "Generate Reply", "Proofread Text", "Analyze via Specific Amendment").
6.  **Click the specific prompt** you want to use for the selected text.
7.  The extension will send the selected text and the chosen prompt (using your configured model and settings) to OpenRouter.
8.  Wait for the API to process the request (up to the configured timeout).
7.  A notification should then appear indicating the result has been **copied to your clipboard**.
8.  Paste the result wherever you need it (e.g., a reply box, a document).

## Development Note

The majority of the code in this project was generated using AI assistance, specifically:
*   Microsoft VS Code
*   Cline Extension
*   Google Gemini 1.5 Pro

The author provided guidance for feature additions, refinements, and bug fixes throughout the development process.

## Security Review (April 13, 2025)

A security review of the codebase was performed with the following findings:

*   **API Key Handling**: The OpenRouter API key appears to be handled securely.
    *   Stored using `chrome.storage.sync`.
    *   Masked in the options page UI (`<input type="password">`).
    *   Transmitted securely over HTTPS within the `Authorization` header.
    *   Not logged in the console or stored in the generation history.
*   **Permissions (`manifest.json`)**: Permissions requested are generally necessary. The `*://*.x.com/*` host permission and the `<all_urls>` content script match could potentially be narrowed depending on the extension's intended scope, but do not currently lead to data leaks.
*   **Logging (`background.js`)**: The background script logs the full response body from the OpenRouter API. While this doesn't leak the API key itself, logging raw API responses is generally discouraged. Recommendation: Modify logging to only include necessary, non-sensitive fields.
*   **Other Scripts (`options.js`, `content.js`)**: These scripts do not appear to handle or expose sensitive information insecurely.

**Overall**: No direct vectors for leaking the API key or other sensitive user information were identified.

## Troubleshooting & Maintenance

*   **Context Menu Not Appearing:** Ensure you are right-clicking *directly on the text you have selected*. Make sure the extension is enabled in `chrome://extensions/`.
*   **"API Key not set" Error:** Go to the extension options and ensure your OpenRouter API key is entered correctly and saved.
*   **"Model or Prompt not configured" Error:** Go to the extension options and make sure you have selected a model and a prompt, then save settings.
*   **Model List Not Loading:** Ensure your OpenRouter API key is entered correctly and is valid. The model list requires a valid key to load. Check the service worker console for errors if it still fails.
*   **API Errors (e.g., 4xx, 5xx):** Ensure your OpenRouter API key is valid and has credits/correct permissions for the selected model. Check the background script console for specific error messages from the API (go to `chrome://extensions/`, find the extension, click the "Service worker" link, and look at the "Console" tab). The Generation History section might also provide clues about recent attempts.
*   **Result Not Copied / Other Errors:** Check the background script console for errors related to the API call or clipboard access.
*   **Viewing Full Generation Details:** Check the Generation History section in the options page for details on past successful generations.
