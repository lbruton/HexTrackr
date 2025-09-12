# HexTrackr Security Guide

## NPM Security Configuration

### Current Security Measures

#### 1. **Package Cleanup (Completed)**

- ✅ Removed 22 extraneous packages (43% reduction)
- ✅ Eliminated @colors/colors (protest-ware risk)
- ✅ Removed faker v6.6.6 (deprecated/risky version)
- ✅ No more undeclared dependencies

#### 2. **Lockfile Security (lockfile-lint)**

- ✅ Validates package-lock.json integrity
- ✅ Enforces HTTPS-only package sources
- ✅ Prevents lockfile injection attacks
- **Command**: `npm run lockfile:check`

#### 3. **Install Script Protection (.npmrc)**

- ✅ `ignore-scripts=true` prevents malicious install scripts
- ✅ 94% of malicious packages use install scripts
- **Override when needed**: Use `--ignore-scripts=false` flag

#### 4. **Security Audit Scripts**

- `npm run audit` - Check for vulnerabilities
- `npm run security:check` - Full audit + extraneous package check
- `npm run security:full` - Lockfile validation + security check
- `npm run install:safe` - Install with scripts disabled
- `npm run ci:safe` - CI install with scripts disabled

### Advanced Security Tools (Recommendations)

#### **Option 1: Socket CLI (Recommended for Teams)**

**Best malware protection available**

```bash
# Install Socket CLI
npm install -g @socket.security/cli

# Replace npm commands
socket install    # Instead of npm install
socket npm audit  # Enhanced audit
```

**Features:**

- 🔥 Blocks malware BEFORE installation
- 🔍 Detects 70+ security signals
- 🛡️ Prevents install script execution
- 📊 Identifies typosquatting attacks
- ⚡ Real-time protection

**Cost:** Paid subscription, worth it for production systems

#### **Option 2: Aikido SafeChain (Free Open Source)**

**Community-driven security wrapper**

```bash
# Install globally
npm install -g @aikidosec/safechain

# Use instead of npm
safechain install
safechain add package-name
```

**Features:**

- 🆓 Free and open source
- 🔍 Threat intelligence checks
- 🛡️ Install script blocking
- 🔄 Works with npm, yarn, pnpm

#### **Option 3: Snyk CLI (Enterprise)**

**Comprehensive vulnerability management**

```bash
# Install globally
npm install -g snyk

# Test for vulnerabilities
snyk test
snyk monitor  # Continuous monitoring
```

**Features:**

- 🏢 Enterprise-grade reporting
- 📊 License compliance
- 🔄 CI/CD integration
- 💰 Freemium model

### CI/CD Security Integration

#### **GitHub Actions Example**

```yaml
- name: Security Check
  run: |
    npm ci --ignore-scripts
    npm run security:full
    npm audit --audit-level moderate
```

#### **Pre-commit Hook**

```bash
#!/bin/sh
npm run lockfile:check
npm run security:check
```

### Security Best Practices

#### **Do's:**

- ✅ Use `npm ci` in CI/CD (not `npm install`)
- ✅ Run security checks before each release
- ✅ Review package-lock.json changes carefully
- ✅ Keep dependencies updated
- ✅ Use official npm registry only

#### **Don'ts:**

- ❌ Don't install packages globally unless necessary
- ❌ Don't ignore lockfile changes in PRs
- ❌ Don't run `npx` commands from untrusted sources
- ❌ Don't disable security checks in production

### Recent Threat Intelligence (2024-2025)

#### **Major Incidents:**

- 20 packages with 2B weekly downloads compromised via phishing
- 200+ malicious packages removed monthly from npm
- Crypto-stealing malware in popular packages (debug, chalk)

#### **Attack Vectors:**

- 📧 Maintainer phishing → Account takeover
- 🎯 Typosquatting (webb3 instead of web3)
- 📦 Install script malware execution
- 🔗 Lockfile injection attacks

### Emergency Response

#### **If Malware Detected:**

1. **Immediately stop all npm installs**
2. **Run**: `npm run security:full`
3. **Check**: Recent package-lock.json changes
4. **Remove**: Any suspicious packages
5. **Report**: To npm security team

#### **Recovery Steps:**

```bash
# Clean slate
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstall safely
npm run ci:safe
npm run security:full
```

### Monitoring & Maintenance

#### **Monthly Tasks:**

- [ ] Run `npm outdated` and update dependencies
- [ ] Check for new security advisories
- [ ] Review `.npmrc` configuration
- [ ] Audit lockfile changes

#### **Before Each Release:**

- [ ] `npm run security:full`
- [ ] `npm audit --audit-level high`
- [ ] Review recent dependency changes

---

**Last Updated:** 2025-09-12  
**Security Level:** 🔒 High (lockfile protection + install script blocking)  
**Recommended Upgrade:** Socket CLI for maximum protection
