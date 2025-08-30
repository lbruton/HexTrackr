#!/usr/bin/env node

/**
 * Import detailed symbols from symbol-index.json
 * This contains more detailed symbol information than symbols-table.json
 */

const fs = require("fs");
const path = require("path");

const SYMBOL_INDEX_PATH = path.join(__dirname, "..", ".rMemory", "json", "symbol-index.json");

function loadSymbolIndex() {
    try {
        const content = fs.readFileSync(SYMBOL_INDEX_PATH, "utf8");
        return JSON.parse(content);
    } catch (error) {
        console.error("Error loading symbol index:", error);
        return null;
    }
}

function createSymbolEntities(symbolData) {
    const entities = [];
    
    // Process each symbol type
    for (const [symbolType, symbols] of Object.entries(symbolData.symbolsByType)) {
        console.log(`Processing ${symbols.length} ${symbolType} symbols...`);
        
        // Group symbols by file for better organization
        const symbolsByFile = {};
        
        symbols.forEach(symbol => {
            const file = symbol.file || "unknown";
            if (!symbolsByFile[file]) {
                symbolsByFile[file] = [];
            }
            symbolsByFile[file].push(symbol);
        });
        
        // Create entities for each file's symbols
        for (const [file, fileSymbols] of Object.entries(symbolsByFile)) {
            if (fileSymbols.length === 0) {continue;}
            
            const entityName = `Detailed ${symbolType} symbols in ${path.basename(file)}`;
            const observations = [
                `File: ${file}`,
                `Symbol type: ${symbolType}`,
                `Symbol count: ${fileSymbols.length}`,
                `Generated: ${symbolData.generated}`,
                `Project: ${symbolData.project}`
            ];
            
            // Add top symbols with their details
            const topSymbols = fileSymbols.slice(0, 10);
            topSymbols.forEach(symbol => {
                let symbolDesc = `${symbol.name}`;
                if (symbol.signature && symbol.signature !== symbol.name) {
                    symbolDesc += ` (${symbol.signature})`;
                }
                if (symbol.lineStart) {
                    symbolDesc += ` at line ${symbol.lineStart}`;
                }
                if (symbol.documentation) {
                    symbolDesc += ` - ${symbol.documentation.substring(0, 100)}`;
                }
                observations.push(`Symbol: ${symbolDesc}`);
            });
            
            if (fileSymbols.length > 10) {
                observations.push(`... and ${fileSymbols.length - 10} more ${symbolType} symbols`);
            }
            
            entities.push({
                name: entityName,
                entityType: "code_symbols",
                observations: observations
            });
        }
    }
    
    return entities;
}

function main() {
    console.log("Loading symbol index data...");
    
    const symbolData = loadSymbolIndex();
    if (!symbolData) {
        console.error("Failed to load symbol index data");
        process.exit(1);
    }
    
    console.log(`Symbol index contains ${symbolData.totalSymbols} total symbols`);
    console.log("Symbol types:", Object.keys(symbolData.symbolsByType));
    
    const entities = createSymbolEntities(symbolData);
    console.log(`Created ${entities.length} symbol entities`);
    
    // Save to output file
    const outputPath = path.join(__dirname, "..", ".rMemory", "json", "symbol-entities.json");
    fs.writeFileSync(outputPath, JSON.stringify(entities, null, 2));
    console.log(`Saved symbol entities to ${outputPath}`);
    
    return entities;
}

if (require.main === module) {
    main();
}

module.exports = { main };
