#!/usr/bin/env node

/* eslint-env node */

/**
 * FileScopeMCP Tools Demo - Interactive Demonstrations
 * Shows what each FileScopeMCP tool would provide for HexTrackr
 */

const fs = require("fs");
const path = require("path");

// Load the FileScopeMCP analysis data
const treeDataPath = path.join(__dirname, "FileScopeMCP-tree-HexTrackr.json");
const treeData = JSON.parse(fs.readFileSync(treeDataPath, "utf8"));

console.log("🔍 FileScopeMCP Tools Demo for HexTrackr\n");
console.log("=========================================\n");

// Helper function for project statistics
function getProjectStats() {
    let totalFiles = 0;
    let totalDirs = 0;
    const importanceScores = [];
    const fileTypes = {};
    
    function traverse(node) {
        if (node.isDirectory) {
            totalDirs++;
        } else {
            totalFiles++;
            importanceScores.push(node.importance);
            const ext = path.extname(node.name) || "no-ext";
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
        
        if (node.children) {
            node.children.forEach(child => traverse(child));
        }
    }
    
    traverse(treeData.fileTree);
    
    const criticalFiles = importanceScores.filter(s => s >= 7).length;
    const highFiles = importanceScores.filter(s => s >= 5 && s < 7).length;
    const mediumFiles = importanceScores.filter(s => s >= 3 && s < 5).length;
    const avgImportance = importanceScores.reduce((a, b) => a + b, 0) / importanceScores.length;
    
    return {
        totalFiles,
        totalDirs,
        criticalFiles,
        highFiles,
        mediumFiles,
        avgImportance,
        fileTypes
    };
}

// Helper function to get file summary
function getFileSummary(fileName) {
    function findFile(node) {
        if (node.name === fileName) {return node;}
        if (node.children) {
            for (const child of node.children) {
                const result = findFile(child);
                if (result) {return result;}
            }
        }
        return null;
    }
    return findFile(treeData.fileTree);
}

// 1. TOOL: set_project_path (Configuration)
console.log("📁 TOOL: set_project_path");
console.log("   Purpose: Initialize FileScopeMCP with project directory");
console.log("   Status: ✅ Already configured");
console.log(`   Base Directory: ${treeData.config.baseDirectory}`);
console.log(`   Project Root: ${treeData.config.projectRoot}`);
console.log(`   Last Updated: ${treeData.config.lastUpdated}`);
console.log("");

// 2. TOOL: get_file_importance
console.log("⭐ TOOL: get_file_importance");
console.log("   Purpose: Retrieve importance score (0-10) for specific files");
console.log("   Example Results:");

function findFileImportance(fileName) {
    function search(node) {
        if (node.name === fileName) {
            return {
                name: node.name,
                path: node.path,
                importance: node.importance,
                isDirectory: node.isDirectory
            };
        }
        if (node.children) {
            for (const child of node.children) {
                const result = search(child);
                if (result) {return result;}
            }
        }
        return null;
    }
    return search(treeData.fileTree);
}

const importantFiles = ["server.js", "package.json", "init-database.js", "tickets-app.js"];
importantFiles.forEach(fileName => {
    const fileInfo = findFileImportance(fileName);
    if (fileInfo) {
        const level = fileInfo.importance >= 7 ? "CRITICAL" : 
                     fileInfo.importance >= 5 ? "HIGH" : 
                     fileInfo.importance >= 3 ? "MEDIUM" : "LOW";
        console.log(`   📄 ${fileName}: Score ${fileInfo.importance}/10 (${level})`);
    }
});
console.log("");

// 3. TOOL: get_dependency_map
console.log("🔗 TOOL: get_dependency_map");
console.log("   Purpose: Analyze file dependencies and relationships");
console.log("   Example Results:");

function getDependencyData() {
    const dependencies = [];
    
    function traverse(node) {
        if (node.dependencies && node.dependencies.length > 0) {
            dependencies.push({
                file: node.name,
                path: node.path,
                dependencies: node.dependencies,
                dependents: node.dependents || [],
                packageDependencies: node.packageDependencies || []
            });
        }
        if (node.children) {
            node.children.forEach(child => traverse(child));
        }
    }
    
    traverse(treeData.fileTree);
    return dependencies;
}

const depData = getDependencyData();
depData.slice(0, 3).forEach(dep => {
    console.log(`   📄 ${dep.file}:`);
    console.log(`      → Dependencies: ${dep.dependencies.length} files`);
    console.log(`      ← Dependents: ${dep.dependents.length} files`);
    console.log(`      📦 Package deps: ${dep.packageDependencies.length} packages`);
    if (dep.dependencies.length > 0) {
        console.log(`      Files it depends on: ${dep.dependencies.map(d => path.basename(d)).join(", ")}`);
    }
});
console.log("");

// 4. TOOL: scan_directory
console.log("📂 TOOL: scan_directory");
console.log("   Purpose: Analyze directory structure and file relationships");
console.log("   Example: Scanning /scripts directory:");

function scanDirectory(dirName) {
    function findDir(node) {
        if (node.name === dirName && node.isDirectory) {
            return node;
        }
        if (node.children) {
            for (const child of node.children) {
                const result = findDir(child);
                if (result) {return result;}
            }
        }
        return null;
    }
    return findDir(treeData.fileTree);
}

const scriptsDir = scanDirectory("scripts");
if (scriptsDir) {
    console.log(`   📁 Directory: ${scriptsDir.name}`);
    console.log(`   📊 Total files: ${scriptsDir.children.length}`);
    
    const fileTypes = {};
    const importanceStats = {high: 0, medium: 0, low: 0};
    
    scriptsDir.children.forEach(file => {
        const ext = path.extname(file.name) || "no-ext";
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        
        if (file.importance >= 3) {importanceStats.high++;}
        else if (file.importance >= 1) {importanceStats.medium++;}
        else {importanceStats.low++;}
    });
    
    console.log(`   📋 File types: ${Object.entries(fileTypes).map(([ext, count]) => `${ext}: ${count}`).join(", ")}`);
    console.log(`   ⭐ Importance: ${importanceStats.high} high, ${importanceStats.medium} medium, ${importanceStats.low} low`);
    
    const topFiles = scriptsDir.children
        .filter(f => f.importance > 2)
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 3);
    
    console.log("   🔝 Top files by importance:");
    topFiles.forEach(file => {
        console.log(`      • ${file.name} (${file.importance}/10)`);
    });
}
console.log("");

