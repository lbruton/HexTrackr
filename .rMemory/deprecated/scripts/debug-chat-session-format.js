#!/usr/bin/env node

/**
 * 🔍 DEBUG: Chat Session Format Inspector
 * Debug what structure VS Code chat sessions actually have
 */

const fs = require("fs/promises");
const path = require("path");
const os = require("os");

class ChatFormatDebugger {
    constructor() {
        this.chatSessionsPath = path.join(
            os.homedir(),
            "Library/Application Support/Code/User/workspaceStorage"
        );
    }

    async findFirstChatSession() {
        try {
            const workspaces = await fs.readdir(this.chatSessionsPath);
            
            for (const workspace of workspaces) {
                const chatPath = path.join(this.chatSessionsPath, workspace, "chatSessions");
                
                try {
                    const stats = await fs.stat(chatPath);
                    if (stats.isDirectory()) {
                        const files = await fs.readdir(chatPath);
                        const jsonFiles = files.filter(f => f.endsWith(".json"));
                        
                        if (jsonFiles.length > 0) {
                            const filePath = path.join(chatPath, jsonFiles[0]);
                            return { workspace, file: jsonFiles[0], path: filePath };
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
            
            return null;
        } catch (error) {
            console.error("❌ Error finding chat sessions:", error.message);
            return null;
        }
    }

    async debugChatFormat() {
        console.log("🔍 DEBUG: Chat Session Format Inspector");
        console.log("=" .repeat(50));

        const session = await this.findFirstChatSession();
        if (!session) {
            console.log("❌ No chat sessions found");
            return;
        }

        console.log(`📁 Found session: ${session.workspace}/${session.file}`);
        
        try {
            const content = await fs.readFile(session.path, "utf8");
            const data = JSON.parse(content);
            
            console.log("\n📋 TOP-LEVEL STRUCTURE:");
            console.log("Keys:", Object.keys(data));
            
            console.log("\n📋 DATA STRUCTURE ANALYSIS:");
            
            if (data.requests) {
                console.log(`✅ Has 'requests' array: ${data.requests.length} items`);
                
                if (data.requests.length > 0) {
                    console.log("\n📋 FIRST REQUEST ITEM:");
                    const first = data.requests[0];
                    console.log("Keys:", Object.keys(first));
                    console.log("Sample:", JSON.stringify(first, null, 2).substring(0, 500) + "...");
                }
            } else {
                console.log("❌ No 'requests' array found");
            }
            
            if (data.responses) {
                console.log(`✅ Has 'responses' array: ${data.responses.length} items`);
            }
            
            // Look for other possible message containers
            for (const [key, value] of Object.entries(data)) {
                if (Array.isArray(value) && key !== "requests" && key !== "responses") {
                    console.log(`🔍 Found array '${key}': ${value.length} items`);
                    if (value.length > 0) {
                        console.log(`   Sample keys: ${Object.keys(value[0])}`);
                    }
                }
            }
            
        } catch (error) {
            console.error("❌ Error parsing chat session:", error.message);
        }
    }
}

// Run the debugger
const inspector = new ChatFormatDebugger();
inspector.debugChatFormat();
