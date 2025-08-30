#!/usr/bin/env node

/**
 * Update Footer Branding Script
 * Updates all existing HTML documentation files with standardized rEngine branding
 * Generated from the rScribe Document System • rEngine (v2.1.0) • August 19, 2025
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, '../docs/generated/html');

// New standardized footer HTML
const newFooterHTML = `        <footer class="footer">
            <div class="branding">
                <span>Generated from the <span class="system-name">rScribe Document System</span></span>
                <span class="divider">•</span>
                <span class="system-name">rEngine</span> <span class="version">(v2.1.0)</span>
                <span class="divider">•</span>
                <span>Last updated: ${new Date().toISOString().split('T')[0]}</span>
            </div>
        </footer>`;

// New footer CSS
const footerCSS = `
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            border-top: 1px solid #e1e4e8;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }

        .footer .branding {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .footer .system-name {
            font-weight: 600;
            color: #495057;
        }

        .footer .version {
            color: #888;
            font-style: italic;
        }

        .footer .divider {
            color: #888;
            opacity: 0.5;
        }
        
        @media (max-width: 768px) {
            .footer .branding {
                flex-direction: column;
                gap: 5px;
            }
        }`;

async function findHTMLFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
            files.push(...await findHTMLFiles(itemPath));
        } else if (item.endsWith('.html')) {
            files.push(itemPath);
        }
    }
    
    return files;
}

async function updateHTMLFile(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');
        let updated = false;
        
        // Check if file needs footer CSS update
        if (!content.includes('.footer .branding')) {
            // Add footer CSS before </style>
            content = content.replace('</style>', footerCSS + '\n    </style>');
            updated = true;
        }
        
        // Update footer HTML - look for various footer patterns
        const footerPatterns = [
            /<footer class="footer">[\s\S]*?<\/footer>/,
            /<p>Generated from.*?<\/p>/,
            /<div class="footer">[\s\S]*?<\/div>/
        ];
        
        for (const pattern of footerPatterns) {
            if (pattern.test(content)) {
                content = content.replace(pattern, newFooterHTML);
                updated = true;
                break;
            }
        }
        
        // If no footer found, add one before </body>
        if (!content.includes('footer class="footer"')) {
            content = content.replace('</body>', newFooterHTML + '\n    </div>\n</body>');
            updated = true;
        }
        
        if (updated) {
            await fs.writeFile(filePath, content, 'utf8');
            console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
            return true;
        } else {
            console.log(`⏭️  Skipped: ${path.relative(process.cwd(), filePath)} (already up to date)`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🎨 rEngine Footer Branding Updater');
    console.log('==================================');
    console.log();
    
    if (!await fs.pathExists(docsDir)) {
        console.error(`❌ Documentation directory not found: ${docsDir}`);
        process.exit(1);
    }
    
    console.log(`📂 Scanning for HTML files in: ${docsDir}`);
    const htmlFiles = await findHTMLFiles(docsDir);
    
    console.log(`📄 Found ${htmlFiles.length} HTML files`);
    console.log();
    
    let updatedCount = 0;
    
    for (const file of htmlFiles) {
        const wasUpdated = await updateHTMLFile(file);
        if (wasUpdated) updatedCount++;
    }
    
    console.log();
    console.log('📊 Summary:');
    console.log(`   • Total files: ${htmlFiles.length}`);
    console.log(`   • Updated: ${updatedCount}`);
    console.log(`   • Skipped: ${htmlFiles.length - updatedCount}`);
    console.log();
    console.log('🎉 Branding update complete!');
    console.log();
    console.log('Generated from the rScribe Document System • rEngine (v2.1.0) • ' + new Date().toISOString().split('T')[0]);
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
