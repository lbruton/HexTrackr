class ConversationBridge {
    constructor() {
        this.conversations = new Map();
        this.contextHistory = [];
    }

    async createConversation(id, context = {}) {
        const conversation = {
            id,
            created: new Date(),
            context,
            messages: [],
            metadata: {}
        };
        
        this.conversations.set(id, conversation);
        return conversation;
    }

    async addMessage(conversationId, message) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }

        const messageEntry = {
            timestamp: new Date(),
            content: message.content || message,
            role: message.role || "user",
            metadata: message.metadata || {}
        };

        conversation.messages.push(messageEntry);
        this.contextHistory.push({
            conversationId,
            message: messageEntry
        });

        return messageEntry;
    }

    async getConversation(conversationId) {
        return this.conversations.get(conversationId);
    }

    async getAllConversations() {
        return Array.from(this.conversations.values());
    }

    async getContextHistory(limit = 100) {
        return this.contextHistory.slice(-limit);
    }

    async bridgeToAI(provider, model, conversationId, message) {
        const conversation = await this.getConversation(conversationId);
        
        // Add context from conversation history
        let contextualMessage = message;
        if (conversation && conversation.messages.length > 0) {
            const recentMessages = conversation.messages.slice(-5);
            const context = recentMessages.map(m => `${m.role}: ${m.content}`).join("\n");
            contextualMessage = `Context:\n${context}\n\nCurrent: ${message}`;
        }

        return {
            provider,
            model,
            conversationId,
            message: contextualMessage,
            contextLength: conversation ? conversation.messages.length : 0
        };
    }

    async saveToMemory(conversationId, data) {
        const conversation = this.conversations.get(conversationId);
        if (conversation) {
            conversation.metadata = { ...conversation.metadata, ...data };
        }
    }
}

module.exports = { ConversationBridge };
