#!/usr/bin/env node

/**
 * AppleScript Terminal Launcher for Node.js Scripts
 * Automatically launches any Node.js script in an AppleScript Terminal window
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function ensureAppleScriptTerminal(scriptPath, windowTitle = "🌸 rEngine Node Script", ...args) {
    // Check if we're already running in an AppleScript terminal
    if (!process.env.APPLESCRIPT_TERMINAL) {
        console.log("🍎 Launching in AppleScript Terminal...");
        
        const scriptDir = path.dirname(scriptPath);
        const scriptName = path.basename(scriptPath);
        
        // Build the command
        const argsString = args.length > 0 ? ` ${args.join(" ")}` : "";
        const command = `export APPLESCRIPT_TERMINAL=1 && cd '${scriptDir}' && node '${scriptName}'${argsString}`;
        
        // Create AppleScript
        const appleScript = `
tell application "Terminal"
    activate
    set newTab to do script "${command}"
    
    -- Set window properties
    set custom title of newTab to "${windowTitle}"
    set background color of newTab to {65535, 52428, 58982}  -- Light pink background
    set normal text color of newTab to {0, 0, 0}             -- Black text
    set size of window 1 to {120, 40}                        -- Larger window
end tell`;
        
        // Execute AppleScript
        const osascript = spawn("osascript", ["-e", appleScript]);
        
        osascript.on("close", (code) => {
            if (code === 0) {
                console.log("✅ Launched in AppleScript Terminal");
            } else {
                console.error("❌ Failed to launch AppleScript Terminal");
            }
            process.exit(code);
        });
        
        return false; // Don't continue with current process
    } else {
        console.log("✅ Already running in AppleScript Terminal");
        return true; // Continue with current process
    }
}

module.exports = { ensureAppleScriptTerminal };

// If this file is run directly, it's a test
if (require.main === module) {
    console.log("AppleScript Terminal Launcher for Node.js - Ready to use!");
    console.log("Usage: const { ensureAppleScriptTerminal } = require(\"./applescript-node-launcher.js\");");
    console.log("       if (!ensureAppleScriptTerminal(__filename, \"My Script Title\")) return;");
}
