#!/usr/bin/env node
/* eslint-env node */
/* global require, module, __dirname, console */

/**
 * Code Symbol Indexer
 * 
 * Scans JavaScript/TypeScript files and extracts function/class/variable definitions
 * Stores results in both SQLite (real-time) and JSON (structured) formats
 * Syncs to Memento MCP for persistent searchable memory
 */

require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { execSync } = require("child_process");

// For AST parsing
const esprima = require("esprima");

class CodeSymbolIndexer {
    constructor() {
        this.projectRoot = path.resolve(__dirname, "../..");
        this.outputPath = path.join(this.projectRoot, ".rMemory", "json");
        this.patterns = [
            "**/*.js",
            "**/*.ts", 
            "**/*.mjs",
            "!node_modules/**",
            "!.git/**",
            "!*.min.js"
        ];
        
        // Define exclude patterns for filtering
        this.excludePatterns = [
            "node_modules",
            ".git", 
            "*.min.js",
            ".rMemory",
            "__MACOSX"
        ];
        
        // Initialize SQLite database
        this.initDatabase();
    }

    /**
     * Initialize SQLite database for real-time symbol storage
     */
    initDatabase() {
        const dbPath = path.join(this.projectRoot, ".rMemory", "sqlite", "symbol_index.db");
        
        // Create directory if needed
        require("fs").mkdirSync(path.dirname(dbPath), { recursive: true });
        
        this.db = new sqlite3.Database(dbPath);
        
        // Initialize tables
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS symbols (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT NOT NULL,
                symbol_name TEXT NOT NULL,
                symbol_type TEXT NOT NULL,
                symbol_category TEXT NOT NULL,
                definition_line INTEGER,
                exports BOOLEAN DEFAULT 0,
                context TEXT,
                hash TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(file_path, symbol_name, symbol_type)
            )
        `;
        
        this.db.run(createTableSQL, (err) => {
            if (err) {
                console.error("Database init error:", err);
            } else {
                console.log("🗃️  Database initialized");
            }
        });
    }

    /**
     * Store symbols in SQLite database for real-time access
     */
    async storeSymbolsInDatabase(symbols, file) {
        const insertSQL = `
            INSERT OR REPLACE INTO symbols 
            (file_path, symbol_name, symbol_type, symbol_category, definition_line, exports, context, hash) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const symbol of symbols) {
            await new Promise((resolve, reject) => {
                this.db.run(insertSQL, [
                    file.relativePath,
                    symbol.name,
                    symbol.type,
                    symbol.type, // using type as category for now
                    symbol.lineStart,
                    symbol.exports || false,
                    symbol.signature,
                    symbol.name + file.relativePath // simple hash
                ], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }    /**
     * Main execution flow
     */
    async indexCodebase() {
        console.log("🔍 Starting HexTrackr Code Symbol Indexing...");
        
        try {
            // Ensure output directory exists
            await this.ensureOutputDirectory();
            
            // Find all source files
            const sourceFiles = await this.findSourceFiles();
            console.log(`📁 Found ${sourceFiles.length} source files`);
            
            // Index symbols from each file
            const allSymbols = [];
            for (const file of sourceFiles) {
                try {
                    const symbols = await this.indexFile(file);
                    allSymbols.push(...symbols);
                    
                    // Store symbols in SQLite for real-time access
                    await this.storeSymbolsInDatabase(symbols, file);
                    
                    console.log(`📋 ${file.relativePath}: ${symbols.length} symbols`);
                } catch (error) {
                    console.warn(`⚠️  Skipping ${file.relativePath}: ${error.message}`);
                }
            }
            
            // Create symbol index files
            await this.createSymbolIndex(allSymbols);
            await this.createMementoImport(allSymbols);
            
            console.log("✅ Code indexing complete!");
            console.log(`📊 Indexed ${allSymbols.length} symbols`);
            console.log(`📁 Output: ${this.outputPath}`);
            
        } catch (error) {
            console.error("❌ Code indexing failed:", error.message);
            throw error;
        }
    }

    /**
     * Find all JavaScript/TypeScript source files
     */
    async findSourceFiles() {
        const files = [];
        
        const scanDirectory = async (dir, baseDir = dir) => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(baseDir, fullPath);
                
                // Skip excluded patterns
                if (this.shouldExclude(relativePath)) {continue;}
                
                if (entry.isDirectory()) {
                    await scanDirectory(fullPath, baseDir);
                } else if (this.isSourceFile(entry.name)) {
                    files.push({
                        fullPath,
                        relativePath,
                        name: entry.name,
                        extension: path.extname(entry.name)
                    });
                }
            }
        };
        
        await scanDirectory(this.projectRoot);
        return files;
    }

    /**
     * Check if path should be excluded
     */
    shouldExclude(relativePath) {
        return this.excludePatterns.some(pattern => {
            if (pattern.includes("*")) {
                // Simple glob pattern matching
                const regex = new RegExp(pattern.replace(/\*/g, ".*"));
                return regex.test(relativePath);
            }
            return relativePath.includes(pattern);
        });
    }

    /**
     * Check if file is a source file we can index
     */
    isSourceFile(fileName) {
        const sourceExtensions = [".js", ".ts", ".jsx", ".tsx", ".mjs"];
        return sourceExtensions.some(ext => fileName.endsWith(ext));
    }

    /**
     * Index symbols from a single file
     */
    async indexFile(file) {
        const content = await fs.readFile(file.fullPath, "utf8");
        const symbols = [];
        
        try {
            // Parse JavaScript/TypeScript with esprima
            const ast = esprima.parseScript(content, {
                ecmaVersion: 2022,
                sourceType: "module",
                loc: true,
                comments: true
            });
            
            // Extract symbols from AST
            this.extractSymbolsFromAST(ast, file, content, symbols);
            
        } catch (parseError) {
            // If esprima fails, try as module
            try {
                const ast = esprima.parseModule(content, {
                    ecmaVersion: 2022,
                    loc: true,
                    comments: true
                });
                this.extractSymbolsFromAST(ast, file, content, symbols);
            } catch (moduleError) {
                throw new Error(`Parse failed: ${parseError.message}`);
            }
        }
        
        return symbols;
    }

    /**
     * Extract symbols from AST
     */
    extractSymbolsFromAST(ast, file, content, symbols) {
        const lines = content.split("\n");
        
        // Walk the AST
        this.walkAST(ast, (node) => {
            let symbol = null;
            
            switch (node.type) {
                case "FunctionDeclaration":
                    symbol = {
                        type: "function",
                        name: node.id?.name || "anonymous",
                        signature: this.getFunctionSignature(node),
                        lineStart: node.loc.start.line,
                        lineEnd: node.loc.end.line,
                        documentation: this.findNearestComment(node, ast.comments, lines)
                    };
                    break;
                    
                case "ClassDeclaration":
                    symbol = {
                        type: "class",
                        name: node.id?.name || "anonymous",
                        signature: `class ${node.id?.name || "anonymous"}`,
                        lineStart: node.loc.start.line,
                        lineEnd: node.loc.end.line,
                        documentation: this.findNearestComment(node, ast.comments, lines)
                    };
                    break;
                    
                case "VariableDeclarator":
                    if (node.id?.name) {
                        symbol = {
                            type: "variable",
                            name: node.id.name,
                            signature: `${node.id.name}`,
                            lineStart: node.loc.start.line,
                            lineEnd: node.loc.end.line,
                            documentation: this.findNearestComment(node, ast.comments, lines)
                        };
                    }
                    break;
                    
                case "MethodDefinition":
                    symbol = {
                        type: "method",
                        name: node.key?.name || "anonymous",
                        signature: this.getMethodSignature(node),
                        lineStart: node.loc.start.line,
                        lineEnd: node.loc.end.line,
                        documentation: this.findNearestComment(node, ast.comments, lines)
                    };
                    break;
            }
            
            if (symbol) {
                symbols.push({
                    ...symbol,
                    file: file.relativePath,
                    fullPath: file.fullPath,
                    project: "HexTrackr",
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Walk AST nodes recursively
     */
    walkAST(node, callback) {
        if (!node || typeof node !== "object") {return;}
        
        callback(node);
        
        for (const key in node) {
            if (key === "parent") {continue;} // Avoid circular references
            
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(item => this.walkAST(item, callback));
            } else if (typeof child === "object" && child !== null) {
                this.walkAST(child, callback);
            }
        }
    }

    /**
     * Get function signature string
     */
    getFunctionSignature(node) {
        const name = node.id?.name || "anonymous";
        const params = node.params.map(param => {
            if (param.type === "Identifier") {return param.name;}
            if (param.type === "AssignmentPattern") {return `${param.left.name} = ...`;}
            return "...";
        }).join(", ");
        
        return `function ${name}(${params})`;
    }

    /**
     * Get method signature string
     */
    getMethodSignature(node) {
        const name = node.key?.name || "anonymous";
        const params = node.value?.params?.map(param => {
            if (param.type === "Identifier") {return param.name;}
            if (param.type === "AssignmentPattern") {return `${param.left.name} = ...`;}
            return "...";
        }).join(", ") || "";
        
        const prefix = node.static ? "static " : "";
        const kind = node.kind === "constructor" ? "constructor" : "method";
        
        return `${prefix}${name}(${params})`;
    }

    /**
     * Find nearest comment to a node (JSDoc style)
     */
    findNearestComment(node, comments, lines) {
        if (!comments || !node.loc) {return null;}
        
        // Look for comment immediately before the node
        const targetLine = node.loc.start.line;
        const nearbyComment = comments.find(comment => {
            const commentEndLine = comment.loc.end.line;
            return commentEndLine >= targetLine - 3 && commentEndLine < targetLine;
        });
        
        if (nearbyComment) {
            return nearbyComment.value.trim();
        }
        
        return null;
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDirectory() {
        try {
            await fs.access(this.outputPath);
        } catch {
            await fs.mkdir(this.outputPath, { recursive: true });
        }
    }

    /**
     * Create searchable symbol index
     */
    async createSymbolIndex(symbols) {
        const symbolIndex = {
            project: "HexTrackr",
            generated: new Date().toISOString(),
            totalSymbols: symbols.length,
            symbolsByType: this.groupSymbolsByType(symbols),
            symbolsByFile: this.groupSymbolsByFile(symbols),
            searchIndex: symbols.map(symbol => ({
                name: symbol.name,
                type: symbol.type,
                file: symbol.file,
                line: symbol.lineStart,
                signature: symbol.signature
            }))
        };
        
        const outputFile = path.join(this.outputPath, "symbol-index.json");
        await fs.writeFile(outputFile, JSON.stringify(symbolIndex, null, 2));
        console.log(`💾 Symbol index: ${outputFile}`);
    }

    /**
     * Create Memento import file
     */
    async createMementoImport(symbols) {
        const mementoEntities = symbols.map(symbol => ({
            entityType: "code_symbol",
            name: `${symbol.file}:${symbol.name}`,
            observations: [
                `Type: ${symbol.type}`,
                `Signature: ${symbol.signature}`,
                `File: ${symbol.file}`,
                `Lines: ${symbol.lineStart}-${symbol.lineEnd}`,
                "Project: HexTrackr",
                ...(symbol.documentation ? [`Documentation: ${symbol.documentation}`] : [])
            ]
        }));
        
        const mementoImport = {
            importType: "code_symbols",
            project: "HexTrackr",
            generated: new Date().toISOString(),
            entities: mementoEntities
        };
        
        const outputFile = path.join(this.outputPath, "memento-import.json");
        await fs.writeFile(outputFile, JSON.stringify(mementoImport, null, 2));
        console.log(`🧠 Memento import: ${outputFile}`);
    }

    /**
     * Group symbols by type
     */
    groupSymbolsByType(symbols) {
        const groups = {};
        symbols.forEach(symbol => {
            if (!groups[symbol.type]) {groups[symbol.type] = [];}
            groups[symbol.type].push(symbol);
        });
        return groups;
    }

    /**
     * Group symbols by file
     */
    groupSymbolsByFile(symbols) {
        const groups = {};
        symbols.forEach(symbol => {
            if (!groups[symbol.file]) {groups[symbol.file] = [];}
            groups[symbol.file].push(symbol);
        });
        return groups;
    }
}

// Run if called directly
if (require.main === module) {
    const indexer = new CodeSymbolIndexer();
    indexer.indexCodebase().catch(console.error);
}

module.exports = { CodeSymbolIndexer };
