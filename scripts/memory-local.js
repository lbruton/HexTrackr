#!/usr/bin/env node
/* eslint-env node */
/*
 Local memory fallback for HexTrackr agents.
 Stores entries in docs/ops/memory.jsonl with fields:
 { id, timestamp, tags: string[], topic, content }
*/
const fs = require("fs");
const path = require("path");

const MEM_DIR = path.join(__dirname, "..", "docs", "ops");
const MEM_FILE = path.join(MEM_DIR, "memory.jsonl");

function ensureFile() {
  if (!fs.existsSync(MEM_DIR)) {fs.mkdirSync(MEM_DIR, { recursive: true });}
  if (!fs.existsSync(MEM_FILE)) {fs.writeFileSync(MEM_FILE, "");}
}

function* readAll() {
  ensureFile();
  const data = fs.readFileSync(MEM_FILE, "utf8");
  if (!data) {return;}
  for (const line of data.split("\n")) {
    if (!line.trim()) {continue;}
    try { yield JSON.parse(line); } catch {}
  }
}

function writeEntry({ tags = [], topic = "", content = "" }) {
  ensureFile();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const entry = { id, timestamp: new Date().toISOString(), tags, topic, content };
  fs.appendFileSync(MEM_FILE, JSON.stringify(entry) + "\n");
  return entry;
}

function searchEntries({ q = "", tag = "" }) {
  const results = [];
  for (const e of readAll() || []) {
    const matchesQ = !q ||
      (e.topic && e.topic.toLowerCase().includes(q.toLowerCase())) ||
      (e.content && e.content.toLowerCase().includes(q.toLowerCase()));
    const matchesTag = !tag || (Array.isArray(e.tags) && e.tags.includes(tag));
    if (matchesQ && matchesTag) {results.push(e);}
  }
  return results;
}

function tagEntry({ id, add = [] }) {
  ensureFile();
  const all = Array.from(readAll() || []);
  let updated = 0;
  const out = all.map((e) => {
    if (e.id === id) {
      const set = new Set([...(e.tags || []), ...add]);
      e.tags = Array.from(set);
      updated += 1;
    }
    return JSON.stringify(e);
  }).join("\n") + (all.length ? "\n" : "");
  fs.writeFileSync(MEM_FILE, out);
  return updated;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "write") {
    const json = JSON.parse(rest[0] || "{}");
    const entry = writeEntry(json);
    console.log(JSON.stringify(entry, null, 2));
  } else if (cmd === "search") {
    const json = JSON.parse(rest[0] || "{}");
    const results = searchEntries(json);
    console.log(JSON.stringify(results, null, 2));
  } else if (cmd === "tag") {
    const json = JSON.parse(rest[0] || "{}");
    const count = tagEntry(json);
    console.log(JSON.stringify({ updated: count }, null, 2));
  } else {
    console.log("Usage:\n  node scripts/memory-local.js write \"{\"tags\":[\"project:HexTrackr\"],\"topic\":\"init\",\"content\":\"setup\"}\"\n  node scripts/memory-local.js search \"{\"q\":\"setup\"}\"\n  node scripts/memory-local.js tag \"{\"id\":\"<id>\",\"add\":[\"project:HexTrackr\"]}\"");
    process.exit(1);
  }
}

main();
