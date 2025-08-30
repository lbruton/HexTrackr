# rEngine Core - Fuzzy Search Module

## Purpose & Overview

The `fuzzy-search.js` file is a module that provides a fuzzy search engine for the `StackTrackr` application within the rEngine Core ecosystem. This module offers typo-tolerant, partial, and order-independent search utilities, enabling users to find relevant items even with imperfect search queries.

The fuzzy search functionality is crucial for improving the user experience by allowing them to easily locate items in the application's inventory, even if their search query doesn't exactly match the item's name or description.

## Key Functions/Classes

The `fuzzy-search.js` module exports the following key functions:

### `normalizeString(str, caseSensitive = false)`

- Normalizes a string by stripping special characters and optionally lowercasing the input.
- This function is used to prepare the search query and target strings for comparison.

### `tokenizeWords(str, caseSensitive = false)`

- Tokenizes a string into an array of individual words.
- This function is used to split the search query and target strings into their constituent words for more granular comparison.

### `generateNGrams(str, n = 2, caseSensitive = false)`

- Generates character n-grams (sequences of n consecutive characters) from a string.
- This function is used to create a set of n-grams for the search query and target strings, which are then used to calculate the n-gram similarity score.

### `calculateLevenshteinDistance(str1, str2)`

- Calculates the Levenshtein distance between two strings, which represents the minimum number of single-character edits (insertions, deletions, or substitutions) required to change one string into the other.
- This function is used to determine the similarity between the search query and the target string's substrings.

### `fuzzyMatch(query, target, options = {})`

- Calculates the fuzzy similarity between a search query and a target string, taking into account Levenshtein distance, n-gram similarity, and word-based similarity.
- This function returns a similarity score between 0 and 1, which can be used to determine whether a target string is a good match for the search query.

### `fuzzySearch(query, targets, options = {})`

- Performs a fuzzy search through an array of target strings and returns the best matches.
- This function calls the `fuzzyMatch` function for each target string and returns an array of objects containing the text and score for each match.

## Dependencies

The `fuzzy-search.js` module does not have any external dependencies. It is a self-contained module that can be used within the rEngine Core ecosystem.

## Usage Examples

Here are some examples of how to use the functions exported by the `fuzzy-search.js` module:

```javascript
// Normalize a string
const normalizedString = normalizeString("   Hello, World!   ");
console.log(normalizedString); // "hello world"

// Tokenize a string
const words = tokenizeWords("   Hello, World!   ");
console.log(words); // ["Hello", "World"]

// Generate n-grams
const ngrams = generateNGrams("Hello");
console.log(ngrams); // ["He", "El", "Ll", "Lo"]

// Calculate Levenshtein distance
const distance = calculateLevenshteinDistance("kitten", "sitting");
console.log(distance); // 3

// Perform a fuzzy match
const score = fuzzyMatch("Ame", "American Silver Eagle");
console.log(score); // ~0.7

// Perform a fuzzy search
const results = fuzzySearch("Eagle Amer", ["American Silver Eagle", "Canadian Maple Leaf", "Australian Kangaroo"]);
console.log(results);
// [
//   { text: "American Silver Eagle", score: ~0.8 },
//   { text: "Canadian Maple Leaf", score: 0 },
//   { text: "Australian Kangaroo", score: 0 }
// ]
```

## Configuration

The `fuzzy-search.js` module does not require any specific configuration or environment variables. However, the `fuzzyMatch` and `fuzzySearch` functions accept optional configuration options, such as:

- `threshold`: The minimum similarity score required for a match (default is 0.6)
- `caseSensitive`: Whether to perform case-sensitive matching (default is false)
- `maxResults`: The maximum number of results to return for a fuzzy search (default is Infinity)

These options can be passed as an object to the respective functions:

```javascript
const results = fuzzySearch("Eagle Amer", ["American Silver Eagle", "Canadian Maple Leaf", "Australian Kangaroo"], {
  threshold: 0.7,
  caseSensitive: true,
  maxResults: 2
});
```

## Integration Points

The `fuzzy-search.js` module is designed to be used within the rEngine Core ecosystem, specifically in the `StackTrackr` application. It provides a reusable fuzzy search functionality that can be integrated into other rEngine Core components that require a similar search mechanism.

## Troubleshooting

- **Invalid input types**: If the `fuzzyMatch` or `fuzzySearch` functions are called with non-string inputs, they will log a warning and return 0 as the score.
- **Unexpected errors**: If any unexpected errors occur within the `fuzzyMatch` function, it will log the error and return 0 as the score.

To address these issues, you can ensure that your application is providing valid string inputs to the fuzzy search functions, and handle any errors that may occur during the search process.
