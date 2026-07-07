# Root-cause note — greeting mount/reuse

Branch: `feature/greeting-reliability-and-error-ux`
Date: 2026-07-06
Author: frontend session (coordinator handoff)

## TL;DR

- **Symptom (a) — greeting fails on mount, user must type first — is FRONTEND-fixable.** Root cause: `Chat.jsx` swallows every `getGreeting()` failure with a `console.error` and empty chat, then permanently latches `greetingLoaded.current = true` **before** the network round-trip so no path re-attempts on subsequent renders. First-mount failures (network hiccup, brief 401 during Supabase token refresh, transient 5xx) become "silent chat with no greeting" until the user types.
- **Symptom (b) — greeting-only spend persists post-ISS-216 — is mostly a DOWNSTREAM CONSEQUENCE of (a), with a small non-bug residual.** No client mount path bypasses the backend's ISS-216 REUSE contract: exactly one caller (`Chat.jsx::loadGreeting → chat.js::getGreeting`), no body is sent, no session_id is forced, reuse decision is 100% backend-driven off the user's most-recent-session `turn_count`. The residual spend is genuine "first mount" + "already-typed sessions" (where turn_count > 0 so reuse can't fire — this is by-design per the ISS-216 comment). **Fixing (a) will meaningfully cut (b)** because today: silent greeting failure → user types → session `turn_count = 1` → next refresh cannot reuse (backend correctly falls through) → new greeting spend. Two greetings per real session instead of one.
- **No backend action is required from this session.** Coordinator can decide whether the "one-typed-session-then-refresh" residual warrants a separate ISS (extending reuse to cache the greeting text even when turn_count > 0, keyed by the first-assistant-message in the transcript). That is not fixable client-side and is not what ISS-216 aimed for.

## Full mount lifecycle traced

Files: `App.jsx`, `hooks/useAuth.jsx`, `components/AuthGuard.jsx`, `components/vault/VaultLayout.jsx`, `components/vault/ChatTab.jsx`, `components/demo/Chat.jsx`, `lib/api-client.js`, `lib/api/chat.js`, `lib/api/auth.js`.

1. `/vault/chat` → `<AuthProvider>` → `<AuthGuard>` → `<VaultLayout>` → `<ChatTab>` → `<Chat mode="try_it_out" />`.
2. `AuthProvider.init()` awaits `supabase.auth.getSession()`; batches `setSession/setUser/fetchUserId`, then `setLoading(false)` + `setInitialized(true)` in the `finally` block. `AuthGuard` renders "Loading..." until `initialized && !loading`.
3. `AuthGuard` gates render of `VaultLayout` on `isAuthenticated = !!session || !!getAccessCode()`. Unauthenticated → redirects to `/signup`; **`Chat` never mounts unless a Supabase session was in localStorage at page load.**
4. `VaultLayout` keeps `<ChatTab>` mounted for the whole vault lifetime (line 97 comment: "always mounted to preserve session state — hidden when other tabs are active"). Switching to People/Todos/etc. does **not** remount Chat.
5. `Chat` mount effect (`Chat.jsx:413-440`) runs once `authInitialized === true`, guarded by `greetingLoaded.current`. Deps: `[authInitialized, loadGreeting, initialGreeting, dailyLimit.isBlocked]`. `loadGreeting` is a stable `useCallback` (its only dep, `activateDailyLimit`, is stable via `useCallback([], ...)` inside `useDailyLimit`).
6. `loadGreeting → getGreeting()` POSTs `/chat/greeting` with **auth headers + timezone header only, no body**. Backend's `_find_reusable_greeting(user_id)` decides reuse purely from the user's most-recent session's `turn_count` + a TTL window.
7. Response handling in `chat.js::getGreeting`:
   - 401/403 → `{ error: 'Authentication failed…' }`
   - 429 daily-cost → `{ dailyLimit: {...} }`
   - Other 4xx/5xx → `{ error: <server detail> }`
   - Network throw → `{ error: 'Network error…' }`
   - Success → `{ greeting, messages, sessionId, ... }`
8. `loadGreeting`'s response handler:
   - `dailyLimit` → activates block card
   - `error` → **`console.error` + `setIsInitializing(false)` + return. No UI signal, no retry.** ← symptom (a) here.
   - success → paints messages

## Why the fix is client-side

Two independent problems in `Chat.jsx`'s mount path:

**Problem 1: latch-before-await.** `greetingLoaded.current = true` is set on line 416, **before** the network call at line 439. Any failure (transient network, brief auth blip, backend 5xx) leaves the latch high. No dep change re-triggers the effect; no user action retries it. The `handleReset` path (line 353) correctly sets the latch after `await loadGreeting()`, so the mount path is doing this inconsistently vs. reset.

**Problem 2: silent-fail branch has no UX.** `loadGreeting` catches errors by writing them to devtools and setting `isInitializing=false`. From the user's perspective, chat is empty and typeable. If they type, `sendMessageStream` (a different code path) usually succeeds because auth has stabilized by then. Turn count becomes 1. On the next mount, backend correctly declines to reuse (`turn_count != 0` in `_find_reusable_greeting`), and a fresh LLM greeting is generated. **The user paid one silent greeting they never saw + one fresh greeting on the next visit — that is the "persistent greeting-only spend" pattern.**

The proposed fix (in this PR):
1. Track `greetingError` state and render an inline retry chip in the empty message area when the initial fetch fails.
2. Move the mount-effect latch so it survives StrictMode's double-fire but doesn't lock out post-failure retries. Specifically: track "in-flight OR succeeded" via a ref; on failure, release the ref so subsequent user-triggered retries can re-enter.
3. Surface the retry via `sonner` toast as well, because a user who switches tabs on error will not see the inline chip.

## What we ruled out

- **Double-mount from StrictMode.** Ref-based guard is correct for React 18/19 StrictMode. First fire sets the ref, second fire exits early. Verified from code (no evidence of re-entry once the ref is set).
- **Route-remount thrash.** `VaultLayout` uses className toggling (`hidden` vs `h-full`), not conditional rendering, for chat vs other tabs. `<ChatTab>` never unmounts inside a vault session.
- **Auth-state race between `AuthGuard` render and `getAuthHeaders` read.** `getAuthHeaders` in `api-client.js` calls `supabase.auth.getSession()` directly (bypasses React state), so it never sees a stale null. If session recovery is still pending, `AuthGuard` would still be showing "Loading..." and `Chat` wouldn't have mounted.
- **`WelcomeStrip` counts fetch racing greeting.** Independent Promises; no shared state; no interference.
- **Multiple `getGreeting` callers.** Grepped `src/`. Exactly one call site (`Chat.jsx:268`). No sneaky duplicate mount path.
- **Any client behavior that could bypass ISS-216 REUSE.** The request body is empty and no `Cache-Control: no-cache` is set. Backend reuse is 100% user-scoped, TTL-gated. The client is not sabotaging reuse.

## Handoff

- Frontend fix is in this branch (`feature/greeting-reliability-and-error-ux`). Coordinator merges → deploys.
- **Backend option for later (not blocking launch):** consider caching the assistant greeting text into `transcript.messages` earlier so `_find_reusable_greeting` could return it even when `turn_count > 0` (i.e. user typed once, then refreshed). Right now that path generates a fresh greeting because the reuse guard checks `turn_count == 0`. This is by-design per the comment ("ISS-113 carryover should fire instead") but it does mean any user who types-then-refreshes pays a greeting. Worth measuring the % of greeting-only spend that comes from that pattern vs. genuine cold starts before scoping. Not a blocker.
