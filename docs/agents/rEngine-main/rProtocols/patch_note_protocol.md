# Protocol: Patch Note Management

**Version: 1.0.0**
**Date: 2025-08-18**
## Status: Active

## 1. Overview

This document establishes the official protocol for creating, naming, and storing patch notes for the `rEngine` component. The purpose of these notes is to maintain a clear, chronological record of changes, bug fixes, and enhancements. Adherence to this protocol is mandatory for all agents to ensure consistency and traceability.

## 2. Protocol Rules

### 2.1. File Location

All `rEngine` patch notes MUST be saved in the following directory:
`/Volumes/DATA/GitHub/rEngine/rEngine-patchnotes/`

### 2.2. Naming Convention

The filename for each patch note MUST follow this exact format:

## `rENGINE-PATCH-X.Y.Z.md`

- **`rENGINE-PATCH`**: This prefix is static and must be in all caps.
- **`X.Y.Z`**: This represents the semantic version number.
- **`.md`**: The file extension must be for Markdown.

### 2.3. Versioning Guide

The version number should be incremented based on the following rules:

- **`X` (Major):** Increment for major, breaking changes to the `rEngine` architecture or core functionality. (e.g., switching from HTTP to MCP).
- **`Y` (Minor):** Increment for new, non-breaking features or significant enhancements. (e.g., adding a new AI provider to the fallback system, creating new documentation).
- **`Z` (Patch):** Increment for bug fixes or minor tweaks that do not add new functionality. (e.g., fixing a typo in a script, correcting a file path).

To determine the next version number, an agent must first list the contents of the `rEngine-patchnotes/` directory and increment from the highest existing version number.

## 3. Patch Note Template

All new patch note files should be created using the following Markdown template to ensure consistency in structure and content.

````markdown

# rEngine Patch Notes - [YYYY-MM-DD]

**Version:** [X.Y.Z]
**Author:** [Your Name/Agent ID]
**Date:** [YYYY-MM-DD]

## Summary

A brief, one-paragraph overview of the changes included in this patch. Explain the "why" behind the work.

## Key Changes & Fixes

### 1. **[Change Title 1]**

- **Problem/Enhancement:** A clear description of the issue that was fixed or the feature that was added.
- **Fix/Implementation:** A summary of the solution. Include file paths, new functions, or architectural changes.
- **Impact:** A brief note on how this change affects the system or workflow.

### 2. **[Change Title 2]**

- **Problem/Enhancement:** ...
- **Fix/Implementation:** ...
- **Impact:** ...

*(Add more sections as needed for each distinct change)*
````
