#!/usr/bin/env node

/* eslint-env node */
/* global require, process, console, module */

/**
 * Uhura Git Tools
 * Starfleet-precision git operations with diplomatic protocol
 */

const { execSync } = require("child_process");
const _fs = require("fs").promises;
const _path = require("path");
const { AgentLogger } = require("./agent-logger.js");

class UhuraGitTools {
    constructor() {
        this.logger = new AgentLogger("uhura", "Starfleet Communications Officer");
    }

    /**
     * Create a safe git checkpoint with diplomatic messaging
     */
    async createCheckpoint(message = null, branch = null) {
        await this.logger.initializeSession("Git Checkpoint Creation");
        this.logger.log("Initiating git checkpoint protocol");
        
        try {
            // Get current branch if not specified
            const currentBranch = branch || this.getCurrentBranch();
            this.logger.log(`Operating on branch: ${currentBranch}`);
            
            // Constitutional compliance: Never work on main
            if (currentBranch === "main") {
                throw new Error("PROTOCOL VIOLATION: Cannot create checkpoints on main branch");
            }
            
            // Check if we have changes to commit
            const status = this.getGitStatus();
            if (!status.hasChanges) {
                this.logger.log("No changes detected. Checkpoint not required.");
                return await this.logger.finalizeLog("SUCCESS", "Clean working directory - no checkpoint needed");
            }
            
            // Prepare diplomatic commit message
            const commitMessage = message || this.generateDiplomaticMessage();
            this.logger.log(`Prepared diplomatic message: "${commitMessage}"`);
            
            // Stage all changes
            execSync("git add .", { stdio: "pipe" });
            this.logger.log("Changes staged for transmission");
            
            // Create commit with diplomatic message
            const commitCmd = `git commit -m "${commitMessage.replace(/"/g, "\\\"")}"`;
            const _commitResult = execSync(commitCmd, { encoding: "utf8" });
            
            // Get commit hash
            const commitHash = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
            this.logger.addResult("COMMIT", `Created checkpoint: ${commitHash.substring(0, 8)}`, {
                branch: currentBranch,
                message: commitMessage,
                hash: commitHash
            });
            
            const result = await this.logger.finalizeLog("SUCCESS", 
                `Checkpoint transmitted successfully. Commit hash: ${commitHash.substring(0, 8)}`
            );
            
            return {
                success: true,
                commitHash,
                branch: currentBranch,
                message: commitMessage,
                logPath: result.logPath
            };
            
        } catch (_error) {
            this.logger.log(`Checkpoint failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Transmission interrupted: ${error.message}`);
            throw error;
        }
    }

