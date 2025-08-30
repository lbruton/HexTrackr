#!/usr/bin/env node
/* eslint-env node */

/**
 * Memory Import Status Checker
 * Quick utility to check if memory import is running and view progress
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔍 Checking Memory Import Status...\n");

// Check if memory import process is running
try {
    const processes = execSync("ps aux | grep \"memory-importer.js\" | grep -v grep", { encoding: "utf8" });
    if (processes.trim()) {
        console.log("✅ Memory import process is RUNNING");
        console.log("📊 Process details:");
        console.log(processes);
    } else {
        console.log("❌ Memory import process is NOT running");
    }
} catch (error) {
    console.log("❌ Memory import process is NOT running");
}

// Check for recent memory files
const memoryOutputPath = path.join(__dirname, "../docs/ops/recovered-memories");
try {
    const files = fs.readdirSync(memoryOutputPath);
    const recentFiles = files
        .filter(f => f.includes("2025-08-"))
        .sort()
        .slice(-5);
    
    if (recentFiles.length > 0) {
        console.log("\n📁 Recent memory files:");
        recentFiles.forEach(file => {
            const filePath = path.join(memoryOutputPath, file);
            const stats = fs.statSync(filePath);
            console.log(`  ✓ ${file} (${new Date(stats.mtime).toLocaleString()})`);
        });
    }
} catch (error) {
    console.log("\n❌ Could not check memory output files");
}

// Check for frustration analysis
const frustrationPath = path.join(__dirname, "../docs/ops/frustration-analysis");
try {
    const files = fs.readdirSync(frustrationPath);
    const todayFiles = files.filter(f => f.includes("2025-08-30"));
    
    if (todayFiles.length > 0) {
        console.log("\n😤 Today's frustration analysis:");
        todayFiles.forEach(file => {
            console.log(`  ✓ ${file}`);
        });
    }
} catch (error) {
    console.log("\n❌ Could not check frustration analysis files");
}

console.log("\n🎯 To monitor live progress:");
console.log("   - Check Terminal.app for \"HexTrackr Memory Import\" window");
console.log("   - Memory will be uploaded to Neo4j via Memento MCP");
console.log("   - Process will show completion message when done");

console.log("\n✨ Status check complete!");
