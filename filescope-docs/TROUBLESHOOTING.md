# Diagram Troubleshooting Guide

## Issue: Blank Diagrams

If the FileScopeMCP-generated diagrams appear blank, this is usually due to one of these issues:

### Common Causes

1. **Network/CDN Issues**: The Mermaid library from CDN might not load
2. **Browser Security**: Local file restrictions on `file://` URLs
3. **JavaScript Errors**: Complex diagram generation scripts may have compatibility issues

### Solutions

#### ✅ **Use Simplified Diagrams**

We've created simplified, working diagrams:

- **[simple-diagram.html](./simple-diagram.html)** - Basic dependency view
- **[project-structure.html](./project-structure.html)** - Project organization

#### ✅ **Alternative Viewing Methods**

1. **Serve via HTTP**: Use a local web server instead of file:// URLs

   ```bash
   cd filescope-docs
   python3 -m http.server 8000

   # Visit http://localhost:8000/simple-diagram.html

   ```

1. **Use Mermaid Live Editor**:
   - Copy content from `.mmd` files
   - Paste into [https://mermaid.live](https://mermaid.live)
   - View and edit interactively

1. **Browser Console**: Check for JavaScript errors in browser developer tools

#### ✅ **Working Files**

These files are confirmed to work:

- `simple-diagram.html` - Core dependencies
- `project-structure.html` - Project overview
- `*.mmd` files - Raw Mermaid source code

#### ✅ **Regenerate If Needed**

You can regenerate diagrams with different settings:

```bash

# More basic dependency diagram

mcp_filescope-mcp_generate_diagram(
    style="dependency", 
    outputFormat="mmd", 
    minImportance=4
)
```

### Browser Compatibility

**Tested Working**: Chrome, Firefox, Safari (when served via HTTP)  
**Known Issues**: Some browsers restrict local file access to CDN resources

### Contact

If diagrams still don't work, the issue is likely browser/network related rather than the FileScopeMCP analysis itself (which is working correctly).
