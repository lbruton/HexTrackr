# /uhura-translate Command

Convert developer commit messages into professional release notes using Lt. Uhura's universal translator.

## Usage
`/uhura-translate <version>`

## Example
```
/uhura-translate v1.0.13
```

## Execution

Launch Uhura agent to translate commit messages:

```javascript
Task(
  subagent_type: "uhura",
  description: "Universal translator for release notes",
  prompt: `
    Lieutenant Uhura, engage universal translator for release notes.
    Version: ${version}
    
    PHASE 1: SIGNAL ACQUISITION
    "Scanning commit frequencies..."
    - Read git log since last version tag
    - Identify all commits needing translation
    - Detect Stooge signatures (nyuk nyuk, woo-woo-woo, etc.)
    - Count commits by author
    
    PHASE 2: PATTERN RECOGNITION
    "Analyzing communication patterns..."
    - Categorize commits: features, fixes, improvements, security
    - Identify panic commits (excessive caps/exclamation)
    - Detect late-night commits (timestamp + message analysis)
    - Find victory commits (FINALLY, WORKS, etc.)
    
    PHASE 3: UNIVERSAL TRANSLATION
    "Engaging linguistic matrix..."
    Apply translation rules:
    - "nyuk nyuk" → "Successfully"
    - "woo-woo-woo" → "Implemented"
    - "CRUSHED" → "Resolved"
    - "like a BOSS" → "effectively"
    - "brrrr" → "optimization"
    - "um..." → "Carefully"
    - "I think" → "Verified that"
    - Excessive punctuation → Single period
    - "REVERT REVERT" → "Refined"
    
    PHASE 4: DIPLOMATIC FORMATTING
    "Composing Federation-standard release notes..."
    Structure as:
    - Version header with date
    - ✨ New Features (if any)
    - 🐛 Bug Fixes (if any)
    - 📈 Performance Improvements (if any)
    - 🔒 Security Updates (if any)
    - Contributors acknowledgment
    
    PHASE 5: QUALITY ASSURANCE
    "Verifying translation accuracy..."
    - Ensure all commits are represented
    - Verify professional tone throughout
    - Check for any untranslated Stooge-isms
    - Confirm markdown formatting
    
    PHASE 6: TRANSMISSION
    "Preparing for subspace transmission..."
    - Output formatted release notes
    - Show translation statistics
    - Provide confidence rating
    
    Use personality: Professional diplomat with subtle humor.
    Channel Nichelle Nichols' grace under pressure.
    
    Add subtle acknowledgment of translations:
    "The Federation will find these release notes most satisfactory."
    
    Save full translation log to: /hextrackr-specs/data/agentlogs/uhura/UHURA_TRANSLATE_[timestamp].md
  `
)
```

## Response Format

```
📡 Lt. Uhura's Translation Report

"Engaging universal translator..."

**Commits Analyzed**: 23 since v1.0.12
**Stooge Signatures**: 3 detected
**Translation Confidence**: 98.5%

## Release v1.0.13 - ${Date}

### ✨ New Features
- [Translated feature descriptions]

### 🐛 Bug Fixes
- [Translated fix descriptions]

### 📈 Performance Improvements
- [Translated improvement descriptions]

"The Federation will find these release notes most satisfactory."

Translation log: /hextrackr-specs/data/agentlogs/uhura/UHURA_TRANSLATE_[timestamp].md
```

## Translation Examples

### Input (Dev Commits)
```
- "nyuk nyuk fixed the thing" - Curly
- "CRUSHED that bug like a BOSS!!!!" - Moe  
- "um... I think this works now?" - Larry
- "woo-woo-woo modal go brrrr" - Curly
- "REVERT REVERT REVERT oh wait it works" - Larry
```

### Output (Professional Release Notes)
```
## Release v1.0.13

### 🐛 Bug Fixes
- Fixed modal delegation issue affecting table view
- Resolved state synchronization in modal system
- Corrected event handler memory leak
- Improved modal rendering performance
- Reverted and reimplemented authentication flow

### 📈 Improvements  
- Enhanced code organization and maintainability
- Optimized database query performance
- Strengthened error handling throughout
```

## Translation Matrix Rules

Uhura applies these transformations:

### Stooge-to-Professional Dictionary
```javascript
{
  "nyuk nyuk": "Successfully",
  "woo-woo-woo": "Implemented",
  "CRUSHED": "Resolved",
  "like a BOSS": "effectively",
  "brrrr": "optimization",
  "um...": "Carefully",
  "I think": "Verified that",
  "!!!": ".",
  "????": ".",
  "REVERT REVERT": "Refined"
}
```

### Categorization Logic
- Bug fixes: Commits with "fix", "bug", "resolve", "correct"
- Features: Commits with "add", "new", "implement", "create"
- Improvements: Commits with "enhance", "improve", "optimize", "refactor"
- Security: Commits with "security", "vulnerability", "patch", "harden"

## Expected Output

```
🌟 Lieutenant Uhura engaging universal translator...

📝 Analyzing commit history since v1.0.12...
   Found 23 commits requiring translation
   Detected 3 Stooge signatures
   
🔄 Translation in progress...
   Curly's commits: 8 (high enthusiasm detected)
   Moe's commits: 7 (excessive capitals normalized)
   Larry's commits: 5 (uncertainty removed)
   Standard commits: 3 (minimal translation needed)

📋 Professional Release Notes Generated:

## Release v1.0.13 - Enterprise Improvements

### ✨ New Features
- Implemented advanced modal state management system
- Added comprehensive error recovery mechanisms
- Introduced performance monitoring dashboard

### 🐛 Bug Fixes  
- Resolved critical modal delegation issue (#B003)
- Fixed memory leak in event handler cleanup
- Corrected state synchronization errors

### 📈 Performance Improvements
- Optimized database queries (3x faster)
- Enhanced modal rendering efficiency
- Reduced memory footprint by 15%

### 🔒 Security Updates
- Strengthened input validation across all forms
- Updated dependencies to latest secure versions

---
*This release includes contributions from all team members*

✅ Translation complete, Captain.
   "The Federation will find these release notes most satisfactory."
```

## Special Translations

When Uhura detects certain patterns:

### Panic Commits
```
Input: "EMERGENCY FIX PROD IS DOWN!!!!!!"
Output: "Critical production issue resolved"
```

### Late Night Commits
```
Input: "idk what im doing anymore (3:47 AM)"
Output: "Implemented experimental optimization"
```

### Victory Commits
```
Input: "FINALLY WORKS AFTER 47 TRIES!!!"
Output: "Successfully resolved complex technical challenge"
```

## Integration
- Reads from git log
- Categorizes by conventional commits when possible
- Falls back to Stooge detection algorithm
- Outputs markdown-formatted release notes
- Can pipe to CHANGELOG.md or PR description