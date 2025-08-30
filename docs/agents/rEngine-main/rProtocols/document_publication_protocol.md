# 📋 Document Publication Protocol

**Protocol ID**: DOC-PUB-001  
**Version**: 1.0.0  
**Created**: August 19, 2025  
**Purpose**: Automated distribution of rEngine platform documentation to individual project directories

## 🎯 Overview

This protocol handles the systematic distribution of generated HTML documentation from the central `rDocuments/html/` directory to individual project `docs/html/` directories within the `rProjects/` ecosystem.

## 📂 Source & Target Structure

### Source Directory

```text
rDocuments/html/
├── developmentstatus.html          # Main platform dashboard
├── documentation.html              # Documentation portal
├── MASTER_ROADMAP.html            # Comprehensive roadmap
├── agent-self-management.html      # Agent system docs
├── enhanced-scribe-system.html     # NEW: Unified document processing system
├── document-scribe-api.html        # NEW: API documentation for document-scribe
├── ~~document-generator.html~~     # DEPRECATED: Use document-scribe instead
├── memory-intelligence.html        # Memory & MCP integration
├── ~~enhanced-document-generator.html~~ # DEPRECATED: Use document-scribe instead
└── documents.json                  # Navigation index
```

### Target Directories

```
rProjects/
├── StackTrackr/docs/html/          # StackTrackr project documentation
├── VulnTrackr/docs/html/           # VulnTrackr project documentation
└── [Future Projects]/docs/html/    # Additional projects as needed
```

## 🔄 Publication Process

### Phase 1: Discovery

1. **Scan Projects**: Automatically discover all projects in `rProjects/`
2. **Validate Structure**: Ensure each project has a `docs/html/` directory
3. **Create Missing Directories**: Auto-create `docs/html/` if not present

### Phase 2: Content Distribution

1. **Core Platform Docs**: Copy all platform-level documentation to each project
2. **Project-Specific Filtering**: Optionally filter content based on project relevance
3. **Navigation Updates**: Update relative paths for project-local access

### Phase 3: Index Generation

1. **Local Navigation**: Generate project-specific `documents.json` index
2. **Cross-Project Links**: Maintain links back to main platform documentation
3. **Version Tracking**: Track publication timestamps and versions

## 🛠 Implementation Components

### 1. Publication Script

**File**: `rEngine/publish-docs.js`

- Automated discovery of projects and documentation
- Intelligent copying with path resolution
- Error handling and rollback capabilities

### 2. Project Registration

**File**: `rProtocols/project-registry.json`

- Centralized registry of all rProjects
- Project-specific documentation requirements
- Publication preferences and filters

### 3. Template Adaptation

- Modify navigation paths for local project access
- Update header branding for project-specific context
- Maintain consistent styling across all projects

## 📋 Publication Rules

### Core Documentation (Always Published)

- ✅ `developmentstatus.html` - Platform status dashboard
- ✅ `documentation.html` - Documentation portal
- ✅ `MASTER_ROADMAP.html` - Comprehensive roadmap
- ✅ `documents.json` - Navigation index

### System Documentation (Selective)

- 🔍 `agent-self-management.html` - Relevant if project uses agents
- 🔍 `document-generator.html` - Relevant if project generates docs
- 🔍 `memory-intelligence.html` - Relevant if project uses rMemory
- 🔍 `enhanced-document-generator.html` - Advanced features only

### Project-Specific Adaptations

- **Path Resolution**: Update all relative paths to work from project context
- **Branding**: Add project-specific headers and navigation
- **Cross-Links**: Maintain links back to main platform documentation

## 🚀 Automation Triggers

### Manual Publication

```bash

# Publish to all projects

npm run docs:publish

# Publish to specific project

npm run docs:publish --project=StackTrackr
```

### Automatic Publication

- **Post-Generation**: Triggered after HTML documentation generation
- **Git Hooks**: Triggered on documentation commits
- **Scheduled**: Daily publication for consistency

## 📊 Quality Assurance

### Validation Checks

1. **Link Integrity**: Verify all internal links work in project context
2. **Asset Availability**: Ensure CSS/JS/images are accessible
3. **Navigation Consistency**: Confirm navigation works from project directories
4. **Version Sync**: Verify all projects have latest documentation versions

### Error Handling

- **Rollback Capability**: Restore previous documentation on publication failure
- **Partial Failure Recovery**: Continue publication to other projects on single failure
- **Conflict Resolution**: Handle concurrent publication attempts

## 🔐 Security & Permissions

### Access Control

- Publication script requires write access to `rProjects/*/docs/html/`
- Automated backups before publication
- Git integration for change tracking

### Content Filtering

- Option to exclude sensitive platform documentation from specific projects
- Project-specific content inclusion/exclusion rules
- Maintenance of project independence while sharing core documentation

## 📈 Success Metrics

### Performance Indicators

- **Publication Speed**: Time to publish to all projects
- **Link Integrity**: Percentage of working links in project contexts
- **Content Freshness**: Time delta between generation and publication
- **Error Rate**: Failed publications per total attempts

### Monitoring

- Publication logs in `rEngine/logs/doc-publication.log`
- Success/failure notifications
- Regular validation of published documentation

## 🔄 Maintenance Protocol

### Regular Tasks

1. **Weekly**: Validate all project documentation links
2. **Monthly**: Review project registry for new additions
3. **Quarterly**: Audit publication process efficiency

### Version Updates

- Update this protocol when new documentation types are added
- Modify publication rules when new projects are added
- Enhance automation based on usage patterns

## 📚 Related Protocols

- **Document Generation Protocol** - Source content creation
- **HTML Template System** - Styling and layout consistency
- **Project Organization Protocol** - rProjects structure management
- **Git Integration Protocol** - Version control and change tracking

---

**Status**: Ready for Implementation  
**Next Steps**: Create `rEngine/publish-docs.js` script and `rProtocols/project-registry.json`  
**Owner**: rEngine Documentation System  
**Dependencies**: HTML documentation generation pipeline
