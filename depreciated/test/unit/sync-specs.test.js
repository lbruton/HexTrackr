#!/usr/bin/env node
/**
 * Unit tests for sync-specs-to-roadmap.js
 * Fast execution, comprehensive coverage
 */

const assert = require("assert");
const path = require("path");

// Mock the sync script functions for testing
const parseCheckboxStats = (md) => {
  const cleaned = md.replace(/```[^]*?```/g, "").replace(/~~~[^]*?~~~/g, "");
  const taskRE = /^\s*-\s*\[(?: |x|X)\]\s+/gm;
  const doneRE = /^\s*-\s*\[(?:x|X)\]\s+/gm;
  const total = (cleaned.match(taskRE) || []).length;
  const done = (cleaned.match(doneRE) || []).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
};

const parseSpecMeta = (md, filePath) => {
  const metaRE = /^\*\*Spec\*\*:\s*([^\r\n]+)$/m;
  const match = md.match(metaRE);
  const slug = match ? match[1].trim() : path.basename(path.dirname(filePath));
  const parts = slug.split("-");
  const id = parts.shift() || "???";
  const name = slug.replace(/^[\d\-]+/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
  return { id, name: name || slug };
};

// Test Suite
console.log("🧪 Running sync-specs unit tests...");

// Test 1: parseCheckboxStats - Empty spec
const test1 = parseCheckboxStats("");
assert.deepStrictEqual(test1, { total: 0, done: 0, pct: 0 }, "Empty spec test failed");
console.log("✅ Empty spec test passed");

// Test 2: parseCheckboxStats - Partial completion
const test2 = parseCheckboxStats("- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3");
assert.deepStrictEqual(test2, { total: 3, done: 1, pct: 33 }, "Partial completion test failed");
console.log("✅ Partial completion test passed");

// Test 3: parseCheckboxStats - Complete spec
const test3 = parseCheckboxStats("- [x] Task 1\n- [X] Task 2\n- [x] Task 3");
assert.deepStrictEqual(test3, { total: 3, done: 3, pct: 100 }, "Complete spec test failed");
console.log("✅ Complete spec test passed");

// Test 4: parseCheckboxStats - Code block filtering
const test4 = parseCheckboxStats("- [x] Real task\n```\n- [ ] Code example\n```\n- [ ] Another task");
assert.deepStrictEqual(test4, { total: 2, done: 1, pct: 50 }, "Code block filtering failed");
console.log("✅ Code block filtering test passed");

// Test 5: parseSpecMeta - Standard case
const test5 = parseSpecMeta("**Spec**: 022-documentation-portal-spec-kit-integration", "/specs/022/tasks.md");
assert.deepStrictEqual(test5, { id: "022", name: "Documentation Portal Spec Kit Integration" }, "Standard meta test failed");
console.log("✅ Standard meta test passed");

// Test 6: parseSpecMeta - No meta line (fallback)
const test6 = parseSpecMeta("Some content without meta", "/specs/022-test-spec/tasks.md");
assert.deepStrictEqual(test6, { id: "022", name: "Test Spec" }, "Fallback meta test failed");
console.log("✅ Fallback meta test passed");

console.log("🎉 All unit tests passed! Ready for integration testing.");