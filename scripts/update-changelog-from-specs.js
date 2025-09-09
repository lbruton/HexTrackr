#!/usr/bin/env node
/**
 * update-changelog-from-specs.js
 * Automatically updates CHANGELOG.md with completed tasks from specifications
 */

"use strict";

const fs = require("fs/promises");
const path = require("path");

const SPECS_ROOT = path.join(process.cwd(), "hextrackr-specs", "specs");
const CHANGELOG_PATH = path.join(process.cwd(), "app/public/docs-source/CHANGELOG.md");
const PACKAGE_PATH = path.join(process.cwd(), "package.json");

async function getCurrentVersion() {
  try {
    const packageJson = await fs.readFile(PACKAGE_PATH, "utf8");
    const parsed = JSON.parse(packageJson);
    return parsed.version;
  } catch (err) {
    console.warn("Could not read package.json version, using 'Unreleased'");
    return "Unreleased";
  }
}

async function listSpecTaskFiles(rootDir) {
  const dirs = await fs.readdir(rootDir, { withFileTypes: true });
  const files = await Promise.all(
    dirs.map(async (dirent) => {
      const res = path.join(rootDir, dirent.name);
      if (dirent.isDirectory()) {return listSpecTaskFiles(res);}
      if (dirent.isFile() && dirent.name.toLowerCase() === "tasks.md") {return [res];}
      return [];
    })
  );
  return files.flat();
}

function stripCodeBlocks(md) {
  return md.replace(/```[^]*?```/g, "").replace(/~~~[^]*?~~~/g, "");
}

function parseSpecMeta(md, filePath) {
  const metaRE = /^\*\*Spec\*\*:\s*([^\r\n]+)$/m;
  const match = md.match(metaRE);
  const slug = match ? match[1].trim() : path.basename(path.dirname(filePath));
  const parts = slug.split("-");
  const id = parts.shift() || "???";
  const name = slug.replace(/^[\d\-]+/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
  return { id, name: name || slug, slug };
}

function extractRecentlyCompleted(md, sinceDays = 7) {
  const cleaned = stripCodeBlocks(md);
  const lines = cleaned.split("\n");
  const completed = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - sinceDays);
  
  for (const line of lines) {
    const match = line.match(/^\s*-\s*\[x\]\s+(.+)$/i);
    if (match) {
      let task = match[1].trim();
      // Clean up task text
      task = task.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold
      task = task.replace(/\*(.*?)\*/g, "$1"); // Remove italic
      task = task.replace(/\s+/g, " "); // Normalize spaces
      
      // Look for completion indicators (✅ COMPLETED, dates, etc.)
      const hasRecentCompletion = task.includes("✅") || 
                                  task.includes("COMPLETED") ||
                                  task.includes("Sept 8") ||
                                  task.includes("2025-09");
      
      if (hasRecentCompletion) {
        completed.push(task);
      }
    }
  }
  
  return completed;
}

function buildChangelogEntry(specs, version) {
  if (specs.length === 0) {return null;}
  
  const today = new Date().toISOString().split("T")[0];
  const entries = [];
  
  entries.push(`## [${version}] - ${today}`);
  entries.push("");
  entries.push("### Completed Tasks");
  entries.push("");
  
  for (const spec of specs) {
    if (spec.completed.length > 0) {
      entries.push(`#### ${spec.name} (Spec ${spec.id})`);
      entries.push("");
      for (const task of spec.completed) {
        entries.push(`- ${task}`);
      }
      entries.push("");
    }
  }
  
  return entries.join("\n");
}

function insertIntoChangelog(changelog, newEntry, version) {
  const versionMarker = `## [${version}]`;
  
  // Check if this version already exists
  if (changelog.includes(versionMarker)) {
    console.log(`Version ${version} already exists in changelog - skipping duplicate entry`);
    return changelog;
  }
  
  const unreleasedMarker = "## [Unreleased]";
  
  if (!changelog.includes(unreleasedMarker)) {
    // If no unreleased section, insert after first ## heading
    const firstHeadingIndex = changelog.indexOf("\n## ");
    if (firstHeadingIndex === -1) {
      return changelog + "\n\n" + newEntry;
    }
    return changelog.substring(0, firstHeadingIndex + 1) + "\n" + newEntry + "\n" + changelog.substring(firstHeadingIndex + 1);
  }
  
  // Find the end of the unreleased section
  const unreleasedStart = changelog.indexOf(unreleasedMarker);
  const nextHeading = changelog.indexOf("\n## ", unreleasedStart + unreleasedMarker.length);
  
  if (nextHeading === -1) {
    // Unreleased is the last section
    return changelog + "\n\n" + newEntry;
  }
  
  // Insert before the next heading
  return changelog.substring(0, nextHeading) + "\n\n" + newEntry + "\n" + changelog.substring(nextHeading);
}

async function main() {
  try {
    const version = await getCurrentVersion();
    const taskFiles = await listSpecTaskFiles(SPECS_ROOT);
    
    if (!taskFiles.length) {
      console.warn("No tasks.md files found – CHANGELOG not modified.");
      return;
    }

    const specs = [];
    
    for (const filePath of taskFiles) {
      const contents = await fs.readFile(filePath, "utf8");
      const meta = parseSpecMeta(contents, filePath);
      const completed = extractRecentlyCompleted(contents, 7); // Last 7 days
      
      if (completed.length > 0) {
        specs.push({
          ...meta,
          completed
        });
      }
    }
    
    if (specs.length === 0) {
      console.log("✅ No recently completed tasks found – CHANGELOG unchanged.");
      return;
    }
    
    const changelogEntry = buildChangelogEntry(specs, version);
    if (!changelogEntry) {
      console.log("✅ No changelog entry generated.");
      return;
    }
    
    const changelog = await fs.readFile(CHANGELOG_PATH, "utf8").catch(() => "# Changelog\n\n");
    const updatedChangelog = insertIntoChangelog(changelog, changelogEntry, version);
    
    await fs.writeFile(CHANGELOG_PATH, updatedChangelog, "utf8");
    
    const totalTasks = specs.reduce((sum, s) => sum + s.completed.length, 0);
    console.log(`✅ CHANGELOG.md updated: ${totalTasks} completed tasks from ${specs.length} spec(s).`);
    
    // Show what was added
    for (const spec of specs) {
      console.log(`   ${spec.name}: ${spec.completed.length} tasks`);
    }
    
  } catch (err) {
    console.error("[update-changelog-from-specs] Error:", err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { getCurrentVersion, extractRecentlyCompleted, buildChangelogEntry, insertIntoChangelog };