#!/usr/bin/env node

// Simple test for Ollama integration
require("dotenv").config();

async function testOllama() {
    console.log("🧪 Testing Ollama Integration");
    
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "qwen2.5-coder:7b",
                prompt: "Hello! Please respond with exactly: \"Ollama is working correctly\"",
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Ollama Response:", result.response.trim());
        console.log("📊 Tokens:", result.eval_count, "Time:", Math.round(result.eval_duration/1000000) + "ms");
        
    } catch (error) {
        console.error("❌ Ollama Test Failed:", error.message);
    }
}

testOllama();
