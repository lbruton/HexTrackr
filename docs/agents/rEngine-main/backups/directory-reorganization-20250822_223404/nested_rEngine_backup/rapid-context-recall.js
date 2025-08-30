# rEngine Core: Rapid Context Recall Protocol

**Version:** 1.0.0  
**Date:** August 19, 2025  
**Priority:** Critical System Enhancement  
**Component:** Memory Access Optimization  

---

## 🎯 **Problem Statement**

**Issue:** Agent taking excessive time to recall extended context when user requests "consult rScribe" or "check extended context"  
**Impact:** Poor user experience, inefficient session flow  
**Root Cause:** No direct access protocol for rapid context retrieval  

---

## 🚀 **Solution: Rapid Context Recall System**

### **Protocol Implementation**

**Command Triggers:**
- "consult rScribe"
- "check extended context" 
- "recall what we worked on [timeframe]"
- "rScribe extended context"

**Immediate Action Sequence:**
1. **Skip exploration** - Don't search multiple directories
2. **Direct access** to known context files
3. **Priority order** for maximum relevance
4. **Instant summary** with key findings

### **Priority Context Sources (In Order)**

**1. Recent Session Data** 
```
/rAgents/extendedcontext.json (last 100 lines)
/handoffs/SESSION_HANDOFF_*.md (most recent)
```

**2. Recent Work Evidence**
```
/patchnotes/ (last 3 patches by date)
/docs/resolved/ (most recent fixes)
```

**3. System State**
```
/rProtocols/USER_STARTUP_PROTOCOL.md (current status)
/MASTER_ROADMAP.md (current priorities)
```

---

## 🔧 **Implementation: Rapid Context Tool**

### **New rEngine Core Function**

<function_calls>
<invoke name="create_file">
<parameter name="content">#!/usr/bin/env node

