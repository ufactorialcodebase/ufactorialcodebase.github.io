# HridAI Vault UX Redesign — Design Spec

**Date:** 2026-06-19
**Status:** Draft, second pass — awaiting user review
**Scope:** Frontend only (this repo). AI response voice / proactive-greeting tone are owned by `AI_manager_v2` and are explicitly out of scope.
**Companion mockups:** `.superpowers/brainstorm/64659-1781466749/content/`
**Backend reality references:** `~/Projects/AI_manager_v2/docs/project/NORTH_STAR.md`, `POSITIONING_AND_MOAT.md`, `PRD_H1_BETA.md`

---

## 1. Goal

Make the logged-in Vault experience demonstrably better at **(a) showing the moat** (trust through depth) and **(b) helping returning beta users feel that memory has grown** — within the limits of what H1 actually ships today.

The redesign must NOT depend on capabilities still being built (cross-domain emotional insight, trajectory direction beyond `new`/`stable`, per-episode emotional_state). Those are the H2 target shape; this spec ships the H1 version.

**Crucially, the redesign must ship to production code without changing the experience of existing prod users.** A new design lands behind a per-user feature flag (§2). Internal testers (Pratik first, then existing betas who opt in) see it; everyone else sees the current Vault unchanged.

### Outcomes we are optimizing for

In priority order:

1. **Trust through demonstrated depth.** When the user mentions an entity or topic, the ContextPanel surfaces narrative + decisions + open questions — not a flat fact card. That is the F1 connected-retrieval bet (`PRD_H1_BETA §4 F1`, shipped) made visible.
2. **"Returning beta felt the upgrade."** A single warm sentence on chat landing communicates real, captured deltas since the user's last visit (real diff, not totals — `last_seen_at` is in scope).
3. **Calmer surface.** Cut visual scaffolding (cluster the 9 desktop tabs into 4; simplify ContextPanel to one muted color family per role; drop dev-flavored UI).

### Non-goals (explicitly out of scope)

- Any change to AI response tone / proactive greeting content — that's the backend's job in `AI_manager_v2`.
- A separate "Today / Home" hero surface with proactive cross-domain insight moments (parked as H2 target — §9).
- Trajectory direction labels beyond `active`/`resolved`.
- A topic detail page (there is no walked-thread view today; the card self-contains its summary).
- Person detail rework — existing `EntityDetail` is fine; we just route to it.
- **Mobile structural rework.** Mobile's `BottomNav` and `MoreSheet` were chosen deliberately and stay. Mobile only inherits palette + card content changes.
- A user-facing "dev mode" toggle for retrieval debug info. Dropped items (StatsBar, Strategies, Query Type badges) are deleted, not hidden.

---

## 2. Coexistence with prod — the feature flag

**How the new design ships without touching existing prod users:** a per-user feature flag, evaluated entirely client-side first, with a backend hop available later when we want to sync across devices.

### 2.1 The flag

A single hook, `useFeatureFlag('vault_redesign')`, returns `true` for opted-in users and `false` for everyone else. Resolution order:

1. `localStorage.getItem('hridai_features')` → parsed JSON object. If `vault_redesign === true`, return true. (Per-device, instant, no backend.)
2. Supabase `auth.user_metadata.vault_redesign_optin === true` (optional sync layer — survives device changes). Set at sign-up via an allowlist of beta tester emails, or via the toggle.
3. `import.meta.env.VITE_VAULT_REDESIGN_DEFAULT === 'true'` — environment override. Used to force-on in `.env.local` for dev and on a Vercel preview deployment for QA.
4. Otherwise return `false`.

### 2.2 Where it's surfaced

- **`/vault/profile`** gains a small toggle: *"Try the new Vault (beta)"* with a one-line explanation. Toggling it sets the localStorage flag (and optionally writes to user metadata). A "Tell us what you think" link points to wherever you collect feedback.
- **Initial enable for first testers**: a tiny script run by you (Pratik) that, for specific user_ids, sets `auth.user_metadata.vault_redesign_optin = true`. Alternative: just flip the localStorage flag on your device.

