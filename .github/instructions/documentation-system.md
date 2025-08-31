# Documentation System

## HexTrackr Documentation Architecture

HexTrackr uses a dual-format documentation system with markdown source files and generated HTML output.

## Documentation Structure

### Source Documentation (`docs-source/`)

- **Format**: Markdown files for easy editing and version control
- **Organization**: Structured hierarchy by topic and audience
- **Version Control**: Full git history for all documentation changes
- **Collaboration**: Easy editing and review process

### Generated Documentation (`docs-html/`)

- **Format**: HTML files for web presentation
- **Generator**: Custom HTML content updater
- **Styling**: Tabler CSS framework for consistent appearance
- **Interactivity**: JavaScript enhancements for navigation

## Directory Structure

### Source Organization

```text
docs-source/
├── index.md                    # Main documentation homepage
├── api-reference/              # API documentation
│   ├── index.md
│   ├── backup-api.md
│   ├── tickets-api.md
│   └── vulnerabilities-api.md
├── architecture/               # Technical architecture docs
│   ├── index.md
│   ├── backend.md
│   ├── database.md
│   ├── deployment.md
│   ├── frameworks.md
│   └── frontend.md
├── development/                # Developer guides
│   ├── index.md
│   ├── coding-standards.md
│   ├── contributing.md
│   ├── development-setup.md
│   ├── docs-portal-guide.md
│   └── pre-commit-hooks.md
├── getting-started/            # User onboarding
│   ├── index.md
│   └── installation.md
├── project-management/         # Project governance
│   ├── index.md
│   ├── codacy-compliance.md
│   ├── quality-badges.md
│   ├── roadmap-to-sprint-system.md
│   └── strategic-roadmap.md
├── security/                   # Security documentation
│   ├── index.md
│   ├── overview.md
│   └── vulnerability-disclosure.md
└── user-guides/               # End-user documentation
    ├── index.md
    ├── ticket-management.md
    └── vulnerability-management.md
```

### Generated Structure

```text
docs-html/
├── index.html                 # Generated homepage
├── template.html              # HTML template
├── html-content-updater.js    # Generation script
├── content/                   # Generated HTML content
│   ├── CHANGELOG.html
│   ├── ROADMAP.html
│   └── [all generated pages]
├── css/                       # Styling
│   └── docs-tabler.css
└── js/                        # JavaScript
    └── docs-portal-v2.js
```

## Documentation Generation Process

### Update Command

```bash
node docs-html/html-content-updater.js
```

### Generation Workflow

1. **Read Source**: Parse markdown files from `docs-source/`
2. **Convert**: Transform markdown to HTML
3. **Template**: Apply consistent HTML template
4. **Style**: Include Tabler CSS framework
5. **Output**: Generate files in `docs-html/content/`
6. **Report**: Create update report with changes

### Automated Updates

- **When**: After significant documentation changes
- **Trigger**: Manual execution or CI/CD integration
- **Validation**: Check for broken links and formatting
- **Deployment**: Sync generated files to web server

## Content Management

### Writing Standards

- **Format**: GitHub Flavored Markdown
- **Headers**: Hierarchical structure (H1 → H6)
- **Links**: Relative links for internal references
- **Code Blocks**: Language-specific syntax highlighting
- **Images**: Relative paths to image assets

### Content Types

- **Tutorials**: Step-by-step guides with examples
- **Reference**: API documentation and technical specs
- **Concepts**: Architecture and design explanations
- **Procedures**: Standard operating procedures

## Maintenance Workflow

### Regular Updates

1. **Edit Source**: Modify markdown files in `docs-source/`
2. **Review Changes**: Validate content and formatting
3. **Generate HTML**: Run update script
4. **Test Output**: Verify generated HTML pages
5. **Commit Changes**: Include both source and generated files

### Quality Assurance

- **Link Validation**: Check internal and external links
- **Format Consistency**: Ensure consistent markdown formatting
- **Content Accuracy**: Verify technical accuracy
- **User Testing**: Validate usability and clarity

## Integration Points

### Version Control

- **Source Control**: Full git history for markdown files
- **Generated Files**: Include in repository for deployment
- **Change Tracking**: Document significant content changes
- **Branch Strategy**: Use feature branches for major updates

### Development Workflow

- **API Changes**: Update API reference documentation
- **Feature Additions**: Document new functionality
- **Architecture Changes**: Update technical documentation
- **Bug Fixes**: Update troubleshooting guides

## Publishing and Deployment

### Local Development

- **Preview**: Serve HTML files locally for review
- **Testing**: Validate links and formatting
- **Iteration**: Quick edit-test cycles

### Production Deployment

- **Hosting**: Static file hosting or web server
- **CDN**: Content delivery for performance
- **SSL**: Secure connection for documentation site
- **Analytics**: Track documentation usage

## Documentation Standards

### Style Guide

- **Tone**: Professional but accessible
- **Structure**: Clear headings and sections
- **Examples**: Include code examples and screenshots
- **Cross-References**: Link related content

### Technical Requirements

- **Accuracy**: Keep technical content current
- **Completeness**: Cover all major features
- **Searchability**: Use descriptive headings and keywords
- **Accessibility**: Follow web accessibility guidelines
