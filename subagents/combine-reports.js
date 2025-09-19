#!/usr/bin/env node

/**
 * @fileoverview Helper script to combine initial and Gemini validation reports
 * @module combine-reports
 * @requires fs
 * @requires path
 */

const fs = require('fs');
const path = require('path');

/**
 * Combines initial analysis and Gemini validation into final report
 * @param {string} initialPath - Path to initial report
 * @param {string} geminiPath - Path to Gemini validation
 * @param {string} finalPath - Path for combined output
 * @param {string} type - Report type ('review' or 'debug')
 */
function combineReports(initialPath, geminiPath, finalPath, type) {
    try {
        // Read both reports
        const initial = fs.readFileSync(initialPath, 'utf8');
        const gemini = fs.readFileSync(geminiPath, 'utf8');

        // Extract key sections from reports
        const timestamp = new Date().toISOString();
        const reportType = type === 'review' ? 'Code Review' : 'Debug Analysis';

        // Create combined report
        const combined = `# Combined ${reportType} Report
Generated: ${timestamp}

## Report Locations
- Initial Analysis: ${path.basename(initialPath)}
- Gemini Validation: ${path.basename(geminiPath)}
- Final Report: ${path.basename(finalPath)}

---

## Part 1: Initial Analysis
${initial}

---

## Part 2: Gemini Validation
${gemini}

---

## Consensus Summary

### Confirmed Findings
[Agent and Gemini agree on these points - manually review and list]

### Additional Findings (Gemini)
[Issues Gemini found that initial analysis missed]

### Disputed/Clarified Items
[Any disagreements between analyses]

### Final Priority Actions
Based on both analyses, the recommended actions in priority order are:
1. [Highest priority action]
2. [Second priority action]
3. [Third priority action]

## Confidence Score
- Initial Analysis Confidence: [X/10]
- Post-Validation Confidence: [Y/10]
- Agreement Level: [High/Medium/Low]

---
*This combined report integrates multiple AI analyses for comprehensive coverage.*
`;

        // Write combined report
        fs.writeFileSync(finalPath, combined, 'utf8');
        console.log(`✅ Combined report created: ${finalPath}`);

        // Calculate basic metrics
        const initialIssues = (initial.match(/###.*Issue/gi) || []).length;
        const geminiIssues = (gemini.match(/Additional.*found/gi) || []).length;

        console.log(`📊 Metrics:`);
        console.log(`   - Initial issues found: ${initialIssues}`);
        console.log(`   - Additional issues from Gemini: ${geminiIssues}`);
        console.log(`   - Total issues: ${initialIssues + geminiIssues}`);

        return true;
    } catch (error) {
        console.error(`❌ Error combining reports: ${error.message}`);
        return false;
    }
}

/**
 * Main execution
 */
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 4) {
        console.log('Usage: node combine-reports.js <initial> <gemini> <final> <type>');
        console.log('Example: node combine-reports.js initial.md gemini.md final.md review');
        process.exit(1);
    }

    const [initialPath, geminiPath, finalPath, type] = args;

    // Validate paths exist
    if (!fs.existsSync(initialPath)) {
        console.error(`Initial report not found: ${initialPath}`);
        process.exit(1);
    }

    if (!fs.existsSync(geminiPath)) {
        console.error(`Gemini report not found: ${geminiPath}`);
        process.exit(1);
    }

    // Validate type
    if (!['review', 'debug'].includes(type)) {
        console.error(`Invalid type: ${type}. Must be 'review' or 'debug'`);
        process.exit(1);
    }

    // Combine reports
    const success = combineReports(initialPath, geminiPath, finalPath, type);
    process.exit(success ? 0 : 1);
}

module.exports = { combineReports };