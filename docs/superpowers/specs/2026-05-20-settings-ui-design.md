# Settings Page UI Redesign

**Date:** 2026-05-20
**Status:** Design — awaiting user approval
**Author:** Claude Code (with @pratik)
**Repo:** `ufactorialcodebase.github.io` (frontend)
**Branch:** `product-experience/settings-ui`
**Mockup:** `docs/mockups/settings-ui-mockup.html`
**Related:** `AI_manager_v2/docs/project/launch_checklist.md` (launch-gated items)

---

## 1. Motivation

Today's `/vault/profile` is a flat, single-column **form** (stacked labeled inputs + a subscription block + a red sign-out). It works but reads as a settings *form*, not a settings *home*, and it's styled with hardcoded `bg-black` + emerald/amber rather than the vault's CSS-variable theme.

This redesign reorganizes it into a grouped, row-list **Settings** home — modeled on the reference (avatar-less collapsed profile entry, uppercase section labels, cards of label-left / control-right rows, drill-in sub-pages) — rendered in HridAI's vault theme with full light + dark support (matching the chat). It also **relocates the dark-mode toggle** out of the chat header and mobile top bar into Settings → Preferences.

## 2. Scope

**In scope** — restyle the `/vault/profile` route only:
- New **Settings home** layout (sections: Profile settings, Preferences, Subscription, Data & Privacy, About, Footer).
- Three **drill-in sub-views**: Profile settings (edit), Manage subscription, Privacy settings.
- Relocate **Dark mode** toggle from `MobileTopBar` into Preferences; add **Language** (display-only) row.
- Switch the page from hardcoded colors to the vault theme variables.
- Wire all links/actions that already have backends (see §5).

**Out of scope** (tracked in `launch_checklist.md`):
- Migrating the **other** vault surfaces (icon rail, People/Todos/Dates/Topics/Lists/World/Self) to light mode — they stay fixed-dark for now (pre-existing). The Settings page itself **does** support light + dark (see §7).
- **Upgrade to Premium** wiring (greyed until launch), **i18n** (Language is display-only), **privacy-settings persistence**, **export** / **delete** endpoints, the **usage meter**, and sourcing plan strings from a backend table.
- The **Self page** (handled in a parallel session — do not touch `components/vault/self/*`).

## 3. Information architecture

Single route `/vault/profile` (title "Settings"), with **in-page sub-views** (not new routes):

```
Settings (home)
├─ Profile settings ▸  ───────────────▶ [sub] Profile settings (edit)
├─ Preferences: Dark mode (toggle) · Language (English ▸)
├─ Subscription: Current plan (Closed beta) · Manage subscription ▸ ─▶ [sub] Manage subscription
├─ Data & Privacy: Privacy settings ▸ ─▶ [sub] Privacy settings
│                  Export my data (soon) · Delete my data (soon) · Delete my account (soon)
├─ About: Version (2.0) · Terms ↗ · Privacy ↗ · Contact ↗
└─ Footer: HridAI wordmark · "Your personal AI manager" · Sign out
```

**Sub-views:**
- **Profile settings (edit):** Display name (+ Save), Email (read-only), Change password (+ show/hide eye, Update, "Send reset email instead"), User ID (+ copy).
- **Manage subscription:** Current plan (Closed beta), "What you get" line, **Upgrade to Premium** button (greyed/disabled until launch).
- **Privacy settings:** intro line + *Data sharing* card with Usage analytics, Crash reports, AI improvement toggles (Community insights excluded).

**Navigation:** sub-views are driven by component state; a back arrow returns to home. Mobile uses a slide-in transition; desktop swaps the column content. Rationale: keeps routing untouched (no `App.jsx` / `VaultLayout` changes, and the `isProfileActive` check in `VaultLayout` keeps working), and matches the reference's push-navigation feel.

## 4. Routing

Keep the existing `/vault/profile` route and the `/profile → /vault/profile` redirect to avoid churn. `MobileTopBar`'s gear continues to navigate to `/vault/profile`. The page is simply re-titled "Settings."

## 5. Wiring inventory

| Status | Item | Backed by |
|---|---|---|
| ✅ Wired | Display name + Save | `PUT /user/profile` |
| ✅ Wired | Email (read-only) | auth user |
| ✅ Wired | Change password + show/hide | Supabase `updatePassword` |
| ✅ Wired | Send reset email | `resetPassword` |
| ✅ Wired | User ID + copy | auth user + clipboard |
| ✅ Wired | Sign out | `signOut` + `clear()` |
| ✅ Wired | Terms / Privacy / Contact | existing `/terms` `/privacy` `/contact` routes, **opened in a new tab** |
| ✅ Wired | Dark mode toggle | `useTheme` (`.dark` on `<html>` + persist). Settings is built with `dark:` variants so it themes with the toggle — consistent with the chat. Other tabs stay dark (pre-existing). |
| 🟡 Caveat | Manage subscription | `/payments/portal` + `/payments/checkout` exist but no beta customers; surface informational page + greyed Upgrade for now |
| 🟡 Caveat | Current plan label / "What you get" | static strings now; source from backend plan table later |
| 🔴 Not wired | Upgrade to Premium | greyed until launch |
| 🔴 Not wired | Language | display-only (no i18n) |
| 🔴 Not wired | Privacy toggles | no backend store (not persisted) |
| 🔴 Not wired | Export my data | no endpoint (PRD 2F deferred) |
| 🔴 Not wired | Delete my data / account | no endpoint; deletion is Supabase-dashboard-only per project rules |
| ⛔ Removed | Conversations this week / usage meter | until tier enforcement |

