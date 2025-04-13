// Smart Browser Assistant - content.js
// v0.2 - Simplified for selection-based context menu

console.log("Smart Browser Assistant content script loaded (v0.2).");

// No longer needs to track right-clicked elements or scrape text for this workflow.
// The background script receives selected text directly via info.selectionText.

// Listener for messages from background (e.g., for potential future UI updates)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);

  // Example: Handle potential future actions like showing a custom notification overlay
  // if (message.action === "showInPageNotification") {
  //   displayNotification(message.text, message.type);
  //   sendResponse({ status: "notification shown" });
  // }

  // Must return true if sendResponse might be called asynchronously later
  // return true;
});

// Example function for future use
// function displayNotification(text, type) {
//   console.log(`Displaying ${type} notification: ${text}`);
//   // Implementation would involve creating and styling a temporary div on the page
// }
