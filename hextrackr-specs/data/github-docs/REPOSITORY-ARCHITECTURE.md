# HexTrackr GitHub Repository Architecture

## Overview

HexTrackr uses a two-repository strategy to separate development tools from production code while maintaining enterprise-grade quality control through Codacy scanning at multiple checkpoints.

**Last Updated**: January 10, 2025  
**Version**: 1.0.12  
**Architecture Type**: Split Repository with Quality Gates

---

## 🏗️ Repository Structure

### HexTrackr-Dev (Private)
- **URL**: https://github.com/Lonnie-Bruton/HexTrackr-Dev
- **Type**: Private
- **Branch**: `copilot` (primary development)
- **Purpose**: Full development environment with all tools, specs, and agents
- **Contents**:
  - Complete source code (`app/`)
  - Development specifications (`hextrackr-specs/`)
  - Agent ecosystem (`.claude/`)
  - Test suites (`__tests__/`)
  - Docker configuration
  - All development tools and scripts

### HexTrackr (Public)
- **URL**: https://github.com/Lonnie-Bruton/HexTrackr
- **Type**: Public
- **Branch**: `main` (production releases only)
- **Purpose**: Clean production code for public visibility and Codacy scanning
- **Contents**:
  - Production source code (`app/`)
  - Docker configuration
  - Package files
  - CI/CD workflows (`.github/`)
  - Codacy configuration (`.codacy/`)
  - README and LICENSE

---

## 📊 Quality Control Pipeline

### Triple-Scan Architecture

```
Development → Scan 1 → Release → Scan 2 → PR → Scan 3 → Production
     ↓           ↓         ↓        ↓       ↓      ↓         ↓
  HexTrackr-Dev  ↓    Release.sh   ↓    GitHub   ↓     Main Branch
              Codacy           Codacy PR    Codacy Final
```

### Scan Points

1. **Development Scan** (HexTrackr-Dev)
   - Continuous scanning during development
   - Catches issues early in `copilot` branch
   - Full tool suite with paid Codacy tier

2. **Release Scan** (HexTrackr PR)
   - Triggered when creating release PR
   - Validates release candidate
   - Ensures no regressions

3. **Production Scan** (HexTrackr main)
   - Final validation after PR merge
   - Public quality badge update
   - Permanent quality record

---

## 🔧 Configuration Synchronization

### Codacy Configuration Files

All three files must be identical between repositories:

1. **`.codacy/codacy.yaml`**
   - Main configuration file
   - Tool definitions and versions
   - Exclude paths
   - Runtime specifications

2. **`.codacyrc`**
   - ESLint specific settings
   - Global definitions
   - Ignore patterns

3. **`.codacyignore`**
   - Additional exclusion patterns
   - Supplements codacy.yaml excludes

### Configuration Location
```
Both Repositories:
├── .codacy/
│   ├── codacy.yaml
│   └── tools-configs/
│       ├── eslint.config.mjs
│       ├── ruleset.xml (PMD)
│       ├── semgrep.yaml
│       └── trivy.yaml
├── .codacyrc
└── .codacyignore
```

### Synchronization Method
- Configurations are copied during release process
- `release-to-public.sh` maintains parity
- Manual verification through Uhura's preflight checks

---

## 🚀 Release Workflow

### Step 1: Development Complete
```bash
# In HexTrackr-Dev
git checkout copilot
git add -A
git commit -m "feat: new feature"
git push origin copilot
```

### Step 2: Prepare Release
```bash
# Merge to main in dev repo (optional)
git checkout main
git merge copilot
git push origin main
```

### Step 3: Execute Release
```bash
# Run release script
./release-to-public.sh v1.0.13

# Or use Uhura
./hextrackr-specs/agents/uhura/uhura.js sync v1.0.13
```

### Step 4: Create Pull Request
The script automatically:
- Syncs files to public repo
- Creates version tag
- Generates release notes
- Creates GitHub Release
- Opens PR for final review

### Step 5: Merge After Approval
- Codacy scans the PR
- CodeQL runs security analysis
- Manual review if needed
- Merge to main

---

## 🛡️ Branch Protection Rules

### HexTrackr (Public) - main branch

Required Status Checks:
- ✅ Codacy Static Code Analysis
- ✅ Code scanning results / CodeQL
- ✅ Codacy Security Scan

