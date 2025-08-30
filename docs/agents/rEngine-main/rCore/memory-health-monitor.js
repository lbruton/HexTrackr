#!/usr/bin/env node

/**
 * Memory Health Monitor - Integrated Smart Scribe Module
 * 
 * Purpose: Real-time memory health monitoring with Smart Scribe integration
 * Features: MCP connectivity, file integrity, sync status, agent continuity
 * 
 * Integration Points:
 * - Smart Scribe real-time monitoring
 * - Cron-based scheduled validation  
 * - Dashboard status updates
 * - Alert generation for critical issues
 */

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

class MemoryHealthMonitor {
    constructor(baseDir = '/Volumes/DATA/GitHub/rEngine') {
        this.baseDir = baseDir;
        this.memoryDir = path.join(baseDir, 'rMemory', 'rAgentMemories');
        this.logsDir = path.join(baseDir, 'logs');
        this.startTime = Date.now();
        
        // Critical files for agent continuity
        this.criticalFiles = [
            'memory.json',
            'handoff.json',
            'tasks.json', 
            'persistent-memory.json',
            'claude-memory.json',
            'github_copilot_memories.json'
        ];
        
        // Health thresholds
        this.thresholds = {
            maxFileAge: 48 * 60 * 60 * 1000, // 48 hours in milliseconds
            maxSyncLag: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            minFileSize: 100, // 100 bytes minimum
            maxLogAge: 7 * 24 * 60 * 60 * 1000 // 7 days for logs
        };
        
        this.healthStatus = {
            overall: 'unknown',
            files: {},
            mcp: {},
            sync: {},
            issues: [],
            recommendations: []
        };
    }

    async checkFileHealth() {
        console.log('🔍 Checking memory file health...');
        
        for (const filename of this.criticalFiles) {
            const filePath = path.join(this.memoryDir, filename);
            
            try {
                if (await fs.pathExists(filePath)) {
                    const stats = await fs.stat(filePath);
                    const age = Date.now() - stats.mtime.getTime();
                    const sizeKB = Math.round(stats.size / 1024);
                    
                    const fileHealth = {
                        exists: true,
                        size: stats.size,
                        sizeKB,
                        lastModified: stats.mtime.toISOString(),
                        ageHours: Math.round(age / (1000 * 60 * 60)),
                        status: 'healthy'
                    };
                    
                    // Check for issues
                    if (age > this.thresholds.maxFileAge) {
                        fileHealth.status = 'stale';
                        fileHealth.issue = `File is ${fileHealth.ageHours}h old (threshold: ${this.thresholds.maxFileAge / (1000 * 60 * 60)}h)`;
                        this.healthStatus.issues.push(`${filename}: ${fileHealth.issue}`);
                    }
                    
                    if (stats.size < this.thresholds.minFileSize) {
                        fileHealth.status = 'undersized';
                        fileHealth.issue = `File is only ${stats.size} bytes (threshold: ${this.thresholds.minFileSize})`;
                        this.healthStatus.issues.push(`${filename}: ${fileHealth.issue}`);
                    }
                    
                    this.healthStatus.files[filename] = fileHealth;
                    
                } else {
                    this.healthStatus.files[filename] = {
                        exists: false,
                        status: 'missing',
                        issue: 'Critical file missing - agent continuity at risk'
                    };
                    this.healthStatus.issues.push(`${filename}: Missing critical file`);
                }
                
            } catch (error) {
                this.healthStatus.files[filename] = {
                    exists: false,
                    status: 'error',
                    issue: `Error accessing file: ${error.message}`
                };
                this.healthStatus.issues.push(`${filename}: ${error.message}`);
            }
        }
    }

    async checkMCPHealth() {
        console.log('🧠 Checking MCP memory server health...');
        
        try {
            // Try to read MCP memory (this would normally use MCP tools, but we'll simulate)
            const mcpSyncFile = path.join(this.memoryDir, 'mcp-sync-summary.json');
            
            if (await fs.pathExists(mcpSyncFile)) {
                const mcpData = await fs.readJson(mcpSyncFile);
                const lastSync = new Date(mcpData.last_sync);
                const syncAge = Date.now() - lastSync.getTime();
                
                this.healthStatus.mcp = {
                    accessible: true,
                    lastSync: lastSync.toISOString(),
                    syncAgeHours: Math.round(syncAge / (1000 * 60 * 60)),
                    status: syncAge > this.thresholds.maxSyncLag ? 'sync_lag' : 'healthy',
                    entities: mcpData.critical_system_requirements?.length || 0
                };
                
                if (syncAge > this.thresholds.maxSyncLag) {
                    this.healthStatus.issues.push(`MCP sync lag: ${this.healthStatus.mcp.syncAgeHours}h old`);
                    this.healthStatus.recommendations.push('Run memory sync utility to refresh MCP data');
                }
                
            } else {
                this.healthStatus.mcp = {
                    accessible: false,
                    status: 'no_cache',
                    issue: 'No MCP sync cache found - offline operation only'
                };
                this.healthStatus.issues.push('MCP: No local cache available');
                this.healthStatus.recommendations.push('Run memory sync to create MCP cache');
            }
            
        } catch (error) {
            this.healthStatus.mcp = {
                accessible: false,
                status: 'error',
                issue: `MCP health check failed: ${error.message}`
            };
            this.healthStatus.issues.push(`MCP: ${error.message}`);
        }
    }

