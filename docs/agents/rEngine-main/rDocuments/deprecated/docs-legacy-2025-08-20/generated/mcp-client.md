# `mcp-client.js` - rEngine Core Memory Management Client

## Purpose & Overview

The `mcp-client.js` file is a part of the rEngine Core platform, and it provides a client-side interface for interacting with the Memory Control Plane (MCP) component. The MCP is responsible for managing the storage and retrieval of memory objects within the rEngine Core ecosystem. The `mcp-client.js` file exports a single function, `addMemory`, which allows developers to add new memory objects to the MCP.

## Key Functions/Classes

### `addMemory(title, description, type)`

The `addMemory` function is the main component of this file. It has the following parameters:

- `title`: A string representing the title of the memory object.
- `description`: A string representing the description of the memory object.
- `type`: A string representing the type of the memory object.

The function sends a POST request to the MCP's `add` endpoint with the provided memory object data, and it handles any errors that may occur during the request.

## Dependencies

The `mcp-client.js` file depends on the following external module:

- `node-fetch`: This module is used to make HTTP requests from the Node.js environment.

## Usage Examples

Here's an example of how to use the `addMemory` function:

```javascript
import { addMemory } from './mcp-client';

async function createMemory() {
    try {
        await addMemory('My First Memory', 'This is a description of my first memory.', 'personal');
        console.log('Memory added successfully!');
    } catch (error) {
        console.error('Failed to add memory:', error);
    }
}

createMemory();
```

## Configuration

The `mcp-client.js` file does not require any specific configuration. However, the `addMemory` function assumes that the MCP is running on `http://localhost:3036/add`. If the MCP is running on a different URL, you'll need to update the `url` variable in the `addMemory` function accordingly.

## Integration Points

The `mcp-client.js` file is part of the rEngine Core platform and is designed to integrate with the Memory Control Plane (MCP) component. It provides a convenient way for other rEngine Core components or applications to interact with the MCP and add new memory objects.

## Troubleshooting

**Problem**: The `addMemory` function fails to add a new memory object.
**Solution**: Check the following:

1. Ensure that the MCP is running and accessible at the expected URL (`http://localhost:3036/add`).
2. Verify that the memory object data (title, description, and type) is valid and formatted correctly.
3. Check the error message logged in the console for any additional information about the failure.
4. Ensure that the `node-fetch` dependency is installed and imported correctly.

If the issue persists, you may need to investigate the MCP component or the overall rEngine Core platform for any potential issues.
