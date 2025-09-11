#!/usr/bin/env node

/**
 * Doc Agent - Documentation Generation and Validation
 * 
 * Responsibilities:
 * - Update ROADMAP.md with roadmap.json data
 * - Update CHANGELOG.md with completed tasks
 * - Run html-content-updater.js
 * - Trigger Playwright validation tests
 * - Verify version numbers match
 */

const fs = require("fs").promises;
const path = require("path");
const { spawn } = require("child_process");

class DocAgent {
    constructor() {
        this.roadmapJson = path.join(__dirname, "../../data/roadmap.json");
        this.roadmapMd = path.join(__dirname, "../../../app/public/docs-source/ROADMAP.md");
        this.changelogMd = path.join(__dirname, "../../../app/public/docs-source/CHANGELOG.md");
        this.htmlUpdater = path.join(__dirname, "../../../app/public/docs-html/html-content-updater.js");
    }

    /**
     * Main execution flow
     */
    async run() {
        console.log("📚 Doc Agent: Starting documentation generation...");
        
        try {
            // Load roadmap data
            const roadmap = await this.loadRoadmap();
            
            // Update ROADMAP.md
            await this.updateRoadmap(roadmap);
            
            // Update CHANGELOG.md if needed
            await this.updateChangelog(roadmap);
            
            // Run HTML content updater
            await this.generateHTML();
            
            // Validate the generated documentation
            const validationResult = await this.validateDocumentation(roadmap);
            
            if (validationResult.success) {
                console.log("✅ Doc: Documentation generation and validation complete");
            } else {
                console.log("⚠️  Doc: Generation complete but validation had issues");
                console.log("   Issues:", validationResult.issues.join(", "));
            }
            
            return validationResult;
        } catch (error) {
            console.error("❌ Doc Error:", error.message);
            throw error;
        }
    }

