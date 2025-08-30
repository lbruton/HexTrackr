import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

// Enhanced application documentation sync script
// Syncs documentation for specific applications to their local docs folders

const APPLICATIONS = {
    'StackTrackr': {
        sourcePath: 'rProjects/StackTrackr',
        patterns: [
            'docs/generated/**/PATCH-*.html',
            'docs/generated/**/inventory*.html',
            'docs/generated/**/price*.html', 
            'docs/generated/**/authentication*.html',
            'docs/generated/**/encryption*.html',
            'docs/generated/**/database*.html',
            'docs/generated/**/filters*.html',
            'docs/generated/**/catalog*.html',
            'docs/generated/**/import*.html',
            'docs/generated/**/export*.html',
            'docs/generated/**/search*.html',
            'docs/generated/**/*stacktrackr*.html',
            'docs/generated/**/*StackTrackr*.html',
            'docs/generated/**/styles.css.html'
        ]
    },
    'VulnTrackr': {
        sourcePath: 'rProjects/VulnTrackr',
        patterns: [
            'docs/generated/**/vuln*.html',
            'docs/generated/**/security*.html',
            'docs/generated/**/vulnerability*.html',
            'docs/generated/**/*vulntrackr*.html',
            'docs/generated/**/*VulnTrackr*.html',
            'docs/generated/**/app_chunk.html',
            'docs/generated/**/app_combined.html',
            'docs/generated/rProjects/VulnTrackr/**/*.html'
        ]
    }
};

async function syncApplicationDocs(appName) {
    const app = APPLICATIONS[appName];
    if (!app) {
        console.error(`❌ Unknown application: ${appName}`);
        return false;
    }

    console.log(`🔄 Syncing documentation for ${appName}...`);
    
    const targetDir = path.join(app.sourcePath, 'docs', 'html');
    await fs.ensureDir(targetDir);

    let filesCopied = 0;
    
    // Copy documentation files
    for (const pattern of app.patterns) {
        try {
            const files = await glob(pattern, { cwd: process.cwd() });
            
            for (const file of files) {
                // Skip if source is the same as target
                if (file.startsWith(app.sourcePath)) continue;
                
                const basename = path.basename(file);
                const targetPath = path.join(targetDir, basename);
                
                await fs.copy(file, targetPath);
                filesCopied++;
                console.log(`  📄 Copied: ${basename}`);
            }
        } catch (error) {
            console.warn(`⚠️  Pattern ${pattern} failed: ${error.message}`);
        }
    }

    // Create index.html for the application docs
    const indexContent = generateIndexHTML(appName, filesCopied);
    await fs.writeFile(path.join(targetDir, 'index.html'), indexContent);
    
    console.log(`✅ ${appName} documentation sync complete: ${filesCopied} files copied`);
    return true;
}

function generateIndexHTML(appName, fileCount) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName} Documentation Portal</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 40px;
        }
        .doc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .doc-card {
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 20px;
            background: #f8f9fa;
            transition: transform 0.2s;
        }
        .doc-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>📚 ${appName} Documentation Portal</h1>
            <p>Application-specific documentation and resources</p>
            <p><strong>${fileCount}</strong> documentation files available</p>
        </header>
        
        <main class="content">
            <a href="../../../html-docs/developmentstatus.html" class="back-link">← Back to Platform Dashboard</a>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #007acc;">📋 Quick Links</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    <a href="../index.html" style="padding: 10px; background: #007acc; color: white; text-decoration: none; border-radius: 5px; text-align: center;">🏠 ${appName} App</a>
                    <a href="../README.md" style="padding: 10px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; text-align: center;">📖 README</a>
                    <a href="../../docs/generated/html/index.html" style="padding: 10px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px; text-align: center;">📚 All Platform Docs</a>
                </div>
            </div>
            
            <h2>📄 Available Documentation</h2>
            <p>This page is automatically generated. Use the <strong>Sync ${appName} Docs</strong> button in the Platform Controls to refresh.</p>
            
            <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0; color: #666;">Documentation files are organized alphabetically.</p>
                <p style="margin: 5px 0 0 0; color: #666;">Last updated: ${new Date().toLocaleString()}</p>
            </div>
        </main>
    </div>
</body>
</html>`;
}

// Main execution
async function main() {
    const appName = process.argv[2];
    
    if (appName) {
        // Sync specific application
        await syncApplicationDocs(appName);
    } else {
        // Sync all applications
        console.log('🔄 Syncing documentation for all applications...\n');
        
        for (const appName of Object.keys(APPLICATIONS)) {
            await syncApplicationDocs(appName);
            console.log(''); // Empty line between apps
        }
        
        console.log('✅ All application documentation synced!');
    }
}

main().catch(console.error);
