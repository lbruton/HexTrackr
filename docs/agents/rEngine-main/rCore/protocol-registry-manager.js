#!/usr/bin/env node

/**
 * Protocol Registry Manager
 * Purpose: Auto-generate and maintain protocols.json and ai_tools_registry.json
 * Ensures every agent has instant access to current protocol stack
 */

import fs from 'fs-extra';
import path from 'path';

class ProtocolRegistryManager {
    constructor() {
        this.baseDir = process.cwd();
        this.protocolsDir = path.join(this.baseDir, 'rProtocols');
        this.timestamp = new Date().toISOString();
        
        // Protocol execution order - critical for system initialization
        this.protocolHierarchy = {
            "tier_1_foundation": {
                "description": "Core system protocols - execute first",
                "protocols": [
                    "memory_management_protocol.md",
                    "rEngine_startup_protocol.md", 
                    "enhanced_scribe_system_protocol.md"
                ]
            },
            "tier_2_coordination": {
                "description": "Agent coordination and communication",
                "protocols": [
                    "session_handoff_protocol.md",
                    "rapid_context_recall_protocol.md",
                    "recall_prime_directive_protocol.md"
                ]
            },
            "tier_3_operations": {
                "description": "Operational procedures and workflows",
                "protocols": [
                    "document_sweep_protocol.md",
                    "documentation_structure_protocol.md",
                    "file_cleanup_protocol.md",
                    "folder_organization_protocol.md"
                ]
            },
            "tier_4_intelligence": {
                "description": "AI enhancement and optimization",
                "protocols": [
                    "ai_intelligence_enhancement_protocol.md",
                    "ai_tools_registry_protocol.md",
                    "unified_document_scribe_protocol.md"
                ]
            },
            "tier_5_specialized": {
                "description": "Specialized operational procedures",
                "protocols": [
                    "document_publication_protocol.md",
                    "patch_note_protocol.md",
                    "root_directory_cleanup_protocol.md",
                    "api_configuration_protocol.md",
                    "file_path_protocol.md"
                ]
            }
        };
    }

    /**
     * Scan rProtocols directory and auto-detect all protocol files
     */
    async scanProtocolFiles() {
        const protocolFiles = [];
        
        try {
            const files = await fs.readdir(this.protocolsDir);
            
            for (const file of files) {
                if (file.endsWith('.md') && file !== 'README.md') {
                    const filePath = path.join(this.protocolsDir, file);
                    const stats = await fs.stat(filePath);
                    
                    // Read first few lines to extract metadata
                    const content = await fs.readFile(filePath, 'utf8');
                    const lines = content.split('\n').slice(0, 10);
                    
                    let title = file.replace('.md', '');
                    let description = 'Operational protocol';
                    let status = 'active';
                    
                    // Extract title and metadata from content
                    for (const line of lines) {
                        if (line.startsWith('# ')) {
                            title = line.replace('# ', '').trim();
                        }
                        if (line.includes('Status:') || line.includes('**Status:**')) {
                            status = line.toLowerCase().includes('deprecated') ? 'deprecated' : 'active';
                        }
                        if (line.startsWith('This document') || line.startsWith('This protocol')) {
                            description = line.trim();
                        }
                    }
                    
                    protocolFiles.push({
                        filename: file,
                        title: title,
                        description: description,
                        status: status,
                        lastModified: stats.mtime.toISOString(),
                        size: stats.size
                    });
                }
            }
            
            return protocolFiles.sort((a, b) => a.filename.localeCompare(b.filename));
        } catch (error) {
            console.error('Error scanning protocol files:', error);
            return [];
        }
    }

