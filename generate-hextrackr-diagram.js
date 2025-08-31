#!/usr/bin/env node

/**
 * Generate HexTrackr Architecture Diagram from FileScopeMCP Analysis
 * This script reads the existing FileScopeMCP-tree-HexTrackr.json and creates a focused diagram
 */

const fs = require("fs");
const path = require("path");

// Read the FileScopeMCP analysis
const treeDataPath = path.join(__dirname, "FileScopeMCP-tree-HexTrackr.json");
const treeData = JSON.parse(fs.readFileSync(treeDataPath, "utf8"));

// Extract high-importance files and key components
function extractKeyComponents(fileTree) {
    const components = [];
    
    function traverse(node, _parentPath = "") {
        if (node.importance > 3) {
            components.push({
                name: node.name,
                path: node.path,
                importance: node.importance,
                dependencies: node.dependencies || [],
                dependents: node.dependents || [],
                isDirectory: node.isDirectory
            });
        }
        
        if (node.children) {
            node.children.forEach(child => traverse(child, node.path));
        }
    }
    
    traverse(fileTree);
    return components;
}

// Generate Mermaid diagram code
function generateMermaidDiagram(components) {
    let mermaidCode = "graph TB\n";
    const nodeMap = new Map();
    let nodeCounter = 0;
    
    // Create nodes for high-importance files
    components.forEach(comp => {
        const nodeId = `node${nodeCounter++}`;
        nodeMap.set(comp.path, nodeId);
        
        const displayName = comp.name;
        const color = getColorByImportance(comp.importance);
        
        mermaidCode += `    ${nodeId}[${displayName}]\n`;
        mermaidCode += `    style ${nodeId} ${color}\n`;
    });
    
    // Add key relationships
    mermaidCode += "\n    %% Key Dependencies\n";
    components.forEach(comp => {
        const sourceNode = nodeMap.get(comp.path);
        if (comp.dependencies && comp.dependencies.length > 0) {
            comp.dependencies.forEach(dep => {
                const targetNode = nodeMap.get(dep);
                if (targetNode && sourceNode) {
                    mermaidCode += `    ${sourceNode} --> ${targetNode}\n`;
                }
            });
        }
    });
    
    return mermaidCode;
}

function getColorByImportance(importance) {
    if (importance >= 7) {return "fill:#ff7675,stroke:#2d3436";} // Critical - Red
    if (importance >= 5) {return "fill:#fd79a8,stroke:#2d3436";} // High - Pink  
    if (importance >= 3) {return "fill:#fdcb6e,stroke:#2d3436";} // Medium - Orange
    return "fill:#74b9ff,stroke:#2d3436"; // Normal - Blue
}

// Create HTML wrapper
function createDiagramHTML(mermaidCode, title = "HexTrackr Architecture Diagram") {
    const now = new Date();
    const timestamp = `${now.toDateString()} ${now.toLocaleTimeString()}`;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #1e1e2f 0%, #1d2426 100%);
      color: #dfe6e9;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
    }
    .mermaid-container {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .legend {
      margin-top: 20px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
    .legend-item {
      display: inline-block;
      margin: 5px 10px;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
    }
    .critical { background: #ff7675; }
    .high { background: #fd79a8; }
    .medium { background: #fdcb6e; color: #2d3436; }
    .normal { background: #74b9ff; }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <p>Generated on ${timestamp}</p>
    <p>Based on FileScopeMCP analysis - Showing files with importance score ≥ 4</p>
  </header>
  
  <div class="mermaid-container">
    <div class="mermaid">
${mermaidCode}
    </div>
  </div>
  
  <div class="legend">
    <h3>File Importance Legend:</h3>
    <span class="legend-item critical">Critical (7-10)</span>
    <span class="legend-item high">High (5-6)</span>
    <span class="legend-item medium">Medium (3-4)</span>
    <span class="legend-item normal">Normal (0-2)</span>
  </div>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#74b9ff',
        primaryTextColor: '#dfe6e9',
        primaryBorderColor: '#636e72',
        lineColor: '#636e72',
        secondaryColor: '#fd79a8',
        tertiaryColor: '#fdcb6e'
      }
    });
  </script>
</body>
</html>`;
}

// Main execution
console.log("🔍 Analyzing HexTrackr structure...");
const components = extractKeyComponents(treeData.fileTree);
console.log(`📊 Found ${components.length} high-importance components`);

const mermaidCode = generateMermaidDiagram(components);
const htmlContent = createDiagramHTML(mermaidCode);

// Write the diagram files
const htmlPath = path.join(__dirname, "HexTrackr-Architecture-Diagram.html");
const mermaidPath = path.join(__dirname, "HexTrackr-Architecture-Diagram.mmd");

fs.writeFileSync(htmlPath, htmlContent);
fs.writeFileSync(mermaidPath, mermaidCode);

console.log("✅ HexTrackr architecture diagram generated:");
console.log(`   📄 HTML: ${htmlPath}`);
console.log(`   📋 Mermaid: ${mermaidPath}`);
console.log("");
console.log("🚀 Open the HTML file in your browser to view the interactive diagram!");
