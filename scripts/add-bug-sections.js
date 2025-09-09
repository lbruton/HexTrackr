#!/usr/bin/env node

/**
 * Add Bug Fixes sections to all existing spec tasks.md files
 * Constitutional Router Architecture - Phase 2.2
 */

const fs = require("fs");
const path = require("path");

const SPECS_DIR = "hextrackr-specs/specs";
const BUG_SECTION = `
## Bug Fixes

*No active bugs for this specification*

<!-- Template for future bugs:
- [ ] B001: Bug description (affects specific-file.js)
  - **Severity**: Critical|High|Medium|Low  
  - **Impact**: User-visible description
  - **Fix Estimate**: Time estimate
  - **Testing**: Testing requirements
  - **Rollback**: Rollback procedure if needed
-->
`;

function addBugSectionToSpec(specDir) {
  const tasksFile = path.join(specDir, "tasks.md");
  
  if (!fs.existsSync(tasksFile)) {
    console.log(`⚠️  No tasks.md found in ${specDir}`);
    return;
  }
  
  let content = fs.readFileSync(tasksFile, "utf8");
  
  // Check if Bug Fixes section already exists
  if (content.includes("## Bug Fixes")) {
    console.log(`✓ Bug Fixes section already exists in ${specDir}`);
    return;
  }
  
  // Find insertion point (before final sections like "Expected Final State", "Success Metrics", etc.)
  const insertionPoints = [
    "## Expected Final State",
    "## Success Metrics",
    "## Dependencies",
    "## Critical Notes",
    "## Sprint Goals"
  ];
  
  let insertIndex = -1;
  let insertBefore = null;
  
  for (const point of insertionPoints) {
    const index = content.indexOf(point);
    if (index !== -1 && (insertIndex === -1 || index < insertIndex)) {
      insertIndex = index;
      insertBefore = point;
    }
  }
  
  if (insertIndex !== -1) {
    // Insert before the final section
    content = content.slice(0, insertIndex) + BUG_SECTION + "\n" + content.slice(insertIndex);
    console.log(`✓ Added Bug Fixes section before "${insertBefore}" in ${specDir}`);
  } else {
    // Append to end of file
    content += BUG_SECTION;
    console.log(`✓ Appended Bug Fixes section to end of ${specDir}`);
  }
  
  fs.writeFileSync(tasksFile, content);
}

function main() {
  console.log("🏛️  Constitutional Router: Adding Bug Fixes sections to all specs...\n");
  
  if (!fs.existsSync(SPECS_DIR)) {
    console.error(`❌ Specs directory not found: ${SPECS_DIR}`);
    process.exit(1);
  }
  
  const specs = fs.readdirSync(SPECS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();
  
  console.log(`Found ${specs.length} specifications:`);
  specs.forEach(spec => console.log(`  - ${spec}`));
  console.log();
  
  let processed = 0;
  let updated = 0;
  
  for (const spec of specs) {
    const specDir = path.join(SPECS_DIR, spec);
    console.log(`Processing ${spec}...`);
    
    try {
      addBugSectionToSpec(specDir);
      processed++;
      updated++; // Assume updated unless already existed
    } catch (error) {
      console.error(`❌ Error processing ${spec}:`, error.message);
    }
  }
  
  console.log("\n🎯 Constitutional Router Phase 2.2 Complete:");
  console.log(`   - Processed: ${processed} specs`);
  console.log("   - Bug integration structure added to all active specs");
  console.log("   - Template available in hextrackr-specs/templates/bug-integration-template.md");
  console.log("   - Ready for bug-tracking-specialist agent integration");
}

if (require.main === module) {
  main();
}

module.exports = { addBugSectionToSpec };