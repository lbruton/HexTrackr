# ADR-0005: rMemory Docker Open Source Repository

**Date**: 2025-08-30  
**Status**: Proposed  
**Context**: HexTrackr Project Memory System Extraction

## Context

The rMemory system developed within HexTrackr has evolved beyond project-specific tooling into a general-purpose AI development memory system. The current Docker installation files and memory architecture should be extracted into a standalone open source repository to share this innovation with the developer community.

## Decision

We will create a standalone `rMemory` repository containing:

1. **Complete Docker installation system**
2. **One-click installer scripts**
3. **Multi-environment configurations** (dev/prod/test)
4. **Community documentation and contribution guidelines**

## Rationale

### Technical Benefits

- **Separation of Concerns**: Memory system becomes independent of HexTrackr
- **Reusability**: Other projects can integrate rMemory without HexTrackr dependencies
- **Maintainability**: Focused repository with clear scope and responsibilities
- **Scalability**: Community contributions can enhance the memory system

### Community Benefits

- **Open Source Sharing**: Contribute to AI development tooling ecosystem
- **Knowledge Transfer**: Share Evidence → Canonical Notes → Todos pipeline innovation
- **Collaboration**: Enable community improvements and extensions
- **Adoption**: Lower barrier to entry with professional installer

### Business Benefits

- **Portfolio Enhancement**: Demonstrates open source leadership
- **Talent Attraction**: Showcase technical innovation publicly
- **Technology Transfer**: Enable broader adoption of memory architecture
- **Feedback Loop**: Community usage improves system design

## Implementation Plan

### Phase 1: Repository Setup

```bash

# New repository structure

rMemory/
├── docker/                    # Multi-environment Docker configs
├── install/                   # One-click installation system
├── config/                    # Configuration templates
└── docs/                      # Community documentation
```

### Phase 2: Docker Architecture

- **Multi-service composition**: rMemory Core, Neo4j, Ollama, GUI
- **Environment separation**: Development, production, testing configs
- **Data persistence**: Volume strategies for databases and logs
- **Security hardening**: Production-ready container configurations

### Phase 3: Installation System

- **One-click installer**: `curl -fsSL install.sh | bash`
- **Setup wizard**: GUI-based configuration tool
- **Dependency management**: Automatic Docker, model downloads
- **Verification system**: Health checks and service validation

### Phase 4: Community Preparation

- **Documentation**: Installation, configuration, troubleshooting guides
- **Contributing guidelines**: Code standards, issue templates, PR process
- **Community support**: Discord/Slack channels, FAQ system

## Consequences

### Positive

- **Community Impact**: Share innovative memory architecture with developers
- **Code Quality**: Forced modularization improves system design
- **Documentation**: Public repository requires comprehensive documentation
- **Testing**: Community usage reveals edge cases and improvements

### Negative

- **Maintenance Overhead**: Additional repository to maintain and support
- **Version Synchronization**: Need to keep HexTrackr integration updated
- **Support Burden**: Community questions and issue management
- **Security Exposure**: Public repository requires security review

### Neutral

- **Migration Path**: HexTrackr will use rMemory as git submodule
- **Backward Compatibility**: Existing HexTrackr installations continue working
- **Release Process**: Independent versioning for rMemory components

## Alternatives Considered

1. **Keep rMemory Internal**: Rejected - limits innovation sharing
2. **Monolithic Repository**: Rejected - violates separation of concerns
3. **Package-Only Release**: Rejected - installation complexity remains high
4. **Commercial Product**: Rejected - conflicts with open source philosophy

## Success Metrics

- **Installation Success Rate**: >95% on clean systems
- **Setup Time**: <10 minutes average installation
- **Community Adoption**: 100+ GitHub stars within 6 months
- **Documentation Quality**: Community can contribute without assistance
- **System Stability**: Zero-downtime operation in production deployments

## Migration Strategy

### HexTrackr Integration

1. Add rMemory as git submodule
2. Update Docker compose to reference rMemory services
3. Maintain backward compatibility during transition
4. Create migration guide for existing users

### Timeline

- **Week 1**: Repository creation and core extraction
- **Week 2**: Docker architecture and installation system
- **Week 3**: Documentation and community preparation
- **Week 4**: Beta testing and final release

## Related ADRs

- **ADR-0001**: Memory Backend Architecture (Memento MCP)
- **ADR-0003**: Claude Embeddings rMemory Integration

## Implementation Notes

```yaml

# Example docker-compose.yml structure

services:
  rmemory-core:
    environment:

      - NEO4J_URI=bolt://neo4j:7687
      - OLLAMA_HOST=ollama:11434

  neo4j:
    image: neo4j:5.15-enterprise
    environment:
      NEO4J_PLUGINS: '["apoc", "graph-data-science"]'
  ollama:
    image: ollama/ollama:latest
    volumes:

      - ollama_data:/root/.ollama

```

---

**Decision Maker**: Development Team  
**Stakeholders**: Open Source Community, HexTrackr Users  
**Review Date**: 2025-09-15
