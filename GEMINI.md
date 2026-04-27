# GEMINI.md

**For Gemini CLI (Interactive Agent)** — Full peer agent in the specflow stack.
Specializes in: security audits (Codacy SRM), schema research, and spec-driven dev.

> See `~/.gemini/GEMINI.md` for global workflow rules, mandatory gates, and shared peer stack protocols.

---

## Peer Stack Context

| Agent | Focus in HexTrackr |
|-------|-------------------|
| Claude Code | Node.js/Express implementation, Docker deployment |
| Codex | Adversarial review, AES-256-GCM encryption, schema migrations |
| Gemini | Security (Codacy SRM), Audit logging, DocVault architecture docs |

## Project Context

**HexTrackr** is an enterprise vulnerability management system.
**Database**: SQLite (WAL mode) at `/app/app/data/hextrackr.db`.
**Security**: AES-256-GCM encrypted audit logs (HEX-254) are a core system pillar.

## Specflow Lifecycle

- Specs in `.spec-workflow/specs/`.
- **Mandatory**: Check `Database Schema` in DocVault before touching SQL.
- **Logging**: Use `spec-workflow.log-implementation` for all service/route changes.

## Security & SRM

HexTrackr is monitored via **Codacy SRM**. 
- Run `@audit` to check for Critical/Overdue findings.
- Prioritize SAST and Secrets findings in the Peer Review phase.

## Issue Tracking

DocVault Prefix: `HEX-`. Use DocVault for all issues (Linear is retired).