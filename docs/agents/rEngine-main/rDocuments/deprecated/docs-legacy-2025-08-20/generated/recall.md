# rEngine Core: `recall.js` Documentation

## Purpose & Overview

The `recall.js` file is a part of the rEngine Core ecosystem, providing a fast and efficient memory lookup mechanism for intelligent agents. This script allows agents to quickly search and retrieve relevant information from various sources within the rEngine Core platform, including extended context, agent memory, and tasks.

The primary purpose of `recall.js` is to enable agents to instantly access and recall relevant data, facilitating efficient decision-making and task completion. By leveraging this powerful lookup tool, agents can enhance their overall intelligence and responsiveness within the rEngine Core environment.

## Key Functions/Classes

The `recall.js` file contains the following key functions:

1. **`fastRecall(query)`**:
   - This is the main function that performs the memory lookup based on the provided search query.
   - It searches through various data sources (extended context, agent memory, tasks) and returns a list of relevant results.
   - The function calculates the relevance of each result based on the search query and sorts the results accordingly.
   - It then displays the top 5 results along with additional metadata (source, date, status, content preview).

1. **`calculateRelevance(query, text)`**:
   - This function is responsible for calculating the relevance score of a given text based on the provided search query.
   - It considers exact matches, as well as partial word matches, to determine the overall relevance.
   - The relevance score is a value between 0 and 1, with 1 representing a perfect match.

## Dependencies

The `recall.js` file relies on the following dependencies:

- **Node.js**: The script is designed to run as a standalone Node.js application.
- **Node.js built-in modules**:
  - `fs/promises`: For asynchronous file system operations.
  - `path`: For handling file paths.
  - `url`: For converting file URLs to file paths.

## Usage Examples

To use the `recall.js` script, follow these steps:

1. Ensure you have Node.js installed on your system.
2. Open a terminal or command prompt and navigate to the `rEngine` directory.
3. Run the script with a search query as an argument:

```bash
node recall.js "search term"
```

This will initiate the fast recall process and display the top 5 relevant results.

You can also run the script in silent mode (without console output) by adding the `--silent` flag:

```bash
node recall.js "search term" --silent
```

This mode is useful for integrating the `recall.js` script into a larger system, such as the rEngine Core platform.

## Configuration

The `recall.js` script does not require any specific configuration files or environment variables. It relies on the file paths defined within the script to locate the necessary data sources (extended context, agent memory, tasks).

## Integration Points

The `recall.js` script is designed to be integrated into the larger rEngine Core platform. It serves as a crucial component for enabling intelligent agents to quickly retrieve relevant information from the platform's memory and knowledge base.

Other rEngine Core components, such as the agent management system or the task scheduling module, can utilize the `fastRecall` function to provide agents with instant access to their memories and past experiences, enhancing their overall decision-making and problem-solving capabilities.

## Troubleshooting

1. **No matches found**:
   - If the search query does not yield any relevant results, the script will display the message "❌ No matches found" along with a suggestion to try broader terms or check the spelling.
   - This may occur if the data sources (extended context, agent memory, tasks) do not contain information related to the search query.

1. **Recall failed**:
   - If an error occurs during the recall process, the script will display the message "❌ Recall failed: {error.message}".
   - This could happen if the script encounters issues accessing the required data sources, such as file read/write errors or corrupted data.

1. **Missing data sources**:
   - The script expects the data sources (extended context, agent memory, tasks) to be available at the specified file paths.
   - If any of these data sources are missing or the file paths are incorrect, the script will skip that data source and continue the search with the remaining sources.
   - Ensure that the necessary data files are present and the file paths are correctly configured within the `recall.js` script.

By addressing these potential issues and ensuring the availability of the required data sources, you can optimize the performance and reliability of the `recall.js` script within the rEngine Core platform.
