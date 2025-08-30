#!/usr/bin/env node

/**
 * Document Sweep Color Demo
 * Shows how the split scribe console will display document sweep activities
 */

// Colors from split-scribe-console.js
const PINK = "\x1b[95m";
const YELLOW = "\x1b[93m";
const ORANGE = "\x1b[38;5;208m";
const GREEN = "\x1b[92m";
const LIGHT_BLUE = "\x1b[96m";
const CYAN = "\x1b[96m";
const RESET = "\x1b[0m";

async function simulateDocumentSweepDisplay() {
    console.clear();
    console.log(`${CYAN}📊 DOCUMENT SWEEP MONITORING DEMO${RESET}`);
    console.log(`${YELLOW}${"─".repeat(50)} ${"─".repeat(50)}${RESET}`);
    console.log(`${CYAN}📊 LAST 5 CHANGES                         📜 FULL VERBOSE LOG${RESET}`);
    console.log(`${YELLOW}${"─".repeat(50)} ${"─".repeat(50)}${RESET}`);
    
    const activities = [
        { time: "23:45:20", msg: "🚀 Document sweep starting...", type: "DOC_SWEEP", color: ORANGE },
        { time: "23:45:21", msg: "📄 Generating: smart-scribe.js", type: "DOC_INFO", color: YELLOW },
        { time: "23:45:22", msg: "✅ Generated: smart-scribe.js", type: "DOC_SUCCESS", color: LIGHT_BLUE },
        { time: "23:45:23", msg: "📊 Diff: smart-scribe_2025-08-17.diff", type: "DOC_SWEEP", color: ORANGE },
        { time: "23:45:24", msg: "🎉 Document sweep completed", type: "DOC_SUCCESS", color: LIGHT_BLUE },
        { time: "23:45:25", msg: "Memory sync completed", type: "SCRIBE_SUCCESS", color: GREEN },
        { time: "23:45:26", msg: "ANALYZED app.js patterns", type: "INFO", color: PINK }
    ];
    
    for (let i = 0; i < 7; i++) {
        const leftEntry = activities[i] || { time: "", msg: "", color: PINK };
        const rightEntry = activities[i] || { time: "", msg: "", color: PINK };
        
        const leftText = leftEntry.msg ? `${leftEntry.color}[${leftEntry.time}] ${leftEntry.msg}${RESET}` : "";
        const rightText = rightEntry.msg ? `${rightEntry.color}[${rightEntry.time}] ${rightEntry.msg}${RESET}` : "";
        
        console.log(`${leftText.padEnd(60)} ${rightText}`);
    }
    
    console.log(`${YELLOW}${"─".repeat(50)} ${"─".repeat(50)}${RESET}`);
    console.log(`${GREEN}✅ Monitoring: 5/5 recent | 25 total logged${RESET}`);
    console.log();
    console.log(`${CYAN}Commands: summary [time] | memory | docs | logs | clear | help | quit${RESET}`);
    
    console.log("\n🎨 COLOR LEGEND:");
    console.log(`${PINK}• Pink: Scribe activities${RESET}`);
    console.log(`${ORANGE}• Orange: Document sweep activities${RESET}`);
    console.log(`${YELLOW}• Yellow: Document sweep info${RESET}`);
    console.log(`${GREEN}• Green: Scribe success${RESET}`);
    console.log(`${LIGHT_BLUE}• Light Blue: Document sweep success${RESET}`);
    
    console.log("\n✅ This is how the Split Scribe Console will display document sweep monitoring!");
    console.log("🕰️  Ready for 6 AM automation with full color-coded visibility.");
}

simulateDocumentSweepDisplay();