### 2.3 Coexistence pattern at the component layer

For each surface that changes:
- Big structural changes (the rail, the ContextPanel) → **variant components**: keep current `IconRail.jsx` / `ContextPanel.jsx` untouched; add `IconRail.v2.jsx` / `ContextPanel.v2.jsx` next to them. A thin wrapper picks the right one based on the flag.
- Small skin/style changes (palette, microcopy on the welcome strip) → conditional internals inside the existing component, gated by the flag.

For the palette specifically: the current Vault uses CSS variables defined under `.vault-theme` (see `reference_vault_theming` — chat has light/dark but the rail + tabs are fixed-dark). The new warm palette ships as a **separate class** `vault-theme-warm` whose CSS variables override the same names. `VaultLayout.jsx` applies `vault-theme-warm` when the flag is on, `vault-theme` otherwise. No collision with existing variants.

### 2.4 Test → ship lifecycle

1. **Internal testing**: Pratik enables flag on his account; iterates against prod data.
2. **Beta opt-in**: turn on the Profile toggle for existing betas; they self-serve.
3. **Wider exposure**: change the default in `useFeatureFlag` from `false` → `true` (one-line change). Old codepath still present, off by default.
4. **Cleanup**: after some quiet weeks, delete the old components (`IconRail.jsx`, `ContextPanel.jsx`) and rename `*.v2.jsx` → drop the `.v2`. Single PR; no behavior change.

Rollback at any step: flip the default back; users can also revert via the toggle.

---

## 3. Visual register & frontend microcopy

This section is **only about UI surfaces** — the labels, headlines, button text, empty-state copy living in React code in this repo. AI-response tone is not specified here.

- **Type**: editorial sans (Inter / Söhne) for UI body and labels; a humanist serif (Source Serif Pro / Newsreader) for accent moments — greetings, big "since you were here" emphasis.
- **Palette**: warm neutrals — surfaces `#FBF8F3` / `#F2EDE4`; ink `#1f1a14`; accent `#FFF9F1` for the welcome strip; deep contrast `#2b211a` for active items. One muted color per role in cards: soft slate-blue for people, soft sage for topics, warm sand for episodes.
- **Microcopy register**: warm, first-person, observational. Examples used in this spec:
  - Welcome strip headline: *"Hi {name}. Welcome back."*
  - Welcome strip prose (post-`last_seen_at` shipping): *"It's been 17 days since we last talked. While you were away I learned about 5 new people and opened 3 new threads."*
  - ContextPanel idle subtitle: *"Recent threads, people, and moments — switches as you talk."*
  - Empty-state for brand-new user: *"Hi {name}. Let's start with whatever's on your mind."*

If the user later adopts a per-user voice preference in `AI_manager`, the frontend microcopy can be tightened to match; this spec doesn't lock it.

---

## 4. The design — what changes

### 4.1 Desktop rail — 9 tabs → 4 clusters

Replace `IconRail.jsx` (currently 9 flat tabs + Settings) with a 4-item rail. Each cluster (except Chat) expands on hover/click to a popover listing its sub-items, which navigate to the existing routes. **Routes themselves are unchanged.**

| Rail item | Suggested icon | Sub-items (existing routes preserved) |
|---|---|---|
| **Chat** | `MessageCircle` | (direct — no popover) `/vault/chat` |
| **You** | `User` | Self `/vault/self`, Dates `/vault/dates`, Todos `/vault/todos` |
| **Your World** | `Globe` | Graph (the World viz) `/vault/world` |
| **Your Vault** | `Archive` | People `/vault/people`, Threads `/vault/topics`, Lists `/vault/lists`, Artifacts `/vault/artifacts` |

