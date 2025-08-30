# Fuzzy Search Engine

## Purpose & Overview

The `fuzzy-search.js` script provides a set of utilities for performing typo-tolerant, partial, and order-independent search functionality. This module is designed to be used as part of the larger StackTrackr application, where it powers the search capabilities.

The key features of this script include:

- **Normalization**: Stripping special characters and optionally converting to lowercase for case-insensitive searches.
- **Tokenization**: Breaking input strings into individual words for more precise matching.
- **N-Gram Generation**: Creating character n-grams (2-grams and 3-grams) to capture partial word matches.
- **Levenshtein Distance**: Calculating the edit distance between strings to find the best substring match.
- **Fuzzy Matching**: Combining the above techniques to calculate a similarity score between a search query and a target string.
- **Fuzzy Search**: Performing a fuzzy search over an array of target strings and returning the top matches.

This script aims to provide a robust and flexible search experience, allowing users to find relevant items even with typos or partial search queries.

## Technical Architecture

The `fuzzy-search.js` script is organized into several key components:

1. **Normalization Functions**:
   - `normalizeString`: Removes diacritics, special characters, and optionally converts to lowercase.
   - `tokenizeWords`: Splits a string into individual words.
   - `generateNGrams`: Generates character n-grams (2-grams and 3-grams) from a string.

1. **Distance Calculation**:
   - `calculateLevenshteinDistance`: Computes the Levenshtein edit distance between two strings.

1. **Fuzzy Matching**:
   - `fuzzyMatch`: Calculates a fuzzy similarity score between a search query and a target string, using a combination of Levenshtein distance, n-gram similarity, and word-based similarity.

1. **Fuzzy Search**:
   - `fuzzySearch`: Performs a fuzzy search over an array of target strings and returns the top matching results.

The data flow within the script is as follows:

1. The user provides a search query and a set of target strings.
2. The `fuzzySearch` function is called with the query and targets.
3. For each target string, the `fuzzyMatch` function is used to calculate a similarity score between the query and the target.
4. The results are sorted by the similarity score and the top matches are returned.

## Dependencies

This script does not have any external dependencies. All the functionality is contained within the provided code.

## Key Functions/Classes

### `normalizeString(str, caseSensitive = false)`

**Purpose**: Normalize a string by stripping special characters and optionally lowercasing.

**Parameters**:

- `str` (string): The input string to be normalized.
- `caseSensitive` (boolean, optional): If `true`, preserves the case of the input string. Default is `false`.

**Returns**:

- (string): The normalized string.

### `tokenizeWords(str, caseSensitive = false)`

**Purpose**: Tokenize a string into individual words.

**Parameters**:

- `str` (string): The input string to be tokenized.
- `caseSensitive` (boolean, optional): If `true`, preserves the case of the tokens. Default is `false`.

**Returns**:

- (string[]): An array of words.

### `generateNGrams(str, n = 2, caseSensitive = false)`

**Purpose**: Generate character n-grams from a string.

**Parameters**:

- `str` (string): The input string to generate n-grams from.
- `n` (number, optional): The length of the n-grams. Default is `2`.
- `caseSensitive` (boolean, optional): If `true`, preserves the case of the n-grams. Default is `false`.

**Returns**:

- (string[]): An array of n-grams.

### `calculateLevenshteinDistance(str1, str2)`

**Purpose**: Calculate the Levenshtein distance between two strings.

**Parameters**:

- `str1` (string): The first string.
- `str2` (string): The second string.

**Returns**:

- (number): The Levenshtein edit distance between the two strings.

### `fuzzyMatch(query, target, options = {})`

**Purpose**: Calculate the fuzzy similarity between a search query and a target string.

**Parameters**:

- `query` (string): The user's search input.
- `target` (string): The item name to match against.
- `options` (object, optional):
  - `threshold` (number, optional): The minimum similarity score for a match. Default is `0.6`.
  - `caseSensitive` (boolean, optional): If `true`, performs case-sensitive matching. Default is `false`.

**Returns**:

- (number): The similarity score between 0 and 1.

### `fuzzySearch(query, targets, options = {})`

**Purpose**: Perform a fuzzy search over an array of target strings and return the top matches.

**Parameters**:

- `query` (string): The user's search input.
- `targets` (string[]): The array of strings to search.
- `options` (object, optional):
  - `threshold` (number, optional): The minimum similarity score for a match. Default is `0.6`.
  - `maxResults` (number, optional): The maximum number of results to return. Default is `Infinity`.
  - `caseSensitive` (boolean, optional): If `true`, performs case-sensitive matching. Default is `false`.

**Returns**:

- (object[]): An array of objects with `text` (the matching string) and `score` (the similarity score).

## Usage Examples

### Fuzzy Matching

```javascript
fuzzyMatch("Ame", "American Silver Eagle"); // returns ~0.7
fuzzyMatch("Eagle Amer", "American Silver Eagle"); // returns ~0.8
```

### Fuzzy Search

```javascript
const targets = [
  "American Silver Eagle",
  "Canadian Maple Leaf",
  "Silver Britannia",
  "Silver Philharmonic",
];

fuzzySearch("Eagle Ame", targets, { maxResults: 2 });
// returns [
//   { text: "American Silver Eagle", score: 0.8 },
//   { text: "Canadian Maple Leaf", score: 0.4 }
// ]
```

## Configuration

This script does not require any external configuration. The only configuration options are passed as parameters to the `fuzzyMatch` and `fuzzySearch` functions:

- `threshold`: The minimum similarity score for a match (default is `0.6`).
- `caseSensitive`: Whether to perform case-sensitive matching (default is `false`).
- `maxResults`: The maximum number of results to return for `fuzzySearch` (default is `Infinity`).

## Error Handling

The `fuzzyMatch` function includes a try-catch block to handle any errors that may occur during the fuzzy matching process. If an error is encountered, the function will log the error and return a similarity score of `0` as a safe fallback.

## Integration

The `fuzzy-search.js` script is designed to be integrated into the larger StackTrackr application, where it can be used to provide a powerful and flexible search experience for users. The script exports its key functions for use in other parts of the application, both in Node.js and in the browser.

## Development Notes

- The script uses the Levenshtein distance algorithm to find the best substring match between the query and the target string. This approach is effective for handling typos and partial matches.
- The combination of Levenshtein distance, n-gram similarity, and word-based similarity provides a well-rounded fuzzy matching strategy that balances precision and recall.
- The `fuzzySearch` function sorts the results by the similarity score, ensuring that the most relevant matches are returned first.
- The script is designed to be modular and extensible, allowing for easy integration into different parts of the StackTrackr application.
- The code includes comments and documentation to ensure that the functionality and usage are clear to other developers working on the project.

Overall, this `fuzzy-search.js` script is a robust and flexible search utility that can significantly enhance the user experience of the StackTrackr application.
