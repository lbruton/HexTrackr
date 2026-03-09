# HexTrackrWeb Technical Architecture

```mermaid
graph TD
    User[User Browser]
    
    subgraph "Cloudflare Pages (Static Assets)"
        HTML[index.html]
        JS[Client-Side JS Bundle]
        WASM[SQLite Wasm]
    end
    
    subgraph "Client-Side Runtime (Browser)"
        UI[UI Components]
        Logic[Service Layer]
        Worker[Web Workers]
        
        dbAdapter[Database Adapter]
        
        subgraph "Storage"
            LocalStorage[localStorage (UI State)]
            OPFS[OPFS (SQLite DB File)]
        end
    end
    
    subgraph "Dropbox Cloud"
        OAuth[OAuth 2.0]
        Vault[App Folder /vault]
        EncDB[Encrypted DB Snapshot]
        EncFiles[Encrypted Attachments]
    end

    User -->|Load| HTML
    
    UI -->|Call| Logic
    Logic -->|Read/Write| dbAdapter
    dbAdapter -->|SQL| WASM
    WASM -->|IO| OPFS
    
    Logic -->|Offload CSV| Worker
    
    Logic -- Sync --> DropboxAdapter
    DropboxAdapter -->|Auth| OAuth
    DropboxAdapter -->|Sync Encrypted Data| Vault
```

## detailed Components

### 1. The Client (Browser)
The entire application logic moves to the browser.
-   **Framework**: Vanilla JS (or migrating to Vue/React if desired, but maintaining current Vanilla stack is feasible).
-   **State**: 
    -   Transient state in Redux/Signal/Global Store.
    -   Persistent state in SQLite Wasm.

### 2. SQLite Wasm (The Brain)
-   Replaces the Node.js `sqlite3` process.
-   **OPFS (Origin Private File System)**: Provides high-performance file handles accessible only to the origin. This allows SQLite to run with near-native speed, essential for querying 100k+ vulnerability rows.

### 3. The "StakVault" (Dropbox)
-   Functions as the "Backend Storage".
-   **File Structure**:
    -   `/vault/master.enc`: The main SQLite database file, encrypted with a user-derived key.
    -   `/vault/attachments/`: Folder for encrypted screenshots/evidence files.
    -   `/vault/metadata.json`: Timestamp of last sync to handle conflicts.

### 4. Sync Mechanism
-   **Startup**:
    1.  User logs in via Dropbox.
    2.  Check `/vault/metadata.json`.
    3.  If Dropbox has newer version than OPFS, download `master.enc`, decrypt, and overwrite OPFS DB.
    4.  Boot App.
-   **On Save/Exit**:
    1.  Lock UI.
    2.  Snapshot OPFS DB.
    3.  Encrypt.
    4.  Upload to Dropbox.
    5.  Update `metadata.json`.
