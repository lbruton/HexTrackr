# HexTrackr GitHub Workflow Diagrams

## Complete Development to Production Flow

```mermaid
flowchart TB
    subgraph "Development Environment"
        A[Developer Work] --> B[Local Testing]
        B --> C{Ready?}
        C -->|No| A
        C -->|Yes| D[Commit to copilot]
    end
    
    subgraph "HexTrackr-Dev (Private)"
        D --> E[Push to GitHub]
        E --> F[Codacy Scan #1]
        F --> G{Issues?}
        G -->|Yes| A
        G -->|No| H[Ready for Release]
    end
    
    subgraph "Release Process"
        H --> I[Run release-to-public.sh]
        I --> J[Uhura Preflight Check]
        J --> K[Sync Files]
        K --> L[Create Version Tag]
        L --> M[Generate Release Notes]
        M --> N[Create GitHub Release]
    end
    
    subgraph "HexTrackr (Public)"
        N --> O[Create PR to main]
        O --> P[Codacy Scan #2]
        P --> Q[CodeQL Security Scan]
        Q --> R{All Checks Pass?}
        R -->|No| S[Fix Issues]
        S --> O
        R -->|Yes| T[Merge to main]
        T --> U[Codacy Scan #3]
        U --> V[Update Public Badge]
        V --> W[Production Ready]
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style W fill:#9f9,stroke:#333,stroke-width:2px
    style F fill:#ff9,stroke:#333,stroke-width:2px
    style P fill:#ff9,stroke:#333,stroke-width:2px
    style U fill:#ff9,stroke:#333,stroke-width:2px
```

## Agent Pipeline Flow

```mermaid
flowchart LR
    subgraph "Development Phase"
        A[Task Dispatcher] --> B[Stooges]
        B --> |Larry| B1[Technical Analysis]
        B --> |Moe| B2[Process Organization]
        B --> |Curly| B3[Creative Solutions]
    end
    
    subgraph "Verification Phase"
        B1 & B2 & B3 --> C[Merlin]
        C --> C1[Truth Verification]
        C1 --> D[SPECS]
        D --> D1[Constitutional Compliance]
    end
    
    subgraph "Release Phase"
        D1 --> E[Atlas]
        E --> E1[Version Management]
        E1 --> F[Uhura]
        F --> F1[Repository Sync]
        F --> F2[Commit Translation]
        F --> F3[PR Creation]
    end
    
    subgraph "Documentation Phase"
        F1 & F2 & F3 --> G[Doc]
        G --> G1[HTML Generation]
        G1 --> H[Public Docs]
    end
    
    style A fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#9f9,stroke:#333,stroke-width:2px
```

## Codacy Quality Gates

```mermaid
flowchart TD
    subgraph "Quality Checkpoints"
        A[Code Written] --> B{Scan 1: Development}
        B -->|Pass| C[Release Candidate]
        B -->|Fail| D[Fix in Dev]
        D --> A
        
        C --> E{Scan 2: PR Review}
        E -->|Pass| F[Approved for Merge]
        E -->|Fail| G[Fix in PR]
        G --> C
        
        F --> H{Scan 3: Production}
        H -->|Pass| I[✅ Production Ready]
        H -->|Fail| J[Hotfix Required]
        J --> A
    end
    
    subgraph "Quality Metrics"
        K[Grade: A+]
        L[Issues: <10]
        M[Complexity: <10%]
        N[Duplication: <5%]
        O[Security: Clean]
    end
    
    B & E & H --> K & L & M & N & O
    
    style I fill:#9f9,stroke:#333,stroke-width:2px
    style K fill:#ff9,stroke:#333,stroke-width:2px
```

## Uhura's Communication Flow

```mermaid
sequenceDiagram
    participant D as Developer
    participant U as Uhura
    participant DR as Dev Repo
    participant PR as Public Repo
    participant GH as GitHub API
    participant C as Codacy
    
    D->>U: /uhura-sync v1.0.13
    U->>U: Run Preflight Checks
    U->>DR: Check Status
    DR-->>U: Clean
    U->>PR: Check Status
    PR-->>U: Ready
    
    U->>DR: Read Commits
    U->>U: Translate to Professional
    U->>DR: Execute release.sh
    DR->>PR: Sync Files
    
    U->>GH: Create Release
    GH-->>U: Release URL
    U->>GH: Create PR
    GH-->>C: Trigger Scan
    C-->>GH: Scan Results
    GH-->>U: PR Created
    
    U-->>D: "Transmission Complete, Captain"
```

## Configuration Sync Status

```mermaid
flowchart TB
    subgraph "Configuration Files"
        A[.codacy/codacy.yaml]
        B[.codacyrc]
        C[.codacyignore]
        D[.github/workflows/]
        E[docker-compose.yml]
        F[Dockerfile.node]
    end
    
    subgraph "Dev Repo"
        A1[Master Configs]
    end
    
    subgraph "Public Repo"
        A2[Synced Configs]
    end
    
    A & B & C & D & E & F --> A1
    A1 -->|release.sh| A2
    
    subgraph "Validation"
        V[Uhura Preflight]
        V -->|Check| A1
        V -->|Check| A2
        V -->|Compare| R{Match?}
        R -->|Yes| S[✅ Sync OK]
        R -->|No| T[⚠️ Drift Detected]
    end
    
    style S fill:#9f9,stroke:#333,stroke-width:2px
    style T fill:#f99,stroke:#333,stroke-width:2px
```

## Release Decision Tree

```mermaid
flowchart TD
    A[Ready to Release?] --> B{All Tests Pass?}
    B -->|No| C[Fix Tests]
    C --> A
    B -->|Yes| D{Codacy Grade A?}
    D -->|No| E[Fix Issues]
    E --> A
    D -->|Yes| F{Configs Synced?}
    F -->|No| G[Sync Configs]
    G --> A
    F -->|Yes| H{Version Bumped?}
    H -->|No| I[Bump Version]
    I --> A
    H -->|Yes| J{Changelog Updated?}
    J -->|No| K[Update Changelog]
    K --> A
    J -->|Yes| L[✅ Ready for Release]
    
    L --> M[Run release-to-public.sh]
    M --> N[Create PR]
    N --> O{PR Checks Pass?}
    O -->|No| P[Fix PR Issues]
    P --> N
    O -->|Yes| Q[Merge to Main]
    Q --> R[🎉 Released!]
    
    style L fill:#9f9,stroke:#333,stroke-width:2px
    style R fill:#9f9,stroke:#333,stroke-width:4px
```

---

*These diagrams can be rendered in any Markdown viewer that supports Mermaid (GitHub, VSCode, etc.)*