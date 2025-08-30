# Agent Documentation Guide

This document outlines the priority and usage of documentation resources within the StackTrackr repository for all AI agents. Adhering to this guide will improve efficiency, accuracy, and reduce token consumption.

## Emergency Startup Protocol

### START.md - Write-Protected Emergency Backup

- **Location:** `/START.md` (root directory)
- **Purpose:** Emergency backup of `COPILOT_INSTRUCTIONS.md` for human use when agent chat sessions fail to auto-load main instructions
- **Protection:** Write-protected (chmod 444) - can only be overwritten by explicit user request
- **Usage:** Human fallback when normal agent initialization fails

## Information Retrieval Hierarchy

When tasked with finding information, analyzing code, or understanding a feature, agents MUST follow this retrieval hierarchy in order:

### 0. Master Project Tracking (NEW - TOP PRIORITY)

- **Location:** `/MASTER_ROADMAP.md` (root directory)
- **Description:** **SINGLE SOURCE OF TRUTH** for all bugs, features, roadmaps, and project status across StackTrackr application and all rEngine components (rAgents, rMemory, rSync, rScribe).
- **Priority:** **HIGHEST.** Always check here first for current issues, priorities, and project status.
- **Usage:** Use this for understanding what's broken, what needs to be done, and current development priorities.

### 1. Primary Memory (MCP & JSON)

- **Location:** `rMemory/`, `rEngine/*.json`
- **Description:** The agent's own memory is the first and most immediate source of information. This includes the Memory Compliance Protocol (MCP) servers and various JSON files that store state, knowledge, and configuration.
- **Priority:** **Highest.** Information here is considered active and immediately relevant.

### 2. Primary Documentation (Human-Curated)

- **Location:** `/docs/` (excluding `/docs/generated/`)
- **Description:** This directory contains hand-written documentation, architectural decisions, and strategic guides. It is the definitive source of truth for the project's design and intent.
- **Priority:** **High.** This is the most reliable source for understanding *why* the system is built the way it is. It should be trusted over AI-generated documentation.

### 3. Secondary Documentation (AI-Generated)

- **Location:** `/docs/generated/`
- **Description:** This directory contains AI-generated documentation created by the `rScribe` agent. It serves as a highly detailed, file-by-file index of the codebase.
- **Usage:** This is an invaluable resource for quickly understanding the functions, dependencies, and purpose of specific files without needing to read the raw source code. It is a massive time and context saver.
- **Caveat:** As this documentation is AI-generated, it should be considered a high-quality summary, but **not infallible**. If there is a conflict or ambiguity, the source code or primary documentation takes precedence.
- **Priority:** **Medium.** Use this as the first stop for "what does this file do?" or "where is the function for X?" before resorting to a full code scan.

### 4. Source Code

- **Location:** The entire repository.
- **Description:** The code itself.
- **Usage:** This is the last resort. A full scan of the project is time-consuming and token-intensive. It should only be performed if the required information cannot be found in any of the documentation tiers above.

## Quick Reference Checklist

## Before starting any work:

1. ✅ Check `/MASTER_ROADMAP.md` for current priorities and known issues
2. ✅ Search MCP memory for relevant context
3. ✅ Review relevant human documentation in `/docs/`
4. ✅ Use AI-generated docs in `/docs/generated/` for file understanding
5. ✅ Only then scan source code if needed

By following this hierarchy, agents will operate more efficiently and make better-informed decisions.
