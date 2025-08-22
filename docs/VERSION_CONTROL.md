# HexTrackr Version Control Standard

## Current Version: **2.3.0**

*Note: The original "6.66" was a playful hex reference, but we use professional semantic versioning for enterprise deployment.*

---

## 📋 Semantic Versioning Standard

HexTrackr follows **Semantic Versioning 2.0.0** (semver.org):

```
MAJOR.MINOR.PATCH
```

### Version Components

- **MAJOR** (2.x.x): Breaking changes, API incompatibilities
- **MINOR** (x.3.x): New features, backward compatible
- **PATCH** (x.x.0): Bug fixes, security patches

---

## 🏷️ Version History

### v2.3.0 - Current Production (August 21, 2025)
- ✅ Optimized SQLite bulk insert performance
- ✅ Enhanced VPR change tracking system  
- ✅ Fixed Tools & Settings modal functionality
- ✅ Improved UI layout and button positioning
- ✅ Added comprehensive API security documentation

### v2.2.x - Previous Stable
- CSV processing optimization
- Database schema improvements
- Basic API integration framework

### v2.1.x - Foundation Release
- Core vulnerability dashboard functionality
- Local SQLite storage implementation
- Basic CSV import capabilities

---

## 🚀 Release Planning

### v2.4.0 - Next Minor Release (Target: September 2025)
**Focus: API Integrations & Security**
- [ ] Cisco PSIRT API integration (active testing)
- [ ] Tenable VPR API implementation
- [ ] Enhanced security documentation
- [ ] API rate limiting and error handling

### v2.5.0 - Planned Features
**Focus: Enterprise Features**
- [ ] SolarWinds Orion API integration
- [ ] Advanced filtering and search
- [ ] Export/reporting functionality
- [ ] Multi-user support preparation

### v3.0.0 - Major Release (Target: Q1 2026)
**Focus: Enterprise Scale & Cloud**
- [ ] Breaking changes: New database schema
- [ ] Cloud storage integration (Turso, AWS RDS)
- [ ] Multi-tenant architecture
- [ ] Advanced analytics and ML insights

---

## 🔧 Development Workflow

### Branch Strategy
```
main (production-ready)
├── develop (integration branch)
├── feature/api-integrations
├── feature/ui-improvements
└── hotfix/security-patches
```

### Version Bumping Rules

#### Patch Release (x.x.+1)
- Bug fixes
- Security patches
- Documentation updates
- UI polish (no new features)

#### Minor Release (x.+1.0)
- New API integrations
- New dashboard features
- New export capabilities
- Backward-compatible changes

#### Major Release (+1.0.0)
- Database schema changes
- API breaking changes
- Architecture overhauls
- New authentication systems

---

## 📦 Release Process

### Pre-Release Checklist
- [ ] All tests passing
- [ ] Security documentation updated
- [ ] API endpoints tested
- [ ] Performance benchmarks met
- [ ] Browser compatibility verified

### Release Artifacts
- [ ] Version tag in Git (`v2.3.0`)
- [ ] Release notes with changelog
- [ ] Security assessment update
- [ ] Deployment documentation

### Post-Release
- [ ] Monitor error logs
- [ ] Verify API functionality
- [ ] Update documentation
- [ ] Notify stakeholders

---

## 🏷️ Tagging Convention

### Git Tags
```bash
v2.3.0          # Production release
v2.3.0-rc.1     # Release candidate
v2.3.0-beta.1   # Beta version
v2.3.0-alpha.1  # Alpha version
```

### Docker Tags
```bash
hextrackr:2.3.0         # Stable release
hextrackr:2.3.0-slim    # Minimal build
hextrackr:latest        # Latest stable
hextrackr:dev           # Development build
```

---

## 🔄 Hotfix Process

### Critical Security Issues
1. Create hotfix branch from main
2. Apply minimal fix
3. Bump patch version
4. Emergency deployment
5. Immediate security assessment

### Version Example
```
v2.3.0 → v2.3.1 (security hotfix)
v2.3.1 → v2.3.2 (critical bug fix)
```

---

## 📊 Version Metrics

### Release Frequency
- **Patch releases**: As needed (security, critical bugs)
- **Minor releases**: Monthly or bi-monthly
- **Major releases**: Annually or as needed for breaking changes

### Compatibility Promise
- **Patch**: 100% backward compatible
- **Minor**: 100% backward compatible
- **Major**: Migration guide provided

---

## 🔗 References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Git Flow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Release Management Best Practices](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

*Version control is critical for enterprise deployment. This standard ensures predictable, safe updates for production environments.*
