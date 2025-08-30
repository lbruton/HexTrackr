#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';

async function fixDocumentationLinks() {
    console.log('🔗 Fixing Documentation Links...\n');
    
    const htmlDocsDir = '/Volumes/DATA/GitHub/rEngine/html-docs';
    const files = [
        path.join(htmlDocsDir, 'documentation.html'),
        path.join(htmlDocsDir, 'developmentstatus.html')
    ];
    
    const linkMappings = [
        // HTML files moved to docs/generated/html/
        { from: /\.\.\/docs\/html\//g, to: '../docs/generated/html/' },
        
        // Markdown files moved to docs/generated/
        { from: /\.\.\/docs\/([^\/]+\.md)/g, to: '../docs/generated/$1' },
        
        // JSON files moved to docs/generated/json/
        { from: /\.\.\/docs\/([^\/]+\.json)/g, to: '../docs/generated/json/$1' },
        
        // Patchnotes moved to docs/generated/html/patchnotes/
        { from: /\.\.\/docs\/patchnotes\//g, to: '../docs/generated/html/patchnotes/' },
        
        // General docs folder references
        { from: /href="\.\.\/docs\/"(?![^>]*generated)/g, to: 'href="../docs/generated/"' },
        
        // Index references
        { from: /\.\.\/docs\/DOCUMENTATION_INDEX\.json/g, to: '../docs/generated/json/DOCUMENTATION_INDEX.json' }
    ];
    
    for (const filePath of files) {
        await fixFileLinks(filePath, linkMappings);
    }
    
    console.log('\n✅ All documentation links updated!');
}

async function fixFileLinks(filePath, mappings) {
    const filename = path.basename(filePath);
    console.log(`🔧 Fixing links in: ${filename}`);
    
    try {
        let content = await fs.readFile(filePath, 'utf8');
        let totalFixes = 0;
        
        for (const mapping of mappings) {
            const matches = content.match(mapping.from);
            if (matches) {
                const fixCount = matches.length;
                content = content.replace(mapping.from, mapping.to);
                totalFixes += fixCount;
                console.log(`   📎 Fixed ${fixCount} links: ${mapping.from.toString()}`);
            }
        }
        
        // Write the updated content
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`   ✅ Total fixes applied: ${totalFixes}\n`);
        
    } catch (error) {
        console.error(`   ❌ Error fixing ${filename}:`, error.message);
    }
}

// Run the link fixer
fixDocumentationLinks();
