# Conversation Bridge

## Purpose & Overview

The `ConversationBridge` class provides a centralized mechanism for managing and bridging conversations between a user and an AI-powered system. It serves as a layer of abstraction, handling the creation, storage, and retrieval of conversations, as well as the integration with the AI provider and model.

The main goals of this script are:

1. **Conversation Management**: Facilitate the creation, storage, and retrieval of conversations, allowing for seamless tracking and access to conversation history.
2. **Context Preservation**: Maintain and provide relevant context from previous messages within a conversation, enabling the AI system to better understand and respond to the user's current input.
3. **AI Integration**: Provide a standardized interface for bridging user messages to the AI provider and model, handling the necessary formatting and enrichment of the message with contextual information.
4. **Metadata Storage**: Allow for the storage of additional metadata associated with each conversation, enabling further customization and integration with other systems.

By using the `ConversationBridge` class, developers can simplify the management of user-AI interactions, focus on the core functionality of their application, and ensure consistent and reliable conversation handling across their system.

## Technical Architecture

The `ConversationBridge` class consists of the following key components:

1. **Conversation Management**:
   - `conversations`: A `Map` that stores individual conversations, indexed by their unique IDs.
   - `contextHistory`: An array that maintains a history of the messages exchanged within all conversations.

1. **Conversation Operations**:
   - `createConversation`: Initializes a new conversation with a unique ID and optional context.
   - `addMessage`: Appends a new message to an existing conversation and updates the context history.
   - `getConversation`: Retrieves a specific conversation by its ID.
   - `getAllConversations`: Returns an array of all active conversations.
   - `getContextHistory`: Retrieves the context history, optionally limiting the number of entries.

1. **AI Integration**:
   - `bridgeToAI`: Prepares the message for the AI provider by adding relevant context from the conversation history.

1. **Metadata Management**:
   - `saveToMemory`: Allows storing additional metadata associated with a conversation.

The data flow within the `ConversationBridge` class can be summarized as follows:

1. A new conversation is created using `createConversation`.
2. Messages are added to the conversation using `addMessage`, which also updates the context history.
3. When bridging a message to the AI provider, `bridgeToAI` is called, which retrieves the relevant conversation and appends the contextual information.
4. Optionally, additional metadata can be associated with a conversation using `saveToMemory`.

## Dependencies

The `ConversationBridge` class does not have any external dependencies. It is a self-contained implementation that can be used within a larger system.

## Key Functions/Classes

### `ConversationBridge` Class

The `ConversationBridge` class is the central component of this script.

#### Constructor

```javascript
constructor()
```

Initializes a new instance of the `ConversationBridge` class, setting up the internal data structures for managing conversations and the context history.

#### `createConversation`

```javascript
async createConversation(id, context = {})
```

- **Parameters**:
  - `id` (string): A unique identifier for the conversation.
  - `context` (object, optional): An initial context object to associate with the conversation.
- **Returns**: A new conversation object with the provided ID and context.

Creates a new conversation with the specified ID and optional initial context.

#### `addMessage`

```javascript
async addMessage(conversationId, message)
```

- **Parameters**:
  - `conversationId` (string): The unique identifier of the conversation to which the message should be added.
  - `message` (object | string): The message to be added to the conversation. Can be an object with `content`, `role`, and `metadata` properties, or a simple string representing the message content.
- **Returns**: The added message entry, including the timestamp, content, role, and metadata.

Adds a new message to the specified conversation and updates the context history.

#### `getConversation`

```javascript
async getConversation(conversationId)
```

- **Parameters**:
  - `conversationId` (string): The unique identifier of the conversation to retrieve.
- **Returns**: The conversation object with the specified ID, or `undefined` if the conversation is not found.

Retrieves a specific conversation by its ID.

#### `getAllConversations`

```javascript
async getAllConversations()
```

- **Returns**: An array of all active conversation objects.

Retrieves an array of all conversations managed by the `ConversationBridge` instance.

#### `getContextHistory`

```javascript
async getContextHistory(limit = 100)
```

- **Parameters**:
  - `limit` (number, optional): The maximum number of context history entries to retrieve (default is 100).
- **Returns**: An array of the most recent context history entries, up to the specified limit.

Retrieves the context history, which includes the conversation ID and message details for the most recent interactions.

#### `bridgeToAI`

```javascript
async bridgeToAI(provider, model, conversationId, message)
```

- **Parameters**:
  - `provider` (string): The name or identifier of the AI provider.
  - `model` (string): The name or identifier of the AI model to use.
  - `conversationId` (string): The unique identifier of the conversation.
  - `message` (string): The user's message to be sent to the AI system.
- **Returns**: An object containing the provider, model, conversation ID, the contextual message, and the length of the conversation history.

Prepares the user's message by adding relevant context from the conversation history, enabling the AI system to better understand and respond to the current input.

#### `saveToMemory`

```javascript
async saveToMemory(conversationId, data)
```

- **Parameters**:
  - `conversationId` (string): The unique identifier of the conversation.
  - `data` (object): Additional metadata to be associated with the conversation.

Stores additional metadata associated with the specified conversation.

## Usage Examples

1. Creating a new conversation:

```javascript
const bridge = new ConversationBridge();
const conversation = await bridge.createConversation('123', { userId: 'user-001' });
console.log(conversation);
```

1. Adding a message to a conversation:

```javascript
const messageEntry = await bridge.addMessage('123', {
  content: 'Hello, how are you?',
  role: 'user',
  metadata: { device: 'mobile' }
});
console.log(messageEntry);
```

1. Retrieving a conversation:

```javascript
const conversation = await bridge.getConversation('123');
console.log(conversation);
```

1. Bridging a message to the AI system:

```javascript
const aiResponse = await bridge.bridgeToAI('openai', 'gpt-3.5-turbo', '123', 'What is the capital of France?');
console.log(aiResponse);
```

1. Storing additional metadata for a conversation:

```javascript
await bridge.saveToMemory('123', { priority: 'high' });
```

## Configuration

The `ConversationBridge` class does not require any specific configuration options or environment variables. It is designed to be a self-contained component that can be easily integrated into a larger system.

## Error Handling

The `ConversationBridge` class handles the following errors:

- `Error('Conversation ${conversationId} not found')`: Thrown when attempting to access a conversation that does not exist.

These errors can be caught and handled by the calling code as needed.

## Integration

The `ConversationBridge` class is designed to be a standalone component that can be easily integrated into a larger system. It can be used as part of a chatbot, virtual assistant, or any other application that requires the management and bridging of user-AI conversations.

To integrate the `ConversationBridge` into your system, you can simply create an instance of the class and use its methods to manage conversations and bridge messages to the AI provider. The class does not have any external dependencies, making it easy to include in your project.

## Development Notes

- The `ConversationBridge` class uses a `Map` to store conversations, which provides efficient lookup and access to individual conversations.
- The `contextHistory` array is used to maintain a record of all messages exchanged across conversations, enabling the retrieval of recent context for a given conversation.
- The `bridgeToAI` method is responsible for preparing the user's message by adding relevant context from the conversation history. This ensures that the AI system has the necessary information to provide a more contextual and relevant response.
- The `saveToMemory` method allows for the storage of additional metadata associated with a conversation, enabling further customization and integration with other systems.
- The class is designed to be asynchronous, allowing for efficient and non-blocking operation in a concurrent environment.

Overall, the `ConversationBridge` class provides a robust and extensible foundation for managing user-AI conversations, making it a valuable component in the development of conversational applications.