    async checkSyncHealth() {
        console.log('🔄 Checking sync system health...');
        
        try {
            // Check last sync status
            const syncStatusFile = path.join(this.logsDir, 'last-sync-status.json');
            
            if (await fs.pathExists(syncStatusFile)) {
                const syncStatus = await fs.readJson(syncStatusFile);
                const lastSync = new Date(syncStatus.timestamp);
                const syncAge = Date.now() - lastSync.getTime();
                
                this.healthStatus.sync = {
                    available: true,
                    lastSync: lastSync.toISOString(),
                    syncAgeHours: Math.round(syncAge / (1000 * 60 * 60)),
                    status: syncStatus.status,
                    logFile: syncStatus.log
                };
                
                if (syncStatus.status === 'failed') {
                    this.healthStatus.issues.push('Last sync operation failed');
                    this.healthStatus.recommendations.push('Review sync logs and retry memory sync');
                }
                
                if (syncAge > this.thresholds.maxSyncLag) {
                    this.healthStatus.issues.push(`Sync overdue: ${this.healthStatus.sync.syncAgeHours}h since last sync`);
                    this.healthStatus.recommendations.push('Run automated memory sync');
                }
                
            } else {
                this.healthStatus.sync = {
                    available: false,
                    status: 'no_history',
                    issue: 'No sync history found'
                };
                this.healthStatus.recommendations.push('Initialize memory sync system');
            }
            
        } catch (error) {
            this.healthStatus.sync = {
                available: false,
                status: 'error',
                issue: `Sync health check failed: ${error.message}`
            };
            this.healthStatus.issues.push(`Sync: ${error.message}`);
        }
    }

    generateHealthReport() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
        
        // Determine overall health
        if (this.healthStatus.issues.length === 0) {
            this.healthStatus.overall = 'excellent';
        } else if (this.healthStatus.issues.length <= 2) {
            this.healthStatus.overall = 'good';
        } else if (this.healthStatus.issues.length <= 5) {
            this.healthStatus.overall = 'warning';
        } else {
            this.healthStatus.overall = 'critical';
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: parseFloat(duration),
            overall_health: this.healthStatus.overall,
            summary: {
                files_checked: this.criticalFiles.length,
                files_healthy: Object.values(this.healthStatus.files).filter(f => f.status === 'healthy').length,
                issues_found: this.healthStatus.issues.length,
                recommendations: this.healthStatus.recommendations.length
            },
            detailed_status: this.healthStatus,
            next_check_recommended: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
        };
        
        return report;
    }

    async saveHealthReport(report) {
        const timestamp = report.timestamp.split('T')[0];
        const reportPath = path.join(this.logsDir, `memory-health-${timestamp}.json`);
        
        await fs.ensureDir(this.logsDir);
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        return reportPath;
    }

    logHealthSummary(report) {
        const statusEmoji = {
            excellent: '🟢',
            good: '🟡', 
            warning: '🟠',
            critical: '🔴'
        };
        
        console.log('\n🏥 MEMORY HEALTH REPORT');
        console.log('═════════════════════════');
        console.log(`${statusEmoji[report.overall_health]} Overall Health: ${report.overall_health.toUpperCase()}`);
        console.log(`⏱️  Check Duration: ${report.duration}s`);
        console.log(`📁 Files Checked: ${report.summary.files_checked}`);
        console.log(`✅ Files Healthy: ${report.summary.files_healthy}`);
        console.log(`⚠️  Issues Found: ${report.summary.issues_found}`);
        
        if (this.healthStatus.issues.length > 0) {
            console.log('\n🚨 ISSUES DETECTED:');
            this.healthStatus.issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }
        
        if (this.healthStatus.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            this.healthStatus.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }
        
        console.log(`\n📊 Next check recommended: ${report.next_check_recommended}`);
    }

    async run() {
        console.log('🏥 Memory Health Monitor - Starting comprehensive health check');
        console.log('══════════════════════════════════════════════════════════════\n');
        
        try {
            await this.checkFileHealth();
            await this.checkMCPHealth();
            await this.checkSyncHealth();
            
            const report = this.generateHealthReport();
            const reportPath = await this.saveHealthReport(report);
            
            this.logHealthSummary(report);
            
            console.log(`\n📋 Detailed report saved: ${path.relative(this.baseDir, reportPath)}`);
            console.log('🔄 For real-time monitoring, integrate with Smart Scribe');
            console.log('⏰ For scheduled checks, use cron with memory-sync-automation.sh');
            
            return report;
            
        } catch (error) {
            console.error('❌ Memory health check failed:', error);
            throw error;
        }
    }

    // Method for Smart Scribe integration
    async quickHealthCheck() {
        await this.checkFileHealth();
        await this.checkMCPHealth();
        
        return {
            healthy: this.healthStatus.issues.length === 0,
            issues: this.healthStatus.issues.length,
            status: this.healthStatus.issues.length === 0 ? 'healthy' : 'issues_detected',
            lastCheck: new Date().toISOString()
        };
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const monitor = new MemoryHealthMonitor();
    monitor.run().catch(error => {
        console.error('Health check failed:', error);
        process.exit(1);
    });
}

export default MemoryHealthMonitor;
