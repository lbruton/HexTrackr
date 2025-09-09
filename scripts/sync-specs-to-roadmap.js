#!/usr/bin/env node
/**
 * sync-specs-to-roadmap.js
 * Scans hextrackr-specs/specs/tasks.md files and updates ROADMAP.md
 */

"use strict";

const fs = require("fs/promises");
const path = require("path");

const SPECS_ROOT = path.join(process.cwd(), "hextrackr-specs", "specs");
const ROADMAP_PATH = path.join(process.cwd(), "ROADMAP.md");
const MARK_START = "<!-- AUTO-GENERATED-SPECS-START -->";
const MARK_END = "<!-- AUTO-GENERATED-SPECS-END -->";

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
  const taskRE = /^\s*-\s*\[(?: |x|X)\]\s+/gm;
  const doneRE = /^\s*-\s*\[(?:x|X)\]\s+/gm;
  const total = (cleaned.match(taskRE) || []).length;
  const done = (cleaned.match(doneRE) || []).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function parseSpecMeta(md, filePath) {
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
  return { ...meta, ...stats };
}

function buildMarkdownTable(summaries) {
  const header = [
    "",
    "### Active Specifications",
    "",
    "| Spec | Title | Progress |",
    "| ---- | ----- | -------- |"
  ];
  const rows = summaries.map(s => {
    const progress = `${s.done}/${s.total} (${s.pct}%)`;
    return `| ${s.id} | ${s.name} | ${progress} |`;
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

    const summaries = await Promise.all(taskFiles.map(summariseSpec));
    summaries.sort((a, b) => Number(a.id) - Number(b.id));

    const tableMd = buildMarkdownTable(summaries);
    const roadmap = await fs.readFile(ROADMAP_PATH, "utf8").catch(() => "");
    const updated = spliceSection(roadmap, tableMd);

    await fs.writeFile(ROADMAP_PATH, updated, "utf8");
    console.log(`✅ ROADMAP.md updated: ${summaries.length} spec(s) processed.`);
  } catch (err) {
    console.error("[sync-specs-to-roadmap] Error:", err);
    process.exitCode = 1;
  }
})();