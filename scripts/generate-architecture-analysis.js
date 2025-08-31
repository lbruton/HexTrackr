#!/usr/bin/env node

/* global console, require, __dirname */

/**
 * Architecture Analysis Generator
 * Generates comprehensive architecture documentation from FileScopeMCP analysis
 * Output: docs-source/architecture/project-analysis.md
 */

const fs = require("fs");
const path = require("path");

// Load the FileScopeMCP analysis data
const treeDataPath = path.join(__dirname, "..", "FileScopeMCP-tree-HexTrackr.json");
const treeData = JSON.parse(fs.readFileSync(treeDataPath, "utf8"));

console.log("🏗️ Generating Architecture Analysis Documentation...\n");

/**
 * Find file importance by name
 */
function findFileImportance(fileName) {
    function search(node) {
        if (node.name === fileName) {
            return {
                name: node.name,
                path: node.path,
                importance: node.importance,
                isDirectory: node.isDirectory,
                dependencies: node.dependencies || [],
                dependents: node.dependents || [],
                packageDependencies: node.packageDependencies || []
            };
        }
        if (node.children) {
            for (const child of node.children) {
                const result = search(child);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
    return search(treeData.fileTree);
}

/**
 * Get dependency data for all files
 */
function getDependencyData() {
    const dependencies = [];
    
    function traverse(node) {
        if (node.dependencies && node.dependencies.length > 0) {
            dependencies.push({
                file: node.name,
                path: node.path,
                importance: node.importance,
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
    return dependencies.sort((a, b) => b.importance - a.importance);
}

/**
 * Analyze directory structure and stats
 */
function analyzeDirectory(dirPath) {
    function findDirectory(node, targetPath) {
        if (node.path === targetPath || node.path.endsWith(targetPath)) {
            return node;
        }
        if (node.children) {
            for (const child of node.children) {
                const result = findDirectory(child, targetPath);
                if (result) {return result;}
            }
        }
        return null;
    }
    
    const dir = findDirectory(treeData.fileTree, dirPath);
    if (!dir || !dir.children) {return null;}
    
    let totalFiles = 0;
    const fileTypes = {};
    const importanceScores = [];
    
    function traverse(node) {
        if (!node.isDirectory) {
            totalFiles++;
            importanceScores.push(node.importance);
            const ext = path.extname(node.name) || "no-ext";
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
        
        if (node.children) {
            node.children.forEach(child => traverse(child));
        }
    }
    
    traverse(dir);
    
    const highFiles = importanceScores.filter(s => s >= 5).length;
    const mediumFiles = importanceScores.filter(s => s >= 3 && s < 5).length;
    const lowFiles = importanceScores.filter(s => s < 3).length;
    
    // Get top files by importance
    const allFiles = [];
    function getFiles(node) {
        if (!node.isDirectory) {
            allFiles.push(node);
        }
        if (node.children) {
            node.children.forEach(child => getFiles(child));
        }
    }
    getFiles(dir);
    
    const topFiles = allFiles
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5);
    
    return {
        name: dir.name,
        totalFiles,
        fileTypes,
        highFiles,
        mediumFiles,
        lowFiles,
        topFiles
    };
}

/**
 * Get comprehensive project statistics
 */
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

/**
 * Generate the markdown content
 */
function generateMarkdown() {
    const stats = getProjectStats();
    const dependencies = getDependencyData();
    const scriptsAnalysis = analyzeDirectory("scripts");
    const docsAnalysis = analyzeDirectory("docs-source");
    
    // Get critical files analysis
    const criticalFiles = ["server.js", "package.json", "init-database.js"];
    const criticalFilesData = criticalFiles.map(fileName => findFileImportance(fileName)).filter(Boolean);
    
    const lastUpdated = new Date().toISOString().split("T")[0];
    
    return `# Project Architecture Analysis

*Generated automatically from FileScopeMCP analysis on ${lastUpdated}*

## Overview

This document provides a comprehensive analysis of the HexTrackr project architecture, including file importance scoring, dependency mapping, and structural insights derived from automated codebase analysis.

## Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | ${stats.totalFiles} |
| Total Directories | ${stats.totalDirs} |
| Critical Files (7-10) | ${stats.criticalFiles} |
| High Importance (5-6) | ${stats.highFiles} |
| Medium Importance (3-4) | ${stats.mediumFiles} |
| Average Importance | ${stats.avgImportance.toFixed(2)}/10 |

## File Type Distribution

${Object.entries(stats.fileTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ext, count]) => `- **${ext === "no-ext" ? "No extension" : ext}**: ${count} files`)
    .join("\n")}

## Critical Files Analysis

These files have the highest importance scores and represent the core architecture components:

${criticalFilesData.map(file => `### ${file.name}

- **Importance Score**: ${file.importance}/10 (${file.importance >= 7 ? "CRITICAL" : file.importance >= 5 ? "HIGH" : file.importance >= 3 ? "MEDIUM" : "LOW"})
- **Path**: \`${file.path}\`
- **Dependencies**: ${file.dependencies.length} files
- **Package Dependencies**: ${file.packageDependencies.length} packages
- **Dependents**: ${file.dependents.length} files

${file.packageDependencies.length > 0 ? `**Key Package Dependencies**:
${file.packageDependencies.slice(0, 5).map(pkg => `- \`${pkg.name}\` ${pkg.version ? `(${pkg.version})` : ""}`).join("\n")}` : ""}
`).join("\n")}

## Dependency Relationships

The following files have significant dependency relationships:

${dependencies.slice(0, 10).map(dep => `### ${dep.file}

- **Importance**: ${dep.importance}/10
- **File Dependencies**: ${dep.dependencies.length}
- **Package Dependencies**: ${dep.packageDependencies.length}
${dep.dependencies.length > 0 ? `- **Depends on**: ${dep.dependencies.map(d => `\`${path.basename(d)}\``).join(", ")}` : ""}
`).join("\n")}

## Directory Analysis

### Scripts Directory

${scriptsAnalysis ? `- **Total Files**: ${scriptsAnalysis.totalFiles}
- **File Types**: ${Object.entries(scriptsAnalysis.fileTypes).map(([ext, count]) => `${ext}: ${count}`).join(", ")}
- **Importance Distribution**: ${scriptsAnalysis.highFiles} high, ${scriptsAnalysis.mediumFiles} medium, ${scriptsAnalysis.lowFiles} low

**Top Files by Importance**:
${scriptsAnalysis.topFiles.map(file => `- \`${file.name}\` (${file.importance}/10)`).join("\n")}` : "No analysis available"}

### Documentation Source

${docsAnalysis ? `- **Total Files**: ${docsAnalysis.totalFiles}
- **File Types**: ${Object.entries(docsAnalysis.fileTypes).map(([ext, count]) => `${ext}: ${count}`).join(", ")}
- **Importance Distribution**: ${docsAnalysis.highFiles} high, ${docsAnalysis.mediumFiles} medium, ${docsAnalysis.lowFiles} low

**Top Files by Importance**:
${docsAnalysis.topFiles.map(file => `- \`${file.name}\` (${file.importance}/10)`).join("\n")}` : "No analysis available"}

## Architecture Insights

### Code Quality Indicators

- **Low Complexity**: Average importance score of ${stats.avgImportance.toFixed(2)}/10 indicates well-organized project structure
- **Focused Architecture**: Only ${stats.criticalFiles} critical file(s) suggest clear separation of concerns
- **Modular Design**: Distribution across ${stats.totalDirs} directories shows good organization

### Recommendations

1. **Focus Code Reviews**: Prioritize reviews of critical files (importance ≥ 7)
2. **Monitor Dependencies**: Track changes to files with high dependency counts
3. **Architectural Stability**: Maintain low complexity by avoiding over-centralization
4. **Documentation Updates**: Keep architecture docs synchronized with code changes

### Risk Assessment

- **Single Points of Failure**: ${stats.criticalFiles} critical file(s) require careful change management
- **Dependency Impact**: Files with multiple dependencies need coordinated updates
- **Maintenance Burden**: ${stats.mediumFiles} medium-importance files may need periodic review

## Related Documentation

- [System Architecture Overview](./overview.md)
- [Database Schema](./database.md)
- [API Architecture](../api-reference/overview.md)
- [Deployment Architecture](./deployment.md)

---

*This analysis is automatically generated from codebase structure. For questions about specific architectural decisions, refer to the development team or project documentation.*
`;
}

// Generate and save the documentation
const markdownContent = generateMarkdown();
const outputPath = path.join(__dirname, "..", "docs-source", "architecture", "project-analysis.md");

// Ensure the architecture directory exists
const archDir = path.dirname(outputPath);
if (!fs.existsSync(archDir)) {
    fs.mkdirSync(archDir, { recursive: true });
}

fs.writeFileSync(outputPath, markdownContent);

console.log("✅ Architecture analysis documentation generated!");
console.log(`📄 Output: ${outputPath}`);
console.log("🌐 Will be available at: docs-html/content/architecture/project-analysis.html");
console.log("\n🎯 Key insights:");
console.log(`   • ${getProjectStats().criticalFiles} critical files identified`);
console.log(`   • ${getDependencyData().length} files with dependencies analyzed`);
console.log(`   • ${getProjectStats().totalFiles} total files across ${getProjectStats().totalDirs} directories`);
console.log("\n💡 Next steps:");
console.log("   1. Run: node docs-html/html-content-updater.js");
console.log("   2. Check: docs-html/content/architecture/project-analysis.html");
console.log("   3. Review: Architecture insights and recommendations");
