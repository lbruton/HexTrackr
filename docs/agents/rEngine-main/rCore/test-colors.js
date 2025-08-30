#!/usr/bin/env node

/**
 * Color Test for Split Scribe Console
 * Tests all the color codes to verify they display correctly
 */

// Colors (matching split-scribe-console.js)
const PINK = "\x1b[95m";
const WHITE = "\x1b[97m";
const YELLOW = "\x1b[93m";
const ORANGE = "\x1b[38;5;208m";  // Orange for document sweep
const GREEN = "\x1b[92m";
const BLUE = "\x1b[94m";
const LIGHT_BLUE = "\x1b[96m";    // Light blue for success
const DIM_PINK = "\x1b[95;2m";
const CYAN = "\x1b[96m";
const RESET = "\x1b[0m";

console.log("\n🎨 COLOR TEST FOR SPLIT SCRIBE CONSOLE");
console.log("=====================================\n");

console.log(`${PINK}PINK: Scribe activities and info messages${RESET}`);
console.log(`${ORANGE}ORANGE: Document sweep activities${RESET}`);
console.log(`${YELLOW}YELLOW: Document sweep info messages${RESET}`);
console.log(`${GREEN}GREEN: Scribe success messages${RESET}`);
console.log(`${LIGHT_BLUE}LIGHT_BLUE: Document sweep success messages${RESET}`);
console.log(`${CYAN}CYAN: System messages${RESET}`);
console.log(`${BLUE}BLUE: Headers and commands${RESET}`);
console.log(`${DIM_PINK}DIM_PINK: Secondary/verbose messages${RESET}`);

console.log("\n📊 TESTING MESSAGE TYPES:");
console.log(`${PINK}[23:45:12] INFO - Logging user input${RESET}`);
console.log(`${ORANGE}[23:45:13] DOC_SWEEP - 📊 Processed 195 files${RESET}`);
console.log(`${YELLOW}[23:45:14] DOC_INFO - 📄 Generating: smart-scribe.js${RESET}`);
console.log(`${GREEN}[23:45:15] SCRIBE_SUCCESS - Memory sync completed${RESET}`);
console.log(`${LIGHT_BLUE}[23:45:16] DOC_SUCCESS - ✅ Generated: app.js${RESET}`);
console.log(`${CYAN}[23:45:17] SYSTEM - Split Scribe Console initializing...${RESET}`);

console.log("\n✅ Color test complete! All colors should be distinct and visible.");
console.log("🔍 Check that Orange and Light Blue are clearly different from other colors.\n");
