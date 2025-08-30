#!/usr/bin/env node

/**
 * HTML Documentation Generator for rScribe Workers
 * Converts markdown files to HTML using StackTrackr template
 */

import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

class HTMLDocGenerator {
  constructor() {
    this.templatePath = path.join(process.cwd(), 'html-docs', 'documentation.html');
    this.cssTemplate = '';
    this.navTemplate = '';
  }

  async loadTemplate() {
    try {
      // Load documentation.html for base CSS
      const docTemplate = await fs.readFile(path.join(process.cwd(), 'html-docs', 'documentation.html'), 'utf8');
      
      // Extract base CSS from documentation.html
      const baseCssMatch = docTemplate.match(/<style>(.*?)<\/style>/s);
      const baseCss = baseCssMatch ? baseCssMatch[1] : '';
      
      // Load branding theme CSS for enhanced styles
      const brandingCss = await fs.readFile(path.join(process.cwd(), 'rEngine', 'templates', 'branding-theme.css'), 'utf8');
      
      // Custom sidebar navigation CSS
      const sidebarCss = `
        /* Sidebar Navigation Styles */
        .container {
            display: flex;
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            min-height: 90vh;
        }
        
        .nav-sidebar {
            width: 300px;
            background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
            border-right: 1px solid #e1e4e8;
            overflow-y: auto;
            flex-shrink: 0;
        }
        
        .nav-header {
            padding: 20px;
            border-bottom: 1px solid #e1e4e8;
            background: linear-gradient(145deg, #495057 0%, #6c757d 100%);
            color: white;
        }
        
        .nav-header h1 {
            font-size: 1.2em;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .nav-subtitle {
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .nav-menu {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .nav-menu > li {
            border-bottom: 1px solid #e1e4e8;
        }
        
        .nav-menu > li > a {
            display: block;
            padding: 12px 20px;
            color: #495057;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
        }
        
        .nav-menu > li > a:hover {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-left-color: #007acc;
        }
        
        .nav-submenu {
            list-style: none;
            padding: 0;
            margin: 0;
            background: #ffffff;
        }
        
        .nav-submenu li a {
            display: block;
            padding: 8px 20px 8px 40px;
            color: #6c757d;
            text-decoration: none;
            font-size: 0.9em;
            transition: all 0.3s ease;
        }
        
        .nav-submenu li a:hover {
            background: #f8f9fa;
            color: #007acc;
            padding-left: 45px;
        }
        
        .main-content {
            flex: 1;
            padding: 40px;
            overflow-y: auto;
        }
        
        .main-content h1, .main-content h2, .main-content h3 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .main-content h1 { 
            font-size: 2.2em; 
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 25px;
        }
        
        .main-content h2 { 
            font-size: 1.6em; 
            margin-top: 30px;
            color: #495057;
        }
        
        .main-content h3 { 
            font-size: 1.3em; 
            margin-top: 25px;
            color: #6c757d;
        }
        
        .main-content p {
            margin-bottom: 15px;
            line-height: 1.6;
        }
        
        .main-content ul, .main-content ol {
            margin-left: 20px;
            margin-bottom: 15px;
        }
        
        .main-content li {
            margin-bottom: 5px;
        }
        
        .main-content code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        }
        
        .main-content pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 15px;
        }
        
        .main-content blockquote {
            border-left: 4px solid #667eea;
            padding-left: 15px;
            margin: 15px 0;
            color: #6c757d;
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .nav-sidebar {
                width: 100%;
                max-height: 300px;
            }
            
            .main-content {
                padding: 20px;
            }
        }
      `;
      
      // Combine all CSS
      this.cssTemplate = baseCss + '\n' + brandingCss + '\n' + sidebarCss;
      
      console.log('✅ Template loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load template:', error.message);
      throw error;
    }
  }

  generateNavigation(sections) {
    // Generate navigation based on document sections
    let nav = `
      <div class="nav-header">
        <h1>${sections.title || 'Documentation'}</h1>
        <div class="nav-subtitle">${sections.subtitle || 'Generated Documentation'}</div>
      </div>
      
      <ul class="nav-menu">
    `;

    sections.items?.forEach(item => {
      nav += `<li><a href="#${item.id}">${item.icon || '📋'} ${item.title}</a>`;
      
      if (item.submenu) {
        nav += '<ul class="nav-submenu">';
        item.submenu.forEach(sub => {
          nav += `<li><a href="#${sub.id}">${sub.title}</a></li>`;
        });
        nav += '</ul>';
      }
      
      nav += '</li>';
    });

    nav += '</ul>';
    return nav;
  }