**Note for the future**: People and Threads currently live under Your Vault. We may move them to Your World later, once we have a clearer split between "visual / connected" and "structured / inspectable." Spec'd as parked.

Behavioral details:
- Single-sub-item clusters (Your World → just Graph) navigate directly on click; popover only opens on hover.
- Active state: the rail item highlights when the user is on any of its sub-routes (so being on `/vault/people` highlights "Your Vault").
- Tooltip on each rail item showing the cluster name. First visit shows a small callout pointing at the rail.
- Settings/Profile stays at the bottom of the rail (unchanged).

### 4.2 Mobile — design only, no structural change

`BottomNav.jsx` and `MoreSheet.jsx` keep their current primary/more split (primary: Chat / Entities / Todos / World; more: Self / Dates / Lists / Topics / Artifacts). This was a deliberate mobile-only choice and we preserve it.

What mobile inherits from the redesign:
- The warm palette (via the `vault-theme-warm` CSS variables — applied to the whole `<VaultLayout>` element, so BottomNav and MobileTopBar get the new colors for free).
- The ContextPanel changes (rendered in the mobile slide-over via `useMobileContextPanel`).
- Welcome strip on the chat surface.

What mobile does NOT change:
- The four bottom tabs (Chat / Entities / Todos / World) or the More-sheet contents.
- The mobile-context-panel show/hide pattern in `VaultLayout`.

### 4.3 Chat landing — calmer left side

The default `/vault/chat` view becomes:

1. **Welcome strip** (top of the chat column).
   - Headline (serif italic accent): *"Hi {name}. Welcome back."* (or the empty-state variant for brand-new users).
   - One paragraph carrying the `since-you-were-here` real deltas (post-`last_seen_at` shipping) or graceful-degradation totals fallback (pre-shipping). See §5.
   - No card, no boxed numerals — warm prose with subtle serif emphasis on numbers.
2. **Proactive HridAI message** — uses the existing `Chat.jsx` initial-greeting pattern. No frontend changes to behavior or content; only the surrounding styling.
3. **Chat input** at the bottom.
4. **No pre-canned "pick a thread" pill row.** Removed — the proactive greeting already plays that role.

### 4.4 ContextPanel refresh

Apply the keep / simplify / drop decisions agreed in the v4 visual companion review:

**KEEP** (structural backbone):
- Three sections: **People & Places · Topics · Past Conversations**, collapsible, with counts.
- `EntityCard` shape: icon + canonical_name + entity_type chip + relationship_to_self + attributes-as-chips (first 3 keys of the `attributes` JSONB).
- `EpisodeCard` shape: quote preview + date.
- Section header for the panel.

**SIMPLIFY:**
- Color palette: one muted family per role (soft slate-blue for people, soft sage for topics, warm sand for episodes). Drop the bright variants (rose, purple, emerald, cyan, indigo, violet) and the type-specific palettes (organization vs location vs doctor).
- `TopicCard` content: replace the current `topic.context` snippet with three real fields from the data audit:
  - `current_summary` (100% populated — the gold)
  - `last_decision` (66% — render when present, omit when null)
  - `open_questions` (87% — render as short bulleted list, up to 3, "+N more" link)
  - Keep status chip (`active` / `resolved`) and `last_mentioned` date.
- "Signals Detected" section: collapse into a **single-line subtitle in the panel header** ("pulled context for: HridAI · conference · talk track"). Drop the per-signal-type sub-labels (Entities / Topics / Emotions / Time references) and their badge clouds.

**DROP** (delete from the new variant):
- `StatsBar` (`timing_ms`, strategies count, items count).
- "Retrieval Strategies" collapsible section.
- "Query Type" and "Follow-up" badges in Signals.
- "Emotions" sub-section in Signals (sparse population — 9%).
- Sentiment chip on TopicCard (skipped per user direction).
- The "Open the full thread →" footer link from the v4 mockup (no detail page exists; card self-contains).

