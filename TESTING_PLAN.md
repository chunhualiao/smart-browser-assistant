# Smart Browser Assistant - Automated Testing Plan

This document outlines a plan for implementing automated testing for the Smart Browser Assistant Chrome extension to ensure code quality, prevent regressions, and enable safe integration with a CI/CD pipeline.

## 1. Goals

*   Verify the correctness of individual functions (Unit Tests).
*   Ensure different parts of the extension interact correctly (Integration Tests).
*   Validate user workflows and interactions within a real browser environment (End-to-End Tests).
*   Integrate testing into the development workflow (e.g., run tests automatically before merging to `main`).

## 2. Types of Tests & Scope

*   **Unit Tests:**
    *   **Focus:** Small, isolated functions within `.js` files (`background.js`, `options.js`).
    *   **Examples:**
        *   Testing helper functions in `background.js` (e.g., `getSettings` parsing, `addLogEntry` logic).
        *   Testing validation logic or UI update functions in `options.js`.
    *   **Environment:** Node.js environment, mocking Chrome APIs.
*   **Integration Tests:**
    *   **Focus:** Interactions between different components or with Chrome APIs.
    *   **Examples:**
        *   Saving settings in `options.js` and verifying the correct values are stored via `chrome.storage.sync.get`.
        *   Simulating a context menu click message and verifying `background.js` calls `getSettings` and attempts a `fetch`.
        *   Verifying `chrome.contextMenus.create` is called correctly on installation.
    *   **Environment:** Node.js environment, mocking/spying on Chrome APIs.
*   **End-to-End (E2E) Tests:**
    *   **Focus:** Simulating real user scenarios in a browser.
    *   **Examples:**
        *   Loading the extension, opening the options page, entering an API key, selecting a model/prompt, saving, and verifying settings are persisted.
        *   Navigating to a webpage, selecting text, right-clicking, triggering the context menu item, and verifying a notification appears and (optionally) text is copied to the clipboard.
        *   Testing the history display and clearing functionality on the options page.
    *   **Environment:** Real browser instance controlled programmatically.

## 3. Recommended Tools

*   **Test Runner & Framework:**
    *   **Jest** or **Vitest:** Popular, feature-rich JavaScript testing frameworks. Provide test structure, assertions, mocking, and code coverage reports.
*   **Chrome API Mocking:**
    *   **`jest-chrome`:** Specifically designed to mock Chrome Extension APIs within a Jest environment.
*   **Browser Automation (for E2E):**
    *   **Puppeteer** (Google) or **Playwright** (Microsoft): Libraries for controlling browsers programmatically. Allow loading extensions, interacting with pages and extension UI.

## 4. Setup & Implementation Steps

1.  **Initialize Project:**
    *   Run `npm init -y` (if `package.json` doesn't exist) to manage dependencies.
2.  **Install Dependencies:**
    *   Install testing frameworks as dev dependencies:
        ```bash
        npm install --save-dev jest jest-chrome # Or vitest
        npm install --save-dev puppeteer # Or playwright
        ```
3.  **Configure Testing Framework:**
    *   Set up Jest/Vitest configuration (e.g., `jest.config.js`). Configure `jest-chrome` for mocking.
4.  **Create Test Directory:**
    *   Create a root `tests/` directory.
    *   Optionally create subdirectories: `tests/unit/`, `tests/integration/`, `tests/e2e/`.
5.  **Write Unit & Integration Tests:**
    *   Create `.test.js` files (e.g., `tests/unit/background.test.js`).
    *   Import functions to test.
    *   Use Jest/Vitest syntax (`describe`, `it`, `expect`) to write tests.
    *   Utilize `jest-chrome` to mock API calls (`chrome.storage.sync.get`, `chrome.runtime.onInstalled.addListener`, etc.).
6.  **Write E2E Tests:**
    *   Create `.e2e.test.js` files (e.g., `tests/e2e/options.e2e.test.js`).
    *   Use Puppeteer/Playwright API to:
        *   Launch the browser with the extension loaded (pointing to the project directory).
        *   Navigate to `chrome-extension://<EXTENSION_ID>/options.html` or test web pages.
        *   Use browser automation commands to find elements, click, type, select text.
        *   Make assertions about the UI state, stored data, or clipboard content.
        *   (Advanced) Potentially intercept and mock network requests to the OpenRouter API to avoid actual API calls during tests.
7.  **Add Test Scripts (`package.json`):**
    *   Add scripts to run tests easily:
        ```json
        "scripts": {
          "test": "jest", // Or vitest
          "test:unit": "jest tests/unit", // Or vitest run tests/unit
          "test:e2e": "jest tests/e2e" // Or vitest run tests/e2e
          // Add specific configurations if needed
        }
        ```

## 5. CI/CD Integration (Example: GitHub Actions)

1.  **Create Workflow File:** `.github/workflows/ci.yml`
2.  **Trigger:** On `push` to feature branches or `pull_request` to `main`.
3.  **Job Steps:**
    *   Checkout code (`actions/checkout`).
    *   Setup Node.js (`actions/setup-node`).
    *   Install dependencies (`npm ci` or `npm install`).
    *   Run tests (`npm test`). E2E tests might require installing browser dependencies or using browser-provided actions.
4.  **Branch Protection:** Configure `main` branch rules on GitHub to require the `ci` check to pass before merging.

## 6. Incremental Implementation Strategy

1.  Start with project initialization (`npm init`) and installing Jest + `jest-chrome`.
2.  Write basic unit tests for pure helper functions (if any) or functions with easily mockable dependencies (e.g., validation logic in `options.js`).
3.  Gradually add unit/integration tests for core features like settings management (`getSettings`, `saveOptions`) using `jest-chrome`.
4.  Set up Puppeteer/Playwright and write a simple E2E test for loading the options page.
5.  Expand E2E tests to cover key user workflows (saving settings, triggering generation).
6.  Set up the GitHub Actions workflow early to run unit/integration tests, adding E2E later.

This plan provides a roadmap for establishing a robust automated testing suite for the extension.
