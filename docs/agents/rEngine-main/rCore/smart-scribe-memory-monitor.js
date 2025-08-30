#!/usr/bin/env node

/**
 * Smart Scribe Memory Health Monitor
 * 
 * Integrates with Smart Scribe to provide real-time memory health monitoring
 * Monitors both MCP Server and rMemory Local Storage for sync issues
 * 
 * Features:
 * - Real-time memory health checks during Smart Scribe operation
 * - MCP server connectivity validation
 * - Local memory file integrity verification
 * - Automatic sync gap detection
 * - Integration with existing Smart Scribe monitoring
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

class SmartScribeMemoryMonitor {
    constructor() {
        this.baseDir = '/Volumes/DATA/GitHub/rEngine';
        this.memoryDir = path.join(this.baseDir, 'rMemory', 'rAgentMemories');
        this.logDir = path.join(this.baseDir, 'logs');
        
        // Critical files to monitor
        this.criticalFiles = [
            'memory.json',
            'handoff.json',
            'tasks.json',
            'persistent-memory.json',
            'mcp-sync-summary.json'
        ];
        
        // Health check thresholds
        this.maxFileAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.checkInterval = 15 * 60 * 1000; // 15 minutes
        this.lastHealthCheck = null;
        this.healthStatus = 'unknown';
    }

    /**
     * Check if MCP server is accessible from Smart Scribe context
     */
    async checkMCPConnectivity() {
        try {
            // Check if MCP memory server process is running
            const mcpMemoryCheck = execSync('ps aux | grep mcp-server-memory | grep -v grep', { encoding: 'utf8' });
            const rEngineMCPCheck = execSync('ps aux | grep "node.*index.js" | grep rEngine | grep -v grep', { encoding: 'utf8' });
            
            return {
                mcp_memory_server: mcpMemoryCheck.trim().length > 0,
                rengine_mcp_server: rEngineMCPCheck.trim().length > 0,
                overall_status: mcpMemoryCheck.trim().length > 0 && rEngineMCPCheck.trim().length > 0
            };
        } catch (error) {
            return {
                mcp_memory_server: false,
                rengine_mcp_server: false,
                overall_status: false,
                error: error.message
            };
        }
    }

    /**
     * Validate local memory file integrity
     */
    async validateLocalMemory() {
        const validation = {
            files_checked: 0,
            files_healthy: 0,
            files_stale: 0,
            files_missing: 0,
            issues: [],
            overall_health: 'healthy'
        };

        for (const filename of this.criticalFiles) {
            const filePath = path.join(this.memoryDir, filename);
            validation.files_checked++;
            
            if (await fs.pathExists(filePath)) {
                try {
                    const stats = await fs.stat(filePath);
                    const age = Date.now() - stats.mtime.getTime();
                    
                    if (age > this.maxFileAge) {
                        validation.files_stale++;
                        validation.issues.push(`${filename} is ${Math.round(age / (1000 * 60 * 60))}h old - may need refresh`);
                        validation.overall_health = 'warning';
                    } else {
                        validation.files_healthy++;
                    }
                    
                    // Validate JSON structure for critical files
                    if (filename.endsWith('.json')) {
                        const content = await fs.readJson(filePath);
                        if (!content || typeof content !== 'object') {
                            validation.issues.push(`${filename} has invalid JSON structure`);
                            validation.overall_health = 'critical';
                        }
                    }
                } catch (error) {
                    validation.issues.push(`${filename} read error: ${error.message}`);
                    validation.overall_health = 'critical';
                }
            } else {
                validation.files_missing++;
                validation.issues.push(`${filename} is missing - critical for agent continuity`);
                validation.overall_health = 'critical';
            }
        }

        return validation;
    }

    /**
     * Check for sync gaps between MCP and local storage
     */
    async checkSyncGaps() {
        const syncCheck = {
            last_sync_time: null,
            sync_gap_hours: null,
            mcp_sync_summary_exists: false,
            recent_activity: false,
            status: 'unknown'
        };

        try {
            // Check MCP sync summary
            const mcpSyncPath = path.join(this.memoryDir, 'mcp-sync-summary.json');
            if (await fs.pathExists(mcpSyncPath)) {
                syncCheck.mcp_sync_summary_exists = true;
                const syncSummary = await fs.readJson(mcpSyncPath);
                
                if (syncSummary.last_sync) {
                    syncCheck.last_sync_time = syncSummary.last_sync;
                    const syncAge = Date.now() - new Date(syncSummary.last_sync).getTime();
                    syncCheck.sync_gap_hours = Math.round(syncAge / (1000 * 60 * 60));
                    
                    if (syncCheck.sync_gap_hours > 24) {
                        syncCheck.status = 'stale';
                    } else if (syncCheck.sync_gap_hours > 12) {
                        syncCheck.status = 'warning';
                    } else {
                        syncCheck.status = 'fresh';
                    }
                }
            }

            // Check for recent memory activity
            const persistentPath = path.join(this.memoryDir, 'persistent-memory.json');
            if (await fs.pathExists(persistentPath)) {
                const persistent = await fs.readJson(persistentPath);
                if (persistent.metadata && persistent.metadata.lastSync) {
                    const lastActivity = new Date(persistent.metadata.lastSync).getTime();
                    const activityAge = Date.now() - lastActivity;
                    syncCheck.recent_activity = activityAge < (6 * 60 * 60 * 1000); // Within 6 hours
                }
            }
        } catch (error) {
            syncCheck.status = 'error';
            syncCheck.error = error.message;
        }

        return syncCheck;
    }

    /**
     * Perform comprehensive memory health check
     */
    async performHealthCheck() {
        const healthReport = {
            timestamp: new Date().toISOString(),
            mcp_connectivity: await this.checkMCPConnectivity(),
            local_memory_validation: await this.validateLocalMemory(),
            sync_gap_analysis: await this.checkSyncGaps(),
            overall_status: 'healthy',
            recommendations: []
        };

        // Determine overall health status
        if (!healthReport.mcp_connectivity.overall_status) {
            healthReport.overall_status = 'critical';
            healthReport.recommendations.push('MCP servers are not running - Smart Scribe will use local fallback');
        }

        if (healthReport.local_memory_validation.overall_health === 'critical') {
            healthReport.overall_status = 'critical';
            healthReport.recommendations.push('Critical local memory files are missing or corrupted');
        } else if (healthReport.local_memory_validation.overall_health === 'warning') {
            if (healthReport.overall_status !== 'critical') {
                healthReport.overall_status = 'warning';
            }
            healthReport.recommendations.push('Some memory files are stale - consider running memory sync');
        }

        if (healthReport.sync_gap_analysis.status === 'stale') {
            if (healthReport.overall_status !== 'critical') {
                healthReport.overall_status = 'warning';
            }
            healthReport.recommendations.push('Memory sync gap detected - run automated sync to resolve');
        }

        // Add positive recommendations for healthy system
        if (healthReport.overall_status === 'healthy') {
            healthReport.recommendations.push('Memory system is healthy - continue normal operation');
        }

        this.lastHealthCheck = Date.now();
        this.healthStatus = healthReport.overall_status;

        return healthReport;
    }

    /**
     * Generate Smart Scribe compatible log entry
     */
    formatForSmartScribe(healthReport) {
        const statusIcon = {
            'healthy': '✅',
            'warning': '⚠️',
            'critical': '❌'
        }[healthReport.overall_status] || '❓';

        const summary = `${statusIcon} Memory Health: ${healthReport.overall_status.toUpperCase()}`;
        
        const details = {
            mcp_servers: healthReport.mcp_connectivity.overall_status ? '✅ Running' : '❌ Offline',
            local_files: `${healthReport.local_memory_validation.files_healthy}/${healthReport.local_memory_validation.files_checked} healthy`,
            sync_status: healthReport.sync_gap_analysis.status || 'unknown',
            recommendations: healthReport.recommendations.length
        };

        return {
            summary,
            details,
            raw_report: healthReport
        };
    }

    /**
     * Integration point for Smart Scribe monitoring
     */
    async getMemoryHealthForScribe() {
        // Only run full check if enough time has passed or status is unknown
        const timeSinceLastCheck = this.lastHealthCheck ? Date.now() - this.lastHealthCheck : Infinity;
        
        if (timeSinceLastCheck > this.checkInterval || this.healthStatus === 'unknown') {
            const healthReport = await this.performHealthCheck();
            const scribeFormat = this.formatForSmartScribe(healthReport);
            
            // Save report for Smart Scribe dashboard
            const reportPath = path.join(this.logDir, 'smart-scribe-memory-health.json');
            await fs.writeJson(reportPath, {
                timestamp: healthReport.timestamp,
                scribe_format: scribeFormat,
                full_report: healthReport
            }, { spaces: 2 });
            
            return scribeFormat;
        } else {
            // Return cached status for frequent checks
            return {
                summary: `${this.healthStatus === 'healthy' ? '✅' : this.healthStatus === 'warning' ? '⚠️' : '❌'} Memory Health: ${this.healthStatus.toUpperCase()} (cached)`,
                details: { cached: true, last_check: new Date(this.lastHealthCheck).toLocaleTimeString() }
            };
        }
    }

    /**
     * Quick connectivity test for Smart Scribe startup
     */
    async quickConnectivityTest() {
        try {
            const mcpStatus = await this.checkMCPConnectivity();
            const mcpSyncExists = await fs.pathExists(path.join(this.memoryDir, 'mcp-sync-summary.json'));
            
            return {
                mcp_available: mcpStatus.overall_status,
                local_fallback_ready: mcpSyncExists,
                smart_scribe_can_operate: mcpStatus.overall_status || mcpSyncExists,
                message: mcpStatus.overall_status ? 
                    'MCP servers accessible - full memory capabilities available' :
                    mcpSyncExists ? 
                        'MCP offline but local fallback available - limited memory capabilities' :
                        'Both MCP and local fallback unavailable - memory operations limited'
            };
        } catch (error) {
            return {
                mcp_available: false,
                local_fallback_ready: false,
                smart_scribe_can_operate: false,
                message: `Memory connectivity test failed: ${error.message}`
            };
        }
    }
}