/**
 * rEngine Core: Rapid Context Recall
 * Instantly retrieves and summarizes recent session context
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RapidContextRecall {
    constructor() {
        this.baseDir = path.resolve(__dirname, '..');
        this.contextSources = [
            // Priority 1: Recent session data
            'rAgents/extendedcontext.json',
            'handoffs/SESSION_HANDOFF_2025-08-19_RENGINE_CORE_COMPLETE.md',
            
            // Priority 2: Recent work evidence  
            'patchnotes',
            'docs/resolved',
            
            // Priority 3: Current state
            'rProtocols/USER_STARTUP_PROTOCOL.md',
            'MASTER_ROADMAP.md'
        ];
    }

    async rapidRecall(timeframe = 'recent') {
        console.log('🧠 rEngine Core: Rapid Context Recall Initiated...');
        const startTime = Date.now();
        
        const context = {
            recent_sessions: [],
            recent_work: [],
            current_status: {},
            timeframe,
            recall_time: null
        };

        try {
            // Priority 1: Extended context (last 100 lines)
            const extendedContext = await this.getExtendedContext();
            if (extendedContext) {
                context.recent_sessions.push({
                    source: 'extendedcontext.json',
                    type: 'persistent_memory',
                    data: extendedContext
                });
            }

            // Priority 2: Recent handoffs
            const handoffs = await this.getRecentHandoffs();
            context.recent_sessions.push(...handoffs);

            // Priority 3: Recent patches (last 3)
            const patches = await this.getRecentPatches(3);
            context.recent_work.push(...patches);

            // Priority 4: Recent fixes
            const fixes = await this.getRecentFixes(3);
            context.recent_work.push(...fixes);

            // Priority 5: Current system status
            context.current_status = await this.getCurrentStatus();

            const endTime = Date.now();
            context.recall_time = `${endTime - startTime}ms`;

            return this.formatContextSummary(context);

        } catch (error) {
            console.error('❌ Rapid Context Recall failed:', error.message);
            return `⚠️ Context recall failed: ${error.message}`;
        }
    }

    async getExtendedContext() {
        try {
            const filePath = path.join(this.baseDir, 'rAgents/extendedcontext.json');
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            // Get last 100 lines for recent context
            const recentLines = lines.slice(-100).join('\n');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    async getRecentHandoffs() {
        try {
            const handoffsDir = path.join(this.baseDir, 'handoffs');
            const files = await fs.readdir(handoffsDir);
            const handoffFiles = files
                .filter(f => f.includes('SESSION_HANDOFF') && f.endsWith('.md'))
                .sort()
                .slice(-2); // Last 2 handoffs

            const handoffs = [];
            for (const file of handoffFiles) {
                try {
                    const content = await fs.readFile(path.join(handoffsDir, file), 'utf-8');
                    // Get first 20 lines for summary
                    const summary = content.split('\n').slice(0, 20).join('\n');
                    handoffs.push({
                        source: file,
                        type: 'session_handoff',
                        summary,
                        date: file.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 'unknown'
                    });
                } catch (err) {
                    // Skip files that can't be read
                }
            }
            return handoffs;
        } catch (error) {
            return [];
        }
    }

    async getRecentPatches(count = 3) {
        try {
            const patchDir = path.join(this.baseDir, 'patchnotes');
            const files = await fs.readdir(patchDir);
            const patchFiles = files
                .filter(f => f.startsWith('PATCH-') && f.endsWith('.md'))
                .sort()
                .slice(-count);

            const patches = [];
            for (const file of patchFiles) {
                try {
                    const content = await fs.readFile(path.join(patchDir, file), 'utf-8');
                    // Extract key info from first 15 lines
                    const lines = content.split('\n').slice(0, 15);
                    const summary = lines.join('\n');
                    patches.push({
                        source: file,
                        type: 'patch_note',
                        summary,
                        version: file.match(/PATCH-(.+)\.md/)?.[1] || 'unknown'
                    });
                } catch (err) {
                    // Skip files that can't be read
                }
            }
            return patches;
        } catch (error) {
            return [];
        }
    }

    async getRecentFixes(count = 3) {
        try {
            const fixesDir = path.join(this.baseDir, 'docs/resolved');
            const files = await fs.readdir(fixesDir);
            const fixFiles = files
                .filter(f => f.endsWith('.md') && f !== 'README.md')
                .sort()
                .slice(-count);

            const fixes = [];
            for (const file of fixFiles) {
                try {
                    const content = await fs.readFile(path.join(fixesDir, file), 'utf-8');
                    // Extract summary from first 10 lines
                    const summary = content.split('\n').slice(0, 10).join('\n');
                    fixes.push({
                        source: file,
                        type: 'resolved_fix',
                        summary,
                        fix_id: file.replace('.md', '')
                    });
                } catch (err) {
                    // Skip files that can't be read
                }
            }
            return fixes;
        } catch (error) {
            return [];
        }
    }

    async getCurrentStatus() {
        const status = {
            system_state: 'unknown',
            active_processes: [],
            current_version: 'unknown'
        };

        try {
            // Check recent handoff for current status
            const handoffPath = path.join(this.baseDir, 'handoffs/SESSION_HANDOFF_2025-08-19_RENGINE_CORE_COMPLETE.md');
            const handoffContent = await fs.readFile(handoffPath, 'utf-8');
            
            if (handoffContent.includes('ALL CLEAR')) {
                status.system_state = 'operational';
            }
            if (handoffContent.includes('rEngine Core v1.2.2')) {
                status.current_version = '1.2.2';
            }

        } catch (error) {
            // Use defaults
        }

        return status;
    }

    formatContextSummary(context) {
        let summary = `🧠 **Rapid Context Recall Complete** (${context.recall_time})\n\n`;

        // Recent Sessions
        if (context.recent_sessions.length > 0) {
            summary += `## 📋 **Recent Sessions**\n`;
            context.recent_sessions.forEach(session => {
                if (session.type === 'session_handoff') {
                    summary += `- **${session.date}:** ${session.source}\n`;
                    const firstLine = session.summary.split('\n')[0];
                    summary += `  ${firstLine}\n\n`;
                }
            });
        }

        // Recent Work
        if (context.recent_work.length > 0) {
            summary += `## 🔧 **Recent Work**\n`;
            context.recent_work.forEach(work => {
                if (work.type === 'patch_note') {
                    summary += `- **PATCH ${work.version}:** `;
                    const titleLine = work.summary.split('\n').find(line => line.startsWith('# '));
                    if (titleLine) {
                        summary += titleLine.replace('# ', '') + '\n';
                    }
                } else if (work.type === 'resolved_fix') {
                    summary += `- **FIX:** ${work.fix_id}\n`;
                }
            });
            summary += '\n';
        }

        // Current Status
        summary += `## ⚡ **Current Status**\n`;
        summary += `- **System:** ${context.current_status.system_state}\n`;
        summary += `- **Version:** rEngine Core v${context.current_status.current_version}\n`;
        summary += `- **Context Timeframe:** ${context.timeframe}\n\n`;

        summary += `**💡 For detailed information, specify: "Show me details about [specific item]"**`;

        return summary;
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const recall = new RapidContextRecall();
    const timeframe = process.argv[2] || 'recent';
    
    recall.rapidRecall(timeframe)
        .then(summary => console.log(summary))
        .catch(error => console.error('Error:', error.message));
}

export default RapidContextRecall;