Settings:
- Require pull request reviews: Optional
- Dismiss stale reviews: Yes
- Require status checks to pass: Yes
- Require branches to be up to date: Yes
- Include administrators: No

---

## 📡 GitHub Integrations

### Codacy
- **Plan**: Paid tier (as of Jan 2025)
- **Tools Enabled**:
  - ESLint 9.34.0
  - PMD 6.55.0
  - Semgrep 1.78.0
  - Trivy 0.65.0
  - Lizard 1.17.31
- **Webhook**: Active on both repositories
- **Badge**: Displayed on public README

### GitHub Actions

#### HexTrackr (Public)
- **CodeQL**: JavaScript security scanning
- **Codacy**: Automated PR scanning

#### Workflows Disabled
- `claude-code-review.yml.disabled` (not needed for direct releases)

### GitHub Releases
- Created for each version
- Includes downloadable archives
- Professional release notes
- Permanent URLs for changelog linking

---

## 👥 Agent Responsibilities

### Lieutenant Uhura - Communications Officer
- **Role**: Repository synchronization
- **Tools**: GitHub MCP, release scripts
- **Responsibilities**:
  - Pre-flight checks
  - Repository synchronization
  - Commit message translation
  - PR creation with diplomatic language
  - Release announcements

### Integration with Pipeline
```
Development → Verification → Compliance → Version → Sync → Documentation
     ↓            ↓             ↓           ↓        ↓          ↓
  Stooges →    Merlin →      SPECS →     Atlas → Uhura →     Doc
```

---

## 🔑 Access Tokens

### GitHub Personal Access Token
- **Type**: Classic PAT
- **Expiration**: 1 year (expires Jan 2026)
- **Scopes**:
  - `repo` - Full repository access
  - `workflow` - GitHub Actions management
- **Used By**:
  - GitHub MCP server in Claude
  - Lieutenant Uhura for releases
  - GitHub CLI operations

### Token Storage
- Claude config: `~/Library/Application Support/Claude/claude_desktop_config.json`
- GitHub MCP server environment variable

---

## 📈 Metrics and Monitoring

### Quality Metrics
- **Target Grade**: A or better
- **Acceptable Issues**: <10
- **Complexity**: <10%
- **Duplication**: <5%
- **Coverage**: >75%

### Monitoring Points
1. Codacy Dashboard: https://app.codacy.com
2. GitHub Insights: Repository insights tab
3. GitHub Actions: Workflow runs
4. Release History: GitHub releases page

---

## 🔄 Maintenance Tasks

### Regular Tasks
- [ ] Weekly: Check for configuration drift
- [ ] Monthly: Review and update dependencies
- [ ] Quarterly: Audit access tokens
- [ ] Annually: Renew GitHub PAT

### Configuration Updates
When updating Codacy configuration:
1. Update in HexTrackr-Dev first
2. Test with local scans
3. Copy to HexTrackr during next release
4. Verify both repos scan correctly

---

## 📝 Quick Reference

### Commands
```bash
# Check repo status
/uhura-preflight

# Sync repositories
./release-to-public.sh v1.0.13

# Create release with Uhura
/uhura-sync v1.0.13

# Translate commits
/uhura-translate v1.0.13
```

### Important URLs
- Dev Repo: https://github.com/Lonnie-Bruton/HexTrackr-Dev
- Public Repo: https://github.com/Lonnie-Bruton/HexTrackr
- Codacy Dashboard: https://app.codacy.com
- GitHub Tokens: https://github.com/settings/tokens
- Branch Protection: https://github.com/Lonnie-Bruton/HexTrackr/settings/branches

---

## 🚨 Troubleshooting

### Common Issues

1. **Codacy showing thousands of issues**
   - Check for `.codacy.yaml` in root (should not exist)
   - Verify `.codacy/codacy.yaml` is being read
   - Ensure configuration matches dev repo

2. **PR failing checks**
   - Verify Codacy webhook is active
   - Check CodeQL workflow status
   - Ensure branch is up to date with main

3. **Release script fails**
   - Check for uncommitted changes
   - Verify both repos are accessible
   - Ensure GitHub token is valid

4. **Configuration drift**
   - Run Uhura preflight check
   - Compare checksums of config files
   - Re-sync from dev to public

---

*This document is maintained in the development repository and should be updated whenever the GitHub architecture changes.*