**NEW:**
- **Idle state** (no message has been sent yet in this session) becomes the same three sections populated with **recent** items — last 3 topics, last 5 mentioned entities, last 3 episodes. Source: existing adapters (`get_recent_topics`, entities sorted by `last_interaction_at`, topic_mentions with a wider window for "moments"). Replaces the current centered `Brain` icon empty state.
- **Section header source label honesty**: rename "Past Conversations" to **"Recent moments"** — the items shown are `topic_mentions.context_snippet`, not `episodes.summary` (which is 0% populated). Wording is warmer too.
- **Pin / unpin per item**. Each card gets a small 📌 icon to lock a topic/person across topic switches. Pinned items stay until unpinned. localStorage initially; backend sync later if needed.
- **Click an EntityCard** → navigate to `/vault/people` with the entity pre-selected (opens existing `EntityDetail` inline). Use existing routing; no new component needed.

---

## 5. Data this design relies on — real fields, real population

Every UI element below maps to a real field with a known population rate from the `demo_demo_try_001` audit. If the field's population is low or absent, the element degrades gracefully (§6).

| UI element | Source field | Population today |
|---|---|---|
| EntityCard name + type | `kg_entities.canonical_name`, `entity_type` | 100% |
| EntityCard relationship line | `kg_entities.relationship_to_self` | varies |
| EntityCard attribute chips | `kg_entities.attributes` (JSONB) — first 3 keys | 100% of rows that have any |
| TopicCard name | `topic_graph.name` | 100% |
| TopicCard narrative | `topic_graph.current_summary` | **100%** |
| TopicCard "decided" line | `topic_graph.last_decision` | 66% — hidden when null |
| TopicCard "open questions" | `topic_graph.open_questions` (array) | 87% — hidden when empty |
| TopicCard status chip | `topic_graph.current_status` | 100% |
| TopicCard last-mentioned | `topic_graph.last_mentioned` | 100% |
| Recent-moments body | `topic_mentions.context_snippet` | well populated |
| Recent-moments date | `topic_mentions.conversation_at` | 100% |
| Header subtitle ("pulled context for: …") | entities + topics extracted from current message | varies per turn |
| Welcome-strip last-seen timestamp | `MAX(chat_transcripts.updated_at) WHERE user_id = ?` — used as proxy, no new column | 100% |
| Welcome-strip people delta | `count(kg_entities WHERE first_mentioned_at > <last-seen proxy>)` *(post-F7)* | 100% |
| Welcome-strip thread delta | `count(topic_graph WHERE first_mentioned > <last-seen proxy>)` | 100% |
| Welcome-strip totals fallback | `count(*) ` from each table *(pre-F7)* | 100% |

**Fields the design deliberately does not show** (sparse / not honest):

- `topic_graph.trajectory` direction beyond `new`/`stable`
- `topic_graph.typical_emotions`, `user_pattern_notes`, `tags`, `linked_self_aspects` (all ~0%)
- `topic_graph.overall_sentiment` (100% populated, but **skipped per user direction** — could feel intrusive)
- `episodes.summary` (0%)
- `episodes.emotional_state` (9%)
- `episodes.meeting_type`, `tier`, `episode_type` (0%)

---

## 6. Phasing — what ships when

Each phase ships behind the same feature flag (`vault_redesign`). Earlier phases land first; later phases enhance. Until you flip the default, only opted-in users see anything new.

