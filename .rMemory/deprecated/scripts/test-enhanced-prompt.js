#!/usr/bin/env node

// Test the enhanced prompt with real chat data
require("dotenv").config();
const fetch = require("node-fetch").default || require("node-fetch");

async function testEnhancedPrompt() {
    console.log("🧪 Testing Enhanced Prompt");
    
    const testChatData = {
        file: "test-session-123.json",
        workspace: "HexTrackr-workspace",
        content: `{
            "messages": [
                {"role": "user", "content": "I'm having trouble with the ESLint configuration in my Node.js project. The fetch API isn't being recognized."},
                {"role": "assistant", "content": "This is a common issue in Node.js environments. You need to either import node-fetch or add fetch to your ESLint globals configuration."},
                {"role": "user", "content": "Great! That fixed it. Now I need to set up automated testing for my memory system scripts."},
                {"role": "assistant", "content": "For your .rMemory scripts, I recommend adding Jest with proper mocking for the Ollama API calls."}
            ]
        }`
    };

    const prompt = `🧠 REAL-TIME MEMORY ANALYSIS - HexTrackr .rMemory Scribe

You are a sophisticated AI scribe within the HexTrackr .rMemory system. Analyze this VS Code chat session:

## 📊 ANALYSIS FRAMEWORK

### PROJECT CLASSIFICATION
Determine if this is: HexTrackr, StackTrackr, rMemory Legacy, or General Development

### TECHNICAL INSIGHT EXTRACTION  
- Code changes and technical decisions
- Dependencies and tools mentioned
- Architecture implications

### FRUSTRATION PATTERN DETECTION
- Technical blockers encountered
- Process inefficiencies
- Knowledge gaps

## 🎯 SESSION DATA

WORKSPACE: ${testChatData.workspace}
SESSION FILE: ${testChatData.file}

CHAT CONTENT:
${testChatData.content}

## 📝 OUTPUT

Provide analysis in this format:

**PROJECT CLASSIFICATION:** [Project type]

**TECHNICAL SUMMARY:**
- Main topics
- Code changes
- Decisions made

**FRUSTRATION ANALYSIS:**
- Pain points
- Root causes  
- Solutions applied

**NEXT STEPS:**
- Immediate actions
- Follow-up items

Keep detailed but focused.`;

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "qwen2.5-coder:7b",
                prompt: prompt,
                stream: false
            })
        });

        const result = await response.json();
        console.log("✅ Enhanced Analysis Result:");
        console.log("=" * 60);
        console.log(result.response);
        console.log("=" * 60);
        console.log("📊 Stats:", result.eval_count, "tokens,", Math.round(result.eval_duration/1000000) + "ms");
        
    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
}

testEnhancedPrompt();