## 6. Components

- **`pages/Profile.jsx`** — becomes the Settings container: owns auth data, the display-name fetch/save, and the active sub-view state. Renders one of: home / edit / subscription / privacy.
- **New `components/vault/settings/`:**
  - `SettingsHome.jsx` — the sectioned home.
  - `ProfileEdit.jsx` — the edit form (incl. password show/hide).
  - `ManageSubscription.jsx` — plan info + greyed upgrade.
  - `PrivacySettings.jsx` — data-sharing toggles.
  - `SettingsSection.jsx`, `SettingsRow.jsx`, `Toggle.jsx` — small shared primitives (row/toggle/section-label) used across the above.
- **Reuse:** the inline success/error message pattern already in `Profile.jsx` (and/or the `VaultLayout` toast) for Save/Update/Copy feedback; `lucide-react` icons; `useAuth`, `useTheme`, `lib/auth`, `lib/api`.

## 7. Styling

- **Theme via Tailwind `dark:` variants on a slate palette, matching the chat** (`bg-white dark:bg-slate-900` page, `bg-slate-50 dark:bg-slate-800` cards, `border-slate-200 dark:border-slate-700`, `text-slate-900 dark:text-slate-100`, secondary `text-slate-500 dark:text-slate-400`) — light defaults + dark overrides, so the page renders correctly in both themes and is visually consistent with the chat. Do **not** use the fixed-dark `--bg-*` vault variables for settings surfaces (they have no light values). Keep indigo accents and the amber→orange gradient for the (greyed) Upgrade CTA. Replaces the page's current hardcoded `bg-black` / emerald.
- Patterns from the mockup: uppercase section labels (`--text-tertiary`, `.1em` tracking); cards (`--bg-secondary`, 18px radius, `--border-subtle`); rows ~54px with inset hairline dividers; indigo toggles; chevron drill affordance; `Space Grotesk` headings / `DM Sans` body.
- **Responsive (mobile-first per frontend CLAUDE.md):** mobile full-width; desktop a centered column (~480px) inside the existing icon-rail shell. Sub-views: full-screen push on mobile, column swap on desktop.

## 8. Dark-mode relocation

- The vault has **two** theme toggles today: `MobileTopBar.jsx` (mobile) and the chat header inside the shared `demo/Chat.jsx` (line ~432, rendered in the vault via `ChatTab`). Relocate **both** into Settings → Preferences.
- Remove the toggle from `MobileTopBar.jsx`. Add a `showThemeToggle` prop to `Chat.jsx` (default `true`) and pass `false` from `ChatTab` so the vault chat hides it; the public demo (other `Chat` consumers) keeps its toggle since it has no settings page.
- Add a **Dark mode** toggle row in Preferences wired to the existing `useTheme()` hook (`isDark` / `toggle`).
- The chat already implements light/dark and the Settings page will too (§7), so the relocated toggle is fully meaningful. Migrating the remaining tabs to light is out of scope (see `launch_checklist.md`).

## 9. Legal links

`Terms of Service`, `Privacy Policy`, `Contact` open `/terms`, `/privacy`, `/contact` in a **new tab** (`<a target="_blank" rel="noopener noreferrer">`) so the user keeps their vault session. These are the same pages used by the public site footer.

## 10. States & data

- On mount: fetch display name (existing `GET /user/profile`); read `email`, `userId`, `plan` from `useAuth`.
- Save name / update password → success/error feedback; copy User ID → "Copied" feedback.
- Sign out → `signOut()` + `clear()` → navigate to `/login`.
- Plan label hardcoded to "Closed beta"; "What you get" hardcoded (both flagged for backend sourcing).

## 11. Testing / verification

No frontend unit-test framework exists (eslint only — see `package.json`). Verification is:
1. `npm run lint` and `npm run build` pass.
2. Manual check at **375px** and **1280px** (per frontend CLAUDE.md "Before Every UI PR").
3. Exercise real actions: display-name save, password update + eye toggle, send reset email, copy User ID, sign out, legal links open in a new tab, dark-mode toggle persists across reload, drill into and back out of each sub-view.
4. Verify the page renders correctly in **both light and dark** (consistent with the chat) and that the relocated toggle restyles it live.

## 12. Resolved decisions

- Page title "Settings"; route stays `/vault/profile`.
- Top = collapsed "Profile settings" row + Edit (no avatar/name); profile fields move to the edit sub-view.
- Preferences = Dark mode + Language (Language display-only).
- Subscription = Current plan ("Closed beta") + Manage subscription; Upgrade greyed, no price.
- Data & Privacy = Privacy settings (Usage analytics / Crash reports / AI improvement) + Export/Delete "Coming soon".
- About version = "2.0".
- Legal links open in a new tab.
- Sub-views via in-page state, not new routes.
