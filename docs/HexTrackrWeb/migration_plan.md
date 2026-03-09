# HexTrackrWeb Migration Plan & Architecture

## Architecture Overview

**Goal**: Convert HexTrackr from a monolithic Node.js/SQLite application to a Serverless/Client-Side Web App ("HexTrackrWeb") using Dropbox for storage.

| Component | Current (Legacy) | Future (HexTrackrWeb) |
| :--- | :--- | :--- |
| **Hosting** | Docker Container (Self-hosted) | Cloudflare Pages (Static Site) |
| **Backend** | Node.js / Express | **None** (Client-side JS) |
| **Database** | SQLite (Server File) | **SQLite Wasm** (Browser OPFS) |
| **Storage** | Local Filesystem | **Dropbox API** (User's Private Vault) |
| **Auth** | Local Passport/Argon2 (Admin/User) | **Dropbox OAuth** (No internal accounts) |
| **API** | Express Routes | Direct Library Calls |

## Technical Strategy

1.  **The "StakVault" Pattern (Bring Your Own Storage)**:
    -   **Identity**: The user identity is derived purely from the Dropbox OAuth session. We strip out all internal user management code.
    -   **Storage**: The app creates a specific folder in their Dropbox App folder.
    -   **Data Sync**: The master SQLite database file is encrypted and synced between Dropbox and the browser's OPFS (Origin Private File System).
    -   **Locking**: A simple lock file in Dropbox prevents concurrent writes from multiple devices.

2.  **Codebase Porting**:
    -   **REMOVAL**: Delete `app/routes`, `app/middleware/auth.js`, `app/controllers` (server-side logic).
    -   **ADAPTATION**: Port `app/services/*` to run in the browser.
    -   We will create a new directory `app/web` for the client-side app.
    -   `app/services/databaseService.js` will be rewritten to use `sqlite-wasm`.
    -   `app/services/*Service.js` (logic layer) will be ported to client-side modules.
    -   Express routes will be replaced by direct function calls from the UI components.

## Phased Rollout Plan

### Phase 1: Schema Consolidation & Validation (Node.js) (Weeks 1-2)
-   **Goal**: Validate the `v1.1.0` consolidated schema on the *existing* Node.js backend to ensure logic correctness before platform migration.
-   [ ] Refactor `DatabaseService` to use `init-database-v1.1.0.js` rules.
-   [ ] Verify all application features work with the new unified schema.
-   [ ] Remove dependencies on legacy tables (`vulnerabilities` legacy, `sites`, `locations` if replaced).

### Phase 2: Storage Abstraction Layer (Weeks 3-4)
-   **Goal**: Decouple the application from the filesystem to support "Bring Your Own Storage" (Dropbox, OneDrive, Google Drive).
-   [ ] Create `StorageManager` interface (Read/Write/Delete/List).
-   [ ] Implement `LocalFileSystemProvider` (for current Node.js app).
-   [ ] Implement `DropboxProvider` (Proof of Concept).
-   [ ] Refactor app to use `StorageManager` for all file I/O (backups, exports).

### Phase 3: Client-Side "HexTrackrWeb" Foundation (Weeks 5-6)
-   [ ] Initialize `HexTrackrWeb` project structure (Vite + React/Vanilla JS).
-   [ ] Implement Multi-Provider Auth (Dropbox, OneDrive, Google).
-   [ ] Port `StorageManager` to Browser (using HTTP APIs for clouds).
-   [ ] Prototype SQLite Wasm + OPFS persistence.

### Phase 4: Database Storage Engine (Weeks 7-8)
-   [ ] Implement **SQLite Wasm** with OPFS backend.
-   [ ] Port the current `schema-actual.sql` to the new engine.
-   [ ] Build the "Sync Engine":
    -   Pull DB from Dropbox → Decrypt → Write to OPFS.
    -   Snapshot OPFS → Encrypt → Push to Dropbox.

### Phase 5: Service Layer Migration (Weeks 9-12)
-   [ ] Port `databaseService.js` to use the new Wasm engine.
-   [ ] Port `vulnerabilityService.js` (logic for importing Tenable CSVs).
-   [ ] Port `ticketService.js`.
-   [ ] **Challenge**: Handling giant CSV parsing in the browser.
    -   *Solution*: Use Web Workers to parse CSVs off the main thread to keep UI responsive.

### Phase 6: UI Integration (Weeks 13-16)
-   [ ] Connect existing frontend html/js to the new client-side services.
-   [ ] Remove all `fetch('/api/...')` calls and replace with direct service calls.
-   [ ] Wire up `localStorage` settings to also sync to Dropbox.

### Phase 7: Polish & Deploy
-   [ ] Setup Cloudflare Pages deployment pipeline.
-   [ ] Security audit (Validation of client-side encryption).
-   [ ] User testing with large Week A/B datasets.

### 5. Authentication & Security Strategy

**The "No-Backend" Shift**:
-   **Legacy Auth Removal**: We will completely **remove** the current `admin`/`user` role system, `passport.js` middleware, and `argon2` password hashing. The concept of a "HexTrackr User" within the app logic is retired.
-   **New Identity Provider**: The "User" is simply the owner of the Dropbox account. Authentication is handled entirely by Dropbox via OAuth 2.0.
-   **Session Management**:
    -   The "Session" is defined by the presence of a valid Dropbox Access Token (stored in `localStorage` or `sessionStorage`).
    -   **Access Control**: If the user grants access to their Dropbox, they are "Logged In". If they revoke access or the token expires, they are "Logged Out".

**Data Security (At Rest)**:
-   **Browser**: The SQLite DB in OPFS is accessible only to the origin (the HexTrackrWeb domain).
-   **Cloud (Dropbox)**: The master DB file (`master.enc`) is **encrypted** before upload using a localized Key Encryption Key (KEK) derived from the user's session or a user-provided "Vault Password" (similar to StakTrakr). This ensures that even if the Dropbox account is compromised, the raw vulnerability data remains encrypted.

## Immediate Next Steps
1.  **Prototype the Storage Layer**: Create a small script to test SQLite Wasm persistence in the browser.
2.  **Analyze Dependencies**: Identify any Node.js-only libraries (like `better-sqlite3`, `fs`) in the service layer that need browser equivalents.