| Phase | Scope | Surface area | Backend | Risk |
|---|---|---|---|---|
| **F0** | `useFeatureFlag` hook + `vault-theme-warm` CSS class shell + Profile toggle | `hooks/useFeatureFlag.js`, `styles/vault-theme-warm.css`, `pages/Profile.jsx` | none | low |
| **F1** | Palette swap — warm CSS vars become active on the flag (desktop + mobile both) | CSS vars only; no component changes | none | low |
| **F2** | Welcome strip on `/vault/chat` (totals fallback wording until F7) | new `WelcomeStrip.jsx`; mount in `ChatTab.jsx` behind flag | counts via existing adapters | low |
| **F3** | ContextPanel.v2: drop StatsBar / Strategies / Query Type / Emotions; fold Signals into header; one color per role | new `ContextPanel.v2.jsx` next to existing; wrapper picks based on flag | none | low |
| **F4** | TopicCard upgrade — surface `current_summary` + `last_decision` + `open_questions` | `ContextPanel.v2.jsx` `TopicCard` | retrieval API must expose these fields (verify; likely already returned) | low–medium |
| **F5** | Idle-state recent items (replaces Brain-icon empty state) | `ContextPanel.v2.jsx` fetches on mount when no `retrievalTrace` | new `GET /context/recent` endpoint returning the three lists | medium |
| **F6** | Desktop rail clusters (9 → 4) | `IconRail.v2.jsx` + `RailClusterPopover.jsx`; `VaultLayout` picks v1/v2 by flag | none | medium |
| **F7** | Real last-seen diff in welcome strip — uses `MAX(chat_transcripts.updated_at)` as proxy | `WelcomeStrip.jsx` reads the proxy and computes deltas | no new column; either reuse existing chat transcripts endpoint or add a tiny `GET /sessions/last-seen` helper if cleaner | low |
| **F8** | Pin / unpin per item | per-card 📌; localStorage | optional backend sync table | low |
| **(post-promote)** | Default-flip → cleanup: delete v1 components | rename `*.v2.jsx`, remove old files | none | low |

**Recommended ship order**: F0 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → promote.

F7 uses `MAX(chat_transcripts.updated_at)` per user as the last-seen proxy (no new backend column). The welcome strip ships totals-language at F2 and tightens to real diff language at F7. See §3 microcopy variants.

---

## 7. Graceful degradation

When a field used by the design is null / empty:

- **Entity attributes empty** → EntityCard renders without the chip row; name + type alone is fine.
- **`last_decision` absent** → omit the decided-line; TopicCard still shows narrative and any open questions.
- **`open_questions` empty** → omit the bulleted list.
- **Both decision + questions absent** → TopicCard is narrative-only.
- **No `last_mentioned`** → omit the date footer.
- **No retrieval trace AND no recent items** → an empty welcoming state (warm copy, no Brain icon).
- **Brand-new user, zero data** → welcome strip swaps to: *"Hi {name}. Let's start with whatever's on your mind."* No counts.
- **`last_seen_at` not yet populated (pre-F7 or first ever visit)** → totals wording, not diff wording.

---

## 8. Open questions

Most of the originals are now resolved (see locked decisions above). What remains:

1. **Where to store the localStorage flag key naming** — propose `hridai_features` as the parent JSON object so other future flags can stack inside it.
2. **Beta opt-in onboarding wording** — the toggle copy on Profile (*"Try the new Vault (beta)"*) — final wording. Not blocking; can be polished pre-ship.
3. **Vercel preview deploy URL for QA** — if you want a stable preview URL with the flag default-on, I can write the config to add a `preview` branch with `VITE_VAULT_REDESIGN_DEFAULT=true`. Optional.

---

## 9. H2 target shape (parked, not built)

The "Today" surface from the earlier Approach 1 — proactive cross-domain insight hero card, threads-picking-up grid, World viz cameo, returning-beta delta digest — is the eventual home for the moat. It is **not built** in this spec because it depends on backend capabilities still landing:

- Cross-domain emotional insight prompt (`PRD_H1_BETA §7`)
- `topic_graph.trajectory` reliably populated beyond `new`/`stable` (currently 86% "new" — ISS-124)
- `episodes.emotional_state` populated meaningfully above 9% (ISS-123)

When those land, adding the Today surface is **additive** to this spec — a new route, a new component, no changes to the rail or the ContextPanel. No rewrite.

---

