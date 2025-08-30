const axios = require("axios");

class AIProviderManager {
    constructor() {
        this.providers = {
            ollama: {
                endpoint: "http://localhost:11434",
                status: "unknown",
                models: []
            },
            openai: {
                endpoint: "https://api.openai.com/v1",
                status: "unknown",
                models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"]
            },
            google: {
                endpoint: "https://generativelanguage.googleapis.com/v1beta",
                status: "unknown",
                models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"]
            },
            anthropic: {
                endpoint: "https://api.anthropic.com/v1",
                status: "unknown",
                models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"]
            },
            groq: {
                endpoint: "https://api.groq.com/openai/v1",
                status: "unknown",
                models: ["llama-3.1-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"]
            }
        };
    }

    async checkProviderStatus() {
        const results = {};
        
        for (const [name, provider] of Object.entries(this.providers)) {
            try {
                if (name === "ollama") {
                    const response = await axios.get(`${provider.endpoint}/api/tags`, { timeout: 2000 });
                    results[name] = {
                        status: "online",
                        models: response.data.models || []
                    };
                } else {
                    // For external APIs, we can't easily check without API keys
                    // So we mark them as available but requiring auth
                    results[name] = {
                        status: "requires_auth",
                        models: provider.models
                    };
                }
            } catch (error) {
                results[name] = {
                    status: "offline",
                    models: [],
                    error: error.message
                };
            }
        }
        
        return results;
    }

    async getAvailableModels() {
        const status = await this.checkProviderStatus();
        const models = [];
        
        for (const [provider, data] of Object.entries(status)) {
            if (data.status === "online" || data.status === "requires_auth") {
                data.models.forEach(model => {
                    models.push({
                        provider,
                        model: typeof model === "string" ? model : model.name,
                        status: data.status
                    });
                });
            }
        }
        
        return models;
    }

    async queryProvider(provider, model, message, options = {}) {
        if (provider === "ollama") {
            return this.queryOllama(model, message, options);
        }
        
        throw new Error(`Provider ${provider} not implemented yet`);
    }

    async queryOllama(model, message, options = {}) {
        try {
            const response = await axios.post("http://localhost:11434/api/generate", {
                model: model,
                prompt: message,
                stream: false,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    ...options
                }
            }, {
                timeout: 30000
            });

            return {
                success: true,
                response: response.data.response,
                model: model,
                provider: "ollama"
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                model: model,
                provider: "ollama"
            };
        }
    }

    async initializeProviders() {
        console.log("🔌 Initializing AI providers...");
        const status = await this.checkProviderStatus();
        console.log("📊 Provider status:", status);
        return status;
    }
}

module.exports = AIProviderManager;
