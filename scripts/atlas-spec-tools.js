#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, module */

/**
 * Atlas Specification Tools
 * Stoic cartographer precision for roadmap and changelog management
 */

const fs = require("fs").promises;
const path = require("path");
const { AgentLogger } = require("./agent-logger.js");

class AtlasSpecTools {
    constructor() {
        this.logger = new AgentLogger("atlas", "Stoic Specification Cartographer");
        this.specsBasePath = path.join(process.cwd(), "hextrackr-specs", "specs");
        this.dataPath = path.join(process.cwd(), "hextrackr-specs", "data");
        this.roadmapPath = path.join(this.dataPath, "roadmap.json");
    }

    /**
     * Scan all specifications and update roadmap with Atlas precision
     */
    async scanSpecificationLandscape(includeArchived = false) {
        await this.logger.initializeSession("Complete Specification Landscape Scan");
        this.logger.log("📊 Initiating comprehensive cartographic analysis");
        this.logger.log("*methodically adjusts surveying instruments*");
        
        try {
            const specifications = [];
            let totalTasks = 0;
            let completedTasks = 0;
            
            // Scan active specifications
            const activeSpecs = await this.scanActiveSpecs();
            specifications.push(...activeSpecs.specs);
            totalTasks += activeSpecs.totalTasks;
            completedTasks += activeSpecs.completedTasks;
            
            // Scan archived specifications if requested
            if (includeArchived) {
                const archivedSpecs = await this.scanArchivedSpecs();
                specifications.push(...archivedSpecs.specs);
                totalTasks += archivedSpecs.totalTasks;
                completedTasks += archivedSpecs.completedTasks;
            }
            
            // Get current version from package.json
            const version = await this.getCurrentVersion();
            
            // Build roadmap data with cartographic precision
            const roadmapData = {
                generated: new Date().toISOString(),
                version,
                totalSpecs: specifications.length,
                activeSpecs: specifications.filter(s => s.status === "active").length,
                completedSpecs: specifications.filter(s => s.status === "complete").length,
                archivedSpecs: specifications.filter(s => s.status === "archived").length,
                totalTasks,
                completedTasks,
                overallProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                specs: specifications
            };
            
            // Save roadmap with precision
            await this.saveRoadmapData(roadmapData);
            
            this.logger.addResult("LANDSCAPE_MAPPED", `${specifications.length} specifications charted`, {
                version,
                totalSpecs: specifications.length,
                activeSpecs: roadmapData.activeSpecs,
                completedSpecs: roadmapData.completedSpecs,
                overallProgress: roadmapData.overallProgress,
                totalTasks,
                completedTasks
            });
            
            const summary = `Cartographic analysis complete. ${specifications.length} specifications mapped with ${roadmapData.overallProgress}% overall progress.`;
            const logResult = await this.logger.finalizeLog("SUCCESS", summary);
            
            return {
                success: true,
                roadmapData,
                specifications,
                summary,
                logPath: logResult.logPath
            };
            
        } catch (error) {
            this.logger.log(`Specification scan failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Cartographic analysis disrupted: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate changelog from completed specification tasks
     */
    async generateChangelogFromSpecs(versionBump = "patch") {
        await this.logger.initializeSession("Changelog Generation from Specifications");
        this.logger.log("📚 Initiating changelog cartography from completed tasks");
        this.logger.log("*precisely examines task completion patterns*");
        
        try {
            // Read current roadmap data
            const roadmapData = await this.loadRoadmapData();
            
            // Extract completed tasks from all specs
            const completedTasks = await this.extractCompletedTasks();
            
            if (completedTasks.length === 0) {
                this.logger.log("No new completed tasks found for changelog");
                return await this.logger.finalizeLog("SUCCESS", "No changelog updates required");
            }
            
            // Categorize tasks for changelog
            const categorizedTasks = this.categorizeTasks(completedTasks);
            
            // Generate version number
            const newVersion = await this.calculateNewVersion(versionBump);
            
            // Build changelog entry
            const changelogEntry = await this.buildChangelogEntry(newVersion, categorizedTasks);
            
            // Update changelog file
            const changelogPath = path.join(process.cwd(), "app", "public", "docs-source", "CHANGELOG.md");
            await this.updateChangelogFile(changelogPath, changelogEntry);
            
            // Update version in package.json and roadmap
            await this.updateVersion(newVersion);
            
            this.logger.addResult("CHANGELOG_GENERATED", `Version ${newVersion} changelog created`, {
                version: newVersion,
                tasksIncluded: completedTasks.length,
                categories: {
                    added: categorizedTasks.added.length,
                    changed: categorizedTasks.changed.length,
                    fixed: categorizedTasks.fixed.length,
                    enhanced: categorizedTasks.enhanced.length
                }
            });
            
            const summary = `Changelog entry for v${newVersion} generated with ${completedTasks.length} completed tasks.`;
            const logResult = await this.logger.finalizeLog("SUCCESS", summary);
            
            return {
                success: true,
                version: newVersion,
                changelogEntry,
                tasksIncluded: completedTasks.length,
                categorizedTasks,
                logPath: logResult.logPath
            };
            
        } catch (error) {
            this.logger.log(`Changelog generation failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Changelog cartography disrupted: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update specification priority and status with precision
     */
    async updateSpecificationStatus(specId, newStatus, newPriority = null) {
        await this.logger.initializeSession(`Specification Status Update: ${specId}`);
        this.logger.log(`📋 Updating specification coordinates for ${specId}`);
        
        try {
            const roadmapData = await this.loadRoadmapData();
            const specIndex = roadmapData.specs.findIndex(spec => spec.id === specId);
            
            if (specIndex === -1) {
                throw new Error(`Specification ${specId} not found in cartographic records`);
            }
            
            const oldStatus = roadmapData.specs[specIndex].status;
            const oldPriority = roadmapData.specs[specIndex].priority;
            
            // Update with cartographic precision
            roadmapData.specs[specIndex].status = newStatus;
            if (newPriority) {
                roadmapData.specs[specIndex].priority = newPriority;
            }
            roadmapData.specs[specIndex].lastUpdated = new Date().toISOString();
            
            // Recalculate summary statistics
            roadmapData.activeSpecs = roadmapData.specs.filter(s => s.status === "active").length;
            roadmapData.completedSpecs = roadmapData.specs.filter(s => s.status === "complete").length;
            roadmapData.archivedSpecs = roadmapData.specs.filter(s => s.status === "archived").length;
            roadmapData.generated = new Date().toISOString();
            
            // Save updated roadmap
            await this.saveRoadmapData(roadmapData);
            
            this.logger.addResult("SPEC_UPDATED", "Specification coordinates updated", {
                specId,
                oldStatus,
                newStatus,
                oldPriority,
                newPriority
            });
            
            const summary = `Specification ${specId} updated: ${oldStatus} → ${newStatus}` + 
                           (newPriority ? `, priority: ${oldPriority} → ${newPriority}` : "");
            const logResult = await this.logger.finalizeLog("SUCCESS", summary);
            
            return {
                success: true,
                specId,
                oldStatus,
                newStatus,
                oldPriority,
                newPriority,
                logPath: logResult.logPath
            };
            
        } catch (error) {
            this.logger.log(`Spec update failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Cartographic update disrupted: ${error.message}`);
            throw error;
        }
    }

    // Core scanning methods
    
    async scanActiveSpecs() {
        const specs = [];
        let totalTasks = 0;
        let completedTasks = 0;
        
        try {
            const specDirs = await fs.readdir(this.specsBasePath, { withFileTypes: true });
            
            for (const dir of specDirs) {
                if (!dir.isDirectory()) {continue;}
                
                const specPath = path.join(this.specsBasePath, dir.name);
                const specData = await this.analyzeSpecification(specPath, dir.name);
                
                if (specData) {
                    specs.push(specData);
                    totalTasks += specData.tasks.total;
                    completedTasks += specData.tasks.completed;
                }
            }
            
            return { specs, totalTasks, completedTasks };
            
        } catch (error) {
            this.logger.log(`Active spec scan failed: ${error.message}`, "WARN");
            return { specs: [], totalTasks: 0, completedTasks: 0 };
        }
    }
    
    async scanArchivedSpecs() {
        const specs = [];
        let totalTasks = 0;
        let completedTasks = 0;
        
        try {
            const archivedPath = path.join(path.dirname(this.specsBasePath), "archived-specs-2025-09-10");
            const archiveExists = await fs.access(archivedPath).then(() => true).catch(() => false);
            
            if (!archiveExists) {
                return { specs: [], totalTasks: 0, completedTasks: 0 };
            }
            
            const specDirs = await fs.readdir(archivedPath, { withFileTypes: true });
            
            for (const dir of specDirs) {
                if (!dir.isDirectory()) {continue;}
                
                const specPath = path.join(archivedPath, dir.name);
                const specData = await this.analyzeSpecification(specPath, dir.name, "archived");
                
                if (specData) {
                    specs.push(specData);
                    totalTasks += specData.tasks.total;
                    completedTasks += specData.tasks.completed;
                }
            }
            
            return { specs, totalTasks, completedTasks };
            
        } catch (error) {
            this.logger.log(`Archived spec scan failed: ${error.message}`, "WARN");
            return { specs: [], totalTasks: 0, completedTasks: 0 };
        }
    }
    
    async analyzeSpecification(specPath, specId, status = null) {
        try {
            // Check for required spec-kit files
            const specFile = path.join(specPath, "spec.md");
            const tasksFile = path.join(specPath, "tasks.md");
            
            const specExists = await fs.access(specFile).then(() => true).catch(() => false);
            const tasksExists = await fs.access(tasksFile).then(() => true).catch(() => false);
            
            if (!specExists) {
                this.logger.log(`Specification ${specId} missing spec.md - skipping`, "WARN");
                return null;
            }
            
            // Read spec content for metadata
            const specContent = await fs.readFile(specFile, "utf8");
            const title = this.extractTitle(specContent) || specId;
            const priority = this.extractPriority(specContent);
            
            // Analyze tasks if present
            let taskData = { total: 0, completed: 0, percentage: 0 };
            let nextTasks = [];
            
            if (tasksExists) {
                const tasksContent = await fs.readFile(tasksFile, "utf8");
                taskData = this.analyzeTaskCompletion(tasksContent);
                nextTasks = this.extractNextTasks(tasksContent);
            }
            
            // Determine status with cartographic precision
            let specStatus = status;
            if (!specStatus) {
                if (specId.includes("COMPLETE")) {
                    specStatus = "complete";
                } else if (taskData.percentage === 100) {
                    specStatus = "complete";
                } else if (taskData.total > 0) {
                    specStatus = "active";
                } else {
                    specStatus = "planning";
                }
            }
            
            return {
                id: specId,
                title,
                status: specStatus,
                priority: priority || "normal",
                tasks: taskData,
                nextTasks: nextTasks.slice(0, 3), // Top 3 next tasks
                lastScanned: new Date().toISOString(),
                isBaseline: specId.includes("master") || specId.includes("000-")
            };
            
        } catch (error) {
            this.logger.log(`Spec analysis failed for ${specId}: ${error.message}`, "WARN");
            return null;
        }
    }
    
    analyzeTaskCompletion(tasksContent) {
        const taskLines = tasksContent.split("\n").filter(line => 
            line.trim().match(/^[T|B]\d+/) || line.trim().includes("✅") || line.trim().includes("[x]")
        );
        
        let total = 0;
        let completed = 0;
        
        taskLines.forEach(line => {
            if (line.includes("✅") || line.includes("[x]")) {
                completed++;
            }
            total++;
        });
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { total, completed, percentage };
    }
    
    extractNextTasks(tasksContent) {
        const lines = tasksContent.split("\n");
        const nextTasks = [];
        
        for (const line of lines) {
            if (line.trim().match(/^[T|B]\d+/) && !line.includes("✅") && !line.includes("[x]")) {
                nextTasks.push(line.trim());
                if (nextTasks.length >= 3) {break;}
            }
        }
        
        return nextTasks;
    }
    
    extractTitle(content) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        return titleMatch ? titleMatch[1] : null;
    }
    
    extractPriority(content) {
        const priorityMatch = content.match(/Priority:\s*(HIGH|MEDIUM|LOW|CRITICAL|BASELINE)/i);
        return priorityMatch ? priorityMatch[1].toLowerCase() : null;
    }
    
    // Data management methods
    
    async loadRoadmapData() {
        try {
            const content = await fs.readFile(this.roadmapPath, "utf8");
            return JSON.parse(content);
        } catch (error) {
            this.logger.log("No existing roadmap found - creating new", "INFO");
            return {
                generated: new Date().toISOString(),
                version: "0.0.0",
                totalSpecs: 0,
                activeSpecs: 0,
                completedSpecs: 0,
                specs: []
            };
        }
    }
    
    async saveRoadmapData(roadmapData) {
        await fs.mkdir(this.dataPath, { recursive: true });
        await fs.writeFile(this.roadmapPath, JSON.stringify(roadmapData, null, 2), "utf8");
        this.logger.log(`Roadmap cartography saved: ${this.roadmapPath}`);
    }
    
    async getCurrentVersion() {
        try {
            const packagePath = path.join(process.cwd(), "package.json");
            const packageData = JSON.parse(await fs.readFile(packagePath, "utf8"));
            return packageData.version || "0.0.0";
        } catch (error) {
            return "0.0.0";
        }
    }
    
    async updateVersion(newVersion) {
        try {
            // Update package.json
            const packagePath = path.join(process.cwd(), "package.json");
            const packageData = JSON.parse(await fs.readFile(packagePath, "utf8"));
            packageData.version = newVersion;
            await fs.writeFile(packagePath, JSON.stringify(packageData, null, 2), "utf8");
            
            // Update roadmap
            const roadmapData = await this.loadRoadmapData();
            roadmapData.version = newVersion;
            roadmapData.generated = new Date().toISOString();
            await this.saveRoadmapData(roadmapData);
            
            this.logger.log(`Version updated to ${newVersion} with cartographic precision`);
            
        } catch (error) {
            this.logger.log(`Version update failed: ${error.message}`, "ERROR");
            throw error;
        }
    }
    
    // Changelog methods
    
    async extractCompletedTasks() {
        // This would scan all specs for recently completed tasks
        // For now, return empty array - can be enhanced
        return [];
    }
    
    categorizeTasks(tasks) {
        const categories = {
            added: [],
            changed: [],
            fixed: [],
            enhanced: []
        };
        
        tasks.forEach(task => {
            if (task.id?.startsWith("T0")) {
                categories.added.push(task);
            } else if (task.id?.startsWith("B0")) {
                categories.fixed.push(task);
            } else if (task.description?.toLowerCase().includes("enhance")) {
                categories.enhanced.push(task);
            } else {
                categories.changed.push(task);
            }
        });
        
        return categories;
    }
    
    async calculateNewVersion(bump) {
        const currentVersion = await this.getCurrentVersion();
        const parts = currentVersion.split(".").map(Number);
        
        switch (bump) {
            case "major":
                return `${parts[0] + 1}.0.0`;
            case "minor":
                return `${parts[0]}.${parts[1] + 1}.0`;
            case "patch":
            default:
                return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
        }
    }
    
    async buildChangelogEntry(version, categorizedTasks) {
        const date = new Date().toISOString().split("T")[0];
        let entry = `## [${version}] - ${date}\n\n`;
        
        if (categorizedTasks.added.length > 0) {
            entry += "### Added\n";
            categorizedTasks.added.forEach(task => {
                entry += `- ${task.description}\n`;
            });
            entry += "\n";
        }
        
        if (categorizedTasks.changed.length > 0) {
            entry += "### Changed\n";
            categorizedTasks.changed.forEach(task => {
                entry += `- ${task.description}\n`;
            });
            entry += "\n";
        }
        
        if (categorizedTasks.fixed.length > 0) {
            entry += "### Fixed\n";
            categorizedTasks.fixed.forEach(task => {
                entry += `- ${task.description}\n`;
            });
            entry += "\n";
        }
        
        if (categorizedTasks.enhanced.length > 0) {
            entry += "### Enhanced\n";
            categorizedTasks.enhanced.forEach(task => {
                entry += `- ${task.description}\n`;
            });
            entry += "\n";
        }
        
        return entry;
    }
    
    async updateChangelogFile(changelogPath, entry) {
        try {
            const existing = await fs.readFile(changelogPath, "utf8");
            const unreleasedIndex = existing.indexOf("## [Unreleased]");
            
            if (unreleasedIndex !== -1) {
                const beforeUnreleased = existing.substring(0, unreleasedIndex);
                const afterUnreleasedHeader = existing.substring(unreleasedIndex).split("\n").slice(0, 4).join("\n") + "\n\n";
                const remaining = existing.substring(unreleasedIndex).split("\n").slice(4).join("\n");
                
                const newContent = beforeUnreleased + afterUnreleasedHeader + entry + remaining;
                await fs.writeFile(changelogPath, newContent, "utf8");
            } else {
                // Append to beginning after header
                const headerEnd = existing.indexOf("\n## ");
                if (headerEnd !== -1) {
                    const header = existing.substring(0, headerEnd);
                    const rest = existing.substring(headerEnd);
                    await fs.writeFile(changelogPath, header + "\n\n" + entry + rest, "utf8");
                }
            }
            
        } catch (error) {
            this.logger.log(`Changelog update failed: ${error.message}`, "ERROR");
            throw error;
        }
    }
}

// Export for use as module
module.exports = { AtlasSpecTools };

// CLI usage if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || "scan";
    
    const atlas = new AtlasSpecTools();
    
    console.log("📊 Atlas - Specification Cartographer");
    console.log("*methodically adjusts surveying instruments*");
    console.log("");
    
    switch (command) {
        case "scan":
            atlas.scanSpecificationLandscape(args.includes("--include-archived"))
                .then(result => {
                    console.log("✅ Specification landscape mapped");
                    console.log(`📋 Specifications: ${result.roadmapData.totalSpecs}`);
                    console.log(`🎯 Active: ${result.roadmapData.activeSpecs}`);
                    console.log(`✅ Complete: ${result.roadmapData.completedSpecs}`);
                    console.log(`📊 Progress: ${result.roadmapData.overallProgress}%`);
                    console.log(`📄 Log: ${result.logPath}`);
                })
                .catch(error => {
                    console.error("❌ Cartographic analysis failed:", error.message);
                    process.exit(1);
                });
            break;
            
        case "changelog":
            const versionBump = args[1] || "patch";
            atlas.generateChangelogFromSpecs(versionBump)
                .then(result => {
                    console.log("✅ Changelog generated");
                    console.log(`📋 Version: ${result.version}`);
                    console.log(`📊 Tasks: ${result.tasksIncluded}`);
                    console.log(`📄 Log: ${result.logPath}`);
                })
                .catch(error => {
                    console.error("❌ Changelog generation failed:", error.message);
                    process.exit(1);
                });
            break;
            
        case "update":
            const specId = args[1];
            const newStatus = args[2];
            const newPriority = args[3];
            
            if (!specId || !newStatus) {
                console.log("Usage: node atlas-spec-tools.js update <specId> <status> [priority]");
                process.exit(1);
            }
            
            atlas.updateSpecificationStatus(specId, newStatus, newPriority)
                .then(result => {
                    console.log("✅ Specification updated");
                    console.log(`📋 Spec: ${result.specId}`);
                    console.log(`📊 Status: ${result.oldStatus} → ${result.newStatus}`);
                    if (result.newPriority) {
                        console.log(`🎯 Priority: ${result.oldPriority} → ${result.newPriority}`);
                    }
                    console.log(`📄 Log: ${result.logPath}`);
                })
                .catch(error => {
                    console.error("❌ Specification update failed:", error.message);
                    process.exit(1);
                });
            break;
            
        default:
            console.log("Atlas Specification Tools");
            console.log("Usage:");
            console.log("  node atlas-spec-tools.js scan [--include-archived]");
            console.log("  node atlas-spec-tools.js changelog [patch|minor|major]");
            console.log("  node atlas-spec-tools.js update <specId> <status> [priority]");
            break;
    }
}