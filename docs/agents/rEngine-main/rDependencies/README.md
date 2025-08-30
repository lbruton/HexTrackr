# rDependencies - rEngine Platform Requirements

## Overview

Complete installation and setup requirements for rEngine platform deployment across all supported environments.

## Folder Structure

```
rDependencies/
├── README.md                     # Main installation guide
├── hardware-requirements.md     # System specifications
├── software-requirements.md     # Core software dependencies
├── platform-specific/
│   ├── macos/
│   │   ├── install-guide.md
│   │   ├── brew-dependencies.sh
│   │   └── troubleshooting.md
│   ├── windows/
│   │   ├── install-guide.md
│   │   ├── chocolatey-dependencies.ps1
│   │   └── troubleshooting.md
│   └── linux/
│       ├── install-guide.md
│       ├── apt-dependencies.sh
│       ├── yum-dependencies.sh
│       └── troubleshooting.md
├── ai-providers/
│   ├── ollama-setup.md
│   ├── openai-setup.md
│   ├── claude-setup.md
│   └── gemini-setup.md
├── development-tools/
│   ├── vscode-setup.md
│   ├── git-configuration.md
│   ├── node-setup.md
│   └── docker-setup.md
├── verification/
│   ├── system-check.sh
│   ├── dependency-test.js
│   └── health-check.md
└── automation/
    ├── one-click-install.sh
    ├── update-dependencies.sh
    └── cleanup-old-versions.sh
```

## Core Dependencies

### Essential Software

- **Node.js** (v18+) - JavaScript runtime
- **Git** (v2.30+) - Version control
- **VS Code** (latest) - Recommended IDE with rEngine integration
- **Docker** (optional) - Container deployment
- **Ollama** (latest) - Local LLM management

### AI Provider APIs (Choose One or More)

- **Ollama** - Local AI models (recommended for privacy)
- **OpenAI** - GPT models (requires API key)
- **Anthropic Claude** - Claude models (requires API key)
- **Google Gemini** - Gemini models (requires API key)

### Hardware Requirements

#### Minimum (Development)

- **CPU**: Intel i5 / AMD Ryzen 5 / Apple M1
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space
- **Network**: Broadband internet for cloud AI providers

#### Recommended (Full Platform)

- **CPU**: Intel i7 / AMD Ryzen 7 / Apple M2 Pro
- **RAM**: 16GB (32GB for local AI models)
- **Storage**: 50GB free space (SSD recommended)
- **GPU**: Optional for local AI acceleration

#### Enterprise (Air-Gapped)

- **CPU**: Apple M4 / Intel i9 / AMD Ryzen 9
- **RAM**: 32GB minimum
- **Storage**: 100GB+ for local models and data
- **Security**: Hardware security modules (HSM) support

## Installation Methods

### Quick Install (Recommended)

```bash
curl -fsSL https://get.rengine.dev/install | bash
```

### Manual Install

1. Install core dependencies per platform guide
2. Clone rEngine repository
3. Run setup verification
4. Configure AI providers
5. Test installation

### Docker Deploy

```bash
docker run -d --name rengine rengine/platform:latest
```

### Air-Gapped Install

1. Download offline installer package
2. Transfer to target system via physical media
3. Run offline installation script
4. Configure local AI models
5. Verify isolated operation

## Verification & Testing

### Automated Checks

- System compatibility verification
- Dependency version validation
- AI provider connectivity testing
- Performance benchmarking

### Manual Validation

- rEngine startup test
- Agent coordination test
- Memory system test
- Documentation generation test

## Support Matrix

| Platform | Support Level | Notes |
|----------|---------------|-------|
| macOS M1/M2/M3/M4 | ✅ Full | Optimized performance |
| macOS Intel | ✅ Full | Supported |
| Windows 11 | ✅ Full | WSL2 recommended |
| Windows 10 | ⚠️ Limited | Basic functionality |
| Ubuntu 20.04+ | ✅ Full | Server deployment ready |
| RHEL/CentOS 8+ | ✅ Full | Enterprise validated |
| Docker | ✅ Full | Cross-platform |

## Update Strategy

### Automated Updates

- Weekly dependency security updates
- Monthly feature updates
- Quarterly major releases

### Manual Updates

- Breaking changes require manual intervention
- Configuration migration assistance
- Rollback procedures documented

---

**Note**: This is a conceptual outline. Actual implementation planned for PROJECT-006 Phase 4 (Week 6).