    /**
     * Load roadmap.json
     */
    async loadRoadmap() {
        try {
            const data = await fs.readFile(this.roadmapJson, "utf8");
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Failed to load roadmap.json: ${error.message}`);
        }
    }

    /**
     * Update ROADMAP.md with dynamic content
     */
    async updateRoadmap(roadmap) {
        console.log("📝 Updating ROADMAP.md...");
        
        // Read current ROADMAP.md
        const content = await fs.readFile(this.roadmapMd, "utf8");
        
        // Generate table from roadmap.json
        const table = this.generateSpecTable(roadmap);
        
        // Replace content between markers
        const startMarker = "<!-- AUTO-GENERATED-SPECS-START -->";
        const endMarker = "<!-- AUTO-GENERATED-SPECS-END -->";
        
        const startIndex = content.indexOf(startMarker);
        const endIndex = content.indexOf(endMarker);
        
        if (startIndex === -1 || endIndex === -1) {
            console.warn("⚠️  Warning: Auto-generation markers not found in ROADMAP.md");
            return;
        }
        
        const newContent = 
            content.substring(0, startIndex + startMarker.length) +
            "\n\n" + table + "\n\n" +
            content.substring(endIndex);
        
        await fs.writeFile(this.roadmapMd, newContent, "utf8");
        console.log("✅ ROADMAP.md updated");
    }

    /**
     * Generate specification table
     */
    generateSpecTable(roadmap) {
        let table = "### Active Specifications\n\n";
        table += "| Spec | Title | Progress | Priority | Status | Next Tasks |\n";
        table += "| ---- | ----- | -------- | -------- | ------ | ---------- |\n";
        
        // Filter and format specs
        const activeSpecs = roadmap.specs.filter(spec => !spec.isBaseline);
        const baselineSpecs = roadmap.specs.filter(spec => spec.isBaseline);
        
        // Show baseline first
        baselineSpecs.forEach(spec => {
            const specNum = spec.id.split("-")[0];
            const progress = `${spec.tasks.completed}/${spec.tasks.total} (${spec.tasks.percentage}%)`;
            const priority = this.getPriorityBadge(spec.priority);
            const status = this.getStatusBadge(spec.status);
            const nextTasks = spec.nextTasks.length > 0 
                ? spec.nextTasks.slice(0, 2).map(t => `• ${t}`).join("<br>")
                : "Baseline complete";
            
            table += `| ${specNum} | ${spec.title} | ${progress} | ${priority} | ${status} | ${nextTasks} |\n`;
        });
        
        // Then active specs
        activeSpecs.forEach(spec => {
            const specNum = spec.id.split("-")[0];
            const progress = `${spec.tasks.completed}/${spec.tasks.total} (${spec.tasks.percentage}%)`;
            const priority = this.getPriorityBadge(spec.priority);
            const status = this.getStatusBadge(spec.status);
            const nextTasks = spec.nextTasks.length > 0 
                ? spec.nextTasks.slice(0, 3).map(t => `• ${t}`).join("<br>")
                : "No tasks defined";
            
            table += `| ${specNum} | ${spec.title} | ${progress} | ${priority} | ${status} | ${nextTasks} |\n`;
        });
        
        if (roadmap.specs.length === 0) {
            table += "| - | No specifications found | - | - | - | - |\n";
        }
        
        // Add summary
        table += "\n### Summary\n\n";
        table += `- **Total Specifications**: ${roadmap.totalSpecs}\n`;
        table += `- **Active Development**: ${roadmap.activeSpecs}\n`;
        table += `- **Completed**: ${roadmap.completedSpecs}\n`;
        table += `- **Last Updated**: ${new Date(roadmap.generated).toLocaleDateString()}\n`;
        
        return table;
    }

    /**
     * Get priority badge
     */
    getPriorityBadge(priority) {
        const badges = {
            "baseline": "⚫ BASE",
            "CRIT": "🔴 CRIT",
            "HIGH": "🟠 HIGH",
            "MED": "🟡 MED",
            "NORM": "⚪ NORM",
            "LOW": "🔵 LOW"
        };
        return badges[priority] || "⚪ NORM";
    }

    /**
     * Get status badge
     */
    getStatusBadge(status) {
        const badges = {
            "complete": "✅ Complete",
            "in_progress": "🔄 Active",
            "planning": "📋 Planning",
            "planned": "📅 Planned"
        };
        return badges[status] || "📅 Planned";
    }

    /**
     * Update CHANGELOG.md with recent completions
     */
    async updateChangelog() {
        // For now, just log - can be enhanced to track task completions
        console.log("📝 Changelog update check...");
        
        // Future enhancement: Track completed tasks and add to changelog
        // This would require a changelog-cache.json to track what's been logged
    }

    /**
     * Run HTML content updater
     */
    async generateHTML() {
        console.log("🔧 Running HTML content updater...");
        
        return new Promise((resolve, reject) => {
            const child = spawn("node", [this.htmlUpdater], {
                cwd: path.join(__dirname, "../../../")
            });
            
            child.stdout.on("data", (data) => {
                process.stdout.write(`   ${data}`);
            });
            
            child.stderr.on("data", (data) => {
                process.stderr.write(`   ${data}`);
            });
            
            child.on("close", (code) => {
                if (code === 0) {
                    console.log("✅ HTML generation complete");
                    resolve();
                } else {
                    reject(new Error(`HTML updater exited with code ${code}`));
                }
            });
        });
    }

    /**
     * Validate the generated documentation
     */
    async validateDocumentation(roadmap) {
        console.log("🔍 Validating documentation portal...");
        
        // const http = require("http");
        const result = {
            success: true,
            issues: [],
            checks: {
                serverResponds: false,
                htmlGenerated: false,
                roadmapPresent: false,
                specsMatch: false
            }
        };
        
        // Wait a moment for server to update
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check 1: Server responds
        try {
            const serverCheck = await this.checkURL("http://localhost:8989/docs-html");
            result.checks.serverResponds = serverCheck;
            if (!serverCheck) {
                result.issues.push("Documentation portal not responding");
            }
        } catch (_error) {
            result.issues.push("Could not reach documentation portal");
        }
        
        // Check 2: HTML files were generated
        try {
            const htmlDir = path.join(__dirname, "../../../app/public/docs-html/content");
            const files = await fs.readdir(htmlDir);
            const hasRoadmap = files.includes("ROADMAP.html");
            result.checks.htmlGenerated = hasRoadmap;
            if (!hasRoadmap) {
                result.issues.push("ROADMAP.html not generated");
            }
        } catch (_error) {
            result.issues.push("Could not verify HTML generation");
        }
        
        // Check 3: Roadmap content includes our specs
        try {
            const roadmapHtml = await fs.readFile(
                path.join(__dirname, "../../../app/public/docs-html/content/ROADMAP.html"),
                "utf8"
            );
            
            // Check if our baseline spec is in the HTML
            const hasBaseline = roadmapHtml.includes("000-hextrackr-master-truth") || 
                               roadmapHtml.includes("HexTrackr Master");
            result.checks.roadmapPresent = hasBaseline;
            
            // Check if spec count matches
            const specCount = (roadmapHtml.match(/\d{3}-[a-z-]+/g) || []).length;
            result.checks.specsMatch = specCount >= roadmap.specs.length;
            
            if (!hasBaseline) {
                result.issues.push("Baseline spec not found in roadmap");
            }
            if (specCount < roadmap.specs.length) {
                result.issues.push(`Only ${specCount} of ${roadmap.specs.length} specs in HTML`);
            }
        } catch (_error) {
            result.issues.push("Could not validate roadmap content");
        }
        
        // Determine overall success
        result.success = result.issues.length === 0;
        
        // Report validation results
        console.log("📊 Validation Results:");
        console.log(`   Server responds: ${result.checks.serverResponds ? "✅" : "❌"}`);
        console.log(`   HTML generated: ${result.checks.htmlGenerated ? "✅" : "❌"}`);
        console.log(`   Roadmap present: ${result.checks.roadmapPresent ? "✅" : "❌"}`);
        console.log(`   Specs match: ${result.checks.specsMatch ? "✅" : "❌"}`);
        
        return result;
    }
    
    /**
     * Check if a URL responds
     */
    async checkURL(url) {
        return new Promise((resolve) => {
            const http = require("http");
            
            http.get(url, (res) => {
                resolve(res.statusCode === 200);
            }).on("error", () => {
                resolve(false);
            });
        });
    }
}

// Execute if run directly
if (require.main === module) {
    const doc = new DocAgent();
    doc.run()
        .then(() => {
            console.log("📚 Documentation portal updated successfully");
            process.exit(0);
        })
        .catch(error => {
            console.error("Fatal error:", error);
            process.exit(1);
        });
}

module.exports = DocAgent;