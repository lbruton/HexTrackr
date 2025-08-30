#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';

async function cleanCombinedDocumentation() {
    console.log('🧹 Cleaning Combined Documentation Files...\n');
    
    const docsDir = '/Volumes/DATA/GitHub/rEngine/docs/generated';
    
    try {
        // Find all _combined.md files
        const combinedFiles = await findCombinedFiles(docsDir);
        
        console.log(`📋 Found ${combinedFiles.length} combined files to clean:`);
        combinedFiles.forEach(file => console.log(`   📄 ${path.relative(docsDir, file)}`));
        console.log('');
        
        for (const filePath of combinedFiles) {
            await cleanCombinedFile(filePath);
        }
        
        console.log('✅ All combined documentation files cleaned!');
        
    } catch (error) {
        console.error('💥 Error cleaning combined files:', error.message);
    }
}

async function findCombinedFiles(dir) {
    const files = [];
    
    async function scanDir(currentDir) {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            
            if (entry.isDirectory()) {
                await scanDir(fullPath);
            } else if (entry.name.endsWith('_combined.md')) {
                files.push(fullPath);
            }
        }
    }
    
    await scanDir(dir);
    return files;
}

async function cleanCombinedFile(filePath) {
    const filename = path.basename(filePath);
    console.log(`🔧 Cleaning: ${filename}`);
    
    try {
        // Read the file
        let content = await fs.readFile(filePath, 'utf8');
        const originalSize = content.length;
        
        // Track what we're removing
        let removedChunks = 0;
        let removedLines = 0;
        
        // Remove chunk headings and analysis headers - multiple patterns
        const patterns = [
            // Pattern 1: **styles.css_chunk_N Documentation**
            /\*\*[^*]+_chunk_\d+ Documentation\*\*\n/g,
            // Pattern 2: **styles.css_chunk_N** with equals underline  
            /\*\*[^*]+_chunk_\d+\*\*\n=+\n\n?/g,
            // Pattern 3: ## Chunk N Analysis
            /## Chunk \d+ Analysis\n\n/g,
            // Pattern 4: References to chunk filenames in text
            /`styles\.css_chunk_\d+`/g,
            // Pattern 5: Link references to chunk files
            /<link rel="stylesheet" [^>]*href="[^"]*_chunk_\d+[^"]*"[^>]*>/g
        ];
        
        let totalRemovals = 0;
        
        // Apply each pattern
        patterns.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                totalRemovals += matches.length;
                console.log(`   🧹 Pattern ${index + 1}: Removing ${matches.length} occurrences`);
            }
            // Replace chunk references with generic references
            if (index === 3) { // chunk filename references
                content = content.replace(pattern, '`styles.css`');
            } else if (index === 4) { // link references
                content = content.replace(pattern, '<!-- CSS link reference removed -->');
            } else {
                content = content.replace(pattern, '');
            }
        });
        
        removedChunks = totalRemovals;
        
        // Clean up multiple consecutive newlines (leave max 2)
        content = content.replace(/\n{3,}/g, '\n\n');
        
        // Clean up any hanging separators
        content = content.replace(/=+\n\n/g, '');
        
        // Fix the main title if it got mangled
        if (filename.includes('styles_combined')) {
            content = content.replace(/^# [^-]+ - Combined Documentation/, '# CSS Styles - Complete Documentation');
        }
        
        const newSize = content.length;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        
        // Write the cleaned content
        await fs.writeFile(filePath, content);
        
        console.log(`   ✅ Removed ${removedChunks} chunk headings and ${removedLines} analysis headers`);
        console.log(`   📊 Size: ${originalSize} → ${newSize} bytes (${reduction}% reduction)`);
        
        // Also regenerate HTML and JSON for the cleaned file
        await regenerateFormats(filePath);
        
    } catch (error) {
        console.error(`   ❌ Error cleaning ${filename}:`, error.message);
    }
}

async function regenerateFormats(markdownPath) {
    const SmartDocumentManager = (await import('/Volumes/DATA/GitHub/rEngine/rEngine/smart-document-generator.js')).default;
    
    try {
        console.log(`   🔄 Regenerating HTML and JSON formats...`);
        
        const manager = new SmartDocumentManager();
        const content = await fs.readFile(markdownPath, 'utf8');
        
        // Generate stats for the cleaned file
        const stats = {
            chunked: false,
            chunks: 1,
            method: "combined-cleaned",
            lines: content.split('\n').length
        };
        
        // Save in all formats
        await manager.saveDocumentation(markdownPath, content, null, stats);
        
        console.log(`   ✅ Updated HTML and JSON formats`);
        
    } catch (error) {
        console.log(`   ⚠️  Could not regenerate formats: ${error.message}`);
    }
}

// Run the cleanup
cleanCombinedDocumentation();
