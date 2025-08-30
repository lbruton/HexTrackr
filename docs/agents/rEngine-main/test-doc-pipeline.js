#!/usr/bin/env node

// DEPRECATED: Use document-scribe.js instead
// import SmartDocumentManager from './rEngine/smart-document-generator.js';
import DocumentScribe from './rEngine/document-scribe.js';
import path from 'path';
import fs from 'fs-extra';

async function testDocumentationPipeline() {
    console.log('🧪 Testing Enhanced Documentation Pipeline...\n');
    
    // Create a small test CSS file
    const testFilePath = path.join(process.cwd(), 'test-sample.css');
    const testCSS = `
/* Test CSS File for Documentation Pipeline */
.test-component {
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    padding: 1rem;
    margin: 0.5rem;
}

.test-button {
    background-color: #4f46e5;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.test-button:hover {
    background-color: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}
`;

    try {
        // Write test file
        await fs.writeFile(testFilePath, testCSS);
        console.log('✅ Created test CSS file');
        
        // Initialize document manager
        const manager = new SmartDocumentManager();
        
        // Generate documentation
        console.log('🚀 Generating documentation...');
        await manager.generate(testFilePath);
        
        // Check generated files
        const baseName = path.basename(testFilePath, path.extname(testFilePath));
        const docsDir = path.join(path.dirname(testFilePath), 'docs');
        
        const markdownFile = path.join(docsDir, `${baseName}.md`);
        const htmlFile = path.join(docsDir, `${baseName}.html`);
        const jsonFile = path.join(docsDir, `${baseName}.json`);
        const indexFile = path.join(docsDir, 'index.html');
        
        console.log('\n📋 Checking generated files:');
        
        // Check markdown
        if (await fs.pathExists(markdownFile)) {
            const markdownSize = (await fs.stat(markdownFile)).size;
            console.log(`✅ Markdown: ${baseName}.md (${markdownSize} bytes)`);
        } else {
            console.log(`❌ Markdown: ${baseName}.md - NOT FOUND`);
        }
        
        // Check HTML
        if (await fs.pathExists(htmlFile)) {
            const htmlSize = (await fs.stat(htmlFile)).size;
            console.log(`✅ HTML: ${baseName}.html (${htmlSize} bytes)`);
            
            // Quick validation of HTML content
            const htmlContent = await fs.readFile(htmlFile, 'utf8');
            if (htmlContent.includes('<!DOCTYPE html') && htmlContent.includes('gradient')) {
                console.log('   📄 HTML contains proper structure and styling');
            }
        } else {
            console.log(`❌ HTML: ${baseName}.html - NOT FOUND`);
        }
        
        // Check JSON
        if (await fs.pathExists(jsonFile)) {
            const jsonSize = (await fs.stat(jsonFile)).size;
            console.log(`✅ JSON: ${baseName}.json (${jsonSize} bytes)`);
            
            // Quick validation of JSON content
            try {
                const jsonContent = await fs.readFile(jsonFile, 'utf8');
                const parsed = JSON.parse(jsonContent);
                if (parsed.metadata && parsed.stats) {
                    console.log('   📊 JSON contains proper metadata and stats');
                }
            } catch (e) {
                console.log('   ⚠️  JSON file exists but may have parsing issues');
            }
        } else {
            console.log(`❌ JSON: ${baseName}.json - NOT FOUND`);
        }
        
        // Check index
        if (await fs.pathExists(indexFile)) {
            const indexSize = (await fs.stat(indexFile)).size;
            console.log(`✅ Index: index.html (${indexSize} bytes)`);
        } else {
            console.log(`❌ Index: index.html - NOT FOUND`);
        }
        
        // Cleanup
        await fs.remove(testFilePath);
        console.log('\n🧹 Cleaned up test file');
        
        // Get final stats
        const stats = manager.getStats();
        console.log('\n📊 Pipeline Statistics:');
        console.log(`   Requests: ${stats.totalRequests}`);
        console.log(`   Success: ${stats.successfulRequests}`);
        console.log(`   Errors: ${stats.errorCount}`);
        console.log(`   Rate Limit Hits: ${stats.rateLimitHits}`);
        
        await manager.shutdown();
        console.log('\n🎉 Documentation pipeline test complete!');
        
    } catch (error) {
        console.error('💥 Pipeline test failed:', error.message);
        console.error(error.stack);
        
        // Cleanup on error
        if (await fs.pathExists(testFilePath)) {
            await fs.remove(testFilePath);
        }
        
        process.exit(1);
    }
}

// Run the test
testDocumentationPipeline();
