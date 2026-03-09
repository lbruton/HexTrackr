# HexTrackr Storage Assessment

## Overview
This document assesses the current storage mechanisms in HexTrackr to prepare for the migration to a web-hosted, Dropbox-backed architecture ("HexTrackrWeb").

## 1. LocalStorage Usage
The application currently relies heavily on `localStorage` for frontend state management, user preferences, and UI configuration.

**Key Findings:**
-   **Direct Usage**: Found in 20+ files.
-   **Content Stored**:
    -   Theme settings (`theme-controller.js`)
    -   Grid column definitions and states (`vulnerability-grid.js`, `tickets-aggrid.js`)
    -   Chart configurations (`vulnerability-chart-manager.js`)
    -   Markdown editor preferences (`vulnerability-markdown-editor.js`)
    -   Authentication tokens/Session tracking (implied by `login.html`, `websocket-client.js`)
-   **Sync Status**: A `PreferencesService` exists (`public/scripts/shared/preferences-service.js`) which attempts to sync some preferences to the backend SQLite database, but many UI-specific states remain purely local.

**Implication for Migration**:
-   These local settings will be lost if a user switches devices unless we explicitly sync `localStorage` content to Dropbox.
-   **Recommendation**: Implement a "Settings Sync" feature that dumps critical `localStorage` keys into a `settings.json` file in the Dropbox vault.

## 2. IndexedDB Usage
-   **Current Status**: **Unused**. No explicit usage of `IndexedDB` or common wrappers (idb, dexie, localforage) was found in the codebase.
-   **Implication**: The migration does not need to worry about migrating existing IndexedDB data.

## 3. SQLite Usage (Backend)
-   **Current Status**: The core of the application.
    -   **Library**: `sqlite3` and `better-sqlite3`.
    -   **Location**: `app/data/hextrackr.db`.
    -   **Schema**: Complex relational schema including:
        -   `tickets` (Core entity)
        -   `vulnerability_imports` & `vulnerabilities_current` (Large datasets)
        -   `vulnerability_snapshots` (Historical data)
        -   `email_templates`, `ticket_templates`
    -   **Logic**: Encapsulated in `app/services/databaseService.js`.

**Implication for Migration**:
-   This is the most critical component to port.
-   **Challenge**: The current backend runs in Node.js. "HexTrackrWeb" will run in the browser.
-   **Solution**: **SQLite Wasm** (Origin Private File System - OPFS).
    -   This allows us to reuse the *exact same schema* and mostly the same SQL queries.
    -   We can port `databaseService.js` to a client-side module using the official SQLite Wasm library.

## 4. Alternatives to SQLite in a Dropbox-Hosted World

Since the goal is a client-side app (Cloudflare Pages) with Dropbox storage:

### Option A: SQLite Wasm + OPFS (Recommended)
-   **How it works**: Run SQLite fully in the browser. Persist the DB file to the browser's highly optimized Origin Private File System (OPFS).
-   **Dropbox Sync**: Export the DB file (or binary chunks) to Dropbox. On load, pull from Dropbox into OPFS.
-   **Pros**:
    -   High performance (near-native).
    -   Reuses existing SQL schema/queries.
    -   Handles "HUGE" datasets (millions of rows) efficiently.
-   **Cons**:
    -   Syncing a large monolith file can be slow. Requires smart diffing or "chunked" uploads.

### Option B: IndexedDB (Dexie.js)
-   **How it works**: Use the browser's native NoSQL database.
-   **Dropbox Sync**: Export data to JSON files.
-   **Pros**:
    -   Native web solution.
-   **Cons**:
    -   **Requires rewriting all SQL logic** (sorting, filtering, complex joins).
    -   Performance with massive imports (100k+ rows) is generally worse than SQLite Wasm.
    -   Complete architectural rewrite.

### Recommendation
**Use SQLite Wasm.** It aligns perfectly with the "StakTrakr" pattern of encrypted vault storage and preserves the existing investment in SQL architecture.

## 5. File System & Uploads
-   **Current**: Files (CSV uploads, attachments) are stored in local `app/uploads` or `app/data`.
-   **Future**: All file uploads must go directly to Dropbox (encrypted).
