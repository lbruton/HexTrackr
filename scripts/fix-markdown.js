#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console */
/* global require, module, process, console */
/* eslint no-undef: "off" */

/**
 * HexTrackr Markdown Formatter
 * Fixes all Codacy markdown violations automatically
 * 
 * Usage:
 *   node scripts/fix-markdown.js --file=path/to/file.md
 *   node scripts/fix-markdown.js --all
 *   node scripts/fix-markdown.js --dry-run --all
 *   node scripts/fix-markdown.js --all --dir=docs-source
 */

const fs = require('fs');
const path = require('path');

class MarkdownFormatter {
    constructor(options = {}) {
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;
        this.stats = {
            filesProcessed: 0,
            headingSpacingFixed: 0,
            listSpacingFixed: 0,
            emphasisToHeadingFixed: 0,
            orderedListFixed: 0,
            duplicateHeadingsFixed: 0
        };
    }

    log(message) {
        if (this.verbose) {
            console.log(`[${new Date().toISOString()}] ${message}`);
        }
    }

    /**
     * Fix heading spacing violations (MD022)
     * Ensures headings are surrounded by blank lines
     */
    fixHeadingSpacing(content) {
        let fixes = 0;
        
        // Split into lines for processing
        const lines = content.split('\n');
        const result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isHeading = /^#{1,6}\s/.test(line.trim());
            
            if (isHeading) {
                // Check if previous line needs blank line
                if (i > 0 && lines[i - 1].trim() !== '') {
                    result.push('');
                    fixes++;
                }
                
                result.push(line);
                
                // Check if next line needs blank line
                if (i < lines.length - 1 && lines[i + 1].trim() !== '') {
                    result.push('');
                    fixes++;
                }
            } else {
                result.push(line);
            }
        }
        
