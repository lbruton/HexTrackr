---
tags: [index]
updated: 2026-04-15
---

# HexTrackr Index

| Page | Summary |
|------|---------|
| [[API Reference]] | Backend controllers, services, REST endpoints, and server configuration reference |
| [[Architecture]] | High-level system overview: MVC layers, technology stack, and links to detailed architecture docs |
| [Backend Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Backend%20Architecture.md) | Node.js/Express modular server: controllers, services, routes, SQLite persistence, and unified delivery |
| [[Cisco Advisory Architecture]] | Cisco PSIRT OpenVuln API integration: OAuth2 flow, advisory parsing, train filtering, and fixed-version display |
| [[CSS Coding Standards]] | Layered theme system coding standards to prevent inconsistent style creation across the codebase |
| [[Data Model]] | Complete database schema: 17 core tables across 6 functional categories with 68 indexes and KEV integration |
| [[Database Architecture]] | SQLite engine configuration: WAL mode, better-sqlite3 driver, Docker volume layout, and initialization |
| [[Database Schema]] | Raw SQL snapshot of the live production schema: 23 tables, 68 indexes, and 1 trigger |
| [[Database Seed]] | Pre-seeded SQLite database file shipped with each release for instant deployment without running SQL scripts |
| Documentation Workflow (retired) (archived) | Retired 2026-03-31 — Linear-based workflow superseded by DocVault vault-based `/issue` system |
| [[Frontend API]] | Client-side module reference: page managers, shared components, and utilities using vanilla JavaScript |
| [[Frontend Architecture]] | Modular orchestrator pattern: VulnerabilityCoreOrchestrator, event-driven communication, and 50+ ES6 modules |
| [[Git Workflow]] | Integration branch pattern using protected main and dev as the working baseline |
| [Logging System](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Logging%20System.md) | Audit logging system with AES-256-GCM encryption across 14 implementation sessions |
| [[MCP Tools]] | MCP server tools and Claude Code hooks used during development |
| [Middleware & Config](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Middleware%20&%20Config.md) | Express middleware pipeline: authentication, CSRF, rate limiting, and error handling |
| [Overview](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Overview.md) | Enterprise vulnerability management system with WebSocket updates, CISA KEV tracking, Cisco/Palo Alto advisories, and Ticketing Bridge |
| [[Schema Evolution]] | Database migration history tracking progression from initial release to present |
| [Security Architecture](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Architecture.md) | Auth flow (Argon2id), CSRF sync, rate limiting, path validation, and compliance controls |
| SRPI Process (retired) (archived) | Retired 2026-03-31 — 4-phase development process replaced by global spec-workflow (`/spec`, `/discover`) |
| [[Theme Architecture]] | Centralized theme system: CSS variable layers, dark/light mode, and component theming |
| [[Turso Migration]] | Archived/cancelled: research into Turso cloud database migration (complexity not justified) |
| [[Utilities]] | 31+ utility modules for vulnerability processing, security validation, theme management, and data transformation |
| [[Version Management]] | Automated changelog and version bump workflow with docs generator integration |
| [[WebSocket Architecture]] | Socket.io protocol reference: events, progress tracking, and real-time update implementation |
| [Security Reviews](/Volumes/DATA/GitHub/Devops/DocVault/Projects/HexTrackr/Security%20Reviews/Security%20Reviews.md) | Security architecture reviews |
