#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console */

/**
 * HexTrackr Memory Hook Handler
 * Generates contextual reminders for Claude to save discoveries to Memento
 * Called by Claude Code hooks to ensure consistent memory capture
 */

// const fs = require("fs"); // Unused - reserved for future use
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const eventType = args[0] || "unknown";

// Get environment context if available
// const toolInfo = process.env.CLAUDE_TOOL_INFO || "{}"; // Unused - reserved for future use
const fileName = process.env.CLAUDE_FILE_PATH || "";

/**
 * Generate appropriate reminder based on event type
 */
function generateReminder(type) {
    const timestamp = new Date().toISOString();
    
    switch(type) {
        case "post-edit":
            if (fileName) {
                const baseName = path.basename(fileName);
                const dirName = path.dirname(fileName);
                return `📝 SAVE-EDIT: Modified ${baseName} in ${dirName}\n` +
                       "   → Save any patterns, fixes, or discoveries about this file to Memento\n" +
                       "   → Include: What changed, why, and what you learned\n" +
                       "   → Classification: HEXTRACKR:CODE:[COMPONENT]";
            }
            return "📝 SAVE-EDIT: File modified\n" +
                   "   → Document the change pattern to Memento with timestamp";
            
        case "post-create":
            if (fileName) {
                return `✨ SAVE-CREATE: New file ${path.basename(fileName)}\n` +
                       "   → Document the file's purpose and architecture to Memento\n" +
                       "   → Include design decisions and patterns used";
            }
            return "✨ SAVE-CREATE: New file created - document its purpose";
            
        case "discovery":
            return "🔍 SAVE-DISCOVERY: Pattern or insight detected\n" +
                   "   → Create Memento entity with classification\n" +
                   "   → Include implementation details and use cases";
            
        case "bug-fix":
            return "⚡ SAVE-FIX: Bug resolved\n" +
                   "   → Document root cause and solution to Memento\n" +
                   "   → Classification: HEXTRACKR:BUG:[AREA]";
            
        case "context-75":
            return "⚠️ CONTEXT-75%: Memory checkpoint needed!\n" +
                   "   → Save full conversation context to Memento NOW\n" +
                   "   → Include: All discoveries, patterns, decisions, code changes\n" +
                   "   → Use entity type: PROJECT:DEVELOPMENT:CONTEXT\n" +
                   "   → This preserves everything before potential compacting";
            
        case "context-90":
            return "🚨 CONTEXT-90%: Decision point reached!\n" +
                   "   Options:\n" +
                   "   [1] Continue with compacting (safe - already saved at 75%)\n" +
                   "   [2] Create handoff with /save-handoff for seamless continuation\n" +
                   "   [3] Wrap up session and save final insights\n" +
                   "   → Choose based on task completion status\n" +
                   "   🦉 Note: Run /athena-extract after session ends to preserve in library";
            
        case "session-end":
            return "💾 SESSION-END: Capture session value\n" +
                   "   → Use /save-insights for key discoveries\n" +
                   "   → Use /save-conversation for full context\n" +
                   `   → Timestamp: ${timestamp}\n` +
                   "   🦉 Remember: /athena-extract will preserve this session in the library";
            
        default:
            return "🧠 MEMORY-HOOK: Remember to save important discoveries to Memento";
    }
}

/**
 * Check if this is a significant file that needs special attention
 */
function checkFileSignificance(filePath) {
    if (!filePath) {return "";}
    
    const significantPatterns = [
        { pattern: /server\.js$/, message: "Core server file - document API changes" },
        { pattern: /\.claude\//, message: "Claude configuration - affects AI behavior" },
        { pattern: /database\.js$/, message: "Database layer - document schema changes" },
        { pattern: /spec\.md$/, message: "Specification updated - track requirements" },
        { pattern: /tasks\.md$/, message: "Task list modified - update progress tracking" },
        { pattern: /roadmap\.json$/, message: "Roadmap updated - document version changes" },
        { pattern: /CLAUDE\.md$/, message: "Instructions modified - critical for AI context" }
    ];
    
    for (const { pattern, message } of significantPatterns) {
        if (pattern.test(filePath)) {
            return `\n   ⚠️ SIGNIFICANT: ${message}`;
        }
    }
    
    return "";
}

/**
 * Main execution
 */
function main() {
    try {
        // Generate the appropriate reminder
        let reminder = generateReminder(eventType);
        
        // Add significance note if applicable
        const significance = checkFileSignificance(fileName);
        if (significance) {
            reminder += significance;
        }
        
        // Add timestamp context
        reminder += `\n   📅 Timestamp: ${new Date().toISOString()}`;
        
        // Output the reminder (Claude will see this)
        console.log(reminder);
        
    } catch (error) {
        console.error(`Memory hook error: ${error.message}`);
        console.log("🧠 MEMORY-HOOK: Remember to save discoveries to Memento");
    }
}

// Execute
main();