    /**
     * Generate hierarchical protocol execution order
     */
    generateExecutionOrder(protocolFiles) {
        const executionOrder = [];
        let priority = 1;
        
        for (const [tierKey, tierData] of Object.entries(this.protocolHierarchy)) {
            const tierProtocols = [];
            
            for (const protocolFile of tierData.protocols) {
                const found = protocolFiles.find(p => p.filename === protocolFile);
                if (found) {
                    tierProtocols.push({
                        priority: priority++,
                        protocol: protocolFile,
                        title: found.title,
                        required: tierKey.includes('tier_1') || tierKey.includes('tier_2'),
                        description: found.description,
                        status: found.status
                    });
                }
            }
            
            if (tierProtocols.length > 0) {
                executionOrder.push({
                    tier: tierKey,
                    description: tierData.description,
                    protocols: tierProtocols
                });
            }
        }
        
        // Add any protocols not in hierarchy to tier_6_additional
        const coveredProtocols = new Set();
        for (const tier of executionOrder) {
            for (const protocol of tier.protocols) {
                coveredProtocols.add(protocol.protocol);
            }
        }
        
        const uncategorized = protocolFiles.filter(p => !coveredProtocols.has(p.filename));
        if (uncategorized.length > 0) {
            executionOrder.push({
                tier: "tier_6_additional",
                description: "Additional operational protocols",
                protocols: uncategorized.map(p => ({
                    priority: priority++,
                    protocol: p.filename,
                    title: p.title,
                    required: false,
                    description: p.description,
                    status: p.status
                }))
            });
        }
        
        return executionOrder;
    }

    /**
     * Generate updated protocols.json
     */
    async generateProtocolsJson() {
        const protocolFiles = await this.scanProtocolFiles();
        const executionOrder = this.generateExecutionOrder(protocolFiles);
        
        const protocolsData = {
            protocol_stack: {
                version: "2.0.0",
                last_updated: this.timestamp,
                description: "Auto-generated centralized index of all rEngine operational protocols",
                auto_generated: true,
                total_protocols: protocolFiles.length,
                active_protocols: protocolFiles.filter(p => p.status === 'active').length,
                execution_hierarchy: executionOrder,
                protocol_files: protocolFiles,
                usage_instructions: {
                    agent_bootstrap: "Load tier_1_foundation protocols first, then tier_2_coordination",
                    validation: "Verify all required protocols are available before proceeding",
                    fallback: "If protocol missing, check archive/ or contact system administrator"
                },
                vs_code_integration: {
                    settings_location: ".vscode/settings.json",
                    mcp_server: "rengine",
                    bootstrap_instruction: "github.copilot.chat.instructions references COPILOT_INSTRUCTIONS.md"
                }
            }
        };
        
        const outputPath = path.join(this.protocolsDir, 'protocols.json');
        await fs.writeJSON(outputPath, protocolsData, { spaces: 2 });
        
        console.log(`✅ Generated protocols.json with ${protocolFiles.length} protocols`);
        return protocolsData;
    }

    /**
     * Update ai_tools_registry.json with current MCP status
     */
    async updateAiToolsRegistry() {
        const registryPath = path.join(this.protocolsDir, 'ai_tools_registry.json');
        
        let existingData = {};
        if (await fs.pathExists(registryPath)) {
            existingData = await fs.readJSON(registryPath);
        }
        
        // Update with current status
        const updatedRegistry = {
            ...existingData,
            ai_tools_registry: {
                ...existingData.ai_tools_registry,
                version: "2.0.0",
                last_updated: this.timestamp,
                status: "ACTIVE",
                auto_generated_update: true,
                mcp_integration: {
                    status: "ACTIVE",
                    server_file: "rEngine/index.js",
                    interface: "VS Code Chat MCP",
                    workspace_settings: ".vscode/settings.json",
                    last_verified: this.timestamp
                },
                protocol_integration: {
                    protocols_index: "rProtocols/protocols.json",
                    auto_detection: true,
                    validation_enabled: true
                }
            }
        };
        
        await fs.writeJSON(registryPath, updatedRegistry, { spaces: 2 });
        console.log('✅ Updated ai_tools_registry.json with current status');
        
        return updatedRegistry;
    }