        this.stats.headingSpacingFixed += fixes;
        return result.join('\n');
    }

    /**
     * Fix list spacing violations (MD032)
     * Ensures lists are surrounded by blank lines
     */
    fixListSpacing(content) {
        let fixes = 0;
        const lines = content.split('\n');
        const result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isListItem = /^[\s]*[-*+]\s/.test(line) || /^[\s]*\d+\.\s/.test(line);
            const prevLine = i > 0 ? lines[i - 1] : '';
            const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
            
            // Check if this is the start of a list
            const isListStart = isListItem && !(/^[\s]*[-*+]\s/.test(prevLine) || /^[\s]*\d+\.\s/.test(prevLine));
            
            // Check if this is the end of a list
            const isListEnd = isListItem && !(/^[\s]*[-*+]\s/.test(nextLine) || /^[\s]*\d+\.\s/.test(nextLine));
            
            if (isListStart && prevLine.trim() !== '') {
                result.push('');
                fixes++;
            }
            
            result.push(line);
            
            if (isListEnd && nextLine.trim() !== '') {
                result.push('');
                fixes++;
            }
        }
        
        this.stats.listSpacingFixed += fixes;
        return result.join('\n');
    }

    /**
     * Fix emphasis used as headings (MD036)
     * Convert **bold text** at start of line to proper headings
     */
    fixEmphasisAsHeading(content) {
        let fixes = 0;
        
        const lines = content.split('\n');
        const result = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Check if line starts with bold text that should be a heading
            const boldMatch = line.match(/^\*\*(.*?)\*\*\s*$/);
            if (boldMatch && line.trim().length < 60) { // Likely a heading if short
                const headingText = boldMatch[1];
                const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
                
                // Convert to heading based on context
                if (nextLine.trim() === '' || i === lines.length - 1) {
                    line = `## ${headingText}`;
                    fixes++;
                }
            }
            
            result.push(line);
        }
        
        this.stats.emphasisToHeadingFixed += fixes;
        return result.join('\n');
    }

    /**
     * Fix ordered list consistency (MD029)
     * Ensure ordered lists use sequential numbering
     */
    fixOrderedLists(content) {
        let fixes = 0;
        const lines = content.split('\n');
        const result = [];
        
        let listNumber = 1;
        let inOrderedList = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const orderedListMatch = line.match(/^(\s*)\d+\.\s(.*)$/);
            
            if (orderedListMatch) {
                if (!inOrderedList) {
                    listNumber = 1;
                    inOrderedList = true;
                }
                
                const indent = orderedListMatch[1];
                const content = orderedListMatch[2];
                line = `${indent}${listNumber}. ${content}`;
                listNumber++;
                fixes++;
            } else {
                inOrderedList = false;
                listNumber = 1;
            }
            
            result.push(line);
        }
        
        this.stats.orderedListFixed += fixes;
        return result.join('\n');
    }

    /**
     * Fix duplicate headings (MD024)
     * Add unique identifiers to duplicate headings
     */
    fixDuplicateHeadings(content) {
        let fixes = 0;
        const lines = content.split('\n');
        const headingSeen = new Map();
        const result = [];
        
        for (let line of lines) {
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            
            if (headingMatch) {
                const level = headingMatch[1];
                const text = headingMatch[2];
                const lowerText = text.toLowerCase();
                
                if (headingSeen.has(lowerText)) {
                    const count = headingSeen.get(lowerText) + 1;
                    headingSeen.set(lowerText, count);
                    line = `${level} ${text} (${count})`;
                    fixes++;
                } else {
                    headingSeen.set(lowerText, 1);
                }
            }
            
            result.push(line);
        }
        
        this.stats.duplicateHeadingsFixed += fixes;
        return result.join('\n');
    }

    /**
     * Format a single markdown file
     */
    formatFile(filePath) {
        this.log(`Processing: ${filePath}`);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Apply all fixes in sequence
            content = this.fixHeadingSpacing(content);
            content = this.fixListSpacing(content);
            content = this.fixEmphasisAsHeading(content);
            content = this.fixOrderedLists(content);
            content = this.fixDuplicateHeadings(content);
            
            // Clean up multiple consecutive blank lines
            content = content.replace(/\n{3,}/g, '\n\n');
            
            // Ensure file ends with single newline
            content = content.replace(/\n*$/, '\n');
            
            if (!this.dryRun) {
                fs.writeFileSync(filePath, content);
            }
            
            this.stats.filesProcessed++;
            this.log(`✅ Formatted: ${filePath}`);
            
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    }

    /**
     * Find all markdown files in the project
     */
    findMarkdownFiles(dir = process.cwd()) {
        const markdownFiles = [];
        const excludeDirs = ['node_modules', '.git', 'data', 'docs-prototype'];
        
        const scanDirectory = (currentDir) => {
            try {
                const items = fs.readdirSync(currentDir);
                
                for (const item of items) {
                    const fullPath = path.join(currentDir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        // Skip excluded directories
                        if (!excludeDirs.includes(item)) {
                            scanDirectory(fullPath);
                        }
                    } else if (stat.isFile() && item.endsWith('.md')) {
                        markdownFiles.push(path.relative(process.cwd(), fullPath));
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        };
        
        scanDirectory(dir);
        return markdownFiles;
    }

    /**
     * Print formatting statistics
     */
    printStats() {
        console.log('\n📊 Markdown Formatting Results:');
        console.log(`Files processed: ${this.stats.filesProcessed}`);
        console.log(`Heading spacing fixes: ${this.stats.headingSpacingFixed}`);
        console.log(`List spacing fixes: ${this.stats.listSpacingFixed}`);
        console.log(`Emphasis→heading fixes: ${this.stats.emphasisToHeadingFixed}`);
        console.log(`Ordered list fixes: ${this.stats.orderedListFixed}`);
        console.log(`Duplicate heading fixes: ${this.stats.duplicateHeadingsFixed}`);
        
        const totalFixes = Object.values(this.stats).reduce((sum, val) => 
            typeof val === 'number' && val !== this.stats.filesProcessed ? sum + val : sum, 0);
        console.log(`Total fixes applied: ${totalFixes}`);
        
        if (this.dryRun) {
            console.log('\n⚠️  DRY RUN MODE - No files were modified');
        }
    }
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose') || args.includes('-v'),
        all: args.includes('--all'),
    file: args.find(arg => arg.startsWith('--file='))?.split('=')[1],
    dir: args.find(arg => arg.startsWith('--dir='))?.split('=')[1]
    };

    console.log('🔧 HexTrackr Markdown Formatter');
    console.log('Fixing Codacy markdown violations...\n');

    const formatter = new MarkdownFormatter(options);

    // If a target directory is provided, change into it so relative paths work as expected
    if (options.dir) {
        const targetDir = path.resolve(process.cwd(), options.dir);
        if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
            console.error(`❌ Directory not found or not a directory: ${options.dir}`);
            process.exit(1);
        }
        if (options.verbose) {
            console.log(`[${new Date().toISOString()}] Changing working directory to: ${targetDir}`);
        }
        process.chdir(targetDir);
    }

    if (options.file) {
        // Format single file
        if (!fs.existsSync(options.file)) {
            console.error(`❌ File not found: ${options.file}`);
            process.exit(1);
        }
        formatter.formatFile(options.file);
    } else if (options.all) {
        // Format all markdown files
        const markdownFiles = formatter.findMarkdownFiles();
        console.log(`Found ${markdownFiles.length} markdown files\n`);
        
        markdownFiles.forEach(file => formatter.formatFile(file));
    } else {
        console.log('Usage:');
        console.log('  node scripts/fix-markdown.js --file=path/to/file.md');
        console.log('  node scripts/fix-markdown.js --all');
        console.log('  node scripts/fix-markdown.js --dry-run --all');
        console.log('  node scripts/fix-markdown.js --verbose --all');
        console.log('  node scripts/fix-markdown.js --all --dir=docs-source');
        process.exit(1);
    }

    formatter.printStats();
}

if (require.main === module) {
    main();
}

module.exports = MarkdownFormatter;
