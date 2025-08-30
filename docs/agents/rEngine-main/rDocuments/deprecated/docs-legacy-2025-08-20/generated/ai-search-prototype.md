# StackTrackr AI-Powered Search Engine Prototype

## Purpose & Overview

This file, `ai-search-prototype.js`, demonstrates how the rEngine Core platform can enhance the existing sophisticated search system of the StackTrackr application with natural language interpretation, while maintaining backward compatibility. It integrates an AI-powered search engine, built using the GPT API, to provide more intelligent and contextual search results for users.

The key objectives of this prototype are:

1. **AI-Powered Search Enhancement**: Leverage the power of large language models (like GPT) to interpret user queries and provide more relevant, personalized search results.
2. **Backward Compatibility**: Ensure that the AI-enhanced search functionality seamlessly integrates with the existing StackTrackr search system, without disrupting the user experience.
3. **Cost Optimization**: Implement a caching strategy and model selection based on a cost optimization matrix to ensure efficient use of the GPT API.

## Key Functions/Classes

### `AISearchEngine` Class

The `AISearchEngine` class is the core of the AI-powered search enhancement. It has the following responsibilities:

1. **Query Interpretation**: Using the GPT API, it interprets the user's natural language query and extracts relevant information, such as search intent, metal filters, and keyword matches.
2. **Result Merging**: It combines the traditional search results with the AI-generated insights, ensuring that the most relevant items are surfaced to the user.
3. **Caching**: To optimize costs, it implements a caching mechanism that stores the AI-enhanced search results, with time-to-live (TTL) management and storage in the browser's localStorage.
4. **Error Handling**: It provides graceful fallback to the traditional search functionality in case of any errors or issues with the AI-powered search.

### `enhanceExistingSearch` Function

This function is the integration point between the AI-powered search engine and the existing StackTrackr search functionality. It acts as a wrapper around the traditional `filterInventory` function, enhancing it with the AI-powered search capabilities.

## Dependencies

This prototype file has the following dependencies:

1. **GPT API**: The AI-powered search engine relies on the GPT API to interpret user queries and provide enhanced search results. The file assumes that the necessary API key is available and configured.
2. **StackTrackr Search Integration**: The `enhanceExistingSearch` function integrates directly with the existing StackTrackr search functionality, specifically the `filterInventory` function.

## Usage Examples

To use the AI-powered search enhancement, you need to follow these steps:

1. Ensure that the `AISearchEngine` class is available in the global scope. This is achieved by the last line of the file: `window.AISearchEngine = AISearchEngine;`.
2. Enable the AI search functionality by setting the `window.aiSearchEnabled` flag to `true`.
3. Provide the necessary GPT API key by setting the `window.aiApiKey` variable.
4. Call the `enhanceExistingSearch` function instead of the traditional `filterInventory` function when performing a search.

Here's an example of how to use the AI-powered search enhancement:

```javascript
// Enable AI search
window.aiSearchEnabled = true;
window.aiApiKey = 'your_gpt_api_key';

// Use the enhanced search function
const results = await enhanceExistingSearch();
```

## Configuration

The AI search engine is configured using the `AI_SEARCH_CONFIG` object, which defines the following settings:

1. **Models**: Specifies the primary, fallback, and premium GPT models to use, based on cost optimization.
2. **Cache**: Configures the caching strategy, including the time-to-live (TTL) and maximum cache size.
3. **Search**: Sets the confidence threshold for AI suggestions and the maximum number of suggestions to display, as well as the fallback to traditional search behavior.

You can adjust these configuration settings as needed to fit your specific requirements.

## Integration Points

The `ai-search-prototype.js` file integrates with the existing StackTrackr search functionality through the `enhanceExistingSearch` function. This function is designed to be a drop-in replacement for the `filterInventory` function, ensuring a seamless integration with the existing StackTrackr application.

## Troubleshooting

### GPT API Errors

If you encounter any issues with the GPT API, such as authentication errors or service unavailability, the `AISearchEngine` class will catch these errors and gracefully fall back to the traditional search functionality. You can check the browser's console for any error messages related to the GPT API calls.

### Cache-related Issues

If you experience any problems with the cache, such as data not being persisted or loaded correctly, you can check the browser's console for any warnings or errors related to the cache management.

### Integration Failures

If the `enhanceExistingSearch` function is not working as expected, ensure that the necessary variables (`window.aiSearchEnabled`, `window.aiApiKey`, `window.inventory`, `window.searchQuery`, and `window.filterInventory`) are properly set and accessible.

## Conclusion

The `ai-search-prototype.js` file showcases the integration of an AI-powered search engine within the rEngine Core platform, specifically for the StackTrackr application. By leveraging the GPT API, this prototype demonstrates how natural language interpretation can be used to enhance the existing sophisticated search system, providing more relevant and personalized search results to the users.

The modular design of the `AISearchEngine` class and the `enhanceExistingSearch` function allows for easy integration and customization within the rEngine Core ecosystem. The configuration options and error handling mechanisms ensure that the AI-powered search enhancement can be seamlessly incorporated into the StackTrackr application, while maintaining backward compatibility and cost optimization.
