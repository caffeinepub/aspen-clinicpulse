# Specification

## Summary
**Goal:** Remove Internet Identity sign-in and dashboard access-code gating so the app loads and all routes work without authentication.

**Planned changes:**
- Remove Internet Identity login as a bootstrap/routing requirement so all existing routes can be accessed without signing in.
- Remove the access-code gate flow (including AccessCodeGate in routing/bootstrap) and ensure old sessionStorage access-code keys do not block rendering.
- Update navigation and recovery UI to remove sign-out actions; add a “Reset Session” action that clears relevant local state (including React Query caches and access-related sessionStorage keys) and reloads the app.
- Disable or remove frontend features that depend on an authenticated “current user” context (e.g., current user profile/role bootstrap queries and profile setup modal) so pages render without identity.
- Remove/disable backend authorization enforcement so anonymous callers can use the existing read/write APIs without Internet Identity or access-code validation.

**User-visible outcome:** Opening the app (or visiting any route directly) never prompts for sign-in or an access code; all main pages load and function, and a session reset option is available instead of sign-out.
