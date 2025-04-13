## MVP

tag as v 1.0

Done

publish to extension market, 

Then deploy it


## Feature set v 1.1

* persuasive response using best psychological methods

* conversational interface

pop up multiple right click menu options
* translation
* proofread
* p

copy history of sessions to markdown

monetize it : collect sponsorship?

how to add regression tests with github? so commit to only a feature or bug fix branch, automatically test and merge to main only if the tests pass?



## Version 2 features

link to relevant bill as context: many posts have double talking : saying one thing but in the bills doing another thing

search CMP connection

use on iphone?

ollama support : end point, key

multiplelingual

multiple types of browser


## Code Refinements / Technical Debt (from Reviews - April 13, 2025)

*   **Logging (`background.js`):** Modify logging to avoid logging the full raw API response body. Log only necessary, non-sensitive fields instead.
*   **Manifest Scope (`manifest.json`):**
    *   Review if the `*://*.x.com/*` host permission is necessary and remove/narrow it.
    *   Evaluate if the content script `matches` can be narrowed from `<all_urls>`.
    *   Update the `description` field to be more general and accurately reflect functionality.
*   **[DONE] Code Duplication (`DEFAULT_PROMPTS`):** Defined shared constants in `constants.js` to avoid duplication between `background.js` and `options.js`.
*   **Constants Definition:** Define constants like `MIN_TIMEOUT` and `MAX_HISTORY_SIZE` globally at the top of files or in a shared constants file.
*   **Notifications (`background.js`):** Consider switching from `alert()` to `chrome.notifications.create()` for user notifications for a better UX.
