# Privacy Policy for Smart Browser Assistant

**Last Updated:** April 13, 2025

This Privacy Policy describes how the Smart Browser Assistant Chrome Extension ("the Extension") collects, uses, and handles your data when you use the Extension.

## 1. Information We Collect

The Extension collects the following types of information:

*   **Authentication Information:**
    *   **OpenRouter API Key:** You provide your OpenRouter API key via the Extension's options page. This key is necessary for the Extension to make API calls to OpenRouter on your behalf.
*   **Website Content:**
    *   **Selected Text:** When you select text on a webpage and activate the Extension via the context menu, that selected text is collected temporarily to be sent to the OpenRouter API for processing according to the prompt you choose.
    *   **Generated Text:** The text response generated by the OpenRouter API is received by the Extension.
*   **Configuration Settings:**
    *   Settings such as your chosen AI model, temperature, timeout value, verbose logging preference, and your list of custom prompts (including their names and text content) are stored.
*   **Usage History (Locally Stored):**
    *   To provide a history feature, the Extension stores a log of recent generations, including the input text (selected text), the output text (generated text), the model used, the timestamp, and the duration of the API call.

## 2. How We Collect Information

*   **API Key & Settings:** Collected directly from your input on the Extension's options page.
*   **Selected Text:** Collected only when you explicitly select text on a webpage and choose an action from the Extension's context menu.
*   **Generated Text:** Received directly from the OpenRouter API in response to your request.
*   **Usage History:** Automatically logged by the Extension after a successful generation.

## 3. How We Use Information

*   **API Key:** Used solely to authenticate requests sent to the OpenRouter API (`https://openrouter.ai/`) when you initiate an action via the context menu.
*   **Selected Text:** Sent to the OpenRouter API along with your chosen prompt and configuration settings for processing by the selected AI model.
*   **Generated Text:** Copied to your clipboard for your convenience.
*   **Configuration Settings:** Used to customize the Extension's behavior (e.g., which model to use, which prompts are available) and saved for persistence using `chrome.storage.sync`.
*   **Usage History:** Stored locally using `chrome.storage.local` and displayed on the options page for your reference.

## 4. Data Sharing

Your data is shared only as follows:

*   **OpenRouter API:** Your API key, selected text, chosen prompt, and selected model configuration are sent to OpenRouter (`https://openrouter.ai/`) when you explicitly trigger an action via the context menu. We do not control how OpenRouter uses this data; please refer to OpenRouter's privacy policy for details.
*   **No Other Third Parties:** We do not share your API key, selected text, generated text, configuration settings, or usage history with any other third parties.

## 5. Data Storage and Security

*   **API Key & Configuration Settings:** Stored using `chrome.storage.sync`. This allows your settings to persist and potentially sync across your devices if Chrome sync is enabled. Chrome encrypts synced data.
*   **Usage History:** Stored using `chrome.storage.local`. This data remains only on the local device where the generation occurred and is not synced.
*   We rely on the security mechanisms provided by the Chrome browser and its storage APIs. However, please note that no method of transmission or storage is 100% secure.

## 6. User Control

*   You can view, modify, or delete your OpenRouter API key and other configuration settings at any time via the Extension's options page.
*   You can clear your locally stored generation history at any time via the Extension's options page.
*   You can uninstall the Extension at any time, which will remove its access to stored data according to Chrome's standard uninstall process.

## 7. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the Extension or its web store listing. You are advised to review this Privacy Policy periodically for any changes.

## 8. Contact Us

If you have any questions about this Privacy Policy, please contact us at: chunhualiao@gmail.com 
