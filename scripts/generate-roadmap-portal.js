#!/usr/bin/env node

/**
 * HexTrackr Roadmap Portal Generator
 * Automatically converts markdown roadmaps to a beautiful HTML portal page
 * Run: node scripts/generate-roadmap-portal.js
 */

const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
    return markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        
        // Bold and italic
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        // Code blocks and inline code
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        
        // Lists
        .replace(/^\- \[ \] (.*$)/gim, '<li class="todo-item"><input type="checkbox" disabled> $1</li>')
        .replace(/^\- \[x\] (.*$)/gim, '<li class="todo-item completed"><input type="checkbox" checked disabled> $1</li>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        
        // Emojis and special formatting
        .replace(/🎯/g, '<span class="emoji">🎯</span>')
        .replace(/✅/g, '<span class="emoji success">✅</span>')
        .replace(/🔄/g, '<span class="emoji warning">🔄</span>')
        .replace(/🚀/g, '<span class="emoji primary">🚀</span>')
        .replace(/📋/g, '<span class="emoji info">📋</span>')
        .replace(/🚨/g, '<span class="emoji danger">🚨</span>')
        
        // Priority tags
        .replace(/\*Risk: (HIGH|MEDIUM|LOW)\*/g, '<span class="risk-badge risk-$1">Risk: $1</span>')
        .replace(/\*Priority: (CRITICAL|HIGH|MEDIUM|LOW)\*/g, '<span class="priority-badge priority-$1">Priority: $1</span>')
        .replace(/\*Duration: ([^*]+)\*/g, '<span class="duration-badge">Duration: $1</span>')
        
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        
        // Wrap in paragraphs
        .replace(/^(?!<[h|ul|ol|li|div|pre])/gim, '<p>')
        .replace(/(?<!>)$/gim, '</p>');
}

