#!/usr/bin/env node

/**
 * Emergency VS Code Chat Debug Log Recall System
 * 
 * Accesses VS Code debug logs to restore full conversation context
 * and sync AI agent memory for session continuity
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VS Code debug log locations
const VSCODE_PATHS = [
    path.join(os.homedir(), 'Library/Application Support/Code/logs'),
    path.join(os.homedir(), 'Library/Application Support/Code - Insiders/logs'),
    path.join(os.homedir(), '.vscode/logs'),
    path.join(os.homedir(), '.config/Code/logs')
];

console.log('🚨 EMERGENCY RECALL: VS Code Chat Debug Log Recovery');
console.log('================================================');

class EmergencyRecall {
    constructor() {
        this.conversations = [];
        this.memoryPath = path.join(__dirname, 'rMemory');
        this.outputPath = path.join(__dirname, 'emergency-recall-output.json');
    }

    async findVSCodeLogs() {
        console.log('🔍 Searching for VS Code debug logs...');
        
        for (const vscodePath of VSCODE_PATHS) {
            try {
                await fs.access(vscodePath);
                console.log(`✅ Found VS Code logs: ${vscodePath}`);
                
                // Get recent log directories (last 7 days)
                const entries = await fs.readdir(vscodePath);
                const recentDirs = entries
                    .filter(entry => entry.match(/^\d{4}-\d{2}-\d{2}/)) // Date format
                    .sort()
                    .slice(-7); // Last 7 days
                
                console.log(`📅 Recent log directories: ${recentDirs.join(', ')}`);
                return { basePath: vscodePath, recentDirs };
                
            } catch (error) {
                console.log(`❌ Not found: ${vscodePath}`);
            }
        }
        
        throw new Error('No VS Code debug logs found');
    }

    async extractChatLogs(basePath, recentDirs) {
        console.log('💬 Extracting chat conversations...');
        
        for (const dirName of recentDirs) {
            const logDir = path.join(basePath, dirName);
            
            try {
                // Look for chat-related log files
                const files = await fs.readdir(logDir);
                const chatFiles = files.filter(f => 
                    f.includes('chat') || 
                    f.includes('copilot') || 
                    f.includes('extension') ||
                    f.includes('main')
                );
                
                console.log(`📂 ${dirName}: Found ${chatFiles.length} potential chat files`);
                
                for (const file of chatFiles) {
                    await this.processChatFile(path.join(logDir, file), dirName);
                }
                
            } catch (error) {
                console.log(`⚠️  Could not read ${dirName}: ${error.message}`);
            }
        }
    }

    async processChatFile(filePath, date) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            // Extract chat conversations using patterns
            const patterns = [
                /(\[.*?\].*?copilot.*?)/gi,
                /(\[.*?\].*?chat.*?)/gi,
                /(\[.*?\].*?conversation.*?)/gi,
                /("userMessage".*?"assistantMessage".*?)/gi,
                /(user.*?request.*?assistant.*?response)/gi
            ];
            
            for (const pattern of patterns) {
                const matches = content.match(pattern);
                if (matches) {
                    this.conversations.push({
                        date,
                        file: path.basename(filePath),
                        matches: matches.slice(0, 10) // Limit per file
                    });
                }
            }
            
        } catch (error) {
            // File might be locked or binary, skip silently
        }
    }

    async syncToMemory() {
        console.log('🧠 Syncing to rEngine memory systems...');
        
        // Prepare emergency context
        const emergencyContext = {
            timestamp: new Date().toISOString(),
            source: 'emergency-vscode-recall',
            conversations: this.conversations,
            summary: `Emergency recall recovered ${this.conversations.length} conversation fragments from VS Code debug logs`,
            systemState: 'context-restored'
        };
        
        // Save to emergency recall output
        await fs.writeFile(this.outputPath, JSON.stringify(emergencyContext, null, 2));
        
        // Update Enhanced Scribe Console memory
        try {
            const memoryScratch = path.join(this.memoryPath, 'emergency-context.json');
            await fs.writeFile(memoryScratch, JSON.stringify(emergencyContext, null, 2));
            console.log('✅ Emergency context saved to memory systems');
        } catch (error) {
            console.log('⚠️  Could not update memory systems:', error.message);
        }
        
        // Update persistent memory
        try {
            const persistentPath = path.join(__dirname, 'persistent-memory.json');
            const existing = JSON.parse(await fs.readFile(persistentPath, 'utf8'));
            existing.emergency_recall = emergencyContext;
            existing.last_updated = new Date().toISOString();
            await fs.writeFile(persistentPath, JSON.stringify(existing, null, 2));
            console.log('✅ Updated persistent memory with emergency context');
        } catch (error) {
            console.log('⚠️  Could not update persistent memory:', error.message);
        }
    }

    async execute() {
        try {
            const { basePath, recentDirs } = await this.findVSCodeLogs();
            await this.extractChatLogs(basePath, recentDirs);
            await this.syncToMemory();
            
            console.log('================================================');
            console.log('🎯 EMERGENCY RECALL COMPLETE');
            console.log(`📊 Recovered: ${this.conversations.length} conversation fragments`);
            console.log(`📄 Output: ${this.outputPath}`);
            console.log('💡 Run Enhanced Scribe Console to process emergency context');
            console.log('================================================');
            
        } catch (error) {
            console.error('❌ Emergency recall failed:', error.message);
            console.log('💡 Manual fallback: Check ~/Library/Application Support/Code/logs manually');
        }
    }
}

// Execute emergency recall
const recall = new EmergencyRecall();
recall.execute();
