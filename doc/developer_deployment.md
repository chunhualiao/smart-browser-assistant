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
