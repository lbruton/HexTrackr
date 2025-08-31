#!/bin/bash

# Move to GitHub directory
cd /Volumes/DATA/GitHub/

# Remove old FileScopeMCP if it exists
rm -rf FileScopeMCP

# Clone FileScopeMCP
git clone https://github.com/admica/FileScopeMCP.git

# Move into the directory
cd FileScopeMCP

# Fix the TypeScript file
cat > src/mcp-server.ts.fixed << 'EOL'
// Fix for the mermaid HTML wrapper function
function createMermaidHtml(mermaidCode: string, title: string): string {
  const now = new Date();
  const timestamp = `${now.toDateString()} ${now.toLocaleTimeString()}`;
  
  // Re-add escaping for backticks and dollar signs
  const escapedMermaidCode = mermaidCode.replace(/\`/g, '\\\`').replace(/\$/g, '\\\$');
  
  return \`<!DOCTYPE html>...\`; // Rest of the function unchanged
}
EOL

# Apply the fix
mv src/mcp-server.ts.fixed src/mcp-server.ts

# Install dependencies
npm install

# Build the project
npm run build
