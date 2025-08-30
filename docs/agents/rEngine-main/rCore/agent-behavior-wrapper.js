#!/usr/bin/env node

/**
 * Agent Behavior Wrapper - Ensures all agents follow proper memory contribution protocols
 * This wraps agent functions to automatically handle memory and git contributions
 */

import AgentSelfManagement from './agent-self-management.js';

class AgentBehaviorWrapper {
    constructor() {
        this.selfMgmt = new AgentSelfManagement();
        this.isInitialized = false;
        this.currentTask = null;
        this.taskStartTime = null;
    }
    
    async ensureInitialized() {
        if (!this.isInitialized) {
            console.log('🤖 Agent behavior wrapper: Initializing...');
            await this.selfMgmt.startupCheck();
            this.isInitialized = true;
        }
    }
    
    async startTask(taskDescription) {
        await this.ensureInitialized();
        
        this.currentTask = taskDescription;
        this.taskStartTime = Date.now();
        
        console.log(`🎯 Starting task: ${taskDescription}`);
        
        // Log task start
        await this.selfMgmt.logTaskCompletion(
            `STARTED: ${taskDescription}`,
            'Task initiated',
            []
        );
    }
    
    async completeTask(outcome, filesModified = []) {
        if (!this.currentTask) {
            console.warn('⚠️  Completing task but no task was started');
            return;
        }
        
        const duration = this.taskStartTime ? Date.now() - this.taskStartTime : 0;
        
        console.log(`✅ Completing task: ${this.currentTask}`);
        console.log(`   Outcome: ${outcome}`);
        console.log(`   Duration: ${Math.round(duration / 1000)}s`);
        console.log(`   Files: ${filesModified.length}`);
        
        await this.selfMgmt.logTaskCompletion(
            this.currentTask,
            outcome,
            filesModified
        );
        
        this.currentTask = null;
        this.taskStartTime = null;
    }
    
    async wrapFunction(taskDescription, fn, expectedFiles = []) {
        await this.startTask(taskDescription);
        
        try {
            const result = await fn();
            await this.completeTask('Success', expectedFiles);
            return result;
        } catch (error) {
            await this.completeTask(`Error: ${error.message}`, expectedFiles);
            throw error;
        }
    }
    
    async cleanup() {
        await this.selfMgmt.sessionCleanup();
    }
}

// Global wrapper instance
let globalWrapper = null;

export function getAgentWrapper() {
    if (!globalWrapper) {
        globalWrapper = new AgentBehaviorWrapper();
    }
    return globalWrapper;
}

export function wrapAgentTask(taskDescription, fn, expectedFiles = []) {
    const wrapper = getAgentWrapper();
    return wrapper.wrapFunction(taskDescription, fn, expectedFiles);
}

export async function agentStartup() {
    const wrapper = getAgentWrapper();
    await wrapper.ensureInitialized();
    return wrapper;
}

export async function agentCleanup() {
    if (globalWrapper) {
        await globalWrapper.cleanup();
        globalWrapper = null;
    }
}

// Auto-cleanup on process exit
process.on('beforeExit', async () => {
    if (globalWrapper) {
        await globalWrapper.cleanup();
    }
});

export default AgentBehaviorWrapper;