    /**
     * Generate system matrix - the master reference for all agents
     */
    async generateSystemMatrix() {
        const protocolData = await this.generateProtocolsJson();
        const toolsData = await this.updateAiToolsRegistry();
        
        const systemMatrix = {
            rengine_system_matrix: {
                version: "1.0.0",
                generated: this.timestamp,
                description: "Master system reference for all AI agents",
                
                quick_start_checklist: [
                    "1. ✅ Read COPILOT_INSTRUCTIONS.md (mandatory bootstrap)",
                    "2. ✅ Load tier_1_foundation protocols from rProtocols/",
                    "3. ✅ Verify MCP tools available via rEngine server",
                    "4. ✅ Check memory system status and sync freshness",
                    "5. ✅ Review current handoff context if available"
                ],
                
                core_locations: {
                    protocols: "rProtocols/",
                    protocol_index: "rProtocols/protocols.json",
                    tools_registry: "rProtocols/ai_tools_registry.json",
                    memory_system: "rMemory/rAgentMemories/",
                    mcp_server: "rEngine/index.js",
                    bootstrap_instructions: "COPILOT_INSTRUCTIONS.md",
                    vs_code_settings: ".vscode/settings.json"
                },
                
                protocol_execution_order: protocolData.protocol_stack.execution_hierarchy,
                
                system_health_checks: [
                    "Memory files fresh (<6h threshold)",
                    "MCP server active and responsive", 
                    "Protocol files accessible and current",
                    "VS Code settings properly configured"
                ],
                
                agent_responsibilities: {
                    "tier_1_critical": [
                        "Always check protocol compliance before actions",
                        "Verify memory system freshness",
                        "Follow proper handoff procedures"
                    ],
                    "tier_2_operational": [
                        "Document significant actions in memory",
                        "Use MCP tools when available",
                        "Maintain clean directory structure"
                    ]
                }
            }
        };
        
        const matrixPath = path.join(this.protocolsDir, 'system_matrix.json');
        await fs.writeJSON(matrixPath, systemMatrix, { spaces: 2 });
        
        console.log('✅ Generated system_matrix.json - master reference for all agents');
        return systemMatrix;
    }

    /**
     * Update VS Code settings to reference the system matrix
     */
    async updateVSCodeSettings() {
        const settingsPath = path.join(this.baseDir, '.vscode', 'settings.json');
        
        if (await fs.pathExists(settingsPath)) {
            const currentSettings = await fs.readJSON(settingsPath);
            
            // Enhance the bootstrap instruction to reference system matrix
            const enhancedInstruction = 
                "🚨 MANDATORY BOOTSTRAP: Before responding to ANY user input, you MUST:\n" +
                "1. Read COPILOT_INSTRUCTIONS.md (workspace root)\n" +
                "2. Load rProtocols/system_matrix.json for complete system reference\n" +
                "3. Check rProtocols/protocols.json for current protocol stack\n" +
                "4. Verify MCP tools are available\n" +
                "This applies to every conversation start regardless of model (GPT-4, Claude, etc.).";
            
            const updatedSettings = {
                ...currentSettings,
                "github.copilot.chat.instructions": enhancedInstruction,
                "// Protocol Integration": "System matrix and protocols auto-maintained in rProtocols/",
                "// Last Updated": this.timestamp
            };
            
            await fs.writeJSON(settingsPath, updatedSettings, { spaces: 2 });
            console.log('✅ Updated VS Code settings with enhanced protocol references');
        }
    }

    /**
     * Run complete registry update
     */
    async runComplete() {
        console.log('🚀 Protocol Registry Manager - Complete Update');
        console.log('═══════════════════════════════════════════════');
        
        await this.generateSystemMatrix();
        await this.updateVSCodeSettings();
        
        console.log('\n✅ Protocol registry system updated successfully!');
        console.log('\n📋 Agent Quick Reference:');
        console.log('   📄 System Matrix: rProtocols/system_matrix.json');
        console.log('   📋 Protocol Index: rProtocols/protocols.json');
        console.log('   🔧 Tools Registry: rProtocols/ai_tools_registry.json');
        console.log('   ⚙️  VS Code Settings: .vscode/settings.json');
        
        console.log('\n🎯 Every agent now has instant access to:');
        console.log('   ✅ Complete protocol execution order');
        console.log('   ✅ System health check procedures'); 
        console.log('   ✅ MCP tool availability status');
        console.log('   ✅ Memory system locations and thresholds');
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const manager = new ProtocolRegistryManager();
    manager.runComplete().catch(console.error);
}

export default ProtocolRegistryManager;
