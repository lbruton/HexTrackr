#!/usr/bin/env node
/**
 * docs-sync-all.js
 * Master script to sync all documentation from specifications
 */

"use strict";

const { execSync } = require("child_process");
const path = require("path");

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

async function runScript(scriptName, description) {
  console.log(`🔄 ${description}...`);
  try {
    const output = execSync(`node ${path.join(SCRIPTS_DIR, scriptName)}`, { 
      encoding: "utf8",
      cwd: process.cwd()
    });
    console.log(output.trim());
    return true;
  } catch (err) {
    console.error(`❌ Failed to run ${scriptName}:`, err.message);
    return false;
  }
}

async function main() {
  console.log("📚 Starting complete documentation sync pipeline...\n");
  
  const steps = [
    { script: "sync-specs-to-roadmap.js", desc: "Syncing roadmap with spec progress" },
    { script: "update-changelog-from-specs.js", desc: "Updating changelog from completed tasks" }
  ];
  
  let successCount = 0;
  
  for (const step of steps) {
    const success = await runScript(step.script, step.desc);
    if (success) {successCount++;}
    console.log(); // Add spacing between steps
  }
  
  // Run docs generation
  console.log("🔄 Regenerating documentation portal...");
  try {
    const output = execSync("npm run docs:generate", { 
      encoding: "utf8",
      cwd: process.cwd()
    });
    console.log(output.trim());
    successCount++;
  } catch (err) {
    console.error("❌ Failed to generate docs:", err.message);
  }
  
  console.log(`\n✅ Documentation sync complete: ${successCount}/${steps.length + 1} operations successful.`);
  
  if (successCount === steps.length + 1) {
    console.log("🎉 All documentation is now synchronized and up to date!");
  } else {
    console.log("⚠️  Some operations failed. Please check the errors above.");
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}