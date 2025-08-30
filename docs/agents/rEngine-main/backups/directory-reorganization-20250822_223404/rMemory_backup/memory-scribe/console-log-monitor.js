const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");

class ConsoleLogMonitor {
    constructor(memoryScribePath) {
        this.memoryScribePath = memoryScribePath;
        this.logFilePath = path.join(memoryScribePath, "console-activity.log");
        this.aiActivityPath = path.join(memoryScribePath, "ai-agent-activity.json");
        this.isMonitoring = false;
        this.logStream = null;
        this.aiActivity = this.loadAIActivity();
        
        // VS Code console logs locations (common paths)
        this.consoleSources = [
            "/Users/lbruton/Library/Application Support/Code/logs",
            "/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-main/main.js",
            process.stdout,
            process.stderr
        ];
        
        this.agentPatterns = [
            /GitHub Copilot/i,
            /Claude/i,
            /GPT/i,
            /Gemini/i,
            /Memory Scribe/i,
            /MCP/i,
            /mcp-server/i,
            /context7/i,
            /AI Provider/i,
            /replace_string_in_file/i,
            /create_file/i,
            /read_file/i,
            /run_in_terminal/i
        ];
    }

    loadAIActivity() {
        try {
            if (fs.existsSync(this.aiActivityPath)) {
                const content = fs.readFileSync(this.aiActivityPath, "utf8");
                return JSON.parse(content);
            }
        } catch (error) {
            console.error("Error loading AI activity:", error.message);
        }
        
        return {
            sessions: {},
            lastUpdate: new Date().toISOString(),
            totalActivities: 0,
            agentStats: {}
        };
    }

    saveAIActivity() {
        try {
            this.aiActivity.lastUpdate = new Date().toISOString();
            fs.writeFileSync(this.aiActivityPath, JSON.stringify(this.aiActivity, null, 2));
        } catch (error) {
            console.error("Error saving AI activity:", error.message);
        }
    }

    async startMonitoring() {
        if (this.isMonitoring) {
            console.log("Console monitoring already active");
            return;
        }

        console.log("🔍 Starting real-time console log monitoring...");
        this.isMonitoring = true;

        // Create log file if it doesn't exist
        if (!fs.existsSync(this.logFilePath)) {
            fs.writeFileSync(this.logFilePath, `Console Log Monitor Started: ${new Date().toISOString()}\n`);
        }

        // Monitor VS Code extension host logs
        this.monitorVSCodeLogs();
        
        // Monitor current process console output
        this.monitorProcessConsole();
        
        // Monitor terminal activity (if accessible)
        this.monitorTerminalActivity();

        console.log("✅ Console log monitoring active");
    }

    monitorVSCodeLogs() {
        const vscodePath = "/Users/lbruton/Library/Application Support/Code/logs";
        
        if (fs.existsSync(vscodePath)) {
            // Watch for new log files
            const watcher = fs.watch(vscodePath, { recursive: true }, (eventType, filename) => {
                if (filename && filename.includes("exthost") && eventType === "change") {
                    this.processLogFile(path.join(vscodePath, filename));
                }
            });

            console.log("📁 Watching VS Code extension host logs");
        }
    }

    monitorProcessConsole() {
        // Capture console.log, console.error, etc.
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.logActivity("console.log", args.join(" "));
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.logActivity("console.error", args.join(" "));
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.logActivity("console.warn", args.join(" "));
            originalWarn.apply(console, args);
        };

