# HexTrackr Authentication Implementation Review (2025-10-05)

## Executive Summary
- The new authentication stack implements Argon2id hashing, Express sessions backed by SQLite, and route protection across the API surface, which aligns with the project’s security goals.
- Frontend session handling bugs currently break the login flow (redirect loops, premature expirations) and must be addressed before further rollout.
- Session data is being persisted inside the publicly served directory, exposing session tokens (and the primary database) to download by any unauthenticated visitor.
- Several best-practice hardening tasks (mandatory CSRF protection, environment validation, dev/prod cookie handling) remain unfinished and leave exploitable gaps.

## What’s Working Well
- `AuthService` uses Argon2id with suitable parameters and tracks failed attempts/lockouts (`app/services/authService.js:20`-`app/services/authService.js:196`).
- All major route stacks now require authentication via middleware (`app/routes/**/*.js`).
- WebSocket handshakes enforce session validation before joining rooms (`app/public/server.js:52`-`app/public/server.js:105`).
- Frontend AuthState centralizes session checks, menu updates, and authenticated fetches, giving a single integration point once defects are resolved (`app/public/scripts/shared/auth-state.js`).

## Critical Issues (Fix Immediately)

1. **Session database is publicly downloadable**  
   - Sessions are written to `app/public/data/sessions.db` (`app/middleware/auth.js:12`). The entire `app/public` tree is served statically (`app/public/server.js:292`), so `https://dev.hextrackr.com/data/sessions.db` (and `hextrackr.db`) can be fetched without authentication. This enables full session hijack and data exfiltration.  
   **Action**: Move all databases outside the static root (e.g., `app/data/`), update the session store path accordingly, and denylist `/data` from static serving. Apply the same fix to the primary SQLite file if not already shielded.

2. **Frontend status parsing causes false logouts and redirect loops**  
   - `authState.startSessionCheck()` reads `data.authenticated` instead of the nested `data.data.authenticated` payload, so every poll treats the user as logged out and fires the timeout modal (`app/public/scripts/shared/auth-state.js:276`).
   - `login.html` performs the same incorrect check during initial load (`app/public/login.html:304`).  
   - These bugs explain the observed “bounce back to login” and “session expired immediately” behaviour.
   **Action**: Normalize response handling in all fetches (e.g., destructure `{data}` first) and update AuthState/login checks to reference `response.data`. Ensure AuthState also clears its local `user` state when a session truly expires.

3. **Secure cookies + HTTP access = no login**  
   - Cookies are marked `secure: true` (`app/middleware/auth.js:22`-`app/middleware/auth.js:27`). Browsers drop them on any non-HTTPS request, which matches the redirect loop reports when using `http://localhost` or `http://dev.hextrackr.com`.  
   **Action**: Enforce HTTPS access everywhere **and** fail fast when the app detects an insecure origin, or gate `secure`/`sameSite` based on environment until nginx termination is always present. Document the requirement prominently.

## High-Priority Gaps
- **Missing CSRF protection**: `csrf-sync` is installed but not wired into middleware or frontend token handling. Until synchronizer tokens wrap POST/PUT/DELETE calls, the session remains CSRFable despite `SameSite=Lax`.  
  *Recommendation*: Add the CSRF middleware immediately after sessions, expose a `/api/auth/csrf` token endpoint, and attach headers in `authenticatedFetch`.

- **No guard on `SESSION_SECRET`**: Express-session happily accepts `undefined` secrets, yielding predictable cookies. Add a bootstrap check that exits if the secret is missing (`app/public/server.js` right after `dotenv`).

- **Remember Me only adjusts cookies**: `extendSession()` extends `req.session.cookie.maxAge` but the store TTL remains default. Confirm `better-sqlite3-session-store` respects the cookie expiry; otherwise set `ttl` explicitly when remember-me is chosen (`app/middleware/auth.js:11`).

- **Static header assumptions**: `AuthState.updateUserMenu()` blindly grabs the first `.navbar-nav .nav-item.dropdown` (`app/public/scripts/shared/auth-state.js:409`). If header markup changes (new dropdown), the menu update breaks. Consider injecting explicit IDs in the shared header and targeting those instead.

## Medium Priority Observations
- WebSocket handshake authentication rejects unauthenticated clients but still logs the disconnect as success; consider returning 401 in the client for clearer UI feedback (`app/public/server.js:62`-`app/public/server.js:92`).
- API responses on `requireAuth` return `{ error, authenticated:false }` without the `success` flag. Aligning response shapes (`success:false`) would simplify consumer logic (`app/middleware/auth.js:37`).
- `authState.handleUnauthenticated()` redirects immediately on any 401, even if received by a background fetch on a still-visible page. Debounce or centralize a single redirect to avoid race conditions during session expiry.
- The login form exposes a version footer that now reads `v1.0.47` while `package.json` is `1.0.45`. Update or automate version synchronisation to avoid confusion.

## Recommended Next Steps
1. Relocate session/main databases out of `app/public`, update session store path, and block static serving of sensitive folders.
2. Patch AuthState/login status parsing and rerun end-to-end tests via the HTTPS nginx proxy.
3. Introduce a boot-time guard for `SESSION_SECRET` and provide clear dev docs for generating it.
4. Implement CSRF synchronizer tokens end-to-end before enabling the change-password modal in production.
5. Revisit cookie configuration: ensure dev tooling uses HTTPS; optionally make `secure` configurable but loudly warn when disabled.
6. After fixes, retest WebSocket flows, authenticated API wrappers, and shared header integration using Chrome DevTools as mandated.

Please let me know if you’d like companion patches for the highlighted items.
