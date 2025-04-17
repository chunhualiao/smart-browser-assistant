# Design Document: Integrating Web Search into Smart Browser Assistant

## Goal

To enable the Smart Browser Assistant Chrome extension to incorporate up-to-date information from the web when processing selected text with an AI model via OpenRouter.

## Options Discussed

We explored several approaches to achieve this goal:

1.  **Rely on Model's Internal Capabilities:** Use an AI model via OpenRouter that has built-in web search functionality. The extension would pass the request as usual, and the model itself would handle accessing the web if needed.
2.  **Direct Search API Integration:** Modify the extension's background script (`background.js`) to:
    *   Accept the user's selected text and prompt trigger.
    *   Make a separate API call to a chosen web search engine (e.g., Google, Bing, Tavily).
    *   Extract relevant information from the search results.
    *   Construct an augmented prompt containing the original text *and* the fetched web context.
    *   Send this augmented prompt to the OpenRouter API.
3.  **Model Context Protocol (MCP) Integration:** Set up or utilize an MCP server that exposes a standardized "web search" tool. The extension's background script (`background.js`) would:
    *   Accept the user's selected text and prompt trigger.
    *   Make a call to the MCP server's search tool endpoint, passing the query.
    *   Receive the search results back from the MCP server.
    *   Construct an augmented prompt containing the original text *and* the fetched web context.
    *   Send this augmented prompt to the OpenRouter API.

## Comparison Table

| Feature                 | Rely on Model Internal Search | Direct Search API Integration | MCP Integration                 |
| :---------------------- | :---------------------------- | :---------------------------- | :------------------------------ |
| **Implementation**      | Minimal (Select capable model) | Moderate (Modify `background.js`, handle API key) | High (Set up/find MCP server, modify `background.js`) |
| **Control over Search** | Low (Depends on model)        | High (Choose API, process results) | High (Define MCP tool logic)  |
| **Reliability**         | Variable (Model dependent)    | High (Explicit control)       | High (Explicit control)         |
| **Flexibility**         | Low                           | Moderate (Tied to chosen API) | High (Standardized interface) |
| **Dependencies**        | Capable AI Model via OpenRouter | Search Engine API Key         | Running MCP Server, Search API Key |
| **Complexity**          | Low                           | Moderate                      | High                            |
| **Maintainability**     | Easy                          | Moderate                      | Potentially easier long-term if adding more tools |
| **Best For**            | Simplicity, if a suitable model exists | Single, specific integration | Structured approach, multiple tools planned |

## Recommendation

*   **If a suitable OpenRouter model with reliable built-in search exists and meets the needs:** This is the simplest approach.
*   **For a direct, focused solution:** Integrating directly with a Search API offers good control with moderate complexity.
*   **For a more structured, extensible system (especially if planning more tools):** Using MCP provides a standardized interface but requires more initial setup.

The choice depends on the availability of suitable models via OpenRouter, the desire for fine-grained control over the search process, and future plans for adding more external capabilities to the extension.
