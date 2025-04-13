// X Reply Assistant - content.js

console.log("X Reply Assistant content script loaded.");

let lastRightClickedElement = null;

// --- Event Listeners ---

// Listen for right-clicks to identify the target reply box
document.addEventListener('contextmenu', (event) => {
  // VERY IMPORTANT: Replace this selector with the actual selector for the reply text area on x.com
  const replyBoxSelector = '[data-testid="tweetTextarea_0"]'; // <<< LIKELY NEEDS UPDATING

  let target = event.target;
  // Check if the clicked element or its parent is the reply box
  while (target && target !== document.body) {
    if (target.matches(replyBoxSelector)) {
      console.log("Right-clicked on a potential reply box:", target);
      lastRightClickedElement = target;
      return; // Found the target
    }
    target = target.parentElement;
  }
  // If the loop finishes without finding the reply box, reset
  lastRightClickedElement = null;
  console.log("Right-click was not on a recognized reply box.");

}, true); // Use capture phase to potentially catch event earlier

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);

  if (message.action === "getTweetText") {
    if (lastRightClickedElement && document.contains(lastRightClickedElement)) {
      console.log("Request received to get tweet text for element:", lastRightClickedElement);
      const tweetText = findParentTweetText(lastRightClickedElement);
      if (tweetText) {
        console.log("Found tweet text:", tweetText);
        sendResponse({ status: "success", tweetText: tweetText });
      } else {
        console.error("Could not find parent tweet text for the element.");
        sendResponse({ status: "error", message: "Could not find tweet text." });
      }
    } else {
      console.error("Request received, but no valid target reply box element stored or element is gone.");
      sendResponse({ status: "error", message: "No valid reply box context." });
    }
    // Reset the element after processing the request for this click
    lastRightClickedElement = null;
  } else if (message.action === "displaySuggestion") {
    if (lastRightClickedElement && document.contains(lastRightClickedElement)) {
      console.log("Displaying suggestion in:", lastRightClickedElement);
      insertSuggestion(lastRightClickedElement, message.suggestion);
      // Reset element after use
      lastRightClickedElement = null;
    } else {
       console.error("Received suggestion, but target element is no longer valid.");
       alert(`X Reply Assistant Suggestion:\n\n${message.suggestion}`); // Fallback display
    }
  } else if (message.action === "showError") {
     console.error("Received error from background:", message.message);
     alert(`X Reply Assistant Error: ${message.message}`); // Simple error display
     // Reset element on error
     lastRightClickedElement = null;
  }

  // Indicate that the response function will be called asynchronously (or synchronously)
  // For simplicity, we are responding synchronously within the checks above.
  // If any part were async, we'd need `return true;` here.
});

// --- Helper Functions ---

function findParentTweetText(replyElement) {
  // VERY IMPORTANT: This logic depends heavily on X.com's DOM structure and WILL likely break.
  // It assumes the reply box is within an <article> element that represents the tweet being replied to.
  // You MUST inspect the live site and adjust selectors accordingly.

  // Example Traversal Logic (NEEDS VERIFICATION/UPDATING):
  // 1. Find the containing tweet article
  const tweetArticleSelector = 'article[data-testid="tweet"]'; // <<< LIKELY NEEDS UPDATING
  let currentElement = replyElement;
  let tweetArticle = null;

  while (currentElement && currentElement !== document.body) {
      // Check if the current element is the tweet article itself *or* contains the reply box but is not the main tweet container yet
      // This logic might need refinement based on structure (e.g., is the reply box *inside* the article it replies to, or *after* it?)
      // Let's assume for now the reply box is *outside* the article it replies to, so we look for the *previous sibling* article.

      // A more robust approach might be needed, e.g., finding a common ancestor and then searching down for the tweet.
      // For now, let's try finding the closest ancestor article first.
      const potentialArticle = currentElement.closest(tweetArticleSelector);
      if (potentialArticle) {
          // Now, we need to determine if this is the *correct* article (the one being replied to)
          // This is complex. A simpler (but maybe wrong) assumption is the closest one IS the one.
          tweetArticle = potentialArticle;
          console.log("Found potential tweet article:", tweetArticle);
          break; // Found an article, stop searching upwards
      }
      currentElement = currentElement.parentElement;
  }


  if (!tweetArticle) {
    console.error("Could not find the parent tweet article element.");
    return null;
  }

  // 2. Find the text element within that article
  const tweetTextSelector = '[data-testid="tweetText"]'; // <<< LIKELY NEEDS UPDATING
  const textElement = tweetArticle.querySelector(tweetTextSelector);

  if (textElement) {
    return textElement.textContent || textElement.innerText;
  } else {
    console.error("Could not find the tweet text element within the article using selector:", tweetTextSelector);
    // Fallback: try getting all text from the article? Might be too noisy.
    // return tweetArticle.textContent || tweetArticle.innerText;
    return null;
  }
}

function insertSuggestion(targetElement, suggestion) {
  // Check if the element is an input or textarea
  if (targetElement.tagName === 'TEXTAREA' || (targetElement.tagName === 'INPUT' && targetElement.type === 'text')) {
    // Simple insertion - replace existing content. Could be improved (e.g., append, insert at cursor).
    targetElement.value = suggestion;
    // Dispatch input event to potentially trigger frameworks listening for changes
    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
    targetElement.focus();
  } else if (targetElement.isContentEditable) {
     // For contentEditable divs (like modern X reply boxes)
     targetElement.textContent = suggestion;
     targetElement.focus();
     // Move cursor to end (optional, might need more complex range/selection handling)
     const range = document.createRange();
     const sel = window.getSelection();
     range.selectNodeContents(targetElement);
     range.collapse(false); // Collapse to end
     sel.removeAllRanges();
     sel.addRange(range);
  } else {
    console.error("Target element is not a recognized input type for suggestion insertion.");
    alert(`X Reply Assistant Suggestion:\n\n${suggestion}`); // Fallback
  }
}

// --- Initial Check ---
// Optional: Check if we are on a page where the script should be active
if (!window.location.hostname.includes("x.com") && !window.location.hostname.includes("twitter.com")) {
    console.warn("X Reply Assistant: Not on x.com or twitter.com, script might not function correctly.");
}
