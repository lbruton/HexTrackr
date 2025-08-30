#!/usr/bin/env node

/**
 * Dashboard Validation Script
 * Checks for HTML/CSS/JS issues in the health dashboard
 */

const fs = require("fs");
const path = require("path");

function validateDashboard() {
    console.log("🔍 Validating health-dashboard.html...\n");
    
    const dashboardPath = path.join(__dirname, "..", "health-dashboard.html");
    const content = fs.readFileSync(dashboardPath, "utf8");
    
    const issues = [];
    
    // Check for common HTML issues
    console.log("📋 Checking HTML structure...");
    
    // Check for unclosed tags
    const openTags = content.match(/<(\w+)(?:\s[^>]*)?(?<!\/)\s*>/g) || [];
    const closeTags = content.match(/<\/(\w+)\s*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
        issues.push("⚠️  Potential unclosed HTML tags detected");
    }
    
    // Check for missing task functions
    console.log("🔧 Checking JavaScript functions...");
    
    const requiredFunctions = [
        "startTask",
        "viewDetails", 
        "updateTaskCounts",
        "initTaskDragDrop",
        "updateSprintProgress"
    ];
    
    requiredFunctions.forEach(func => {
        if (!content.includes(`function ${func}(`)) {
            issues.push(`❌ Missing function: ${func}`);
        } else {
            console.log(`✅ Found function: ${func}`);
        }
    });
    
    // Check for CSS issues
    console.log("🎨 Checking CSS...");
    
    const cssBlocks = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (cssBlocks) {
        const cssContent = cssBlocks.join("\n");
        
        // Check for common CSS issues
        if (cssContent.includes("draggable:")) {
            issues.push("⚠️  CSS contains HTML attributes (draggable should be HTML attr, not CSS)");
        }
        
        // Check for unclosed CSS blocks
        const openBraces = (cssContent.match(/{/g) || []).length;
        const closeBraces = (cssContent.match(/}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            issues.push("❌ Unmatched CSS braces detected");
        }
    }
    
    // Check for task board structure
    console.log("📊 Checking task board structure...");
    
    const requiredElements = [
        "currentTasks",
        "critical-tasks",
        "high-tasks", 
        "medium-tasks",
        "completed-tasks"
    ];
    
    requiredElements.forEach(id => {
        if (!content.includes(`id="${id}"`)) {
            issues.push(`❌ Missing element: ${id}`);
        } else {
            console.log(`✅ Found element: ${id}`);
        }
    });
    
    // Summary
    console.log("\n📊 Validation Summary:");
    if (issues.length === 0) {
        console.log("✅ No major issues detected!");
    } else {
        console.log(`❌ Found ${issues.length} issue(s):`);
        issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    return issues;
}

if (require.main === module) {
    validateDashboard();
}

module.exports = { validateDashboard };