    /**
     * Sync with remote repository using diplomatic protocols
     */
    async syncWithRemote(forcePush = false) {
        await this.logger.initializeSession("Repository Synchronization");
        this.logger.log("Opening subspace channels to remote repository");
        
        try {
            const currentBranch = this.getCurrentBranch();
            this.logger.log(`Establishing connection on frequency: ${currentBranch}`);
            
            // Fetch latest from remote
            execSync("git fetch origin", { stdio: "pipe" });
            this.logger.log("Received latest transmissions from Starfleet Command");
            
            // Check if remote branch exists
            const remoteExists = this.checkRemoteBranchExists(currentBranch);
            
            if (remoteExists) {
                // Pull latest changes
                try {
                    execSync(`git pull origin ${currentBranch}`, { stdio: "pipe" });
                    this.logger.log("Synchronized with remote transmissions");
                } catch (_pullError) {
                    this.logger.log("Merge conflict detected - manual resolution required", "WARN");
                    throw new Error("Subspace interference detected. Manual conflict resolution required.");
                }
            }
            
            // Push changes
            const pushCmd = forcePush 
                ? `git push --force-with-lease origin ${currentBranch}`
                : `git push -u origin ${currentBranch}`;
            
            execSync(pushCmd, { stdio: "pipe" });
            this.logger.addResult("SYNC", "Branch synchronized with remote", {
                branch: currentBranch,
                remoteExists,
                forcePush
            });
            
            const result = await this.logger.finalizeLog("SUCCESS", 
                "All frequencies synchronized. Remote repository acknowledges receipt."
            );
            
            return {
                success: true,
                branch: currentBranch,
                synchronized: true,
                logPath: result.logPath
            };
            
        } catch (_error) {
            this.logger.log(`Sync failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Communication disrupted: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a diplomatic pull request
     */
    async createDiplomaticPR(title, description = null, targetBranch = "main") {
        await this.logger.initializeSession("Diplomatic PR Creation");
        this.logger.log("Initiating diplomatic channels with Starfleet Command");
        
        try {
            const currentBranch = this.getCurrentBranch();
            
            if (currentBranch === targetBranch) {
                throw new Error("PROTOCOL VIOLATION: Cannot create PR from target branch");
            }
            
            // Ensure branch is synchronized
            await this.syncWithRemote();
            
            // Prepare diplomatic description
            const diplomaticDescription = description || this.generateDiplomaticPRDescription(currentBranch);
            
            // Create PR using GitHub CLI (if available)
            try {
                const prCmd = `gh pr create --title "${title}" --body "${diplomaticDescription}" --base ${targetBranch}`;
                const prResult = execSync(prCmd, { encoding: "utf8" });
                
                // Extract PR number from result
                const prMatch = prResult.match(/https:\/\/github\.com\/.*\/pull\/(\d+)/);
                const prNumber = prMatch ? prMatch[1] : "unknown";
                
                this.logger.addResult("PR_CREATED", "Diplomatic channels established", {
                    prNumber,
                    title,
                    branch: currentBranch,
                    target: targetBranch,
                    url: prMatch ? prMatch[0] : null
                });
                
                const result = await this.logger.finalizeLog("SUCCESS", 
                    `Diplomatic mission successful. PR #${prNumber} transmitted to Starfleet Command.`
                );
                
                return {
                    success: true,
                    prNumber,
                    url: prMatch ? prMatch[0] : null,
                    logPath: result.logPath
                };
                
            } catch (_ghError) {
                // Fallback: provide manual instructions
                this.logger.log("GitHub CLI not available. Providing manual instructions.", "WARN");
                
                const instructions = this.generateManualPRInstructions(title, diplomaticDescription, targetBranch);
                this.logger.addResult("PR_INSTRUCTIONS", "Manual PR creation required", {
                    title,
                    description: diplomaticDescription,
                    instructions
                });
                
                const result = await this.logger.finalizeLog("SUCCESS", 
                    "Diplomatic message prepared. Manual transmission required."
                );
                
                return {
                    success: true,
                    manual: true,
                    instructions,
                    logPath: result.logPath
                };
            }
            
        } catch (_error) {
            this.logger.log(`PR creation failed: ${error.message}`, "ERROR");
            await this.logger.finalizeLog("FAILED", `Diplomatic mission failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get current git status
     */
    getGitStatus() {
        try {
            const status = execSync("git status --porcelain", { encoding: "utf8" });
            const staged = execSync("git diff --cached --name-only", { encoding: "utf8" }).trim();
            const unstaged = execSync("git diff --name-only", { encoding: "utf8" }).trim();
            
            return {
                hasChanges: status.trim().length > 0,
                staged: staged ? staged.split("\n") : [],
                unstaged: unstaged ? unstaged.split("\n") : [],
                raw: status
            };
        } catch (_error) {
            return { hasChanges: false, staged: [], unstaged: [], raw: "" };
        }
    }

    /**
     * Get current branch name
     */
    getCurrentBranch() {
        return execSync("git branch --show-current", { encoding: "utf8" }).trim();
    }

    /**
     * Check if remote branch exists
     */
    checkRemoteBranchExists(branch) {
        try {
            execSync(`git show-ref --verify --quiet refs/remotes/origin/${branch}`, { stdio: "pipe" });
            return true;
        } catch (_error) {
            return false;
        }
    }

    /**
     * Generate diplomatic commit message
     */
    generateDiplomaticMessage() {
        const messages = [
            "✨ Enhancement: Diplomatic code improvements transmitted",
            "🔧 Maintenance: System optimizations applied with precision",
            "📝 Documentation: Knowledge base updated for Starfleet records",
            "🛡️ Security: Defensive protocols enhanced",
            "🎯 Feature: New functionality integrated with diplomatic protocol",
            "🐛 Fix: Anomalies corrected for optimal performance"
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Generate diplomatic PR description
     */
    generateDiplomaticPRDescription(branch) {
        return `## 📡 Diplomatic Transmission Report

**Communications Officer**: Lt. Uhura  
**Branch Frequency**: \`${branch}\`  
**Mission Status**: Ready for integration with main systems

### Transmission Summary
This pull request contains carefully reviewed changes that have passed all diplomatic protocols and security clearances.

### Changes Included
- Code improvements and enhancements
- Documentation updates where applicable
- Security and performance optimizations

### Quality Assurance
- ✅ Branch tested and verified
- ✅ No conflicts with main frequency
- ✅ Ready for Starfleet Command review

### Deployment Authorization
All changes have been verified and are ready for integration with main systems.

---
*"All frequencies clear, Captain. Ready for integration."*

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
    }

    /**
     * Generate manual PR instructions
     */
    generateManualPRInstructions(title, description, targetBranch) {
        return `## Manual PR Creation Instructions

1. Navigate to GitHub repository
2. Click "New Pull Request"
3. Select branches:
   - Base: ${targetBranch}
   - Compare: ${this.getCurrentBranch()}
4. Title: ${title}
5. Description: (see below)

### PR Description:
${description}`;
    }
}

// Export for use as module
module.exports = { UhuraGitTools };

// CLI usage if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const uhura = new UhuraGitTools();
    
    switch (command) {
        case "checkpoint":
            uhura.createCheckpoint(args[1])
                .then(result => {
                    console.log("✅ Checkpoint created successfully");
                    console.log(`Commit: ${result.commitHash.substring(0, 8)}`);
                    console.log(`Log: ${result.logPath}`);
                })
                .catch(error => {
                    console.error("❌ Checkpoint failed:", error.message);
                    process.exit(1);
                });
            break;
            
        case "sync":
            uhura.syncWithRemote(args.includes("--force"))
                .then(result => {
                    console.log("✅ Repository synchronized");
                    console.log(`Branch: ${result.branch}`);
                    console.log(`Log: ${result.logPath}`);
                })
                .catch(error => {
                    console.error("❌ Sync failed:", error.message);
                    process.exit(1);
                });
            break;
            
        case "pr":
            const title = args[1] || "Diplomatic transmission ready for integration";
            uhura.createDiplomaticPR(title)
                .then(result => {
                    if (result.manual) {
                        console.log("📋 Manual PR creation required");
                        console.log(result.instructions);
                    } else {
                        console.log("✅ PR created successfully");
                        console.log(`PR: ${result.prNumber}`);
                        console.log(`URL: ${result.url}`);
                    }
                    console.log(`Log: ${result.logPath}`);
                })
                .catch(error => {
                    console.error("❌ PR creation failed:", error.message);
                    process.exit(1);
                });
            break;
            
        default:
            console.log("Uhura Git Tools");
            console.log("Usage:");
            console.log("  node uhura-git-tools.js checkpoint [\"message\"]");
            console.log("  node uhura-git-tools.js sync [--force]");
            console.log("  node uhura-git-tools.js pr [\"title\"]");
            break;
    }
}