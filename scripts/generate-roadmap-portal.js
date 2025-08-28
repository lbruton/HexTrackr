#!/usr/bin/env node

/**
 * HexTrackr Roadmap Portal Generator
 * Uses existing Pico CSS template and populates with real markdown content
 * Run: node scripts/generate-roadmap-portal.js
 */

const fs = require("fs");
const path = require("path");

// Enhanced markdown to HTML converter
function markdownToHtml(markdown) {
    // Handle code blocks first to prevent interference
    const codeBlocks = [];
    markdown = markdown.replace(/```([\s\S]*?)```/g, (match, code) => {
        codeBlocks.push(code);
        return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });

    // Process line by line for better structure
    const lines = markdown.split("\n");
    const htmlLines = [];
    let inList = false;
    let listType = "";

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const nextLine = lines[i + 1] || "";

        // Headers
        if (line.match(/^### /)) {
            if (inList) { htmlLines.push(`</${listType}>`); inList = false; }
            htmlLines.push(line.replace(/^### (.*)$/, "<h3>$1</h3>"));
        } else if (line.match(/^## /)) {
            if (inList) { htmlLines.push(`</${listType}>`); inList = false; }
            htmlLines.push(line.replace(/^## (.*)$/, "<h2>$1</h2>"));
        } else if (line.match(/^# /)) {
            if (inList) { htmlLines.push(`</${listType}>`); inList = false; }
            htmlLines.push(line.replace(/^# (.*)$/, "<h1>$1</h1>"));
        }
        // Horizontal rules
        else if (line.match(/^---+$/)) {
            if (inList) { htmlLines.push(`</${listType}>`); inList = false; }
            htmlLines.push("<hr>");
        }
        // Task lists (checkboxes)
        else if (line.match(/^\s*- \[ \]/)) {
            if (!inList || listType !== "ul") {
                if (inList) htmlLines.push(`</${listType}>`);
                htmlLines.push("<ul class=\"task-list\">");
                inList = true;
                listType = "ul";
            }
            htmlLines.push(line.replace(/^\s*- \[ \] (.*)$/, "<li class=\"task-item\">☐ $1</li>"));
        } else if (line.match(/^\s*- \[x\]/)) {
            if (!inList || listType !== "ul") {
                if (inList) htmlLines.push(`</${listType}>`);
                htmlLines.push("<ul class=\"task-list\">");
                inList = true;
                listType = "ul";
            }
            htmlLines.push(line.replace(/^\s*- \[x\] (.*)$/, "<li class=\"task-item completed\">✅ $1</li>"));
        }
        // Regular lists
        else if (line.match(/^\s*- /)) {
            if (!inList || listType !== "ul") {
                if (inList) htmlLines.push(`</${listType}>`);
                htmlLines.push("<ul>");
                inList = true;
                listType = "ul";
            }
            htmlLines.push(line.replace(/^\s*- (.*)$/, "<li>$1</li>"));
        }
        // Empty line - close lists
        else if (line.trim() === "") {
            if (inList) {
                htmlLines.push(`</${listType}>`);
                inList = false;
            }
            htmlLines.push("");
        }
        // Regular paragraphs
        else {
            if (inList && !nextLine.match(/^\s*-/)) {
                htmlLines.push(`</${listType}>`);
                inList = false;
            }
            if (line.trim() !== "") {
                htmlLines.push(`<p>${line}</p>`);
            }
        }
    }

    // Close any remaining lists
    if (inList) {
        htmlLines.push(`</${listType}>`);
    }

    let html = htmlLines.join("\n");

    // Apply inline formatting
    html = html
        // Bold and italic
        .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        
        // Inline code
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        
        // Status badges
        .replace(/\*Risk: (HIGH|MEDIUM|LOW)\*/g, "<span class=\"phase-status status-critical\">Risk: $1</span>")
        .replace(/\*Priority: (CRITICAL|HIGH|MEDIUM|LOW)\*/g, "<span class=\"phase-status status-in-progress\">Priority: $1</span>")
        .replace(/\*Duration: ([^*]+)\*/g, "<span class=\"phase-status status-planned\">Duration: $1</span>")
        .replace(/\*Updated: ([^*]+)\*/g, "<span class=\"phase-status status-complete\">Updated: $1</span>")
        
        // Blockquotes
        .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

    // Restore code blocks
    codeBlocks.forEach((code, index) => {
        html = html.replace(`__CODEBLOCK_${index}__`, `<pre><code>${code}</code></pre>`);
    });

    return html;
}

// Generate the roadmap portal using existing template
function generatePortal() {
    const roadmapsDir = path.join(__dirname, "../roadmaps");
    const templatePath = path.join(roadmapsDir, "index.html");
    const outputPath = templatePath; // Overwrite the existing file
    
    console.log("🔍 Reading roadmap files...");
    
    // Read roadmap files
    const strategicRoadmap = fs.readFileSync(path.join(roadmapsDir, "ROADMAP.md"), "utf8");
    const tacticalRoadmap = fs.readFileSync(path.join(roadmapsDir, "UI_UX_ROADMAP.md"), "utf8");
    const currentStatus = fs.readFileSync(path.join(roadmapsDir, "CURRENT_STATUS.md"), "utf8");
    
    console.log("🔄 Converting markdown to HTML...");
    
    // Convert to HTML
    const strategicHtml = markdownToHtml(strategicRoadmap);
    const tacticalHtml = markdownToHtml(tacticalRoadmap);
    const statusHtml = markdownToHtml(currentStatus);
    
    console.log("📝 Reading existing template...");
    
    // Read the current template
    let template = fs.readFileSync(templatePath, "utf8");
    
    // Update the navigation to include current status tab
    const updatedNav = `
        <nav class="nav-container">
            <ul class="nav-tabs">
                <li><a href="#strategic" class="nav-tab active" data-tab="strategic">🎯 Strategic Roadmap</a></li>
                <li><a href="#tactical" class="nav-tab" data-tab="tactical">🚀 Tactical Implementation</a></li>
                <li><a href="#status" class="nav-tab" data-tab="status">📊 Current Status</a></li>
            </ul>
        </nav>`;
    
    // Replace navigation
    template = template.replace(
        /<nav class="nav-container">[\s\S]*?<\/nav>/,
        updatedNav
    );
    
    // Create the tab content sections
    const tabContent = `
        <section id="strategic" class="tab-content active">
            <div class="roadmap-section">
                ${strategicHtml}
            </div>
        </section>

        <section id="tactical" class="tab-content">
            <div class="roadmap-section">
                ${tacticalHtml}
            </div>
        </section>

        <section id="status" class="tab-content">
            <div class="roadmap-section">
                ${statusHtml}
            </div>
        </section>`;
    
    // Find where to insert content (after nav, before footer)
    const navEndIndex = template.indexOf("</nav>") + 6;
    const footerStartIndex = template.indexOf("<footer");
    
    if (navEndIndex > 5 && footerStartIndex > navEndIndex) {
        // Replace content between nav and footer
        template = template.substring(0, navEndIndex) + 
                  "\n\n" + tabContent + "\n\n        " + 
                  template.substring(footerStartIndex);
    } else {
        // Fallback: insert before closing main tag
        template = template.replace(
            "</main>",
            tabContent + "\n    </main>"
        );
    }
    
    // Add enhanced CSS for task lists and markdown content
    const enhancedCSS = `
        /* Enhanced Markdown Styling */
        .roadmap-section h1, .roadmap-section h2, .roadmap-section h3 {
            color: var(--pico-primary-500);
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        
        .roadmap-section h1:first-child, .roadmap-section h2:first-child, .roadmap-section h3:first-child {
            margin-top: 0;
        }
        
        .roadmap-section hr {
            border: none;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--pico-border-color), transparent);
            margin: 2rem 0;
        }
        
        /* Task Lists */
        .task-list {
            list-style: none;
            padding-left: 0;
            margin: 1rem 0;
        }
        
        .task-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--pico-border-color);
            opacity: 0.9;
        }
        
        .task-item:last-child {
            border-bottom: none;
        }
        
        .task-item.completed {
            opacity: 0.6;
            text-decoration: line-through;
            color: var(--pico-muted-color);
        }
        
        /* Update footer */
        footer p {
            margin: 0;
        }`;
    
    // Insert enhanced CSS before closing </style>
    template = template.replace("</style>", enhancedCSS + "\n    </style>");
    
    // Update footer with generation info
    const footerContent = `
        <footer>
            <p>🔄 Auto-generated from markdown files | Last updated: ${new Date().toLocaleDateString()} | 
            <a href="javascript:location.reload()">Refresh</a></p>
        </footer>`;
    
    template = template.replace(/<footer>[\s\S]*?<\/footer>/, footerContent);
    
    // Add JavaScript for tab functionality
    const jsScript = `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Tab switching functionality
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all tabs and content
                    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Show corresponding content
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                    
                    // Smooth scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
            
            // Progress tracking
            const totalTasks = document.querySelectorAll('.task-item').length;
            const completedTasks = document.querySelectorAll('.task-item.completed').length;
            
            if (totalTasks > 0) {
                const progressPercent = Math.round((completedTasks / totalTasks) * 100);
                console.log(\`📊 Overall Progress: \${completedTasks}/\${totalTasks} tasks (\${progressPercent}%)\`);
            }
        });
    </script>`;
    
    // Insert JavaScript before closing body tag
    template = template.replace("</body>", jsScript + "\n</body>");
    
    console.log("💾 Writing updated portal...");
    
    // Write the updated HTML file
    fs.writeFileSync(outputPath, template);
    
    console.log("🚀 Roadmap portal generated successfully!");
    console.log(`📂 Open: file://${outputPath}`);
    console.log("🌐 Or access via: http://localhost:8080/roadmaps/");
}

// Add npm script integration
function updatePackageJson() {
    const packageJsonPath = path.join(__dirname, "../package.json");
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        if (!packageJson.scripts.roadmap) {
            packageJson.scripts.roadmap = "node scripts/generate-roadmap-portal.js";
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log("✅ Added \"npm run roadmap\" script to package.json");
        }
    } catch (error) {
        console.log("⚠️  Could not update package.json:", error.message);
    }
}

// Count tasks for progress tracking
function countTasks(html) {
    const taskMatches = html.match(/class="task-item"/g) || [];
    const completedMatches = html.match(/class="task-item completed"/g) || [];
    return { total: taskMatches.length, completed: completedMatches.length };
}

// Run the generator
if (require.main === module) {
    try {
        generatePortal();
        updatePackageJson();
    } catch (error) {
        console.error("❌ Error generating roadmap portal:", error.message);
        process.exit(1);
    }
}

module.exports = { generatePortal };
