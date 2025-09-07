# Context7 Documentation Cache

This directory contains cached documentation from Context7 for offline development and sub-agent reference.

## Structure

```
.context7/
├── README.md                 # This file
├── cache-manifest.json       # Cache metadata and trust scores
└── frameworks/               # Cached framework documentation
    ├── express.md           # Express.js documentation
    ├── chartjs.md           # Chart.js documentation  
    ├── sqlite3.md           # Node SQLite3 documentation
    ├── ag-grid.md           # AG-Grid documentation
    ├── apexcharts.md        # ApexCharts documentation
    └── tabler.md            # Tabler UI documentation
```

## Usage

Sub-agents can reference these files directly without loading the Context7 MCP service:

```bash

# Read Express.js documentation

cat .context7/frameworks/express.md

# Search for specific patterns

grep -n "middleware" .context7/frameworks/express.md
```

## Cache Management

- **Last Updated**: September 5, 2025
- **Source**: Context7 MCP Service
- **Coverage**: 6 major HexTrackr frameworks
- **Total Snippets**: 4,722 code examples

## Trust Scores

All cached documentation includes Context7 trust scores for reliability assessment.

## Refresh Strategy

To update the cache:

1. Use Context7 MCP service to download latest docs
2. Run the cache update script (if available)
3. Update the cache-manifest.json with new metadata
