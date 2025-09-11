#!/usr/bin/env node

/**
 * Atlas Agent - Roadmap and Specification Intelligence
 * 
 * Responsibilities:
 * - Scan all specifications in hextrackr-specs/specs/
 * - Extract progress from tasks.md files
 * - Determine priority from task markers
 * - Generate roadmap.json for documentation portal
 * - Sort specs by development priority
 */

const fs = require("fs").promises;
const path = require("path");

class AtlasAgent {
    constructor() {
        this.specsDir = path.join(__dirname, "../../specs");
        this.outputFile = path.join(__dirname, "../../data/roadmap.json");
        this.specs = [];
    }

    /**
     * Main execution flow
     */
    async run() {
        console.log("🌍 Atlas Agent: Scanning specifications...");
        
        try {
            // Ensure data directory exists
            await this.ensureDataDir();
            
            // Scan all spec folders
            await this.scanSpecs();
            
            // Sort by priority
            this.sortSpecs();
            
            // Generate roadmap.json
            await this.generateRoadmap();
            
            console.log(`✅ Atlas: Generated roadmap with ${this.specs.length} specifications`);
            return this.specs;
        } catch (error) {
            console.error("❌ Atlas Error:", error.message);
            throw error;
        }
    }

    /**
     * Ensure data directory exists
     */
    async ensureDataDir() {
        const dataDir = path.dirname(this.outputFile);
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
    }

    /**
     * Scan all specification folders
     */
    async scanSpecs() {
        const entries = await fs.readdir(this.specsDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith(".")) {
                const specPath = path.join(this.specsDir, entry.name);
                const spec = await this.parseSpec(specPath, entry.name);
                if (spec) {
                    this.specs.push(spec);
                }
            }
        }
    }

    /**
     * Parse individual specification
     */
    async parseSpec(specPath, specId) {
        const spec = {
            id: specId,
            title: "",
            status: "planned",
            priority: "NORM",
            tasks: {
                total: 0,
                completed: 0,
                percentage: 0
            },
            nextTasks: [],
            isBaseline: false
        };

        // Check if this is a baseline/complete spec
        if (specId.includes("COMPLETE")) {
            spec.isBaseline = true;
            spec.status = "complete";
            spec.priority = "baseline";
        }

        // Parse spec.md for title and status
        try {
            const specFile = await fs.readFile(path.join(specPath, "spec.md"), "utf8");
            
            // Extract title
            const titleMatch = specFile.match(/^#\s+(?:Feature Specification:\s+)?(.+?)(?:\s+-\s+.+)?$/m);
            if (titleMatch) {
                spec.title = titleMatch[1].replace(/HexTrackr\s+Master\s+-\s+/, "");
            }
            
            // Extract status
            const statusMatch = specFile.match(/\*\*Status\*\*:\s*(.+)/i);
            if (statusMatch) {
                const status = statusMatch[1].toLowerCase();
                if (status.includes("complete") || status.includes("production")) {
                    spec.status = "complete";
                } else if (status.includes("progress")) {
                    spec.status = "in_progress";
                } else if (status.includes("planning")) {
                    spec.status = "planning";
                }
            }
        } catch (_error) {
            // No spec.md, might be archived or incomplete
        }

        // Parse tasks.md for progress
        try {
            const tasksFile = await fs.readFile(path.join(specPath, "tasks.md"), "utf8");
            
            // Count total tasks (T### format)
            const taskMatches = tasksFile.match(/^###?\s+T\d+:/gm) || [];
            spec.tasks.total = taskMatches.length;
            
            // Count completed tasks (look for ✅ or Status: Complete)
            const completedMatches = tasksFile.match(/^###?\s+T\d+:\s*✅/gm) || [];
            // const statusCompleteMatches = tasksFile.match(/\*\*Status\*\*:\s*Complete(?:d)?(?:\s|$)/gi) || [];
            spec.tasks.completed = completedMatches.length;
            
            // Calculate percentage
            if (spec.tasks.total > 0) {
                spec.tasks.percentage = Math.round((spec.tasks.completed / spec.tasks.total) * 100);
            }
            
            // Extract next tasks (first 3 incomplete tasks)
            const incompleteTasks = tasksFile.match(/^###?\s+T\d+:\s*(?!✅)(.+?)$/gm) || [];
            spec.nextTasks = incompleteTasks.slice(0, 3).map(task => {
                return task.replace(/^###?\s+T\d+:\s*/, "").trim();
            });
            
            // Determine priority from task content
            if (tasksFile.includes("🔴 CRIT") || tasksFile.includes("CRITICAL")) {
                spec.priority = "CRIT";
            } else if (tasksFile.includes("🟠 HIGH")) {
                spec.priority = "HIGH";
            } else if (tasksFile.includes("🟡 MED")) {
                spec.priority = "MED";
            } else if (tasksFile.includes("🔵 LOW")) {
                spec.priority = "LOW";
            }
        } catch (_error) {
            // No tasks.md, spec might be in planning phase
        }

        return spec;
    }

    /**
     * Sort specifications by priority
     */
    sortSpecs() {
        const priorityOrder = {
            "baseline": 0,
            "CRIT": 1,
            "HIGH": 2,
            "MED": 3,
            "NORM": 4,
            "LOW": 5
        };

        this.specs.sort((a, b) => {
            // Baselines first
            if (a.isBaseline !== b.isBaseline) {
                return a.isBaseline ? -1 : 1;
            }
            
            // Then by status (active > planning > complete)
            const statusOrder = { "in_progress": 0, "planning": 1, "complete": 2, "planned": 3 };
            const statusDiff = statusOrder[a.status] - statusOrder[b.status];
            if (statusDiff !== 0) {return statusDiff;}
            
            // Then by priority
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) {return priorityDiff;}
            
            // Finally by completion percentage (lower first, more work to do)
            return a.tasks.percentage - b.tasks.percentage;
        });
    }

    /**
     * Generate roadmap.json file
     */
    async generateRoadmap() {
        const roadmap = {
            generated: new Date().toISOString(),
            version: process.env.HEXTRACKR_VERSION || "1.0.12",
            totalSpecs: this.specs.length,
            activeSpecs: this.specs.filter(s => s.status === "in_progress").length,
            completedSpecs: this.specs.filter(s => s.status === "complete").length,
            specs: this.specs
        };

        await fs.writeFile(
            this.outputFile,
            JSON.stringify(roadmap, null, 2),
            "utf8"
        );
    }
}

// Execute if run directly
if (require.main === module) {
    const atlas = new AtlasAgent();
    atlas.run()
        .then(specs => {
            console.log(`📊 Summary: ${specs.length} specifications processed`);
            process.exit(0);
        })
        .catch(error => {
            console.error("Fatal error:", error);
            process.exit(1);
        });
}

module.exports = AtlasAgent;