// Generate the complete HTML portal
function generatePortal() {
    const roadmapsDir = path.join(__dirname, '../roadmaps');
    const outputPath = path.join(__dirname, '../roadmaps/index.html');
    
    // Read roadmap files
    const strategicRoadmap = fs.readFileSync(path.join(roadmapsDir, 'ROADMAP.md'), 'utf8');
    const tacticalRoadmap = fs.readFileSync(path.join(roadmapsDir, 'UI_UX_ROADMAP.md'), 'utf8');
    
    // Convert to HTML
    const strategicHtml = markdownToHtml(strategicRoadmap);
    const tacticalHtml = markdownToHtml(tacticalRoadmap);
    
    // Generate complete HTML page
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HexTrackr Development Roadmap Portal</title>
    <link href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/gitbook-style@1.0.0/dist/gitbook.min.css" rel="stylesheet" onerror="this.remove();">
    <style>
        /* Enhanced Documentation Theme with GitBook/VuePress inspiration */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Liberation Sans', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.65;
            color: #2c3e50;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 0;
            padding: 0;
        }
        
        .roadmap-portal {
            min-height: 100vh;
            padding: 1rem 0;
        }
        
        .documentation-container {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            overflow: hidden;
        }
        
        .roadmap-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
            overflow: hidden;
        }
        
        .roadmap-header {
            background: #ffffff;
            border-bottom: 2px solid #e5e7eb;
            color: #1f2937;
            padding: 1.5rem;
            position: relative;
        }
        
        .roadmap-header h2 {
            color: #111827;
            margin: 0;
            font-weight: 600;
        }
        
        .roadmap-content {
            padding: 2rem;
            max-height: 70vh;
            overflow-y: auto;
            background: white;
        }
        
        .emoji {
            font-size: 1.1em;
            margin-right: 0.5rem;
        }
        
        .risk-badge, .priority-badge, .duration-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
            margin: 0.25rem 0.5rem 0.25rem 0;
            border: 1px solid;
        }
        
        .risk-HIGH, .priority-CRITICAL { 
            background: #fef2f2; 
            color: #dc2626; 
            border-color: #fca5a5;
        }
        .risk-MEDIUM, .priority-HIGH { 
            background: #fffbeb; 
            color: #d97706; 
            border-color: #fcd34d;
        }
        .risk-LOW, .priority-MEDIUM { 
            background: #eff6ff; 
            color: #2563eb; 
            border-color: #93c5fd;
        }
        .priority-LOW { 
            background: #f0fdf4; 
            color: #16a34a; 
            border-color: #86efac;
        }
        .duration-badge { 
            background: #f8fafc; 
            color: #475569; 
            border-color: #cbd5e1;
        }
        
        .todo-item {
            list-style: none;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 0.95rem;
        }
        
        .todo-item.completed {
            opacity: 0.7;
            text-decoration: line-through;
            color: #6b7280;
        }
        
        .todo-item input[type="checkbox"] {
            margin-right: 0.75rem;
            transform: scale(1.1);
        }
        
        .nav-tabs {
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 1.5rem;
            background: white;
            border-radius: 8px 8px 0 0;
            padding: 0 1rem;
        }
        
        .nav-link {
            border: none;
            padding: 1rem 1.5rem;
            font-weight: 500;
            color: #6b7280;
            transition: all 0.2s ease;
            border-radius: 6px 6px 0 0;
            margin-top: 0.5rem;
        }
        
        .nav-link:hover {
            color: #374151;
            background: #f9fafb;
        }
        
        .nav-link.active {
            background: #2563eb;
            color: white !important;
            font-weight: 600;
        }
        
        .last-updated {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: normal;
        }
        
        .progress-overview {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .phase-progress {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
            gap: 1rem;
        }
        
        .phase-status {
            flex: 1;
            text-align: center;
            padding: 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid;
        }
        
        .phase-status.completed { 
            background: #f0fdf4; 
            color: #16a34a; 
            border-color: #86efac;
        }
        .phase-status.in-progress { 
            background: #fffbeb; 
            color: #d97706; 
            border-color: #fcd34d;
        }
        .phase-status.planned { 
            background: #eff6ff; 
            color: #2563eb; 
            border-color: #93c5fd;
        }
        
        h1, h2, h3 { 
            color: #111827; 
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        
        h1:first-child, h2:first-child { margin-top: 0; }
        
        h1 { font-size: 2rem; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.25rem; }
        
        code {
            background: #f1f5f9;
            color: #475569;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            border: 1px solid #e2e8f0;
        }
        
        pre {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
        }
        
        pre code {
            background: none;
            border: none;
            padding: 0;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
            border: 1px solid;
        }
        
        .alert-info {
            background: #eff6ff;
            border-color: #93c5fd;
            color: #1e40af;
        }
        
        .page-header {
            background: white;
            padding: 2rem 0;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .page-title {
            color: #111827;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .page-subtitle {
            color: #6b7280;
            font-size: 1.125rem;
            font-weight: 400;
        }
        
        ul, ol {
            padding-left: 1.5rem;
        }
        
        li {
            margin-bottom: 0.5rem;
        }
        
        blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #6b7280;
            font-style: italic;
        }
        
        .roadmap-content::-webkit-scrollbar {
            width: 8px;
        }
        
        .roadmap-content::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
        }
        
        .roadmap-content::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        
        .roadmap-content::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="roadmap-portal">
        <div class="container-xl">
            <div class="page-header">
                <div class="container-xl text-center">
                    <h1 class="page-title">🛡️ HexTrackr Development Roadmap Portal</h1>
                    <p class="page-subtitle">Strategic Planning & Tactical Implementation Dashboard</p>
                </div>
            </div>
            
            <div class="progress-overview">
                <h3>🎯 Current Development Status</h3>
                <div class="phase-progress">
                    <div class="phase-status completed">Phase 1 ✅<br><small>Core UI Complete</small></div>
                    <div class="phase-status in-progress">Phase 2 🔄<br><small>Filtering & Layout</small></div>
                    <div class="phase-status planned">Phase 3-7 📋<br><small>Advanced Features</small></div>
                </div>
                <div class="alert alert-info">
                    <strong>Last Updated:</strong> ${new Date().toLocaleDateString()} | 
                    <strong>Next Priority:</strong> Fix "Clear Data" button & VPR calculations
                </div>
            </div>
            
            <ul class="nav nav-tabs" id="roadmapTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="strategic-tab" data-bs-toggle="tab" data-bs-target="#strategic" type="button" role="tab">
                        🎯 Strategic Roadmap
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tactical-tab" data-bs-toggle="tab" data-bs-target="#tactical" type="button" role="tab">
                        🚀 Tactical Implementation
                    </button>
                </li>
            </ul>
            
            <div class="tab-content" id="roadmapTabsContent">
                <div class="tab-pane fade show active" id="strategic" role="tabpanel">
                    <div class="roadmap-card">
                        <div class="roadmap-header">
                            <h2 class="mb-0">Strategic Project Roadmap</h2>
                            <div class="last-updated">Long-term Vision & Architecture</div>
                        </div>
                        <div class="roadmap-content">
                            ${strategicHtml}
                        </div>
                    </div>
                </div>
                
                <div class="tab-pane fade" id="tactical" role="tabpanel">
                    <div class="roadmap-card">
                        <div class="roadmap-header">
                            <h2 class="mb-0">UI/UX Implementation Roadmap</h2>
                            <div class="last-updated">Current Sprint Priorities</div>
                        </div>
                        <div class="roadmap-content">
                            ${tacticalHtml}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <p class="text-muted">
                    <small>🔄 Auto-generated from markdown files | Run <code>npm run roadmap</code> to update</small>
                </p>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/js/tabler.min.js"></script>
    <script>
        // Auto-refresh functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scrolling for internal links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
            
            // Progress tracking
            const checkboxes = document.querySelectorAll('.todo-item input[type="checkbox"]');
            const totalTasks = checkboxes.length;
            const completedTasks = document.querySelectorAll('.todo-item.completed').length;
            
            if (totalTasks > 0) {
                const progressPercent = Math.round((completedTasks / totalTasks) * 100);
                console.log(\`📊 Overall Progress: \${completedTasks}/\${totalTasks} tasks (\${progressPercent}%)\`);
            }
        });
    </script>
</body>
</html>`;
    
    // Write the HTML file
    fs.writeFileSync(outputPath, htmlTemplate);
    console.log('🚀 Roadmap portal generated successfully!');
    console.log(`📂 Open: file://${outputPath}`);
    console.log('🌐 Or access via: http://localhost:8080/roadmaps/');
}

// Add npm script integration
function updatePackageJson() {
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        packageJson.scripts.roadmap = 'node scripts/generate-roadmap-portal.js';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Added "npm run roadmap" script to package.json');
    } catch (error) {
        console.log('⚠️  Could not update package.json:', error.message);
    }
}

// Run the generator
if (require.main === module) {
    try {
        generatePortal();
        updatePackageJson();
    } catch (error) {
        console.error('❌ Error generating roadmap portal:', error.message);
        process.exit(1);
    }
}

module.exports = { generatePortal };
