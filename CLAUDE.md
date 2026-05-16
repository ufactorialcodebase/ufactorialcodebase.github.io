# CLAUDE.md — Frontend (ufactorialcodebase.github.io)

## Project

HridAI frontend — React 19 + Vite + Tailwind CSS. Deployed via GitHub Pages.

## Commands

```bash
npm run dev       # Dev server (localhost:5173)
npm run build     # Production build to dist/
```

## Architecture

```
src/
├── components/vault/     # Vault UI (all user-facing views)
│   ├── todos/            # Todo system (TodosTab, TodoItem, TodayPanel, FilterBar, TagModal, CreateTodoForm)
│   ├── self/             # Self graph (identity, goals, preferences, hobbies, wellness)
│   ├── people/           # Entity views (people, orgs, places)
│   ├── topics/           # Topic list with expandable detail
│   ├── dates/            # Key dates
│   ├── lists/            # User-created lists (index + detail)
│   ├── world/            # Force graph visualization
│   ├── artifacts/        # Saved content/documents
│   ├── IconRail.jsx      # Desktop side navigation
│   ├── VaultLayout.jsx   # Main layout container
│   ├── ChatTab.jsx       # Chat interface
│   └── (shared)          # PageHeader, EmptyState, InlineEdit, SidePanel
├── pages/                # Route-level pages (Signup, Profile, Landing, etc.)
├── lib/
│   ├── api/              # API client functions (vault-todos.js, vault-entities.js, etc.)
│   ├── api-client.js     # Fetch wrapper with auth
│   ├── vault-cache.js    # Stale-while-revalidate cache
│   ├── supabase.js       # Supabase client
│   └── auth.js           # Auth helpers
├── hooks/                # useAuth
└── styles/               # vault-theme.css (CSS variables)
```

## Stack

- **React 19** + **Vite 7** (bundler)
- **Tailwind CSS 3** (utility-first, `darkMode: 'class'`)
- **Framer Motion** (animations)
- **Lucide React** (icons)
- **D3** (world graph)
- **Supabase** (auth)

## Styling

All styling uses Tailwind classes + CSS variables defined in `src/styles/vault-theme.css`. Key variables:

```css
--bg-primary: #0f1729    --text-primary: #e8edf5    --accent-indigo: #6366f1
--bg-secondary: #1a2238  --text-secondary: #8b95a8   --accent-amber: #f59e0b
--bg-tertiary: #243049   --text-tertiary: #5a6478    --accent-teal: #14b8a6
--border-subtle: rgba(255,255,255,0.06)              --status-resolved: #34d399
```

Fonts: `DM Sans` (body), `Space Grotesk` (headings).

## UI Development Process

### Responsive-First Rule

Every UI change must work on both phone (375px) and desktop (1280px+). **Write mobile layout first, then add `md:` overrides for desktop.** Never the other way around.

### Breakpoints

| Prefix | Width | Meaning |
|--------|-------|---------|
| (none) | <768px | Mobile (phone) — the default |
| `md:` | >=768px | Desktop (tablet/laptop) |

### Before Every UI PR

1. Check at **375px width** (phone) — Chrome DevTools → Responsive → iPhone SE/12
2. Check at **1280px+ width** (desktop)
3. If a component looks different at each size, it needs explicit responsive Tailwind classes
4. If it looks the same, it usually just works — but verify

### Mobile Layout (< 768px)

- **Navigation:** Bottom nav bar (Chat, Entities, Todos, World, More). Side IconRail is hidden.
- **Top bar:** Page title + action buttons + gear icon (rightmost). Gear → Account & Settings.
- **Chat top bar:** "HridAI" + BETA tag + gear.
- **"More" button:** Opens a grid sheet (3x2) with: Self, Dates, Lists, Topics, Artifacts.
- **Todo items:** Stacked layout — title full-width on row 1, meta/priority/due/action on row 2.
- **Todo detail:** Tap a todo → slide-up sheet with all fields editable.
- **No tooltips** on touch devices.
- **Delete buttons:** Always visible (not hover-dependent).
- **Dropdowns:** Native `<select>` elements work better on mobile than custom dropdowns.

### Desktop Layout (>= 768px)

- **Navigation:** Side IconRail (48px, left). No bottom nav.
- **Todo items:** Side-by-side layout (title left, priority/due/actions right with fixed widths).
- **Panels:** Side-by-side (e.g., Todos main + Today panel at 50/50).
- **Hover actions:** Show on hover (invisible by default, visible via `visibility`).
- **Tooltips:** Show on hover for icon rail items.

### Component Patterns

- **Responsive layout:** `flex flex-col md:flex-row` for stacking on mobile, side-by-side on desktop
- **Hide on mobile:** `hidden md:flex` or `hidden md:block`
- **Hide on desktop:** `md:hidden`
- **Mobile-only visible actions:** Remove `invisible`/`visible` hover logic, always show
- **Scrollable filter bars:** `overflow-x-auto` with `flex-nowrap` and hidden scrollbar

### Environment

- `.env.local` — test Supabase (development)
- `.env.production` — prod Supabase (deployed)
- `VITE_API_URL` — backend API base URL

### Backend Repo

The API backend is at `/Users/pratik/Projects/AI_manager_v2`. See that repo's CLAUDE.md for API endpoints, storage adapters, and backend conventions.
