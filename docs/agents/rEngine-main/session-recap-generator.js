#!/usr/bin/env node

/**
 * Session Recap Generator
 * 
 * Reads lastsession.json and generates a markdown recap for the user
 * Similar to the conversation summary system, but focused on session handoffs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SessionRecapGenerator {
    constructor() {
        this.enginePath = process.cwd();
        this.sessionFile = path.join(this.enginePath, 'lastsession.json');
        this.outputFile = path.join(this.enginePath, 'SESSION_RECAP.md');
    }

    async generateRecap() {
        try {
            console.log('📋 Generating session recap from lastsession.json...');
            
            // Read the last session data
            const sessionData = await this.readSessionData();
            if (!sessionData) {
                console.log('❌ No session data found');
                return;
            }
            
            // Generate markdown content
            const markdown = this.createMarkdown(sessionData);
            
            // Write to file
            await fs.writeFile(this.outputFile, markdown, 'utf8');
            
            console.log(`✅ Session recap generated: ${this.outputFile}`);
            console.log(`📖 Last session: ${sessionData.summary?.mainObjective || 'Unknown objective'}`);
            
        } catch (error) {
            console.error(`❌ Failed to generate session recap: ${error.message}`);
        }
    }

    async readSessionData() {
        try {
            const content = await fs.readFile(this.sessionFile, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.log(`⚠️  No previous session data found (${error.message})`);
            return null;
        }
    }

    createMarkdown(sessionData) {
        const timestamp = new Date(sessionData.timestamp).toLocaleString();
        const session = sessionData.summary || {};
        const context = sessionData.context || {};
        const handoff = sessionData.handoff || {};
        
        return `# 📋 Last Session Recap

**Session ID:** \`${sessionData.sessionId}\`  
**Completed:** ${timestamp}  
**Status:** ${sessionData.status}

## 🎯 Main Objective
${session.mainObjective || 'No objective recorded'}

## ✅ Key Accomplishments
${session.keyAccomplishments ? session.keyAccomplishments.map(item => `- ${item}`).join('\n') : '- No accomplishments recorded'}

## 🔧 Technical Changes
${session.technicalChanges ? session.technicalChanges.map(item => `- ${item}`).join('\n') : '- No technical changes recorded'}

## 📂 Working Context
- **Directory:** \`${context.workingDirectory || 'Unknown'}\`
- **AI Model:** \`${context.aiModel || 'Not specified'}\`
- **Active Files:** ${context.activeFiles ? context.activeFiles.map(f => `\`${f}\``).join(', ') : 'None'}

## 🧠 Memory State
${context.memoryState ? Object.entries(context.memoryState).map(([key, value]) => `- **${key}:** ${value}`).join('\n') : '- No memory state recorded'}

## 🚀 Next Steps
${session.nextSteps ? session.nextSteps.map(item => `- [ ] ${item}`).join('\n') : '- No next steps defined'}

## 🔄 Handoff Information
${handoff.description ? `
**Type:** ${handoff.type}  
**Priority:** ${handoff.priority}  
**Description:** ${handoff.description}

**Required Context:**
${handoff.requiredContext ? handoff.requiredContext.map(item => `- ${item}`).join('\n') : '- No context specified'}
` : '- No handoff information'}

---
*Generated automatically by Session Recap Generator*  
*To update this recap, modify \`lastsession.json\` and run \`node session-recap-generator.js\`*
`;
    }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new SessionRecapGenerator();
    await generator.generateRecap();
}

export default SessionRecapGenerator;
