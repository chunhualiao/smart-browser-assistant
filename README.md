# X Reply Assistant Chrome Extension

This Chrome extension helps generate reply suggestions for posts on X (formerly Twitter) using the OpenRouter API. It adds a context menu item when you right-click inside a reply box on x.com.

## Prerequisites

*   Google Chrome browser installed.
*   An API key from [OpenRouter.ai](https://openrouter.ai/).

## Installation and Setup (Developer Mode)

1.  **Get the Code:** Ensure you have this `x-reply-assistant` folder containing the extension files (`manifest.json`, `background.js`, etc.) on your local machine.

2.  **Replace Placeholder Icons (Optional but Recommended):**
    *   Navigate to the `x-reply-assistant/icons/` directory.
    *   Replace the placeholder files (`icon16.png`, `icon48.png`, `icon128.png`) with your own actual PNG images of the corresponding sizes (16x16, 48x48, 128x128 pixels).

3.  **Update DOM Selectors (CRITICAL STEP):**
    *   The functionality of this extension heavily relies on identifying specific elements (like the reply box and the tweet text) within the x.com webpage structure (the DOM). X.com frequently updates its website, which **will break** the default selectors provided in the code.
    *   Open the `x-reply-assistant/content.js` file in a text editor.
    *   Go to [x.com](https://x.com) in your Chrome browser.
    *   Use Chrome's Developer Tools (right-click anywhere on the page -> "Inspect") to find the current, correct CSS selectors for:
        *   The **reply text box/area** where you type your reply. Look for unique attributes like `data-testid`, `role`, `aria-label`, or specific class names.
        *   The main **container element of a tweet** (often an `<article>` tag).
        *   The element containing the **actual text content** of a tweet.
    *   **Carefully replace the placeholder selectors** within `content.js` (marked with comments like `<<< LIKELY NEEDS UPDATING`) with the correct selectors you found. You may need to adjust the DOM traversal logic in the `findParentTweetText` function as well.
    *   **Note:** You may need to repeat this step periodically if the extension stops working after an x.com website update.

4.  **Load the Extension in Chrome:**
    *   Open Chrome.
    *   Navigate to the extensions page by typing `chrome://extensions/` in the address bar and pressing Enter.
    *   Enable "Developer mode". You should see a toggle switch for this, usually in the top-right corner of the page.
    *   Click the "Load unpacked" button (usually appears on the top-left after enabling Developer mode).
    *   In the file dialog that opens, navigate to and select the **entire `x-reply-assistant` folder** (the one containing `manifest.json`). Click "Select Folder" or "Open".
    *   The "X Reply Assistant" extension should now appear in your list of installed extensions.

5.  **Set Your OpenRouter API Key:**
    *   Find the "X Reply Assistant" extension card on the `chrome://extensions/` page.
    *   Click the "Details" button.
    *   Scroll down and click "Extension options".
    *   Alternatively, click the puzzle piece icon in your Chrome toolbar, find "X Reply Assistant", click the three dots next to it, and select "Options".
    *   On the options page that opens, paste your OpenRouter API key into the input field.
    *   Click the "Save Key" button. You should see a confirmation message.

## How to Use

1.  Navigate to [x.com](https://x.com).
2.  Find a tweet you want to reply to.
3.  Click the reply button to open the reply interface.
4.  **Right-click** inside the text box where you would normally type your reply.
5.  Select "Generate Reply Suggestion" from the context menu that appears.
6.  The extension will attempt to find the text of the tweet you are replying to, send it to OpenRouter, and then insert the generated suggestion directly into the reply box.

## Troubleshooting & Maintenance

*   **Extension Not Working:** The most common reason is that x.com has updated its website structure, breaking the DOM selectors. You will need to repeat **Step 3 (Update DOM Selectors)** above. Check the Chrome Developer Tools console (Inspect -> Console) on the x.com page for error messages from the content script. Also check the extension's background script console (go to `chrome://extensions/`, find the extension, click the "Service worker" link) for API errors.
*   **Incorrect Tweet Scraped:** The logic in `content.js` for finding the parent tweet might be flawed or broken by site updates. Adjust the `findParentTweetText` function and its selectors.
*   **API Errors:** Ensure your OpenRouter API key is correct and has credits. Check the background script console for specific error messages from the API.
