#!/usr/bin/env node

/**
 * Quick Demo of Smart Documentation Generator
 * Analyzes just a few key files to show the system in action
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const CONFIG = {
    OLLAMA_HOST: 'http://localhost:11434',
    ANALYSIS_MODEL: 'qwen2.5-coder:7b',
    OUTPUT_PATH: path.join(process.cwd(), 'technical-docs-demo')
};

async function quickDemo() {
    console.log('🚀 Quick Smart Documentation Demo');
    console.log('📊 Analyzing key files...');
    
    // Create output directory
    await fs.mkdir(CONFIG.OUTPUT_PATH, { recursive: true });
    
    // Demo files to analyze
    const demoFiles = [
        'enhanced-scribe-console.js',
        'session-recap-generator.js',
        'smart-doc-generator.js'
    ];
    
    // Simple analysis template
    const analysisResults = [];
    
    for (const fileName of demoFiles) {
        try {
            const filePath = path.join(process.cwd(), fileName);
            const content = await fs.readFile(filePath, 'utf8');
            
            console.log(`🔍 Analyzing: ${fileName}`);
            
            // Quick analysis using Qwen
            const prompt = `Analyze this JavaScript file and extract:
1. Main functions (name and purpose)
2. Key classes
3. Dependencies/imports
4. Overall purpose

File: ${fileName}
Content (first 2000 chars):
${content.substring(0, 2000)}

Return a simple summary in this format:
## ${fileName}
**Purpose**: [brief description]
**Functions**: [list main functions]
**Classes**: [list classes if any]
**Dependencies**: [key imports]
`;

            const result = await callQwen(prompt);
            if (result) {
                analysisResults.push({
                    file: fileName,
                    analysis: result
                });
                console.log(`✅ Analysis complete: ${fileName}`);
            }
            
        } catch (error) {
            console.log(`❌ Failed to analyze ${fileName}: ${error.message}`);
        }
    }
    
    // Generate demo HTML
    const html = generateDemoHTML(analysisResults);
    const htmlPath = path.join(CONFIG.OUTPUT_PATH, 'demo.html');
    await fs.writeFile(htmlPath, html, 'utf8');
    
    console.log('🎉 Demo documentation generated!');
    console.log(`📖 View at: file://${htmlPath}`);
    
    return htmlPath;
}

async function callQwen(prompt) {
    try {
        const response = await fetch(`${CONFIG.OLLAMA_HOST}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: CONFIG.ANALYSIS_MODEL,
                messages: [{ role: "user", content: prompt }],
                stream: false,
                options: { temperature: 0.2, num_predict: 1024 }
            })
        });

        if (!response.ok) {
            throw new Error(`Qwen API error: ${response.status}`);
        }

        const data = await response.json();
        return data.message?.content || null;
    } catch (error) {
        console.error(`❌ Qwen call failed: ${error.message}`);
        return null;
    }
}

function generateDemoHTML(results) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Smart Documentation Demo</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        .header { background: #2d3748; color: white; padding: 2rem; text-align: center; margin-bottom: 2rem; }
        .file-section { background: white; margin: 1rem 0; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .file-title { color: #2d3748; border-bottom: 2px solid #68d391; padding-bottom: 0.5rem; }
        .analysis { line-height: 1.6; }
        .footer { text-align: center; color: #666; margin-top: 2rem; }
        .demo-banner { background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Smart Documentation Demo</h1>
        <p>AI-Powered Code Analysis with Qwen2.5-Coder 7B</p>
    </div>
    
    <div class="container">
        <div class="demo-banner">
            <strong>Demo Features:</strong>
            <ul>
                <li>Qwen2.5-Coder 7B code analysis</li>
                <li>Function and class extraction</li>
                <li>Dependency mapping</li>
                <li>Real-time HTML generation</li>
                <li>Full system analyzes 500+ files with Mermaid diagrams</li>
            </ul>
        </div>
        
        ${results.map(result => `
            <div class="file-section">
                <h2 class="file-title">${result.file}</h2>
                <div class="analysis">
                    ${result.analysis ? result.analysis.replace(/\n/g, '<br>') : 'Analysis failed'}
                </div>
            </div>
        `).join('')}
        
        <div class="footer">
            <p>Generated by Smart Documentation Generator • ${new Date().toLocaleString()}</p>
            <p>Launch full system with: <code>./launch-smart-system.sh</code></p>
        </div>
    </div>
</body>
</html>`;
}

// Run demo
quickDemo().catch(console.error);