## 10. Files affected (best-current estimate)

A guide for implementation planning, not a contract. The flag wrapper pattern means most new files live next to (not in place of) existing ones.

**New (F0–F8)**:
- `src/hooks/useFeatureFlag.js`
- `src/styles/vault-theme-warm.css`
- `src/components/vault/WelcomeStrip.jsx`
- `src/components/demo/ContextPanel.v2.jsx`
- `src/components/demo/ContextPanelContainer.jsx` *(thin picker)*
- `src/components/vault/IconRail.v2.jsx`
- `src/components/vault/IconRailContainer.jsx` *(thin picker)*
- `src/components/vault/RailClusterPopover.jsx`
- `src/lib/api/vault-recent.js` *(F5 endpoint client)*
- Optional: a small migration helper for setting `auth.user_metadata` for initial allowlisted testers

**Modified**:
- `src/components/vault/VaultLayout.jsx` — applies `vault-theme` vs `vault-theme-warm` based on flag; mounts the container components
- `src/components/vault/ChatTab.jsx` — mounts `WelcomeStrip` behind flag
- `src/components/demo/Chat.jsx` — mounts `ContextPanelContainer` (or its existing ContextPanel import becomes the container)
- `src/pages/Profile.jsx` — adds the "Try the new Vault (beta)" toggle

**Backend (`AI_manager_v2/`)** — minimal additions only, separate ISS tickets:
- F5: `GET /context/recent` returning recent topics/entities/moments for the idle ContextPanel
- F7: no new column. Either reuse an existing endpoint that returns chat transcripts (and read `MAX(updated_at)` client-side) or add a tiny `GET /sessions/last-seen` helper. No migration needed.

---

## 11. How a tester verifies the redesign without affecting prod

The intended flow for you (and any beta opt-in):

1. **Sign in to prod as yourself.**
2. Navigate to `/vault/profile`. Toggle **"Try the new Vault (beta)"** on.
3. The page state changes immediately — `vault-theme-warm` palette applies, the rail renders the 4-cluster layout, ContextPanel renders v2, welcome strip appears on `/vault/chat`.
4. Use it normally. All data is your real prod data via the prod Supabase.
5. To revert: toggle off. The flag clears, original `vault-theme` reapplies, original components render.

Other prod users who haven't toggled see exactly today's UI. There is no shared codepath that affects them.

For deeper isolation when needed (e.g. trying breaking changes against staging): set `VITE_VAULT_REDESIGN_DEFAULT=true` in a Vercel preview deploy, pointing at the test Supabase. Internal QA only.

---

## 12. Success criteria

We will consider this redesign successful if, by the end of the next H1 beta cycle:

1. Opted-in beta users (existing + new) reach their second session at a higher rate than the unflagged baseline. Target: +20 pp over 4 weeks of flag exposure.
2. Returning betas in qualitative interviews say something like *"it feels like it knows more / has more on it"* — a self-report signal that the welcome strip + upgraded TopicCard land.
3. Session length holds steady or grows.
4. Zero tickets filed about the dropped UI elements (StatsBar, Strategies, Query Type, Emotions sub-section) — they weren't doing user-facing work.
5. Zero negative feedback from non-opted-in users — the flag isolation worked.

Failure modes to watch for:

- Users don't find the Profile toggle. Mitigation: a brief one-time banner on `/vault/chat` for whitelisted testers pointing at it.
- TopicCard becomes too dense once narrative + decision + questions are stacked. Mitigation: max-height + "show more" expand.
- Rail-cluster icons aren't discoverable. Mitigation: tooltips on hover; first-visit callout already in the spec.
- Idle-state recent items feel stale (last-activity, not "what matters today"). Acknowledged limit; the proactive "Today" surface in §9 is the real fix, deferred.

---

*End of spec. Companion mockups: `.superpowers/brainstorm/64659-1781466749/content/`. Implementation plan to follow this spec's approval.*
