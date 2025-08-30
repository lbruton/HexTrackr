#!/usr/bin/env node
/* eslint-env node */
/**
 * HexTrackr Memory Wrapper Integration Script
 * Easily install/remove memento-protocol-enhanced wrapper for development
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const WRAPPER_PACKAGE = "memento-protocol-enhanced";
const MCP_CONFIG_PATH = path.join(process.env.HOME, ".vscode", "mcp-settings.json");

class MemoryWrapperManager {
    constructor() {
        this.packageJsonPath = path.join(process.cwd(), "package.json");
    }

    async install() {
        console.log("🚀 Installing memento-protocol-enhanced wrapper...\n");

        try {
            // 1. Install as dev dependency
            console.log("1. Installing wrapper package as dev dependency...");
            execSync(`npm install --save-dev ${WRAPPER_PACKAGE}`, { stdio: "inherit" });

            // 2. Create MCP configuration backup
            console.log("2. Backing up MCP configuration...");
            this.backupMCPConfig();

            // 3. Add wrapper to MCP settings
            console.log("3. Adding wrapper to MCP settings...");
            this.addWrapperToMCP();

            // 4. Create removal script
            console.log("4. Creating easy removal script...");
            this.createRemovalScript();

            console.log("\n✅ Wrapper installation complete!");
            console.log("📋 Next steps:");
            console.log("   - Restart VS Code to load enhanced memory capabilities");
            console.log("   - Run `npm run memory:remove` to easily remove before shipping");
            console.log("   - Standard memento-mcp continues to work as fallback");

        } catch (error) {
            console.error("❌ Installation failed:", error.message);
            process.exit(1);
        }
    }

    async remove() {
        console.log("🗑️  Removing memento-protocol-enhanced wrapper...\n");

        try {
            // 1. Remove package
            console.log("1. Uninstalling wrapper package...");
            execSync(`npm uninstall ${WRAPPER_PACKAGE}`, { stdio: "inherit" });

            // 2. Restore MCP configuration
            console.log("2. Restoring original MCP configuration...");
            this.restoreMCPConfig();

            // 3. Clean up scripts
            console.log("3. Cleaning up management scripts...");
            this.cleanupScripts();

            console.log("\n✅ Wrapper removal complete!");
            console.log("📋 Status:");
            console.log("   - Enhanced wrapper removed");
            console.log("   - Standard memento-mcp continues working");
            console.log("   - Ready for production shipping");

        } catch (error) {
            console.error("❌ Removal failed:", error.message);
            process.exit(1);
        }
    }

    backupMCPConfig() {
        if (fs.existsSync(MCP_CONFIG_PATH)) {
            const backup = MCP_CONFIG_PATH + ".backup";
            fs.copyFileSync(MCP_CONFIG_PATH, backup);
            console.log(`   ✓ Backed up to ${backup}`);
        } else {
            console.log("   ⚠️  No existing MCP config found");
        }
    }

    addWrapperToMCP() {
        let config = {};
        
        if (fs.existsSync(MCP_CONFIG_PATH)) {
            config = JSON.parse(fs.readFileSync(MCP_CONFIG_PATH, "utf8"));
        }

        // Add wrapper configuration
        config["memento-enhanced"] = {
            command: "node",
            args: ["./node_modules/memento-protocol-enhanced/src/index.js"],
            env: {
                MEMENTO_WRAPPER_MODE: "development",
                FALLBACK_TO_STANDARD: "true"
            }
        };

        // Ensure directory exists
        fs.mkdirSync(path.dirname(MCP_CONFIG_PATH), { recursive: true });
        
        // Write updated config
        fs.writeFileSync(MCP_CONFIG_PATH, JSON.stringify(config, null, 2));
        console.log("   ✓ Added memento-enhanced to MCP settings");
    }

    restoreMCPConfig() {
        const backup = MCP_CONFIG_PATH + ".backup";
        
        if (fs.existsSync(backup)) {
            fs.copyFileSync(backup, MCP_CONFIG_PATH);
            fs.unlinkSync(backup);
            console.log("   ✓ Restored original MCP configuration");
        } else {
            // Remove wrapper from current config
            if (fs.existsSync(MCP_CONFIG_PATH)) {
                const config = JSON.parse(fs.readFileSync(MCP_CONFIG_PATH, "utf8"));
                delete config["memento-enhanced"];
                fs.writeFileSync(MCP_CONFIG_PATH, JSON.stringify(config, null, 2));
                console.log("   ✓ Removed wrapper from MCP configuration");
            }
        }
    }

    createRemovalScript() {
        const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, "utf8"));
        
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        packageJson.scripts["memory:install"] = "node scripts/memory-wrapper-manager.js install";
        packageJson.scripts["memory:remove"] = "node scripts/memory-wrapper-manager.js remove";
        packageJson.scripts["memory:status"] = "node scripts/memory-wrapper-manager.js status";
        
        fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
        console.log("   ✓ Added npm scripts for easy management");
    }

    cleanupScripts() {
        const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, "utf8"));
        
        if (packageJson.scripts) {
            delete packageJson.scripts["memory:install"];
            delete packageJson.scripts["memory:remove"];
            delete packageJson.scripts["memory:status"];
        }
        
        fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
        console.log("   ✓ Removed management scripts");
    }

    status() {
        console.log("📊 Memory Wrapper Status\n");

        // Check if wrapper is installed
        const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, "utf8"));
        const isInstalled = packageJson.devDependencies && 
                           packageJson.devDependencies[WRAPPER_PACKAGE];

        console.log(`Package Status: ${isInstalled ? "✅ Installed" : "❌ Not Installed"}`);

        // Check MCP configuration
        let mcpConfigured = false;
        if (fs.existsSync(MCP_CONFIG_PATH)) {
            const config = JSON.parse(fs.readFileSync(MCP_CONFIG_PATH, "utf8"));
            mcpConfigured = !!config["memento-enhanced"];
        }

        console.log(`MCP Config: ${mcpConfigured ? "✅ Configured" : "❌ Not Configured"}`);
        console.log("Standard memento-mcp: ✅ Always Available");

        console.log("\n📋 Available Commands:");
        console.log("   npm run memory:install  - Install wrapper for development");
        console.log("   npm run memory:remove   - Remove wrapper for shipping");
        console.log("   npm run memory:status   - Check current status");
    }
}

// Command line interface
const manager = new MemoryWrapperManager();
const command = process.argv[2];

switch (command) {
    case "install":
        manager.install();
        break;
    case "remove":
        manager.remove();
        break;
    case "status":
        manager.status();
        break;
    default:
        console.log("Usage: node memory-wrapper-manager.js [install|remove|status]");
        console.log("");
        console.log("Commands:");
        console.log("  install  - Install memento-protocol-enhanced wrapper for development");
        console.log("  remove   - Remove wrapper and restore standard memento-mcp");
        console.log("  status   - Show current installation status");
        process.exit(1);
}
