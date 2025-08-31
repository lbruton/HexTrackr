# Codacy Compliance Standards

## Code Quality Requirements

HexTrackr maintains strict code quality standards enforced through Codacy analysis.

## Quality Thresholds

### Issue Limits

- **Maximum Total Issues**: <50 issues project-wide
- **Critical Issues**: Zero tolerance
- **High Issues**: Zero tolerance  
- **Medium Issues**: Monitor and address in next sprint
- **Low Issues**: Address during maintenance cycles

### Security Requirements

- **Critical Vulnerabilities**: Zero tolerance - immediate fix required
- **High Vulnerabilities**: Zero tolerance - fix within 24 hours
- **Medium Vulnerabilities**: Fix within current sprint
- **Low Vulnerabilities**: Address in next release cycle

## Mandatory Analysis Workflow

### After Every File Edit

**CRITICAL**: Immediately run Codacy analysis after any file modification:

```bash

# Required after each file edit

codacy_cli_analyze --rootPath=/path/to/project --file=path/to/edited/file
```

### After Dependencies Changes

**SECURITY CRITICAL**: Run Trivy security scan after package updates:

```bash

# Required after npm/yarn/pnpm install or package.json changes

codacy_cli_analyze --rootPath=/path/to/project --tool=trivy
```

### Analysis Parameters

- **provider**: gh
- **organization**: Lonnie-Bruton  
- **repository**: HexTrackr
- **rootPath**: Always use standard file system path (non-URL-encoded)

## Issue Resolution Priority

### Security Issues (Immediate)

1. **Critical/High**: Stop all work, fix immediately
2. **Medium**: Fix within current sprint
3. **Low**: Schedule for next release

### Code Quality Issues (Scheduled)

1. **PMD Global Variables**: Systematic cleanup completed (89→8 warnings)
2. **ESLint Issues**: Address during development
3. **Complexity Issues**: Refactor during feature work
4. **Duplication**: Address during maintenance

## Codacy Tool Configuration

### Available Tools

- **PMD**: Java/JavaScript code analysis
- **ESLint**: JavaScript linting
- **Trivy**: Security vulnerability scanning
- **Pylint**: Python code analysis (if applicable)
- **DartAnalyzer**: Dart code analysis (if applicable)

### Tool-Specific Usage

```bash

# Security scanning (required after dependency changes)

codacy_cli_analyze --tool=trivy

# Code quality (default - all tools)

codacy_cli_analyze

# Specific tool analysis

codacy_cli_analyze --tool=eslint
```

## Repository Setup

### Initial Setup

If repository returns 404 error:

1. Offer to run `codacy_setup_repository`
2. Only proceed with user consent
3. Retry failed operation once after setup

### Configuration Requirements

- Repository must be added to Codacy organization
- Analysis tools must be enabled
- Quality gates must be configured

## Compliance Monitoring

### Quality Metrics Tracking

- **Grade**: Maintain A or B grade
- **Issues**: Track issue count trends
- **Duplication**: Monitor code duplication percentage
- **Complexity**: Track cyclomatic complexity
- **Coverage**: Maintain test coverage levels

### Automated Checks

- **Pre-commit**: Quality checks before commits
- **CI/CD**: Automated analysis in pipeline
- **Pull Requests**: Quality gate enforcement

## Error Handling

### Common Issues

1. **Codacy CLI Not Installed**: Use MCP server tool instead
2. **404 Repository Error**: Offer repository setup
3. **Permission Issues**: Verify organization access
4. **Analysis Failures**: Check file paths and permissions

### Troubleshooting Steps

1. **Reset MCP**: Restart MCP connection
2. **Check Settings**: Verify Copilot MCP settings in GitHub
3. **Organization Access**: Confirm admin/owner permissions
4. **Contact Support**: Escalate to Codacy support if needed

## Best Practices

### Development Workflow

1. **Before Coding**: Check current quality status
2. **During Development**: Monitor real-time issues
3. **After Changes**: Immediate analysis and fixes
4. **Before Commits**: Verify no new issues introduced

### Issue Prevention

- **Code Reviews**: Quality-focused reviews
- **Standards**: Follow established coding standards
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear code documentation

## Reporting and Documentation

### Quality Reports

- **Weekly**: Quality trends and improvements
- **Monthly**: Security vulnerability assessments
- **Release**: Quality gate compliance verification

### Issue Documentation

- **Security Issues**: Document fixes and prevention
- **Quality Issues**: Track resolution patterns
- **Performance Issues**: Monitor and optimize