// 5. TOOL: get_file_summary
console.log("📋 TOOL: get_file_summary");
console.log("   Purpose: Generate summary of critical file components");
console.log("   Example: server.js summary:");

const serverFile = findFileImportance("server.js");
if (serverFile) {
    const summary = getFileSummary("server.js");
    console.log(`   📄 File: ${summary.name}`);
    console.log(`   📍 Path: ${summary.path}`);
    console.log(`   ⭐ Importance: ${summary.importance}/10 (CRITICAL)`);
    console.log(`   🔗 Dependencies: ${summary.dependencies.length} files`);
    console.log(`   📦 Package Dependencies: ${summary.packageDependencies.length} packages`);
    
    if (summary.packageDependencies.length > 0) {
        console.log("   📦 Key packages used:");
        summary.packageDependencies.slice(0, 5).forEach(pkg => {
            console.log(`      • ${pkg.name}${pkg.version ? ` (${pkg.version})` : ""}`);
        });
    }
    
    console.log("   🎯 Role: Main application entry point");
    console.log("   💡 Why it's critical: Orchestrates the entire HexTrackr application");
}
console.log("");

// 6. TOOL: generate_architecture_diagram (Already demonstrated!)
console.log("🎨 TOOL: generate_architecture_diagram");
console.log("   Purpose: Create Mermaid visualization of project structure");
console.log("   Status: ✅ Already generated!");
console.log("   Output: HexTrackr-Architecture-Diagram.html");
console.log("   Features: Interactive diagram with importance-based coloring");
console.log("");

// Summary Statistics
console.log("📊 PROJECT ANALYSIS SUMMARY");
console.log("============================");

const stats = getProjectStats();
console.log(`📁 Total Directories: ${stats.totalDirs}`);
console.log(`📄 Total Files: ${stats.totalFiles}`);
console.log(`🔥 Critical Files (7-10): ${stats.criticalFiles}`);
console.log(`⚡ High Importance (5-6): ${stats.highFiles}`);
console.log(`📝 Medium Importance (3-4): ${stats.mediumFiles}`);
console.log(`📊 Average Importance: ${stats.avgImportance.toFixed(2)}/10`);
console.log("");

console.log("🎯 INSIGHTS & RECOMMENDATIONS:");
console.log("• Focus code reviews on the critical files (server.js, init-database.js)");
console.log("• Consider breaking down high-complexity files for better maintainability");
console.log("• Use dependency mapping to understand change impact");
console.log("• Monitor file importance changes over time");
console.log("");
console.log("✨ This is just a taste of what FileScopeMCP provides in real-time!");
