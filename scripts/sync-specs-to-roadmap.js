#!/usr/bin/env node
/**
 * sync-specs-to-roadmap.js
 * Scans hextrackr-specs/specs/tasks.md files and updates ROADMAP.md
 */

"use strict";

const fs = require("fs/promises");
const path = require("path");

const SPECS_ROOT = path.join(process.cwd(), "hextrackr-specs", "specs");
const ROADMAP_PATH = path.join(process.cwd(), "app/public/docs-source/ROADMAP.md");
const ACTIVE_SPEC_PATH = path.join(process.cwd(), ".active-spec");
const MARK_START = "<!-- AUTO-GENERATED-SPECS-START -->";
const MARK_END = "<!-- AUTO-GENERATED-SPECS-END -->";

async function readActiveSpec() {
  try {
    const content = await fs.readFile(ACTIVE_SPEC_PATH, "utf8");
    return content.trim();
  } catch (_error) {
    console.log("ℹ️ No active spec file found (.active-spec)");
    return null;
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

function parseCheckboxStats(md) {
  const cleaned = stripCodeBlocks(md);
  
  // Check for HexTrackr task format first: ### T0XX: [status symbol]
  const hexTrackrTasks = cleaned.match(/^\s*###\s+T\d+:\s*[✅🔄🆕]/gm) || [];
  if (hexTrackrTasks.length > 0) {
    const total = hexTrackrTasks.length;
    const done = (cleaned.match(/^\s*###\s+T\d+:\s*✅/gm) || []).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }
  
  // Fallback to checkbox format for other specs
  const taskRE = /^\s*-\s*\[(?: |x|X)\]\s+/gm;
  const doneRE = /^\s*-\s*\[(?:x|X)\]\s+/gm;
  const total = (cleaned.match(taskRE) || []).length;
  const done = (cleaned.match(doneRE) || []).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function extractPendingTasks(md, limit = 10) {
  const cleaned = stripCodeBlocks(md);
  const lines = cleaned.split("\n");
  const pending = [];
  
  for (const line of lines) {
    // Handle standard markdown checkbox format: - [ ] Task
    const checkboxMatch = line.match(/^\s*-\s*\[\s\]\s+(.+)$/);
    
    // Handle HexTrackr task format: ### T0XX: 🔄 Task Description
    const hexTrackrMatch = line.match(/^\s*###\s+T\d+:\s*🔄\s+(.+)$/);
    
    if ((checkboxMatch || hexTrackrMatch) && pending.length < limit) {
      let task = checkboxMatch ? checkboxMatch[1].trim() : hexTrackrMatch[1].trim();
      
      // Clean up task text - remove markdown formatting and extra spaces
      task = task.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold
      task = task.replace(/\*(.*?)\*/g, "$1"); // Remove italic
      task = task.replace(/\s+/g, " "); // Normalize spaces
      task = task.replace(/\[P\]/g, ""); // Remove parallel markers
      
      // Truncate if too long
      if (task.length > 80) {
        task = task.substring(0, 77) + "...";
      }
      
      pending.push(task);
    }
  }
  
  return pending;
}

function extractSpecPriority(md, specId) {
  // Look for explicit priority indicators in the markdown
  if (md.includes("**HIGH PRIORITY**") || md.includes("Priority: HIGH")) {
    return "HIGH";
  }
  if (md.includes("**CRITICAL**") || md.includes("Priority: CRITICAL")) {
    return "CRITICAL";
  }
  if (md.includes("**MEDIUM PRIORITY**") || md.includes("Priority: MEDIUM")) {
    return "MEDIUM";
  }
  if (md.includes("**LOW PRIORITY**") || md.includes("Priority: LOW")) {
    return "LOW";
  }
  
  // Auto-detect priority based on spec content and ID
  const lowerMd = md.toLowerCase();
  const specNum = parseInt(specId);
  
  // Critical priority for security specs
  if (specNum === 8 || lowerMd.includes("security hardening") || lowerMd.includes("authentication")) {
    return "CRITICAL";
  }
  
  // High priority for active bugs, security features, and critical integrations
  if (specNum === 4 || specNum === 7 || 
      lowerMd.includes("cve link") || lowerMd.includes("kev integration") ||
      lowerMd.includes("vulnerability") && lowerMd.includes("critical")) {
    return "HIGH";
  }
  
  // Medium priority for API integrations and important features
  if ((specNum >= 12 && specNum <= 13) || specNum === 9 ||
      lowerMd.includes("api integration") || lowerMd.includes("cisco") || 
      lowerMd.includes("tenable") || lowerMd.includes("epss")) {
    return "MEDIUM";
  }
  
  // Low priority for nice-to-have features
  if (specNum === 11 || specNum === 14 ||
      lowerMd.includes("dark mode") || lowerMd.includes("pwa")) {
    return "LOW";
  }
  
  return "NORMAL";
}

function parseSpecMeta(md, filePath) {
  // Try to extract from title line: # Implementation Tasks: [Title]
  const titleMatch = md.match(/^#\s+Implementation Tasks:\s*(.+)$/m);
  if (titleMatch) {
    const fullTitle = titleMatch[1].trim();
    const dirName = path.basename(path.dirname(filePath));
    const parts = dirName.split("-");
    const id = parts[0] || "???";
    const name = fullTitle;
    return { id, name };
  }
  
  // Fallback to original logic for other spec formats
  const metaRE = /^\*\*Spec\*\*:\s*([^\r\n]+)$/m;
  const match = md.match(metaRE);
  const slug = match ? match[1].trim() : path.basename(path.dirname(filePath));
  const parts = slug.split("-");
  const id = parts.shift() || "???";
  const name = slug.replace(/^[\d\-]+/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
  return { id, name: name || slug };
}

async function summariseSpec(filePath) {
  const contents = await fs.readFile(filePath, "utf8");
  const stats = parseCheckboxStats(contents);
  const meta = parseSpecMeta(contents, filePath);
  const pending = extractPendingTasks(contents);
  const priority = extractSpecPriority(contents, meta.id);
  
  return { 
    ...meta, 
    ...stats, 
    pending,
    priority
  };
}

function buildMarkdownTable(summaries, activeSpec) {
  const header = [
    "",
    "### Active Specifications",
    "",
    "| Spec | Title | Progress | Priority | Next Tasks |",
    "| ---- | ----- | -------- | -------- | ---------- |"
  ];
  
  const rows = summaries.map(s => {
    const progress = `${s.done}/${s.total} (${s.pct}%)`;
    const priorityBadge = s.priority === "CRITICAL" ? "🔴 CRIT" :
                         s.priority === "HIGH" ? "🟠 HIGH" : 
                         s.priority === "MEDIUM" ? "🟡 MED" :
                         s.priority === "LOW" ? "🔵 LOW" : "⚪ NORM";
    
    let nextTasks = "All tasks completed";
    if (s.pending.length > 0) {
      nextTasks = s.pending.map(task => `• ${task}`).join("<br>");
    }
    
    // Check if this is the active spec and highlight it
    const isActiveSpec = activeSpec && s.name.toLowerCase().includes(activeSpec.replace(/^\d+-/, "").replace(/-/g, " "));
    const specId = isActiveSpec ? `**⚡ ${s.id}**` : s.id;
    const specTitle = isActiveSpec ? `**${s.name}** 🎯` : s.name;
    
    return `| ${specId} | ${specTitle} | ${progress} | ${priorityBadge} | ${nextTasks} |`;
  });
  
  return header.concat(rows, "").join("\n");
}

function spliceSection(original, generated) {
  if (!original.includes(MARK_START) || !original.includes(MARK_END)) {
    return original.trimEnd() + "\n\n" + MARK_START + "\n" + generated + "\n" + MARK_END + "\n";
  }
  const pre = original.split(MARK_START)[0];
  const post = original.split(MARK_END)[1] ?? "";
  return pre + MARK_START + "\n" + generated + "\n" + MARK_END + post;
}

(async function main() {
  try {
    const taskFiles = await listSpecTaskFiles(SPECS_ROOT);
    if (!taskFiles.length) {
      console.warn("No tasks.md files found – ROADMAP not modified.");
      return;
    }

    const activeSpec = await readActiveSpec();
    const summaries = await Promise.all(taskFiles.map(summariseSpec));
    summaries.sort((a, b) => Number(a.id) - Number(b.id));

    const tableMd = buildMarkdownTable(summaries, activeSpec);
    const roadmap = await fs.readFile(ROADMAP_PATH, "utf8").catch(() => "");
    const updated = spliceSection(roadmap, tableMd);

    await fs.writeFile(ROADMAP_PATH, updated, "utf8");
    const totalTasks = summaries.reduce((sum, s) => sum + s.total, 0);
    const completedTasks = summaries.reduce((sum, s) => sum + s.done, 0);
    const overallPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    console.log(`✅ ROADMAP.md updated: ${summaries.length} spec(s) processed.`);
    console.log(`   Overall progress: ${completedTasks}/${totalTasks} tasks (${overallPct}%)`);
    
    // Log pending tasks summary
    const totalPending = summaries.reduce((sum, s) => sum + s.pending.length, 0);
    if (totalPending > 0) {
      console.log(`   Next tasks: ${totalPending} pending across active specs`);
    }
  } catch (err) {
    console.error("[sync-specs-to-roadmap] Error:", err);
    process.exitCode = 1;
  }
})();