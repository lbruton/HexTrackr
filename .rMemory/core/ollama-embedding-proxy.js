#!/usr/bin/env node
/**
 * OpenAI Embedding API Proxy for Memento MCP
 * Translates OpenAI embedding requests to local Ollama nomic-embed-text
 * 
 * This proxy allows Memento MCP to use local embeddings instead of OpenAI
 * by implementing the OpenAI embeddings API specification with Ollama backend
 */

const express = require("express");
const { spawn } = require("child_process");
const app = express();

// Configuration
const PORT = process.env.EMBEDDING_PROXY_PORT || 3001;
const OLLAMA_HOST = process.env.OLLAMA_HOST || "localhost";
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const EMBEDDING_MODEL = "nomic-embed-text:latest";

// Expected dimensions for nomic-embed-text
const EMBEDDING_DIMENSIONS = 768;

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "healthy", 
        service: "ollama-embedding-proxy",
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
        timestamp: new Date().toISOString()
    });
});

// OpenAI compatible embedding endpoint
app.post("/v1/embeddings", async (req, res) => {
    try {
        console.log(`🔗 Embedding request received for ${req.body.input?.length || 1} text(s)`);
        
        const { input } = req.body;
        
        if (!input) {
            return res.status(400).json({
                error: {
                    message: "Input is required",
                    type: "invalid_request_error"
                }
            });
        }
        
        // Handle both string and array inputs
        const texts = Array.isArray(input) ? input : [input];
        const embeddings = [];
        
        // Process each text
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            console.log(`   📝 Processing text ${i + 1}/${texts.length}: "${text.substring(0, 100)}..."`);
            
            const embedding = await generateEmbedding(text);
            if (embedding) {
                embeddings.push({
                    object: "embedding",
                    index: i,
                    embedding: embedding
                });
            } else {
                console.warn(`   ⚠️  Failed to generate embedding for text ${i + 1}`);
                return res.status(500).json({
                    error: {
                        message: "Failed to generate embedding",
                        type: "api_error"
                    }
                });
            }
        }
        
                // Return OpenAI-compatible response
        const response = {
            object: "list",
            data: embeddings,
            model: "nomic-embed-text",
            usage: {
                prompt_tokens: inputArray.join(" ").length,
                total_tokens: inputArray.join(" ").length
            }
        };
        
        console.log(`   ✅ Generated ${embeddings.length} embeddings (768D each)`);
        res.json(response);
        
    } catch (error) {
        console.error("   ❌ Error in embedding endpoint:", error.message);
        res.status(500).json({
            error: {
                message: "Failed to generate embeddings",
                type: "api_error"
            }
        });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "healthy",
        service: "ollama-embedding-proxy",
        model: "nomic-embed-text:latest"
    });
});

// Start server
app.listen(PORT, () => {
    console.log("🚀 Ollama Embedding Proxy Server");
    console.log(`   📍 Port: ${PORT}`);
    console.log("   🎯 Target: Ollama nomic-embed-text (localhost:11434)");
    console.log("   🔗 API: OpenAI-compatible /v1/embeddings");
    console.log("   📊 Dimensions: 768 (nomic-embed-text native)");
    console.log(`   💡 Use: Configure Memento MCP to use http://localhost:${PORT}/v1`);
    console.log("   ✅ Ready for requests");
});

// Generate embedding using Ollama
async function generateEmbedding(text) {
    return new Promise((resolve) => {
        const requestData = {
            model: EMBEDDING_MODEL,
            prompt: text
        };
        
        const curl = spawn("curl", [
            "-s",
            "-X", "POST",
            `http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/embeddings`,
            "-H", "Content-Type: application/json",
            "-d", JSON.stringify(requestData)
        ]);
        
        let output = "";
        let errorOutput = "";
        
        curl.stdout.on("data", (data) => {
            output += data.toString();
        });
        
        curl.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });
        
        curl.on("close", (code) => {
            if (code === 0 && output.trim()) {
                try {
                    const response = JSON.parse(output);
                    if (response.embedding && Array.isArray(response.embedding)) {
                        console.log(`      🧮 Generated ${response.embedding.length}D embedding`);
                        resolve(response.embedding);
                    } else {
                        console.warn("      ⚠️  Invalid embedding response format");
                        resolve(null);
                    }
                } catch (parseError) {
                    console.warn(`      ⚠️  Failed to parse embedding: ${parseError.message}`);
                    resolve(null);
                }
            } else {
                console.warn(`      ❌ Curl failed: ${errorOutput}`);
                resolve(null);
            }
        });
        
        curl.on("error", (error) => {
            console.warn(`      ❌ Curl process error: ${error.message}`);
            resolve(null);
        });
    });
}

// Handle models endpoint (for compatibility)
app.get("/v1/models", (req, res) => {
    res.json({
        object: "list",
        data: [
            {
                id: EMBEDDING_MODEL,
                object: "model",
                created: Math.floor(Date.now() / 1000),
                owned_by: "ollama-local",
                permission: [],
                root: EMBEDDING_MODEL,
                parent: null
            }
        ]
    });
});

// Start the proxy server
app.listen(PORT, () => {
    console.log(`🚀 OpenAI Embedding API Proxy started on port ${PORT}`);
    console.log(`📡 Proxying to Ollama at ${OLLAMA_HOST}:${OLLAMA_PORT}`);
    console.log(`🤖 Using model: ${EMBEDDING_MODEL}`);
    console.log(`📐 Embedding dimensions: ${EMBEDDING_DIMENSIONS}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Embeddings API: http://localhost:${PORT}/v1/embeddings`);
    console.log("");
    console.log("🎯 Configure Memento MCP to use:");
    console.log(`   OPENAI_API_BASE_URL=http://localhost:${PORT}/v1`);
    console.log("   OPENAI_API_KEY=dummy-key-not-used");
    console.log("");
});

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down embedding proxy...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down embedding proxy...");
    process.exit(0);
});
