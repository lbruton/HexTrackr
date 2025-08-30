#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';

async function updateDocumentationLinks() {
    console.log('🔗 Updating Documentation Links to Generated HTML Files...\n');
    
    const htmlDocsDir = '/Volumes/DATA/GitHub/rEngine/html-docs';
    const documentationFile = path.join(htmlDocsDir, 'documentation.html');
    
    // Read the current documentation.html
    let content = await fs.readFile(documentationFile, 'utf8');
    
    // Our actual generated HTML files that exist
    const actualHtmlFiles = [
        { 
            filename: 'MASTER_ROADMAP.html',
            title: 'rEngine Platform Master Roadmap & Issue Tracker',
            category: 'Core Documentation',
            icon: '📋',
            description: 'Comprehensive roadmap with all projects, issues, and milestones'
        },
        {
            filename: 'agent-self-management.html', 
            title: 'Agent Self-Management System',
            category: 'Agent System',
            icon: '🤖',
            description: 'Documentation for AI agent self-management capabilities'
        },
        {
            filename: 'document-generator.html',
            title: 'Document Generator System', 
            category: 'Core System',
            icon: '📄',
            description: 'Documentation for the rScribe document generation system'
        },
        {
            filename: 'memory-intelligence.html',
            title: 'Memory Intelligence System',
            category: 'Memory System', 
            icon: '🧠',
            description: 'Documentation for rEngine memory intelligence and MCP integration'
        },
        {
            filename: 'enhanced-document-generator.html',
            title: 'Enhanced Document Generator',
            category: 'Core System',
            icon: '⚡',
            description: 'Enhanced documentation for advanced document generation features'
        }
    ];
    
    // Build new documentation grid content
    let newDocGrid = '';
    
    // Add our actual HTML files
    for (const file of actualHtmlFiles) {
        newDocGrid += `
                    <a href="${file.filename}" class="doc-card">
                        <div class="doc-header">
                            <span class="doc-icon">${file.icon}</span>
                            <div>
                                <div class="doc-title">${file.title}</div>
                                <div class="doc-category">${file.category}</div>
                            </div>
                        </div>
                        <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;">${file.description}</p>
                    </a>
                `;
    }
    
    // Add link back to development dashboard
    newDocGrid += `
                    <a href="developmentstatus.html" class="doc-card">
                        <div class="doc-header">
                            <span class="doc-icon">🎛️</span>
                            <div>
                                <div class="doc-title">Development Dashboard</div>
                                <div class="doc-category">Core Dashboard</div>
                            </div>
                        </div>
                        <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;">Main platform development status and service monitoring</p>
                    </a>
                `;
    
    // Replace the doc-grid content
    const docGridStart = '<div class="doc-grid">';
    const docGridEnd = '</div>';
    
    const startIndex = content.indexOf(docGridStart);
    const endIndex = content.lastIndexOf(docGridEnd);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const beforeGrid = content.substring(0, startIndex + docGridStart.length);
        const afterGrid = content.substring(endIndex);
        
        content = beforeGrid + newDocGrid + '\n            ' + afterGrid;
        
        // Update stats
        content = content.replace(
            '<div class="stat-number">291</div>',
            '<div class="stat-number">5</div>'
        );
        content = content.replace(
            '<div class="stat-label">Documentation Pages</div>',
            '<div class="stat-label">Generated HTML Docs</div>'
        );
        content = content.replace(
            '<div class="stat-number">25</div>',
            '<div class="stat-number">8</div>'
        );
        content = content.replace(
            '<div class="stat-label">Categories</div>',
            '<div class="stat-label">Total HTML Files</div>'
        );
        
        // Write the updated file
        await fs.writeFile(documentationFile, content, 'utf8');
        
        console.log('✅ Updated documentation.html with:');
        console.log(`   📋 ${actualHtmlFiles.length} generated HTML documentation files`);
        console.log('   🎛️ Link back to development dashboard');
        console.log('   📊 Updated statistics');
        console.log('\n🎉 Documentation portal now links to actual generated HTML files!');
        
    } else {
        console.error('❌ Could not find doc-grid section in documentation.html');
    }
}

// Run the updater
updateDocumentationLinks().catch(console.error);