  async convertMarkdownToHTML(markdownPath, outputPath, options = {}) {
    try {
      console.log(`🔄 Converting ${markdownPath} to HTML...`);
      
      // Read markdown content
      const markdownContent = await fs.readFile(markdownPath, 'utf8');
      
      // Parse markdown to HTML
      const htmlContent = marked(markdownContent);
      
      // Extract title from first heading
      const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : path.basename(markdownPath, '.md');
      
      // Generate sections for navigation
      const sections = this.extractSections(markdownContent);
      const navigation = this.generateNavigation({
        title: title,
        subtitle: options.subtitle || 'Generated from Markdown',
        items: sections
      });
      
      // Generate complete HTML
      const completeHTML = this.generateCompleteHTML(title, navigation, htmlContent);
      
      // Write to output file
      await fs.writeFile(outputPath, completeHTML, 'utf8');
      
      console.log(`✅ Generated ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error(`❌ Failed to convert ${markdownPath}:`, error.message);
      throw error;
    }
  }

  extractSections(markdownContent) {
    const sections = [];
    const lines = markdownContent.split('\n');
    
    lines.forEach(line => {
      const heading2Match = line.match(/^##\s+(.+)$/);
      const heading3Match = line.match(/^###\s+(.+)$/);
      
      if (heading2Match) {
        const title = heading2Match[1];
        const id = this.generateId(title);
        const icon = this.getIconForSection(title);
        
        sections.push({
          id: id,
          title: title.replace(/\*\*/g, ''),
          icon: icon,
          submenu: []
        });
      } else if (heading3Match && sections.length > 0) {
        const title = heading3Match[1];
        const id = this.generateId(title);
        
        sections[sections.length - 1].submenu.push({
          id: id,
          title: title.replace(/\*\*/g, '')
        });
      }
    });
    
    return sections;
  }

  generateId(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  getIconForSection(title) {
    const iconMap = {
      'critical': '🚨',
      'high priority': '🔥',
      'medium priority': '📋',
      'resolved': '✅',
      'projects': '🚀',
      'statistics': '📊',
      'future': '🔮',
      'process': '🔄',
      'migration': '🗄️',
      'cleanup': '🧹',
      'performance': '📈',
      'overview': '📋'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerTitle.includes(key)) {
        return icon;
      }
    }
    
    return '📄';
  }

  generateCompleteHTML(title, navigation, content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${this.cssTemplate}
    </style>
</head>
<body>
    <div class="container">
        <!-- Navigation Sidebar -->
        <nav class="nav-sidebar">
            ${navigation}
        </nav>

        <!-- Main Content -->
        <main class="main-content">
            ${content}
            
            <footer style="margin-top: 40px; padding: 20px 0; border-top: 1px solid #e1e4e8; text-align: center; color: #666;">
                <p><em>Generated: ${new Date().toLocaleDateString()}</em></p>
                <p><em>Source: Markdown → HTML via rScribe Worker</em></p>
            </footer>
        </main>
    </div>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Highlight current section in navigation
        window.addEventListener('scroll', function() {
            let current = '';
            const sections = document.querySelectorAll('h2, h3');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (pageYOffset >= sectionTop) {
                    current = section.id;
                }
            });

            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.style.background = '#e1f5fe';
                    link.style.color = '#007acc';
                    link.style.fontWeight = 'bold';
                } else {
                    link.style.background = '';
                    link.style.color = '';
                    link.style.fontWeight = '';
                }
            });
        });
    </script>
</body>
</html>`;
  }

  async generateMultiFormat(markdownPath) {
    const baseName = path.basename(markdownPath, '.md');
    
    try {
      // Generate HTML - output to html-docs/
      const htmlPath = path.join('html-docs', `${baseName}.html`);
      await this.convertMarkdownToHTML(markdownPath, htmlPath);
      
      // Generate JSON - output to docs/
      const jsonPath = path.join('docs', `${baseName}.json`);
      await this.generateJSON(markdownPath, jsonPath);
      
      console.log(`✅ Multi-format generation complete for ${baseName}`);
      return {
        markdown: markdownPath,
        html: htmlPath,
        json: jsonPath
      };
      
    } catch (error) {
      console.error(`❌ Multi-format generation failed for ${markdownPath}:`, error.message);
      throw error;
    }
  }

  async generateJSON(markdownPath, jsonPath) {
    try {
      const content = await fs.readFile(markdownPath, 'utf8');
      const sections = this.extractSections(content);
      
      const jsonData = {
        source_file: markdownPath,
        generated_date: new Date().toISOString(),
        title: content.match(/^#\s+(.+)$/m)?.[1] || 'Unknown',
        sections: sections,
        word_count: content.split(/\s+/).length,
        format_version: '1.0'
      };
      
      await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
      console.log(`✅ Generated ${jsonPath}`);
      
    } catch (error) {
      console.error(`❌ Failed to generate JSON for ${markdownPath}:`, error.message);
      throw error;
    }
  }

  // Alias method for backward compatibility
  async generateHtml(markdownPath) {
    return await this.generateMultiFormat(markdownPath);
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📄 HTML Documentation Generator for rScribe Workers

Usage:
  node html-doc-generator.js <markdown-file>     # Generate HTML only
  node html-doc-generator.js --all <markdown>    # Generate HTML + JSON
  node html-doc-generator.js --batch *.md        # Process multiple files

Examples:
  node html-doc-generator.js TASK_SUMMARY.md
  node html-doc-generator.js --all SQLITE_MIGRATION_PLAN.md
    `);
    process.exit(1);
  }

  const generator = new HTMLDocGenerator();
  await generator.loadTemplate();

  try {
    if (args[0] === '--all') {
      // Generate all formats
      const result = await generator.generateMultiFormat(args[1]);
      console.log('📊 Generated files:', result);
      
    } else if (args[0] === '--batch') {
      // Process multiple files
      for (let i = 1; i < args.length; i++) {
        await generator.generateMultiFormat(args[i]);
      }
      
    } else {
      // Generate HTML only - output to html-docs/
      const inputFile = path.basename(args[0]);
      const outputFile = inputFile.replace('.md', '.html');
      const outputPath = path.join('html-docs', outputFile);
      await generator.convertMarkdownToHTML(args[0], outputPath);
    }
    
    console.log('🚀 Documentation generation complete!');
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

// Export for use by other scripts
export { HTMLDocGenerator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