// CLI interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
    const monitor = new SmartScribeMemoryMonitor();
    
    const command = process.argv[2] || 'health';
    
    switch (command) {
        case 'health':
            console.log('🔍 Performing memory health check...\n');
            const healthReport = await monitor.performHealthCheck();
            const scribeFormat = monitor.formatForSmartScribe(healthReport);
            
            console.log('📊 MEMORY HEALTH REPORT');
            console.log('═══════════════════════');
            console.log(`Status: ${scribeFormat.summary}`);
            console.log(`MCP Servers: ${scribeFormat.details.mcp_servers}`);
            console.log(`Local Files: ${scribeFormat.details.local_files}`);
            console.log(`Sync Status: ${scribeFormat.details.sync_status}`);
            console.log(`Recommendations: ${scribeFormat.details.recommendations} items`);
            
            if (healthReport.recommendations.length > 0) {
                console.log('\n🎯 RECOMMENDATIONS:');
                healthReport.recommendations.forEach((rec, i) => {
                    console.log(`   ${i + 1}. ${rec}`);
                });
            }
            break;
            
        case 'connectivity':
            console.log('🔌 Testing connectivity for Smart Scribe...\n');
            const connectivityTest = await monitor.quickConnectivityTest();
            
            console.log('🚀 SMART SCRIBE CONNECTIVITY');
            console.log('════════════════════════════');
            console.log(`MCP Available: ${connectivityTest.mcp_available ? '✅' : '❌'}`);
            console.log(`Local Fallback: ${connectivityTest.local_fallback_ready ? '✅' : '❌'}`);
            console.log(`Smart Scribe Ready: ${connectivityTest.smart_scribe_can_operate ? '✅' : '❌'}`);
            console.log(`\n💬 ${connectivityTest.message}`);
            break;
            
        case 'scribe':
            console.log('🤖 Smart Scribe memory health integration...\n');
            const scribeHealth = await monitor.getMemoryHealthForScribe();
            
            console.log('🔧 SMART SCRIBE FORMAT');
            console.log('═══════════════════════');
            console.log(`Summary: ${scribeHealth.summary}`);
            console.log('Details:', JSON.stringify(scribeHealth.details, null, 2));
            break;
            
        default:
            console.log('Usage: node smart-scribe-memory-monitor.js [health|connectivity|scribe]');
            break;
    }
}

export default SmartScribeMemoryMonitor;