        console.log("📺 Intercepting process console output");
    }

    monitorTerminalActivity() {
        // Monitor common log files that might contain AI agent activity
        const potentialLogFiles = [
            "/Volumes/DATA/GitHub/rEngine/logs/memory-monitor.log",
            "/Volumes/DATA/GitHub/rEngine/memory-scribe/scribe.log"
        ];

        potentialLogFiles.forEach(logFile => {
            try {
                if (fs.existsSync(logFile)) {
                    this.tailLogFile(logFile);
                }
            } catch (error) {
                console.error(`Error checking log file ${logFile}:`, error.message);
            }
        });
    }

    tailLogFile(filePath) {
        try {
            const tail = spawn("tail", ["-f", filePath]);
            
            tail.stdout.on("data", (data) => {
                const content = data.toString();
                this.processLogContent(content, path.basename(filePath));
            });

            tail.stderr.on("data", (data) => {
                console.error(`Tail error for ${filePath}:`, data.toString());
            });

            console.log(`📜 Tailing log file: ${filePath}`);
        } catch (error) {
            console.error(`Failed to tail ${filePath}:`, error.message);
        }
    }

    processLogFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, "utf8");
                this.processLogContent(content, path.basename(filePath));
            }
        } catch (error) {
            // File might be locked or in use
        }
    }

    processLogContent(content, source) {
        try {
            if (!content || typeof content !== "string") {return;}
            
            const lines = content.split("\n");
            
            lines.forEach(line => {
                try {
                    if (line.trim() && this.isAIAgentActivity(line)) {
                        this.logActivity(`ai-agent-${source}`, line);
                        this.trackAIActivity(line, source);
                    }
                } catch (error) {
                    console.error("Error processing line:", error.message);
                }
            });
        } catch (error) {
            console.error("Error processing log content:", error.message);
        }
    }

    isAIAgentActivity(line) {
        return this.agentPatterns.some(pattern => pattern.test(line));
    }

    logActivity(type, content) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type}: ${content}\n`;
        
        try {
            fs.appendFileSync(this.logFilePath, logEntry);
        } catch (error) {
            console.error("Failed to write to log:", error.message);
        }
    }

    trackAIActivity(content, source) {
        const timestamp = new Date().toISOString();
        const sessionKey = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
        
        if (!this.aiActivity.sessions[sessionKey]) {
            this.aiActivity.sessions[sessionKey] = {
                activities: [],
                agentCounts: {},
                startTime: timestamp
            };
        }

        // Extract agent name from content
        let agent = "unknown";
        for (const pattern of this.agentPatterns) {
            const match = content.match(pattern);
            if (match) {
                agent = match[0].toLowerCase().replace(/\s+/g, "_");
                break;
            }
        }

        const activity = {
            timestamp,
            agent,
            source,
            content: content.substring(0, 200), // Truncate long content
            type: this.classifyActivity(content)
        };

        this.aiActivity.sessions[sessionKey].activities.push(activity);
        this.aiActivity.sessions[sessionKey].agentCounts[agent] = 
            (this.aiActivity.sessions[sessionKey].agentCounts[agent] || 0) + 1;

        this.aiActivity.totalActivities++;
        
        // Update agent stats
        if (!this.aiActivity.agentStats[agent]) {
            this.aiActivity.agentStats[agent] = {
                totalActivities: 0,
                lastSeen: timestamp,
                sources: new Set()
            };
        }
        
        this.aiActivity.agentStats[agent].totalActivities++;
        this.aiActivity.agentStats[agent].lastSeen = timestamp;
        this.aiActivity.agentStats[agent].sources.add(source);

        // Convert Set to Array for JSON serialization
        Object.keys(this.aiActivity.agentStats).forEach(agentKey => {
            if (this.aiActivity.agentStats[agentKey].sources instanceof Set) {
                this.aiActivity.agentStats[agentKey].sources = 
                    Array.from(this.aiActivity.agentStats[agentKey].sources);
            }
        });

        this.saveAIActivity();
    }

    classifyActivity(content) {
        if (content.includes("replace_string_in_file")) {return "file_edit";}
        if (content.includes("create_file")) {return "file_create";}
        if (content.includes("read_file")) {return "file_read";}
        if (content.includes("run_in_terminal")) {return "terminal_command";}
        if (content.includes("error") || content.includes("Error")) {return "error";}
        if (content.includes("warning") || content.includes("Warning")) {return "warning";}
        if (content.includes("memory") || content.includes("Memory")) {return "memory_operation";}
        return "general";
    }

    stopMonitoring() {
        this.isMonitoring = false;
        console.log("🛑 Console log monitoring stopped");
    }

    getActivitySummary() {
        const today = new Date().toISOString().substring(0, 10);
        const todaySession = this.aiActivity.sessions[today];
        
        return {
            isMonitoring: this.isMonitoring,
            totalActivities: this.aiActivity.totalActivities,
            todayActivities: todaySession ? todaySession.activities.length : 0,
            agentStats: this.aiActivity.agentStats,
            lastUpdate: this.aiActivity.lastUpdate,
            logFilePath: this.logFilePath,
            aiActivityPath: this.aiActivityPath
        };
    }

    getRecentActivity(limit = 50) {
        const allActivities = [];
        
        Object.keys(this.aiActivity.sessions)
            .sort()
            .reverse()
            .forEach(sessionKey => {
                allActivities.push(...this.aiActivity.sessions[sessionKey].activities);
            });

        return allActivities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }
}

module.exports = ConsoleLogMonitor;
