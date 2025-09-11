# HexTrackr GitHub Quick Reference

## 🚀 Daily Workflow Commands

### Development
```bash
# Start work
cd /Volumes/DATA/GitHub/HexTrackr
git checkout copilot
git pull origin copilot

# Make changes and commit
git add -A
git commit -m "feat: something awesome"
git push origin copilot
```

### Release
```bash
# Check if ready
./hextrackr-specs/agents/uhura/uhura.js preflight

# Create release
./release-to-public.sh v1.0.13

# Or use Uhura
/uhura-sync v1.0.13
```

---

## 📁 Repository Locations

| Repository | Path | GitHub URL |
|------------|------|------------|
| Dev (Private) | `/Volumes/DATA/GitHub/HexTrackr` | https://github.com/Lonnie-Bruton/HexTrackr-Dev |
| Public | `/Volumes/DATA/GitHub/HexTrackr-Public` | https://github.com/Lonnie-Bruton/HexTrackr |

---

## 🔧 Configuration Files

### Must Stay in Sync
```
.codacy/codacy.yaml
.codacyrc
.codacyignore
```

### Check Sync Status
```bash
# Use Uhura
./hextrackr-specs/agents/uhura/uhura.js preflight

# Or manual check
diff /Volumes/DATA/GitHub/HexTrackr/.codacy/codacy.yaml \
     /Volumes/DATA/GitHub/HexTrackr-Public/.codacy/codacy.yaml
```

---

## 👥 Agent Commands

### The Stooges
```bash
/stooges "analyze this code"
```

### Merlin
```bash
/merlin-audit
/merlin-prophecy
```

### SPECS
```bash
/specs-validate
/specs-enforce
```

### Atlas
```bash
/atlas-bump-version v1.0.13
/atlas-list-versions
```

### Uhura
```bash
/uhura-preflight
/uhura-sync v1.0.13
/uhura-translate v1.0.13
```

### Doc
```bash
/generatedocs
```

---

## 📊 Codacy Status

### Dashboard
https://app.codacy.com

### Target Metrics
- Grade: **A** or better
- Issues: **<10**
- Complexity: **<10%**
- Duplication: **<5%**

### Current Status (v1.0.12)
- Grade: **A+**
- Issues: **5**
- Complexity: **7%**
- Duplication: **4%**

---

## 🚨 Troubleshooting

### Issue: Codacy shows 1000+ issues
```bash
# Check for root .codacy.yaml (should not exist)
ls -la /Volumes/DATA/GitHub/HexTrackr-Public/.codacy.yaml

# Should only have folder config
ls -la /Volumes/DATA/GitHub/HexTrackr-Public/.codacy/
```

### Issue: PR failing checks
```bash
# Check webhook
# Go to: https://github.com/Lonnie-Bruton/HexTrackr/settings/hooks
# Click Codacy webhook → Recent Deliveries → Redeliver
```

### Issue: Release script fails
```bash
# Check for uncommitted changes
git status

# Check both repos accessible
ls -la /Volumes/DATA/GitHub/HexTrackr
ls -la /Volumes/DATA/GitHub/HexTrackr-Public
```

---

## 🔑 Important URLs

| Service | URL |
|---------|-----|
| Dev Repo | https://github.com/Lonnie-Bruton/HexTrackr-Dev |
| Public Repo | https://github.com/Lonnie-Bruton/HexTrackr |
| Codacy Dashboard | https://app.codacy.com |
| GitHub Tokens | https://github.com/settings/tokens |
| Branch Protection | https://github.com/Lonnie-Bruton/HexTrackr/settings/branches |
| Webhooks | https://github.com/Lonnie-Bruton/HexTrackr/settings/hooks |
| PR #3 (Config Fix) | https://github.com/Lonnie-Bruton/HexTrackr/pull/3 |
| Release v1.0.12 | https://github.com/Lonnie-Bruton/HexTrackr/releases/tag/v1.0.12 |

---

## 📝 Commit Message Format

### Development (Casual OK)
```bash
git commit -m "fixed the thing"
git commit -m "woo-woo-woo modal works!"
```

### Release (Uhura Translates)
```markdown
## Release v1.0.13

### ✨ New Features
- Implemented modal state management
- Added error recovery mechanisms

### 🐛 Bug Fixes
- Resolved modal delegation issue
- Fixed memory leaks
```

---

## 🎯 Release Checklist

- [ ] All tests passing
- [ ] Codacy grade A or better
- [ ] No uncommitted changes
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Configs synchronized
- [ ] Run preflight check
- [ ] Execute release script
- [ ] Verify PR created
- [ ] Check Codacy scan
- [ ] Merge when green

---

## 📡 MCP Servers

### Current Configuration
- **Memento**: Memory and knowledge management
- **Zen**: AI analysis and code review
- **Codacy**: Code quality scanning
- **GitHub**: Repository management (NEW!)

### GitHub Token
- **Type**: Personal Access Token (Classic)
- **Expires**: January 2026
- **Scopes**: repo, workflow

---

## 🌟 Lieutenant Uhura's Status

### Capabilities
✅ Pre-flight checks  
✅ Repository synchronization  
✅ Commit translation  
✅ PR creation  
✅ GitHub MCP integration  

### Quick Test
```bash
# Check if Uhura is operational
./hextrackr-specs/agents/uhura/uhura.js preflight
```

---

*"Hailing frequencies are open, Captain!"* - Lt. Uhura