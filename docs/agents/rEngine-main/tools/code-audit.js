#!/usr/bin/env node
/**
 * rEngine Code Audit & Cross-Reference Report Generator
 * - Project inventory
 * - Dependencies & scripts
 * - Module import graph (Mermaid)
 * - Function call graph (heuristic, Mermaid)
 * - Event & network map
 * - Per-file function catalog with line numbers
 * - Cross-reference index (defs/usages)
 * - Refactoring suggestions & feature-flag map
 * - Outputs: Markdown, HTML, and saves annexes per module
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import esprima from 'esprima';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Source roots to scan (repo-root relative)
const SRC_DIRS = [
  '.',               // scan from repo root but we will skip EXCLUDE_DIRS
  'rEngine',
  'rAgents',
  'rEngineMCP',
  'rMemory',
  'rScribe',
  'scripts',
  'bin',
  'tools',
  'docker'
];

const EXCLUDE_DIRS = new Set([
  'node_modules', 'backups', 'rDocuments', 'deprecated', 'logs', '.git', '.rengine', 'rProjects_backup_20250821_083419',
  'rProjects', 'rLogs', 'memory-backups'
]);

const OUT_DIR = path.join(repoRoot, 'docs', 'code-review');
const OUT_MD = path.join(OUT_DIR, 'RENGINE_CODE_REVIEW.md');
const OUT_HTML = path.join(OUT_DIR, 'RENGINE_CODE_REVIEW.html');

function listFiles(dir) {
  const results = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    if (!fs.existsSync(cur)) continue;
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      const rel = path.relative(repoRoot, full);
      const parts = rel.split(path.sep);
      if (parts.some(p => EXCLUDE_DIRS.has(p))) continue;
      if (e.isDirectory()) stack.push(full);
      else results.push(full);
    }
  }
  return results;
}

function readJSON(file) {
  try { return fs.readJsonSync(file); } catch { return null; }
}

function parseJS(file) {
  const code = fs.readFileSync(file, 'utf8');
  try {
    const ast = esprima.parseModule(code, { loc: true, comment: true, tolerant: true });
  return { code, ast };
  } catch (e) {
    return { code, ast: null, error: e.message };
  }
}

function collectProjectInventory() {
  const files = [];
  for (const base of SRC_DIRS) {
    const abs = path.join(repoRoot, base);
    files.push(...listFiles(abs));
  }
  return files.sort();
}

function codeBlock(content, lang = '') {
  const fence = '```';
  return `${fence}${lang}\n${content}\n${fence}`;
}

function htmlFromMarkdownWithMermaid(md) {
  // Convert mermaid blocks to <div class="mermaid"> and keep other code fences as pre/code
  const mermaidRe = /```mermaid\n([\s\S]*?)```/g;
  let html = md.replace(mermaidRe, (_m, g1) => `<div class="mermaid">${escapeHtml(g1)}</div>`);
  // Convert remaining code fences with optional lang
  const codeRe = /```(\w+)?\n([\s\S]*?)```/g;
  html = html.replace(codeRe, (_m, lang, code) => `<pre><code class="language-${lang || 'text'}">${escapeHtml(code)}</code></pre>`);
  // Basic paragraphs for lines not in code blocks
  html = html.split('\n').map(l => {
    if (l.startsWith('<div class="mermaid">') || l.startsWith('<pre><code') || l.startsWith('</code></pre>')) return l;
    if (l.startsWith('#')) {
      const level = l.match(/^#+/)[0].length;
      const text = escapeHtml(l.replace(/^#+\s*/, ''));
      return `<h${level}>${text}</h${level}>`;
    }
    if (l.trim().length === 0) return '';
    return `<p>${escapeHtml(l)}</p>`;
  }).join('\n');
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>rEngine Code Review</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:1100px;margin:24px auto;padding:0 16px;}pre{background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto;}code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace;}.mermaid{background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:8px;margin:12px 0;}</style>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' });</script>
</head>
<body>
<article>
${html}
</article>
</body>
</html>`;
}

function analyzeImportsAndDefs(file, ast) {
  const imports = [];
  const functions = [];
  const classes = [];
  const calls = [];
  const vars = [];
  const events = [];
  const network = [];
  const timers = [];

  function addImport(source, spec) { imports.push({ source, spec }); }
  function addFunc(name, loc, type) { functions.push({ name, loc, type }); }
  function addClass(name, loc) { classes.push({ name, loc }); }
  function addCall(name, loc) { calls.push({ name, loc }); }
  function addVar(name, loc) { vars.push({ name, loc }); }
  function addEvent(type, name, loc) { events.push({ type, name, loc }); }
  function addNetwork(kind, url, loc) { network.push({ kind, url, loc }); }
  function addTimer(kind, loc) { timers.push({ kind, loc }); }

  if (!ast) return { imports, functions, classes, calls, vars, events, network, timers };

  esprima.traverse?.(ast, { enter: () => {} }); // placeholder if traverse exists; fallback below

  const stack = [ast];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;

    // Push children
    for (const k in node) {
      const v = node[k];
      if (v && typeof v === 'object' && (v.type || Array.isArray(v))) stack.push(v);
    }

    switch (node.type) {
      case 'ImportDeclaration':
        addImport(node.source.value, node.specifiers.map(s => s.local?.name || s.imported?.name).filter(Boolean));
        break;
      case 'VariableDeclaration':
        for (const d of node.declarations) {
          if (d.id?.name) addVar(d.id.name, d.loc);
          // function expressions / arrows
          if (d.init && (d.init.type === 'FunctionExpression' || d.init.type === 'ArrowFunctionExpression')) {
            if (d.id?.name) addFunc(d.id.name, d.loc, 'var:' + d.init.type);
          }
        }
        break;
      case 'FunctionDeclaration':
        addFunc(node.id?.name || '(anonymous)', node.loc, 'function');
        break;
      case 'ClassDeclaration':
        addClass(node.id?.name || '(anonymous)', node.loc);
        break;
      case 'CallExpression': {
        const callee = node.callee;
        let name = null;
        if (callee.type === 'Identifier') name = callee.name;
        else if (callee.type === 'MemberExpression') {
          const obj = callee.object?.name || (callee.object?.property?.name ? `${callee.object.object?.name}.${callee.object.property?.name}` : null);
          const prop = callee.property?.name;
          name = [obj, prop].filter(Boolean).join('.');
        }
        if (name) addCall(name, node.loc);

        // Treat require('x') as imports for CJS
        if (callee.type === 'Identifier' && callee.name === 'require') {
          const arg0 = node.arguments && node.arguments[0];
          if (arg0 && arg0.type === 'Literal' && typeof arg0.value === 'string') {
            addImport(arg0.value, []);
          }
        }

        // Network heuristics
        if (name === 'fetch') addNetwork('fetch', tryExtractURL(node), node.loc);
        if (name && name.startsWith('axios')) addNetwork('axios', tryExtractURL(node), node.loc);
        if (name?.includes('XMLHttpRequest')) addNetwork('xhr', null, node.loc);

        // Event heuristics
        if (name?.endsWith('addEventListener')) addEvent('dom', tryExtractEventName(node), node.loc);

        // Timers
        if (name === 'setTimeout' || name === 'setInterval') addTimer(name, node.loc);
        break; }
    }
  }

  return { imports, functions, classes, calls, vars, events, network, timers };
}

function tryExtractURL(node) {
  const arg = node.arguments?.[0];
  if (arg?.type === 'Literal' && typeof arg.value === 'string') return arg.value;
  return null;
}

function tryExtractEventName(node) {
  const args = node.arguments || [];
  const a0 = args[0];
  if (a0?.type === 'Literal' && typeof a0.value === 'string') return a0.value;
  return null;
}

function buildGraphs(analysis) {
  const moduleEdges = [];
  const callEdges = [];

  for (const f of Object.keys(analysis)) {
    const entry = analysis[f];
    const from = f;
    for (const imp of entry.imports) {
      moduleEdges.push([from, imp.source]);
    }
    for (const call of entry.calls) {
      callEdges.push([from + ':' + nearestFunc(entry, call.loc), call.name]);
    }
  }

  const moduleMermaid = 'graph TD\n' + moduleEdges.map(([a,b]) => `  "${a}" --> "${b}"`).join('\n');
  const callMermaid = 'graph TD\n' + callEdges.map(([a,b]) => `  "${a}" --> "${b}"`).join('\n');
  return { moduleMermaid, callMermaid };
}

function nearestFunc(entry, loc) {
  if (!loc) return '(root)';
  const funcs = entry.functions || [];
  let best = '(root)';
  let bestDist = Infinity;
  for (const f of funcs) {
    if (f.loc && f.loc.start && f.loc.start.line <= loc.start.line) {
      const dist = loc.start.line - f.loc.start.line;
      if (dist < bestDist) { bestDist = dist; best = f.name || '(anonymous)'; }
    }
  }
  return best;
}

function buildCrossRef(analysis) {
  const defs = new Map(); // name -> [{file, loc, kind}]
  const uses = new Map(); // name -> [{file, loc, ctx}]

  for (const [file, entry] of Object.entries(analysis)) {
    for (const f of entry.functions) {
      if (!defs.has(f.name)) defs.set(f.name, []);
      defs.get(f.name).push({ file, loc: f.loc, kind: f.type || 'function' });
    }
    for (const c of entry.classes) {
      const name = c.name;
      if (!defs.has(name)) defs.set(name, []);
      defs.get(name).push({ file, loc: c.loc, kind: 'class' });
    }
    for (const v of entry.vars) {
      if (!defs.has(v.name)) defs.set(v.name, []);
      defs.get(v.name).push({ file, loc: v.loc, kind: 'var' });
    }
    for (const call of entry.calls) {
      const name = call.name.split('.').pop();
      if (!uses.has(name)) uses.set(name, []);
      uses.get(name).push({ file, loc: call.loc, ctx: 'call' });
    }
  }
  return { defs, uses };
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function main() {
  await fs.ensureDir(OUT_DIR);

  const pkg = readJSON(path.join(repoRoot, 'package.json'));
  const inventory = collectProjectInventory();

  const jsFiles = inventory.filter(f => f.endsWith('.js') || f.endsWith('.cjs') || f.endsWith('.mjs'));
  const analysis = {};
  for (const file of jsFiles) {
  const { ast } = parseJS(file);
  analysis[path.relative(repoRoot, file)] = analyzeImportsAndDefs(file, ast);
  }

  const graphs = buildGraphs(analysis);
  const xref = buildCrossRef(analysis);

  // Build markdown
  const mdParts = [];
  mdParts.push('# rEngine Code Review and Cross-Reference Report');
  mdParts.push('Date: ' + new Date().toISOString());

  // Inventory
  mdParts.push('\n## Project inventory');
  mdParts.push('Total files scanned: ' + inventory.length);
  mdParts.push('\n' + codeBlock(inventory.map(f => path.relative(repoRoot, f)).join('\n')));

  // package.json
  mdParts.push('\n## Dependencies & build scripts');
  if (pkg) {
    mdParts.push('\n### Scripts');
    mdParts.push('\n' + codeBlock(JSON.stringify(pkg.scripts, null, 2), 'json'));
    mdParts.push('\n### Dependencies');
    mdParts.push('\n' + codeBlock(JSON.stringify(pkg.dependencies, null, 2), 'json'));
  }

  // Graphs
  mdParts.push('\n## Module import graph');
  mdParts.push('\n```mermaid\n' + graphs.moduleMermaid + '\n```');
  mdParts.push('\n## Function call graph (heuristic)');
  mdParts.push('\n```mermaid\n' + graphs.callMermaid + '\n```');

  // Event & network map
  mdParts.push('\n## Event & network map');
  const allEvents = Object.entries(analysis).flatMap(([f,e]) => e.events.map(ev => ({ file:f, ...ev })));
  const allNetwork = Object.entries(analysis).flatMap(([f,e]) => e.network.map(n => ({ file:f, ...n })));
  const allTimers = Object.entries(analysis).flatMap(([f,e]) => e.timers.map(t => ({ file:f, ...t })));
  mdParts.push('\n### Events');
  mdParts.push('\n' + codeBlock(allEvents.map(e => `${e.type}\t${e.name}\t${e.file}:${e.loc?.start?.line}`).join('\n')));
  mdParts.push('\n### Network');
  mdParts.push('\n' + codeBlock(allNetwork.map(n => `${n.kind}\t${n.url || ''}\t${n.file}:${n.loc?.start?.line}`).join('\n')));
  mdParts.push('\n### Timers');
  mdParts.push('\n' + codeBlock(allTimers.map(t => `${t.kind}\t${t.file}:${t.loc?.start?.line}`).join('\n')));

  // Per-file function catalog
  mdParts.push('\n## Per-file function and class catalog');
  for (const [file, entry] of Object.entries(analysis)) {
    mdParts.push(`\n### ${file}`);
    if (entry.functions.length === 0 && entry.classes.length === 0) {
      mdParts.push('No functions/classes detected.');
      continue;
    }
    if (entry.functions.length) {
      mdParts.push('\nFunctions:');
      mdParts.push('\n' + codeBlock(entry.functions.map(f => `${f.name}\tline ${f.loc?.start?.line} (${f.type})`).join('\n')));
    }
    if (entry.classes.length) {
      mdParts.push('\nClasses:');
      mdParts.push('\n' + codeBlock(entry.classes.map(c => `${c.name}\tline ${c.loc?.start?.line}`).join('\n')));
    }
  }

  // Cross-reference index
  // Symbol Index (alphabetical)
  const allSymbols = Array.from(new Set([
    ...Array.from(xref.defs.keys()),
    ...Array.from(xref.uses.keys())
  ])).sort();
  mdParts.push('\n## Symbol Index');
  mdParts.push('\n' + codeBlock(allSymbols.join('\n')));

  mdParts.push('\n## Cross-reference index (symbol -> defs and uses)');
  for (const [name, defs] of xref.defs.entries()) {
    const usesList = xref.uses.get(name) || [];
    mdParts.push(`\n### ${name}`);
    mdParts.push('\nDefinitions:');
    mdParts.push('\n' + codeBlock(defs.map(d => `${d.kind}\t${d.file}:${d.loc?.start?.line}`).join('\n')));
    mdParts.push('Usages:');
    mdParts.push('\n' + codeBlock(usesList.map(u => `${u.ctx}\t${u.file}:${u.loc?.start?.line}`).join('\n')));
  }

  // Recommendations & feature flags
  // Misplacement detection (heuristic)
  const misplaced = inventory
    .filter(f => f.includes(`${path.sep}rEngine${path.sep}`) && /\.(c?m?js|ts)$/.test(f))
    .filter(f => /memory-bridge|vscode-mcp-bridge|integrated-mcp|publish-docs|recall|scribe/i.test(f));

  mdParts.push('\n## Refactoring & simplification recommendations');
  mdParts.push('- Unify duplicate bridge files: prefer a single `rEngine/memory-bridge.(js|cjs)`; remove or alias the other.');
  mdParts.push('- Consolidate MCP server variants: prefer a single entry (integrated-mcp-manager.js) and deprecate older *.cjs mirrors.');
  mdParts.push('- Extract memory orchestration into a dedicated module with a small interface used by bridge, scribe, and CLI.');
  mdParts.push('- Add health checks for long-running scripts (scribe, bridge) and watchdog restarts.');
  mdParts.push('- Feature flags: memory search matrix, document sweep, html generator, MCP stdio bridge, multi-provider rate limiter.');
  mdParts.push('- Map each flag to top-level files to allow safe stripping for minimal runtime.');
  if (misplaced.length) {
    mdParts.push('\n### Potentially misplaced executable scripts (consider moving to root bin/ or scripts/)');
    mdParts.push('\n' + codeBlock(misplaced.map(f => path.relative(repoRoot, f)).join('\n')));
  }

  // Feature-flag mapping (heuristic)
  const featureFlags = {
    memoryMatrix: ['rEngine/ragent-search-matrix.js', 'rEngine/rapid-context-recall.js'],
    documentSweep: ['rEngine/document-sweep.js', 'rEngine/html-doc-generator.js', 'rEngine/claude-doc-sweep-and-html.js'],
    htmlGenerator: ['rEngine/enhanced-document-generator.js', 'rEngine/html-doc-generator.js'],
    mcpBridge: ['rEngine/mcp-stdio-bridge.js', 'rEngine/integrated-mcp-manager.js', 'rEngine/standalone-mcp-manager.cjs'],
    rateLimiter: ['rEngine/multi-provider-rate-limiter.js', 'rEngine/fast-groq-rate-limiter.js'],
  };
  mdParts.push('\n### Feature flags suggestion');
  mdParts.push('\n' + codeBlock(JSON.stringify(featureFlags, null, 2), 'json'));

  // Write MD
  const md = mdParts.join('\n');
  await fs.writeFile(OUT_MD, md, 'utf8');

  // Simple HTML wrapper with Mermaid support
  const html = htmlFromMarkdownWithMermaid(md);
  await fs.writeFile(OUT_HTML, html, 'utf8');

  // Annexes per module
  for (const [file, entry] of Object.entries(analysis)) {
  const annexParts = [];
  annexParts.push(`# Annex: ${file}`);
  annexParts.push('\n## Functions');
  annexParts.push(codeBlock(entry.functions.map(f => `${f.name}\tline ${f.loc?.start?.line} (${f.type})`).join('\n')));
  annexParts.push('\n## Classes');
  annexParts.push(codeBlock(entry.classes.map(c => `${c.name}\tline ${c.loc?.start?.line}`).join('\n')));
  annexParts.push('\n## Imports');
  annexParts.push(codeBlock(entry.imports.map(i => `${i.source}\t${(i.spec||[]).join(',')}`).join('\n')));
  annexParts.push('\n## Calls');
  annexParts.push(codeBlock(entry.calls.map(c => `${c.name}\tline ${c.loc?.start?.line}`).join('\n')));
  const annex = annexParts.join('\n');
    const annexPath = path.join(OUT_DIR, file.replace(/[\/]/g,'__') + '.md');
    await fs.outputFile(annexPath, annex, 'utf8');
  }

  console.log('Code review generated:', path.relative(repoRoot, OUT_MD));
  console.log('HTML report:', path.relative(repoRoot, OUT_HTML));
}

main().catch(err => { console.error(err); process.exit(1); });
