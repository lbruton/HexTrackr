# Codacy False Positive Guidelines

**Purpose**: Prevent code-breaking "fixes" from automated linting tools that don't understand HexTrackr's modular architecture.

---

## 🚨 CRITICAL: Never Trust These Codacy Warnings

### ❌ Pattern 1: "Variable is undefined" in Controllers/Services

**Common Examples:**
- `db is not defined`
- `progressTracker is not defined`
- `req is not defined`
- `res is not defined`
- `socket is not defined`

**Why Codacy is Wrong:**

These variables come from dependency injection and parent scopes that Codacy's static analysis cannot see:

```javascript
// Dependency Injection Pattern
class VulnerabilityController {
    static initialize(db, progressTracker) {
        // ❌ Codacy says: "db is not defined"
        // ✅ Reality: db comes from initialize() parameter
        this.db = db;
        this.progressTracker = progressTracker;
    }
}

// Express Route Handler Pattern
router.get('/api/vulnerabilities', (req, res) => {
    // ❌ Codacy says: "req is not defined"
    // ✅ Reality: req comes from Express middleware
    const data = await service.getData(req.query);
    res.json(data);
});

// WebSocket Event Handler Pattern
socket.on('progress', (data) => {
    // ❌ Codacy says: "data is not defined"
    // ✅ Reality: data comes from event callback
    console.log(data);
});
```

**DO NOT:**
- ❌ Add underscore prefix (`_db`, `_req`, `_progressTracker`)
- ❌ Remove the variable
- ❌ Try to "fix" the warning with code changes
- ❌ Trust Codacy's suggested fix

**DO:**
- ✅ Verify variable comes from function parameter or parent scope
- ✅ Check if it's dependency injection or event handler
- ✅ Add ESLint ignore comment: `// eslint-disable-line no-undef`
- ✅ Ignore the Codacy warning entirely

---

### ❌ Pattern 2: "Unused Variable" for Dependency Injection

**Example:**
```javascript
class ImportController {
    static setProgressTracker(progressTracker) {
        // ❌ Codacy says: "progressTracker is unused"
        // ✅ Reality: It's stored for later use
        this.progressTracker = progressTracker;
    }
}
```

**Why Codacy is Wrong:** Codacy doesn't track class properties across methods. The variable IS used, just in different methods.

---

## ✅ Safe to Fix

These Codacy warnings are usually legitimate:

1. **Actual Typos**
   ```javascript
   const userName = "Alice";
   console.log(userNmae);  // ✅ Fix this - it's a real typo
   ```

2. **Truly Unused Imports**
   ```javascript
   const fs = require('fs');  // Never used in file
   const path = require('path');  // Never used in file
   // ✅ Safe to remove
   ```

3. **Formatting Issues**
   - Missing semicolons
   - Inconsistent quotes
   - Spacing issues
   - Indentation
   - ✅ All safe to auto-fix

4. **CSS/Markdown Issues**
   - ✅ Always safe to auto-fix
   - Cannot break application logic

---

## 🔥 Historical Warning: What Went Wrong

### Commit c2e4757 (September 18, 2025)
**Title:** "Major linting cleanup and codebase consolidation"

**What Happened:**
- Codacy flagged dependency injection variables as "undefined"
- Developer added underscores to silence warnings
- **Result:** Broke 12 core JavaScript files

**Damage:**
- Import pipeline completely destroyed
- VulnerabilityGridManager functionality broken
- ProgressTracker initialization failed
- CSV imports failed silently

### Commit 94db530 (September 18, 2025)
**Title:** "Revert linting damage and fix import pipeline"

**Required Actions:**
- Reverted 12 core JS files
- Fixed progressTracker initialization
- Re-added missing global utility functions
- Fixed progressTracker parameter passing
- Partial recovery (staging complete, lifecycle pending)

**Impact:** ~6 hours of emergency recovery work

---

## 🛡️ Verification Process

Before fixing any "undefined variable" warning:

### Step 1: Find the Variable Declaration
```bash
# Search for where the variable is actually defined
grep -r "progressTracker" app/
```

### Step 2: Check the Context

**Is it a function parameter?**
```javascript
function doSomething(db, progressTracker) {  // ✅ Parameter - ignore Codacy
    db.run(...);
}
```

**Is it from dependency injection?**
```javascript
class Controller {
    static initialize(db) {  // ✅ Injected - ignore Codacy
        this.db = db;
    }
}
```

**Is it from an event handler?**
```javascript
socket.on('event', (data) => {  // ✅ Event callback - ignore Codacy
    processData(data);
});
```

**Is it from Express middleware?**
```javascript
app.get('/api/data', (req, res) => {  // ✅ Express params - ignore Codacy
    res.json(data);
});
```

### Step 3: Apply the Right Fix

**If any of the above → Add ESLint comment:**
```javascript
function doSomething(db) {
    // eslint-disable-next-line no-undef
    db.run(query);
}
```

**If genuinely undefined → Actually fix it:**
```javascript
// Missing import
const db = require('./database');  // ✅ Real fix needed
```

---

## 🎯 Best Practices

### 1. Safe Auto-Fixes Only
Our pre-commit hook only auto-fixes:
- ✅ Markdown formatting (`lint:md:fix`)
- ✅ CSS formatting (`stylelint:fix`)

It will **warn** about JavaScript issues but **never auto-fix** them.

### 2. Manual JavaScript Review
Always review ESLint warnings manually:
```bash
npm run eslint
```

### 3. Codacy Review Process
When Codacy flags an issue:
1. Read the warning
2. Understand the context
3. Check this guide
4. If it matches a false positive pattern → ignore it
5. If it's legitimate → fix it manually

### 4. Team Communication
If you're unsure about a Codacy warning:
- Ask in Linear (HexTrackr-Dev team)
- Reference this guide
- Include file location and warning text

---

## 📚 Additional Resources

- **ESLint Configuration**: `eslint.config.mjs`
- **Pre-Commit Hook**: `.githooks/pre-commit`
- **Linting Scripts**: See `package.json` scripts section

---

## 🚀 Emergency Bypass

If you need to commit during an emergency without running hooks:
```bash
git commit --no-verify -m "emergency: description"
```

**Use sparingly** - only for production emergencies or critical hotfixes.

---

## 📝 Update History

- **2025-09-30**: Initial guidelines created based on c2e4757 incident
- **Version**: 1.0.0
- **Maintainer**: HexTrackr Dev Team