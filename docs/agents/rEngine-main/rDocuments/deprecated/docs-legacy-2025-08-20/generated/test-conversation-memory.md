# rEngine Core: `test-conversation-memory.sh` Documentation

## Purpose & Overview

The `test-conversation-memory.sh` script is a shell script that is used to test the conversation memory functionality of the rEngineMCP (rEngine Memory and Conversation Persistence) component within the rEngine Core ecosystem. This script ensures that the conversation memory system is working as expected, by creating a test conversation session, saving it to a file, and then verifying that the conversation was successfully recorded.

## Key Functions/Classes

The script performs the following key functions:

1. **Connectivity Test**: Checks if the rEngine plugin is responding and able to receive JSON-RPC requests.
2. **Conversation Memory Test**: Creates a test conversation session, sends a message, and verifies that the conversation was saved to a file.
3. **File Verification**: Checks if the conversation memory file exists and displays the last recorded exchange.

## Dependencies

The `test-conversation-memory.sh` script has the following dependencies:

- `node` (installed at `/opt/homebrew/bin/node`) - The Node.js runtime used to execute the rEngine Core's JavaScript-based application.
- `jq` - A command-line JSON processor used to parse the JSON responses from the rEngine Core.
- Access to the rEngine Core's index.js file located at `/Volumes/DATA/GitHub/rEngine/rEngine/index.js`.

## Usage Examples

To run the `test-conversation-memory.sh` script, follow these steps:

1. Ensure that you have the necessary dependencies installed and configured.
2. Navigate to the directory where the `test-conversation-memory.sh` script is located.
3. Run the script using the following command:

```bash
./test-conversation-memory.sh
```

The script will output the results of the various tests, including the connectivity check, the conversation memory test, and the file verification.

## Configuration

The `test-conversation-memory.sh` script does not require any specific configuration. However, it assumes that the rEngine Core's index.js file is located at `/Volumes/DATA/GitHub/rEngine/rEngine/index.js` and that the `node` executable is available at `/opt/homebrew/bin/node`.

If your environment differs, you may need to update the script accordingly.

## Integration Points

The `test-conversation-memory.sh` script is designed to test the conversation memory functionality of the rEngineMCP component within the rEngine Core ecosystem. It interacts with the rEngine Core's JSON-RPC API to create a test conversation session and verify that the conversation is saved to a file.

The script can be used as a part of the rEngine Core's overall testing and quality assurance process, ensuring that the conversation memory system is working as expected.

## Troubleshooting

If the `test-conversation-memory.sh` script encounters any issues, you can try the following troubleshooting steps:

1. **Verify Dependencies**: Ensure that you have the necessary dependencies installed and configured correctly (Node.js and `jq`).
2. **Check File Paths**: Verify that the paths to the rEngine Core's index.js file and the conversation memory file are correct.
3. **Examine Output**: Review the output of the script to identify any error messages or unexpected behavior.
4. **Consult rEngine Core Documentation**: Refer to the rEngine Core documentation for more information on the conversation memory system and how to troubleshoot any issues.

If you continue to experience issues, you may need to reach out to the rEngine Core development team for further assistance.
