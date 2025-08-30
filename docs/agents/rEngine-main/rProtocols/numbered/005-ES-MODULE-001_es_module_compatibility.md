# ES Module Compatibility Protocol

**Protocol ID**: 005-ES-MODULE-001  
**Created**: August 23, 2025  
**Author**: GitHub Copilot  
**Version**: 1.0  
**Priority**: CRITICAL  
**Execution Order**: After Git Safety (004), Before Session Handoff (006)

---

## 🎯 **Purpose**

Ensure ES module compatibility across the rEngine platform, preventing module import/export conflicts and maintaining consistent module architecture.

## 🚨 **Critical Requirements**

### **1. File Extension Consistency**

- `.js` files: ES modules with `import/export`
- `.cjs` files: CommonJS modules with `require/module.exports`
- `.mjs` files: Explicit ES modules
- **NO MIXING**: Never use `require()` in `.js` files or `import` in `.cjs` files

### **2. Package.json Configuration**

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./index.js",
      "require": "./index.cjs"
    }
  }
}
```

### **3. Import/Export Patterns**

```javascript
// ✅ CORRECT - ES Module (.js)
import { callLLM } from './call-llm.js';
import fs from 'fs/promises';
import path from 'path';

export { processMemory, updateContext };
export default MemoryManager;

// ✅ CORRECT - CommonJS (.cjs)
const { callLLM } = require('./call-llm.cjs');
const fs = require('fs').promises;
const path = require('path');

module.exports = { processMemory, updateContext };
module.exports.default = MemoryManager;
```

## 🔗 **Protocol Cross-References**

- **001-MEMORY-MGT-001**: Memory files must follow ES module patterns
- **002-RENGINE-START-001**: Startup scripts must declare module type
- **003-SCRIBE-SYS-001**: Scribe workers must use correct import syntax
- **004-GIT-SAFETY-001**: Version control safety before module changes

## 🛠 **Implementation Steps**

### **Phase 1: Audit Current Files**

```bash

# Check for mixed module usage

grep -r "require(" --include="*.js" .
grep -r "import " --include="*.cjs" .

# Identify module type mismatches

find . -name "*.js" -exec grep -l "require(" {} \;
find . -name "*.cjs" -exec grep -l "import " {} \;
```

### **Phase 2: Convert Problem Files**

1. **Rename files**: `.js` → `.cjs` if using CommonJS
2. **Update imports**: Change to appropriate syntax
3. **Fix package.json**: Add `"type": "module"` if needed
4. **Test functionality**: Ensure all imports resolve correctly

### **Phase 3: Validate Integration**

```bash

# Test ES module imports

node --experimental-modules test-imports.js

# Check for circular dependencies

madge --circular --extensions js,cjs .

# Validate all entry points

npm test && npm run start
```

## 🚫 **Common Violations & Fixes**

### **❌ Problem: Mixed Syntax in .js File**

```javascript
// BROKEN
const express = require('express');
import { processData } from './utils.js';
```

### **✅ Solution: Choose One Pattern**

```javascript
// Option A: Full ES Module
import express from 'express';
import { processData } from './utils.js';

// Option B: Rename to .cjs and use CommonJS
const express = require('express');
const { processData } = require('./utils.cjs');
```

### **❌ Problem: Missing File Extensions**

```javascript
// BROKEN
import { helper } from './utils';
```

### **✅ Solution: Always Include Extensions**

```javascript
// CORRECT
import { helper } from './utils.js';
```

## 🔍 **Validation Checklist**

- [ ] All `.js` files use ES module syntax exclusively
- [ ] All `.cjs` files use CommonJS syntax exclusively
- [ ] `package.json` declares correct module type
- [ ] All imports include file extensions
- [ ] No circular dependencies detected
- [ ] All entry points start successfully
- [ ] Memory bridge compatibility maintained
- [ ] Scribe system imports resolve correctly

## 🎯 **Success Metrics**

- **Zero module errors** during startup
- **Clean import resolution** for all dependencies
- **Consistent syntax** across codebase
- **Future-proof compatibility** with Node.js LTS

## 📋 **Emergency Rollback Procedure**

If module changes break the system:

1. **Immediate Revert**: `git checkout HEAD~1 -- affected-files`
2. **Restart Services**: `docker-compose restart`
3. **Validate Health**: Run health checks
4. **Document Issue**: Add to protocol violation log
5. **Plan Fix**: Schedule proper ES module migration

---

**Tags**: `module-system`, `es6`, `nodejs`, `import-export`, `compatibility`  
**Related Protocols**: `001`, `002`, `003`, `004`  
**Validation Required**: Before any module-related code changes
