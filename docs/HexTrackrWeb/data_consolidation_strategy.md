# Data Consolidation Strategy

**Goal**: Simplify HexTrackr's data model by moving scattered client-side state (localStorage) and legacy server-side concepts into a unified SQLite schema running in the browser (OPFS).

## 1. Inventory of State

### A. LocalStorage / SessionStorage (To Be Migrated)
| Key | Usage | Target Destination | Migration Logic |
| :--- | :--- | :--- | :--- |
| `hextrackr-theme` | "light" / "dark" | `user_preferences` table | Read on startup, insert into DB, delete from LS. |
| `hextrackr_cache_metadata` | Cache headers | **Keep in LS or Move to `sync_metadata`** | Better fits `sync_metadata` table for cross-device consistency. |
| `ag-grid-state-*` | Column order/width | `user_preferences` table | Serialize JSON -> DB. |
| `auth_token` (New) | Dropbox Access Token | `localStorage` (Encrypted?) | **EXCEPTION**: Must remain in LS/SessionStorage to bootstrap DB access. |

### B. Legacy Server-Side Data (To Be Refactored)
| Table / Concept | Current State | Future State (HexTrackrWeb) |
| :--- | :--- | :--- |
| `users` table | Stores bcrypt/argon2 hashes | **Keep for FKs, but change usage.** Store Dropbox User ID & Profile. Password column becomes nullable/unused. |
| `sessions` | Server-side memory/Redis | **Eliminate**. Auth state is derived from valid Dropbox Token + Local DB existence. |
| `vulnerabilities` | Legacy table | **Drop**. Do not include in new schema. |

## 2. Schema Strategy

We will repurpose the existing v1.1.0 schema with minimal breaking changes to facilitate easy code porting.

### `users` Table Adaptation
- **ID**: Use Dropbox Account ID (e.g., `dbid:AAH...`) instead of UUID if possible, or map them.
- **Username**: Dropbox Display Name.
- **Password_Hash**: Set to `AUTH_VIA_DROPBOX` or make nullable. Remove all password logic.
- **Role**: Define roles in `user_preferences` or hardcode "Owner" for the Dropbox owner.

### `user_preferences` Usage
This table becomes the single source of truth for UI state.
- **Key**: `theme.mode` -> **Value**: `dark`
- **Key**: `grid.vulnerabilities.state` -> **Value**: `{ "colState": [...] }` (JSON string)

## 3. Migration Workflow (Startup)

1. **Bootstrap**: App loads. Check for Dropbox Token in LS.
   - If missing -> Redirect to OAuth.
2. **DB Init**: Initialize SQLite Wasm from OPFS.
   - If DB missing -> Download encrypted `master.enc` from Dropbox.
   - Decrypt & Mount.
3. **Consolidation** (Run Once on First Load):
   - Check `localStorage` for legacy keys (`hextrackr-theme`, etc.).
   - If found:
     - UPSERT into `user_preferences`.
     - Remove from `localStorage`.
4. **Runtime**:
   - `ThemeController` reads/writes to DB `user_preferences`.
   - `GridManager` reads/writes to DB `user_preferences`.
   - `SyncManager` pushes DB changes to Dropbox.

## 4. Sync Strategy (High Level)

- **SQLite DB**: The `hextrackr.db` file is the master.
- **Push**: periodically (or on save), snapshot DB, encrypt, upload to Dropbox `/HexTrackr/hextrackr.db.enc`.
- **Pull**: On startup, check modification time. If remote is newer, download & replace local.
- **Conflict Resolution**: "Last Write Wins" (Simple) or "Manual Merge" (Complex). Start with Last Write Wins for Phase 1.

## 5. Security Implications

- **Token Storage**: Dropbox Access Token acts as the master key. It must be stored securely (HttpOnly cookie is best, but difficult for pure client-side. `sessionStorage` is acceptable for MVP).
- **Encryption**: The DB file on Dropbox is encrypted (AES-GCM) related to a user-derived key (or simply relying on Dropbox security for MVP, but user wants encryption).

## 6. Action Items

- [ ] Update `init-database` script to remove password constraints on `users`.
- [ ] Create `LocalStorageMigrator` class.
- [ ] Refactor `ThemeController` to use `DatabaseService`.
