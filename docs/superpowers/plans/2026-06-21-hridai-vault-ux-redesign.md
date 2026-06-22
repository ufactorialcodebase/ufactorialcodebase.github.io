# HridAI Vault UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a calmer, depth-demonstrating Vault redesign behind a per-user feature flag, so internal testers and opted-in betas can use it on prod while everyone else sees today's UI unchanged.

**Architecture:** Per-user feature flag (`useFeatureFlag('vault_redesign')`) gates all changes. Big structural changes ship as variant components (`*.v2.jsx`) next to the existing ones, with a thin container picking which to render. Palette swap ships as a parallel CSS class (`vault-theme-warm`). Mobile structure is preserved; only palette and card content changes apply there. Backend additions for F5 (`GET /context/recent`) and F7 (last-seen proxy) are filed as separate ISS tickets in `AI_manager_v2` and stubbed in the frontend until they land.

**Tech Stack:** React 18 + Vite, React Router, Tailwind, lucide-react, framer-motion (existing). Adding: Vitest + @testing-library/react + happy-dom for unit and component tests (no current test infra).

**Spec:** `docs/superpowers/specs/2026-06-14-hridai-vault-ux-redesign-design.md` (read first).

**Branch:** `product-experience/vault-ux-redesign` (this worktree).

---

## Overview

The work breaks into 9 ship-able phases (F0–F8 from the spec) plus a post-promote cleanup phase. Each phase is independently shippable and can be flipped on for testers as soon as it lands. Tasks below number sequentially across all phases.

| Phase | Tasks | What ships |
|---|---|---|
| F0 | 1–6 | Test infra, `useFeatureFlag`, theme scaffold, Profile toggle |
| F1 | 7 | Warm palette CSS vars (visible when flag on) |
| F2 | 8–10 | `WelcomeStrip` component on `/vault/chat` (totals wording) |
| F3 | 11–14 | `ContextPanel.v2` shell — dropped sections, one color per role |
| F4 | 15–17 | `TopicCard` upgrade — narrative + decision + open questions |
| F5 | 18–21 | Idle-state recent items (with backend stub until ISS lands) |
| F6 | 22–26 | Desktop rail 9 tabs → 4 cluster icons |
| F7 | 27–29 | Real last-seen diff using `MAX(chat_transcripts.updated_at)` |
| F8 | 30–32 | Pin/unpin per item in ContextPanel cards |
| Post | (deferred) | Flip default, delete v1 components, rename v2 → drop suffix |

Each task ends with a commit. Phases ending in a user-visible change end with a manual smoke-test step.

---

## Setup verification (do this once before Task 1)

- [ ] **Confirm you are in the worktree** — not the main checkout.

```bash
pwd
# Expected: .../ufactorialcodebase.github.io/.worktrees/product-experience/vault-ux-redesign
git branch --show-current
# Expected: product-experience/vault-ux-redesign
git status --short
# Expected: (clean — no uncommitted changes)
```

- [ ] **Install existing dependencies and verify dev server boots.**

```bash
npm install
npm run dev
```

Expected: Vite logs `Local: http://localhost:5173/`. Open it. Sign in to prod. Confirm the existing Vault loads at `/vault/chat`. Then `Ctrl+C` to stop.

- [ ] **Confirm `.gitignore` already ignores `.worktrees/` and `.superpowers/`.** (Done in the prep commit on main — `b2201df`.)

```bash
grep -E "\.worktrees|\.superpowers" .gitignore
# Expected: both lines present
```

---

## Task 1: Test infrastructure (Vitest + React Testing Library)

**Files:**
- Create: `vitest.config.js`
- Create: `src/test/setup.js`
- Modify: `package.json` (add deps + `test` script)
- Create: `src/test/example.test.js` (smoke test, deleted after Task 2)

- [ ] **Step 1: Install dev dependencies.**

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom @vitest/coverage-v8
```

- [ ] **Step 2: Create `vitest.config.js`.**

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/', 'dist/', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Create `src/test/setup.js`.**

```javascript
// src/test/setup.js
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})
```

- [ ] **Step 4: Add scripts to `package.json`.**

In `package.json`, add to `scripts`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 5: Write smoke test.**

```javascript
// src/test/example.test.js
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('test infrastructure smoke test', () => {
  it('renders text and finds it', () => {
    render(<div>hello</div>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the smoke test.**

```bash
npm run test:run -- src/test/example.test.js
```

Expected: `1 passed`.

- [ ] **Step 7: Delete smoke test and commit.**

```bash
rm src/test/example.test.js
git add vitest.config.js src/test/setup.js package.json package-lock.json
git commit -m "chore(test): add Vitest + RTL + happy-dom for component tests"
```

---

## Task 2: `useFeatureFlag` hook

**Files:**
- Create: `src/hooks/useFeatureFlag.js`
- Create: `src/hooks/useFeatureFlag.test.js`

- [ ] **Step 1: Write the failing test.**

```javascript
// src/hooks/useFeatureFlag.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFeatureFlag, setFeatureFlag } from './useFeatureFlag'

describe('useFeatureFlag', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns false when flag is unset', () => {
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(false)
  })

  it('returns true when flag is set in localStorage', () => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(true)
  })

  it('returns false when flag is explicitly false in localStorage', () => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: false }))
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(false)
  })

  it('returns false when localStorage has malformed JSON', () => {
    localStorage.setItem('hridai_features', 'not-json{')
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(false)
  })

  it('returns false for unknown flag names', () => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    const { result } = renderHook(() => useFeatureFlag('something_else'))
    expect(result.current).toBe(false)
  })

  it('setFeatureFlag updates localStorage and triggers re-render', () => {
    const { result } = renderHook(() => useFeatureFlag('vault_redesign'))
    expect(result.current).toBe(false)

    act(() => { setFeatureFlag('vault_redesign', true) })
    expect(result.current).toBe(true)

    act(() => { setFeatureFlag('vault_redesign', false) })
    expect(result.current).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails.**

```bash
npm run test:run -- src/hooks/useFeatureFlag.test.js
```

Expected: FAIL — cannot resolve `./useFeatureFlag`.

- [ ] **Step 3: Implement the hook.**

```javascript
// src/hooks/useFeatureFlag.js
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'hridai_features'

function readFlags() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Read a per-user feature flag.
 *
 * Resolution order:
 *   1. localStorage `hridai_features.<flagName>` (per-device, instant)
 *   2. import.meta.env.VITE_<FLAGNAME>_DEFAULT === 'true' (env override for QA preview)
 *   3. false
 *
 * @param {string} flagName e.g. 'vault_redesign'
 * @returns {boolean}
 */
export function useFeatureFlag(flagName) {
  const [enabled, setEnabled] = useState(() => readFlags()[flagName] === true)

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setEnabled(readFlags()[flagName] === true)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [flagName])

  // Env override — applied last (highest precedence for QA preview builds)
  const envKey = `VITE_${flagName.toUpperCase()}_DEFAULT`
  if (import.meta.env[envKey] === 'true') return true

  return enabled
}

/**
 * Write a feature flag to localStorage (used by the Profile toggle).
 */
export function setFeatureFlag(flagName, value) {
  const flags = readFlags()
  flags[flagName] = !!value
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  // Synthesise a storage event for the current tab (default storage event only fires across tabs).
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
}
```

- [ ] **Step 4: Run tests to verify they pass, commit.**

```bash
npm run test:run -- src/hooks/useFeatureFlag.test.js
# Expected: 6 passed
git add src/hooks/useFeatureFlag.js src/hooks/useFeatureFlag.test.js
git commit -m "feat(flag): add useFeatureFlag hook + setFeatureFlag setter

Reads vault_redesign flag from localStorage hridai_features object.
Reactive via storage event. Includes env-var override for QA preview."
```

---

## Task 3: Warm theme CSS scaffold

**Files:**
- Create: `src/styles/vault-theme-warm.css`
- Modify: `src/index.css` (import)

- [ ] **Step 1: Create the warm theme stylesheet with EMPTY overrides.**

```css
/* src/styles/vault-theme-warm.css
 *
 * Warm palette applied when the vault_redesign feature flag is on.
 * Filled in by Task 7 (F1). For now this is a scaffolding stub
 * containing only the class definition — values will be populated
 * with the real palette in F1.
 */

.vault-theme-warm {
  /* Filled in Task 7. */
}
```

- [ ] **Step 2: Import in `src/index.css`.**

Find the top of `src/index.css` and add this import below any existing CSS imports:

```css
@import './styles/vault-theme-warm.css';
```

- [ ] **Step 3: Verify build still passes.**

```bash
npm run build
```

Expected: `built in ...ms` with no errors.

- [ ] **Step 4: Commit.**

```bash
git add src/styles/vault-theme-warm.css src/index.css
git commit -m "feat(theme): add vault-theme-warm CSS scaffold (empty, filled in F1)"
```

---

## Task 4: `VaultLayout` applies theme class based on flag

**Files:**
- Modify: `src/components/vault/VaultLayout.jsx`
- Create: `src/components/vault/VaultLayout.test.jsx`

- [ ] **Step 1: Write the failing test.**

```javascript
// src/components/vault/VaultLayout.test.jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VaultLayout from './VaultLayout'
import { AuthProvider } from '../../hooks/useAuth.jsx'
import { setFeatureFlag } from '../../hooks/useFeatureFlag'

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/vault/chat']}>
      <AuthProvider>
        <VaultLayout />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('VaultLayout theme class', () => {
  beforeEach(() => { localStorage.clear() })

  it('applies vault-theme class by default (flag off)', () => {
    const { container } = renderLayout()
    const root = container.querySelector('.vault-theme, .vault-theme-warm')
    expect(root).toHaveClass('vault-theme')
    expect(root).not.toHaveClass('vault-theme-warm')
  })

  it('applies vault-theme-warm when flag is on', () => {
    setFeatureFlag('vault_redesign', true)
    const { container } = renderLayout()
    const root = container.querySelector('.vault-theme, .vault-theme-warm')
    expect(root).toHaveClass('vault-theme-warm')
    expect(root).not.toHaveClass('vault-theme')
  })
})
```

- [ ] **Step 2: Run to verify it fails.**

```bash
npm run test:run -- src/components/vault/VaultLayout.test.jsx
```

Expected: FAIL — second test asserts wrong class.

- [ ] **Step 3: Modify `VaultLayout.jsx` to switch theme classes.**

In `src/components/vault/VaultLayout.jsx`:

```javascript
// Add import at top, after existing imports
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
```

Then hoist a `themeClass` variable inside the component body, BEFORE the early returns:

```javascript
export default function VaultLayout() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { refreshSubscription } = useAuth()
  const [toast, setToast] = useState(null)
  const [mobileContextOpen, setMobileContextOpen] = useState(false)
  const themeClass = useFeatureFlag('vault_redesign') ? 'vault-theme-warm' : 'vault-theme'
  // ... rest unchanged
```

And the outer wrapper changes from:

```jsx
<div className="vault-theme h-dvh flex flex-col md:flex-row bg-[var(--bg-primary)]">
```

to:

```jsx
<div className={`${themeClass} h-dvh flex flex-col md:flex-row bg-[var(--bg-primary)]`}>
```

- [ ] **Step 4: Run tests, commit.**

```bash
npm run test:run -- src/components/vault/VaultLayout.test.jsx
# Expected: 2 passed
git add src/components/vault/VaultLayout.jsx src/components/vault/VaultLayout.test.jsx
git commit -m "feat(theme): VaultLayout switches between vault-theme and vault-theme-warm by flag"
```

---

## Task 5: Profile toggle for the flag

**Files:**
- Create: `src/components/vault/settings/FeatureFlagsSection.jsx`
- Create: `src/components/vault/settings/FeatureFlagsSection.test.jsx`
- Modify: `src/pages/Profile.jsx`
- Modify: `src/components/vault/settings/SettingsHome.jsx` (read first to mirror its nav-item pattern)

- [ ] **Step 1: Inspect Settings sub-views to mirror the pattern.**

```bash
ls src/components/vault/settings/
# Expected: SettingsHome.jsx, ProfileEdit.jsx, ManageSubscription.jsx, PrivacySettings.jsx
grep -n "view\|setView\|navigate\|onClick" src/components/vault/settings/SettingsHome.jsx | head -20
```

We'll add a new sub-view `'features'` similarly to how `'privacy'` is wired.

- [ ] **Step 2: Write the failing test.**

```javascript
// src/components/vault/settings/FeatureFlagsSection.test.jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeatureFlagsSection from './FeatureFlagsSection'

describe('FeatureFlagsSection', () => {
  beforeEach(() => { localStorage.clear() })

  it('renders the vault_redesign toggle, off by default', () => {
    render(<FeatureFlagsSection />)
    const toggle = screen.getByRole('switch', { name: /try the new vault/i })
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('toggling on writes to localStorage', async () => {
    const user = userEvent.setup()
    render(<FeatureFlagsSection />)
    const toggle = screen.getByRole('switch', { name: /try the new vault/i })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    const stored = JSON.parse(localStorage.getItem('hridai_features'))
    expect(stored.vault_redesign).toBe(true)
  })

  it('reads existing localStorage state on mount', () => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    render(<FeatureFlagsSection />)
    const toggle = screen.getByRole('switch', { name: /try the new vault/i })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})
```

- [ ] **Step 3: Run to verify it fails.**

```bash
npm run test:run -- src/components/vault/settings/FeatureFlagsSection.test.jsx
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement the component.**

```javascript
// src/components/vault/settings/FeatureFlagsSection.jsx
import { useFeatureFlag, setFeatureFlag } from '../../../hooks/useFeatureFlag'

export default function FeatureFlagsSection() {
  const enabled = useFeatureFlag('vault_redesign')

  const onToggle = () => setFeatureFlag('vault_redesign', !enabled)

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Experiments</h2>
      <p className="text-sm text-[var(--text-tertiary)]">
        Try in-progress features early. Toggle off anytime to return to the current Vault.
      </p>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
        <button
          role="switch"
          type="button"
          aria-checked={enabled}
          aria-label="Try the new Vault (beta)"
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            enabled ? 'bg-[var(--accent-indigo)]' : 'bg-[var(--border-active)]'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">Try the new Vault (beta)</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
            A calmer redesign with a warm palette and a refreshed context panel. Your data is unchanged.
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass.**

```bash
npm run test:run -- src/components/vault/settings/FeatureFlagsSection.test.jsx
# Expected: 3 passed
```

- [ ] **Step 6: Wire into Profile.**

In `src/pages/Profile.jsx`, add the import:

```javascript
import FeatureFlagsSection from '../components/vault/settings/FeatureFlagsSection'
```

And add the conditional render alongside other views (`view === 'features'`):

```javascript
{view === 'features' && (
  <div className="max-w-2xl mx-auto p-6">
    <button onClick={() => setView('home')} className="text-sm text-[var(--text-tertiary)] mb-4 hover:text-[var(--text-primary)]">← Back</button>
    <FeatureFlagsSection />
  </div>
)}
```

In `src/components/vault/settings/SettingsHome.jsx`, READ the file first to see the nav-item shape. Add an "Experiments" entry mirroring the existing items:

```javascript
{ label: 'Experiments', sub: 'Try features in beta', onClick: () => setView('features'), icon: '🧪' }
```

(Adjust to the EXACT structure already in the file — don't invent fields it doesn't use.)

- [ ] **Step 7: Run all tests; commit.**

```bash
npm run test:run
# Expected: all green (FeatureFlagsSection 3, VaultLayout 2, useFeatureFlag 6)
git add src/components/vault/settings/FeatureFlagsSection.jsx src/components/vault/settings/FeatureFlagsSection.test.jsx src/pages/Profile.jsx src/components/vault/settings/SettingsHome.jsx
git commit -m "feat(flag): Profile gains 'Experiments' section with vault_redesign toggle"
```

- [ ] **Step 8: Manual smoke test.**

```bash
npm run dev
```

Open `http://localhost:5173`, sign in, navigate to Profile → Experiments. Toggle on. Confirm:
- Toggle visually flips
- `localStorage.getItem('hridai_features')` in console shows `{"vault_redesign":true}`
- Toggle off → back to `false`

No visible Vault changes yet — the flag is just wired.

---

## Task 6: F0 phase-close

- [ ] **Step 1: Confirm all F0 commits are in place.**

```bash
git log --oneline | head -10
```

Expected: most recent commits cover test infra, useFeatureFlag, vault-theme-warm scaffold, VaultLayout theme switching, Profile toggle.

- [ ] **Step 2: Push to remote.**

```bash
git push
```

---

## Task 7: F1 — fill in the warm palette

**Files:**
- Modify: `src/styles/vault-theme-warm.css`

- [ ] **Step 1: Read the existing palette to mirror its var names.**

```bash
cat src/styles/vault-theme.css | head -50
```

Note the var names: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--border-subtle`, `--border-active`, `--accent-indigo`, and entity-type accents.

- [ ] **Step 2: Fill in the warm palette overrides.**

Replace the contents of `src/styles/vault-theme-warm.css` with:

```css
/* src/styles/vault-theme-warm.css
 *
 * Warm palette applied when the vault_redesign feature flag is on.
 * Mirrors the var names from vault-theme.css so existing components
 * pick this up automatically.
 */

.vault-theme-warm {
  /* Backgrounds — warm neutrals */
  --bg-primary: #FBF8F3;
  --bg-secondary: #F2EDE4;
  --bg-tertiary: #E8E0D0;

  /* Text — deep ink */
  --text-primary: #1f1a14;
  --text-secondary: #5b4c39;
  --text-tertiary: #8a7a64;

  /* Borders */
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-active: rgba(0, 0, 0, 0.15);

  /* Accent — one warm primary; muted secondaries */
  --accent-indigo: #2b211a;            /* repurposed as "ink-on-warm" primary action */
  --accent-warm:   #c97f3a;            /* new — for the welcome strip accent + key highlights */
  --accent-rose:   #884444;
  --accent-teal:   #4f6b4f;
  --accent-amber:  #a0773b;
  --accent-violet: #5a3e8a;
  --accent-cyan:   #336669;

  /* Entity type colors — one muted family per role */
  --entity-person: #4d6688;            /* soft slate-blue */
  --entity-org:    #6e4d1e;            /* warm brown */
  --entity-place:  #4f6b4f;            /* soft sage */
  --entity-other:  #5b4c39;            /* warm neutral */
}
```

- [ ] **Step 3: Manual smoke test.**

```bash
npm run dev
```

Open Vault with the flag ON (Profile → Experiments → toggle). Navigate `/vault/chat`. Confirm:
- Background turns cream
- Text becomes dark ink
- Rail still works but in warmer tones
- Active item highlight is the dark ink (not bright indigo)

Compare with flag OFF — should look exactly as it does today.

Things that will look ROUGH (expected; cleaned in later phases):
- The ContextPanel still uses its own per-type bright colors (rose/purple/emerald). That's the F3 work.
- Welcome strip is not yet present — that's F2.

- [ ] **Step 4: Commit + push.**

```bash
git add src/styles/vault-theme-warm.css
git commit -m "feat(theme): fill in warm palette CSS vars for vault-theme-warm (F1)"
git push
```

---

## Task 8: `WelcomeStrip` component shell

**Files:**
- Create: `src/components/vault/WelcomeStrip.jsx`
- Create: `src/components/vault/WelcomeStrip.test.jsx`

- [ ] **Step 1: Write the failing test.**

```javascript
// src/components/vault/WelcomeStrip.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WelcomeStrip from './WelcomeStrip'

describe('WelcomeStrip — totals variant', () => {
  it('renders greeting with name', () => {
    render(<WelcomeStrip name="Pratik" counts={{ people: 118, threads: 139, decisions: 92, openQuestions: 122 }} />)
    expect(screen.getByText(/Hi Pratik/i)).toBeInTheDocument()
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
  })

  it('renders all four counts in totals wording', () => {
    render(<WelcomeStrip name="Pratik" counts={{ people: 118, threads: 139, decisions: 92, openQuestions: 122 }} />)
    expect(screen.getByText(/139 threads/)).toBeInTheDocument()
    expect(screen.getByText(/92/)).toBeInTheDocument()
    expect(screen.getByText(/122/)).toBeInTheDocument()
    expect(screen.getByText(/118 people/)).toBeInTheDocument()
  })

  it('renders the brand-new-user variant when counts are all zero', () => {
    render(<WelcomeStrip name="Pratik" counts={{ people: 0, threads: 0, decisions: 0, openQuestions: 0 }} />)
    expect(screen.getByText(/Let's start with whatever's on your mind/i)).toBeInTheDocument()
    expect(screen.queryByText(/threads/)).not.toBeInTheDocument()
  })

  it('uses "there" fallback when name is missing', () => {
    render(<WelcomeStrip counts={{ people: 1, threads: 1, decisions: 1, openQuestions: 1 }} />)
    expect(screen.getByText(/Hi there/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails.**

```bash
npm run test:run -- src/components/vault/WelcomeStrip.test.jsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component.**

```javascript
// src/components/vault/WelcomeStrip.jsx
/**
 * Warm welcome strip at the top of /vault/chat for opted-in users.
 *
 * Three variants:
 *   - brand-new: no counts, gentle prompt
 *   - totals (pre-F7): "I'm holding N threads…"
 *   - diff   (post-F7): "It's been N days… X new people, Y new threads."
 *
 * The diff variant is wired in Task 28 (F7). For now this file ships the
 * brand-new + totals variants.
 */
export default function WelcomeStrip({ name, counts, daysSince = null, deltas = null }) {
  const displayName = name || 'there'
  const isBrandNew = !counts || (counts.people === 0 && counts.threads === 0)

  if (isBrandNew) {
    return (
      <section aria-label="Welcome" className="px-8 pt-6 pb-5 border-b border-[var(--border-subtle)]">
        <h2 className="font-serif text-2xl text-[var(--text-primary)] leading-tight">
          Hi {displayName}. <em className="text-[var(--text-secondary)]">Let's start with whatever's on your mind.</em>
        </h2>
      </section>
    )
  }

  const { people, threads, decisions, openQuestions } = counts
  const hasDiff = daysSince != null && deltas

  return (
    <section aria-label="Welcome" className="px-8 pt-6 pb-5 border-b border-[var(--border-subtle)]">
      <h2 className="font-serif text-2xl text-[var(--text-primary)] leading-tight">
        Hi {displayName}. <em className="text-[var(--text-secondary)]">Welcome back.</em>
      </h2>
      {hasDiff ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-6 max-w-2xl">
          It's been <Num>{daysSince} days</Num> since we last talked. While you were away I learned about <Num>{deltas.newPeople ?? 0} new people</Num> and opened <Num>{deltas.newThreads ?? 0} new threads</Num>. <Num>{decisions}</Num> decisions, <Num>{openQuestions}</Num> open questions across everything I'm holding.
        </p>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-6 max-w-2xl">
          I'm holding <Num>{threads} threads</Num> for you right now — <Num>{decisions}</Num> with a decision you've captured, <Num>{openQuestions}</Num> with something still open. <Num>{people} people</Num> across them.
        </p>
      )}
    </section>
  )
}

function Num({ children }) {
  return <span className="font-serif text-[var(--text-primary)]">{children}</span>
}
```

- [ ] **Step 4: Run tests, commit.**

```bash
npm run test:run -- src/components/vault/WelcomeStrip.test.jsx
# Expected: 4 passed
git add src/components/vault/WelcomeStrip.jsx src/components/vault/WelcomeStrip.test.jsx
git commit -m "feat(welcome): add WelcomeStrip with totals + brand-new + diff variants

Diff variant wires up in Task 28 (F7); component supports all three from
day one so we only modify ChatTab in the F7 task."
```

---

## Task 9: Wire `WelcomeStrip` into `ChatTab` behind the flag

**Files:**
- Create: `src/lib/api/vault-counts.js`
- Modify: `src/components/vault/ChatTab.jsx`

- [ ] **Step 1: Create a thin counts client.**

```javascript
// src/lib/api/vault-counts.js
/**
 * Get totals (and raw lists) for the welcome strip — count of entities,
 * topics, topics with a captured decision, topics with non-empty open
 * questions.
 *
 * Returns _rawTopics / _rawEntities alongside counts so F7 can compute
 * deltas without a second fetch.
 */
import { getEntities } from './vault-entities.js'
import { getTopics } from './vault-topics.js'

export async function getWelcomeCounts() {
  const [eRes, tRes] = await Promise.all([
    getEntities().catch(() => ({ entities: [] })),
    getTopics().catch(() => ({ topics: [] })),
  ])
  const entities = eRes.entities || []
  const topics = tRes.topics || []
  return {
    people: entities.length,
    threads: topics.length,
    decisions: topics.filter(t => !!t.last_decision).length,
    openQuestions: topics.filter(t => Array.isArray(t.open_questions) && t.open_questions.length > 0).length,
    _rawTopics: topics,
    _rawEntities: entities,
  }
}
```

- [ ] **Step 2: Modify `ChatTab.jsx`.**

Read `src/components/vault/ChatTab.jsx`. Add at the top of the file:

```javascript
import { useEffect, useState } from 'react'
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import { useAuth } from '../../hooks/useAuth'
import WelcomeStrip from './WelcomeStrip'
import { getWelcomeCounts } from '../../lib/api/vault-counts'
```

Inside the `ChatTab` function, ABOVE the existing `if (demo?.isDemo)` block:

```javascript
const flagOn = useFeatureFlag('vault_redesign')
const { user } = useAuth() || {}
const [counts, setCounts] = useState(null)

useEffect(() => {
  if (!flagOn) return
  let cancelled = false
  getWelcomeCounts().then(c => { if (!cancelled) setCounts(c) }).catch(() => {})
  return () => { cancelled = true }
}, [flagOn])
```

Wrap the EXISTING return logic so the strip sits above it when the flag is on. The simplest pattern is to split the existing return into a helper, then wrap conditionally:

```javascript
const chatElement = demo?.isDemo
  ? <Chat mode="simulated" personaName={demo.personaName?.split(' ')[0] || demo.personaId} suggestedPrompts={prompts} initialGreeting={greeting} onExit={handleDemoExit} showThemeToggle={false} />
  : <Chat mode="try_it_out" suggestedPrompts={DEFAULT_PROMPTS} showThemeToggle={false} />

if (flagOn) {
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0]
  return (
    <>
      <WelcomeStrip name={displayName} counts={counts || { people: 0, threads: 0, decisions: 0, openQuestions: 0 }} />
      {chatElement}
    </>
  )
}
return chatElement
```

(Adapt to the EXACT existing structure — the demo conditional logic was already in the file. Just hoist into a `chatElement` variable.)

- [ ] **Step 3: Manual smoke test.**

```bash
npm run dev
```

With flag ON, navigate `/vault/chat`. Expected:
- Warm welcome strip appears at top with serif greeting
- Numbers populate within ~1s ("I'm holding N threads for you right now…")
- Existing chat sits below

With flag OFF: chat looks unchanged.

- [ ] **Step 4: Commit + push.**

```bash
git add src/components/vault/ChatTab.jsx src/lib/api/vault-counts.js
git commit -m "feat(welcome): mount WelcomeStrip in ChatTab behind vault_redesign flag (F2)"
git push
```

### F2-B follow-up: migrate Chat outer wrapper to CSS vars (remove transitional overrides)

After Task 9 lands and you're already in `Chat.jsx`, do a small architecture cleanup. Today (post-F1) `src/styles/vault-theme-warm.css` contains transitional overrides that target Tailwind utility classes in `Chat.jsx` (`bg-gradient-to-br.from-slate-50.to-white` and `header.bg-white.border-b.shadow-sm`) to warm the chat surface. They were added in commit `<F1-B>` so the warm theme felt cohesive immediately, but they're brittle — they pin Chat's styling to specific Tailwind class strings.

**Files:**
- Modify: `src/components/demo/Chat.jsx`
- Modify: `src/styles/vault-theme-warm.css` (remove the override block)

**Steps:**

- [ ] In `src/components/demo/Chat.jsx` line ~408, change:
  ```jsx
  <div className="h-full flex bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
  ```
  to read the primary background from CSS vars (preserving the dark-mode gradient for the non-flagged dark path):
  ```jsx
  <div className="h-full flex bg-[var(--bg-primary)] dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950">
  ```

- [ ] In `Chat.jsx` line ~412, change the chat header from `bg-white dark:bg-slate-900` to `bg-[var(--bg-secondary)] dark:bg-slate-900`. Update its `border-slate-200` to `border-[var(--border-subtle)]`.

- [ ] Delete the "Chat surface warm-up (transitional)" CSS block at the bottom of `src/styles/vault-theme-warm.css`.

- [ ] Manual smoke test (flag ON and OFF):
  - Flag ON: chat surface is still warm cream, header is still soft sand. Identical to the transitional state.
  - Flag OFF: chat surface is still the existing light gradient. No regression.

- [ ] Commit:
  ```
  refactor(chat): use --bg-primary / --bg-secondary for chat outer surface
  
  Removes the transitional Tailwind-class-targeting overrides in
  vault-theme-warm.css; Chat now participates in the theme system properly.
  ```

This is small enough (~6 lines touched) to do alongside the Task 9 work without a separate review cycle, but keep it as its own commit for clean history.

---

## Task 10: F2 phase-close

- [ ] All tests green: `npm run test:run`
- [ ] Flag-off path manually verified (no WelcomeStrip)
- [ ] Flag-on path manually verified (WelcomeStrip with real counts)

---

## Task 11: `ContextPanel.v2` shell — copy and strip

**Files:**
- Create: `src/components/demo/ContextPanel.v2.jsx`
- Create: `src/components/demo/ContextPanelContainer.jsx`
- Modify: `src/components/demo/Chat.jsx`

- [ ] **Step 1: Copy the existing file.**

```bash
cp src/components/demo/ContextPanel.jsx src/components/demo/ContextPanel.v2.jsx
```

- [ ] **Step 2: Open `ContextPanel.v2.jsx` and remove these sections.**

1. The entire `StatsBar` function definition AND its render site (`<StatsBar ... />` inside the main component).
2. The "Retrieval Strategies" `<Section ...>...</Section>` block.
3. The "Query Type" sub-block inside "Signals Detected".
4. The "Emotions" sub-block inside "Signals Detected".
5. The "Time References" sub-block inside "Signals Detected".

After removing, "Signals Detected" should only have Entities + Topics. We collapse those into the header in Task 12.

Save the file. Function name and default export name stay `ContextPanel`.

- [ ] **Step 3: Create the container.**

```javascript
// src/components/demo/ContextPanelContainer.jsx
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import ContextPanelV1 from './ContextPanel'
import ContextPanelV2 from './ContextPanel.v2'

export default function ContextPanelContainer(props) {
  const flagOn = useFeatureFlag('vault_redesign')
  const Panel = flagOn ? ContextPanelV2 : ContextPanelV1
  return <Panel {...props} />
}
```

- [ ] **Step 4: Swap `Chat.jsx` to import the container.**

In `src/components/demo/Chat.jsx`, change:

```javascript
import ContextPanel from './ContextPanel';
```

to:

```javascript
import ContextPanel from './ContextPanelContainer';
```

No other changes needed — the container's default export is interface-compatible.

- [ ] **Step 5: Manual smoke test.**

```bash
npm run dev
```

Flag ON: open chat, type "Tell me about Mike" (or any real entity in your data). ContextPanel on the right appears, MINUS StatsBar (no `147ms` strip), MINUS "Retrieval Strategies" section, MINUS Query Type / Emotions / Time refs badges. Entities and Topics still appear.

Flag OFF: ContextPanel renders exactly as it did before.

- [ ] **Step 6: Commit.**

```bash
git add src/components/demo/ContextPanel.v2.jsx src/components/demo/ContextPanelContainer.jsx src/components/demo/Chat.jsx
git commit -m "feat(context): ContextPanel.v2 drops StatsBar, Strategies, Query Type, Emotions, Time refs

Container picks v1/v2 by vault_redesign flag. Chat.jsx swapped to import container."
```

---

## Task 12: ContextPanel.v2 — collapse Signals into header subtitle

**Files:**
- Modify: `src/components/demo/ContextPanel.v2.jsx`

- [ ] **Step 1: Find the current panel header.**

Locate the JSX block that renders `<span ...>Context Retrieved</span>` and `<p ...>What HridAI knows about this</p>` inside the panel header `div`.

- [ ] **Step 2: Replace the header content + drop the Signals Detected section.**

Replace the header's text JSX:

```jsx
<div>
  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Context Retrieved</span>
  <p className="text-xs text-slate-400 dark:text-slate-500">What HridAI knows about this</p>
</div>
```

with:

```jsx
<div className="min-w-0">
  <span className="text-sm font-semibold text-[var(--text-primary)]">Context</span>
  {signals?.entities?.length || signals?.topics?.length ? (
    <p className="text-xs text-[var(--text-tertiary)] truncate">
      pulled context for: {[
        ...(signals.entities || []).map(e => typeof e === 'string' ? e : e.name || ''),
        ...(signals.topics || []).map(t => typeof t === 'string' ? t : t.name || ''),
      ].filter(Boolean).slice(0, 4).join(' · ')}
    </p>
  ) : (
    <p className="text-xs text-[var(--text-tertiary)]">Recent threads, people, and moments — switches as you talk.</p>
  )}
</div>
```

Then DELETE the entire `<Section title="Signals Detected" ...>...</Section>` block lower in the file.

- [ ] **Step 3: Manual smoke test.**

Flag ON:
- Before sending a message: header reads "Context" + "Recent threads, people, and moments — switches as you talk."
- After sending "Tell me about Mike": header subtitle changes to "pulled context for: Mike" (or whatever was extracted).
- Full Signals card with badges is gone.

- [ ] **Step 4: Commit.**

```bash
git add src/components/demo/ContextPanel.v2.jsx
git commit -m "feat(context): collapse Signals into header subtitle (v2)"
```

---

## Task 13: ContextPanel.v2 — one muted color family per role

**Files:**
- Modify: `src/components/demo/ContextPanel.v2.jsx`

- [ ] **Step 1: Replace `ENTITY_TYPE_CONFIG` with muted families.**

In `ContextPanel.v2.jsx`:

```javascript
const ENTITY_TYPE_CONFIG = {
  person:       { icon: User,      bgClass: 'bg-[color:rgba(77,102,136,0.08)] border-[color:rgba(77,102,136,0.18)]', textClass: 'text-[color:#4d6688]', iconClass: 'text-[color:#4d6688]' },
  organization: { icon: Building2, bgClass: 'bg-[color:rgba(110,77,30,0.08)] border-[color:rgba(110,77,30,0.18)]', textClass: 'text-[color:#6e4d1e]', iconClass: 'text-[color:#6e4d1e]' },
  place:        { icon: MapPin,    bgClass: 'bg-[color:rgba(79,107,79,0.08)] border-[color:rgba(79,107,79,0.18)]',  textClass: 'text-[color:#4f6b4f]', iconClass: 'text-[color:#4f6b4f]' },
  location:     { icon: MapPin,    bgClass: 'bg-[color:rgba(79,107,79,0.08)] border-[color:rgba(79,107,79,0.18)]',  textClass: 'text-[color:#4f6b4f]', iconClass: 'text-[color:#4f6b4f]' },
  default:      { icon: Users,     bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]',    textClass: 'text-[color:#5b4c39]', iconClass: 'text-[color:#5b4c39]' },
}
```

Remove the `doctor` entry entirely.

- [ ] **Step 2: Replace `TOPIC_STATUS_CONFIG`.**

```javascript
const TOPIC_STATUS_CONFIG = {
  active:   { bgClass: 'bg-[color:rgba(79,107,79,0.08)] border-[color:rgba(79,107,79,0.18)]', textClass: 'text-[color:#4f6b4f]', icon: TrendingUp },
  resolved: { bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]', textClass: 'text-[color:#5b4c39]', icon: CheckCircle },
  pending:  { bgClass: 'bg-[color:rgba(160,119,59,0.08)] border-[color:rgba(160,119,59,0.18)]', textClass: 'text-[color:#a0773b]', icon: AlertCircle },
  default:  { bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]', textClass: 'text-[color:#5b4c39]', icon: Tag },
}
```

- [ ] **Step 3: Manual smoke test.**

Flag ON, trigger context. Confirm:
- People cards in soft slate-blue
- Org cards in warm brown
- Place/location cards in soft sage
- Topic cards in soft sage (active) or warm sand (resolved)
- No purple/rose/cyan variants anywhere

- [ ] **Step 4: Commit + push.**

```bash
git add src/components/demo/ContextPanel.v2.jsx
git commit -m "feat(context): one muted color family per role (people slate-blue, topics sage)"
git push
```

---

## Task 14: F3 phase-close

- [ ] All tests green: `npm run test:run`
- [ ] Flag ON: panel shows simplified sections + header subtitle + muted colors
- [ ] Flag OFF: panel unchanged

---

## Task 15: `TopicCard.v2` — surface `current_summary` + `last_decision` + `open_questions`

**Files:**
- Create: `src/components/demo/TopicCard.v2.jsx`
- Create: `src/components/demo/TopicCard.v2.test.jsx`
- Modify: `src/components/demo/ContextPanel.v2.jsx` (replace inline TopicCard usage)

- [ ] **Step 1: Write the failing test.**

```javascript
// src/components/demo/TopicCard.v2.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TopicCardV2 from './TopicCard.v2'

const baseTopic = {
  id: 't1',
  name: 'HridAI conference presentation and introduction strategy',
  current_summary: 'Successfully presented at conference; gathered feedback.',
  current_status: 'active',
  last_mentioned: '2026-05-22T18:00:00Z',
}

describe('TopicCardV2', () => {
  it('renders the name and current_summary', () => {
    render(<TopicCardV2 topic={baseTopic} />)
    expect(screen.getByText(baseTopic.name)).toBeInTheDocument()
    expect(screen.getByText(/Successfully presented/i)).toBeInTheDocument()
  })

  it('renders status chip', () => {
    render(<TopicCardV2 topic={baseTopic} />)
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('renders last_decision when present', () => {
    const t = { ...baseTopic, last_decision: 'Will work backwards from connections.' }
    render(<TopicCardV2 topic={t} />)
    expect(screen.getByText(/decided:/i)).toBeInTheDocument()
    expect(screen.getByText(/Will work backwards/i)).toBeInTheDocument()
  })

  it('omits last_decision block when missing', () => {
    render(<TopicCardV2 topic={baseTopic} />)
    expect(screen.queryByText(/decided:/i)).not.toBeInTheDocument()
  })

  it('renders open_questions as a bulleted list, capped at 3 with +N more', () => {
    const t = { ...baseTopic, open_questions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] }
    render(<TopicCardV2 topic={t} />)
    expect(screen.getByText('Q1')).toBeInTheDocument()
    expect(screen.getByText('Q2')).toBeInTheDocument()
    expect(screen.getByText('Q3')).toBeInTheDocument()
    expect(screen.queryByText('Q4')).not.toBeInTheDocument()
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('omits open_questions block when array is empty', () => {
    const t = { ...baseTopic, open_questions: [] }
    render(<TopicCardV2 topic={t} />)
    expect(screen.queryByText(/^open$/i)).not.toBeInTheDocument()
  })

  it('falls back to topic.context when current_summary is missing', () => {
    const t = { ...baseTopic, current_summary: undefined, context: 'fallback narrative' }
    render(<TopicCardV2 topic={t} />)
    expect(screen.getByText('fallback narrative')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails.**

```bash
npm run test:run -- src/components/demo/TopicCard.v2.test.jsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `TopicCard.v2.jsx`.**

```javascript
// src/components/demo/TopicCard.v2.jsx
import { Tag, Clock } from 'lucide-react'

const TOPIC_STATUS_CONFIG = {
  active:   { bgClass: 'bg-[color:rgba(79,107,79,0.08)] border-[color:rgba(79,107,79,0.18)]', textClass: 'text-[color:#4f6b4f]' },
  resolved: { bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]', textClass: 'text-[color:#5b4c39]' },
  default:  { bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]', textClass: 'text-[color:#5b4c39]' },
}

function getConfig(status) {
  const s = (status || 'default').toLowerCase()
  return TOPIC_STATUS_CONFIG[s] || TOPIC_STATUS_CONFIG.default
}

export default function TopicCardV2({ topic }) {
  const status = topic.current_status || topic.status || 'active'
  const config = getConfig(status)
  const summary = topic.current_summary || topic.context || ''
  const decision = topic.last_decision
  const openQs = Array.isArray(topic.open_questions) ? topic.open_questions : []
  const visibleQs = openQs.slice(0, 3)
  const moreQs = Math.max(0, openQs.length - visibleQs.length)

  return (
    <article className={`rounded-lg p-3 mb-2 border ${config.bgClass} transition-shadow hover:shadow-sm`}>
      <header className="flex items-start gap-2">
        <Tag className={`w-4 h-4 mt-0.5 ${config.textClass}`} />
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold ${config.textClass} leading-snug`}>{topic.name}</h4>
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${config.textClass} bg-white/40`}>
          {status}
        </span>
      </header>

      {summary && (
        <p className="mt-2 text-xs text-[var(--text-primary)] leading-relaxed">
          {summary}
        </p>
      )}

      {decision && (
        <p className="mt-2 text-xs text-[var(--text-primary)] leading-relaxed pl-3 border-l-2 border-[color:rgba(79,107,79,0.4)]">
          <span className="text-[var(--text-tertiary)]">decided:</span> {decision}
        </p>
      )}

      {visibleQs.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">open</div>
          <ul className="list-disc pl-5 space-y-0.5">
            {visibleQs.map((q, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] leading-snug">{q}</li>
            ))}
            {moreQs > 0 && <li className="text-xs text-[var(--text-tertiary)]">+{moreQs} more</li>}
          </ul>
        </div>
      )}

      {topic.last_mentioned && (
        <div className="mt-2 text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(topic.last_mentioned).toLocaleDateString()}
        </div>
      )}
    </article>
  )
}
```

- [ ] **Step 4: Run tests.**

```bash
npm run test:run -- src/components/demo/TopicCard.v2.test.jsx
# Expected: 7 passed
```

- [ ] **Step 5: Replace the inline TopicCard usage in `ContextPanel.v2.jsx`.**

At top of file, add:

```javascript
import TopicCardV2 from './TopicCard.v2'
```

Find where `TopicCard` is invoked (likely `{topics_retrieved.map((topic, i) => <TopicCard key={topic.id || i} topic={topic} />)}`). Replace with:

```javascript
{topics_retrieved.map((topic, i) => <TopicCardV2 key={topic.id || i} topic={topic} />)}
```

Then DELETE the inline `function TopicCard(...) {...}` definition from `ContextPanel.v2.jsx`.

- [ ] **Step 6: Commit.**

```bash
git add src/components/demo/TopicCard.v2.jsx src/components/demo/TopicCard.v2.test.jsx src/components/demo/ContextPanel.v2.jsx
git commit -m "feat(context): TopicCardV2 surfaces current_summary + last_decision + open_questions"
```

---

## Task 16: Rename "Past Conversations" → "Recent moments"

**Files:**
- Modify: `src/components/demo/ContextPanel.v2.jsx`

- [ ] **Step 1: Replace the section title.**

```bash
grep -n "Past Conversations" src/components/demo/ContextPanel.v2.jsx
```

Replace `title="Past Conversations"` with `title="Recent moments"` in the `<Section>` JSX.

- [ ] **Step 2: Manual smoke test.**

Flag ON, trigger context retrieval. Confirm the third section reads "Recent moments".

- [ ] **Step 3: Commit + push.**

```bash
git add src/components/demo/ContextPanel.v2.jsx
git commit -m "feat(context): rename 'Past Conversations' to 'Recent moments'"
git push
```

---

## Task 17: F4 phase-close

Manual smoke test:
- Flag ON, type "tell me about the conference talk track" (or any real topic with populated summary)
- TopicCard renders narrative, last decision (if any), open questions list
- Section header reads "Recent moments"
- Flag OFF unchanged

`npm run test:run` — all green.

---

## Task 18: Backend stub for `GET /context/recent` — frontend client

This is a **mock-only frontend client** so F5 can proceed without waiting on backend. Backend ISS filed in Task 20.

**Files:**
- Create: `src/lib/api/vault-recent.js`
- Create: `src/lib/api/vault-recent.test.js`

- [ ] **Step 1: Write the failing test.**

```javascript
// src/lib/api/vault-recent.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getRecentContext', () => {
  beforeEach(() => { vi.resetModules() })

  it('returns shape { topics, entities, moments } from adapter outputs', async () => {
    vi.doMock('./vault-topics.js', () => ({
      getTopics: () => Promise.resolve({ topics: [
        { id: 't1', name: 'foo', current_status: 'active', last_mentioned: '2026-06-01T00:00:00Z' },
        { id: 't2', name: 'bar', current_status: 'active', last_mentioned: '2026-05-25T00:00:00Z' },
      ] })
    }))
    vi.doMock('./vault-entities.js', () => ({
      getEntities: () => Promise.resolve({ entities: [
        { id: 'e1', canonical_name: 'Mike', last_interaction_at: '2026-06-10T00:00:00Z' },
      ] })
    }))

    const { getRecentContext } = await import('./vault-recent')
    const out = await getRecentContext()

    expect(out).toHaveProperty('topics')
    expect(out).toHaveProperty('entities')
    expect(out).toHaveProperty('moments')
    expect(Array.isArray(out.topics)).toBe(true)
    expect(Array.isArray(out.entities)).toBe(true)
    expect(Array.isArray(out.moments)).toBe(true)
    expect(out.topics.length).toBeLessThanOrEqual(3)
    expect(out.entities.length).toBeLessThanOrEqual(5)
  })
})
```

- [ ] **Step 2: Run to verify it fails.**

```bash
npm run test:run -- src/lib/api/vault-recent.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement.**

```javascript
// src/lib/api/vault-recent.js
/**
 * F5: recent context for the ContextPanel idle state.
 *
 * Until the backend GET /context/recent endpoint lands (see ISS in
 * AI_manager_v2), this composes from existing list endpoints client-side:
 *   - topics: most recent 3 by last_mentioned
 *   - entities: most recent 5 by last_interaction_at
 *   - moments: most recent 3 derived from topic summaries (best-effort)
 *
 * When the real endpoint ships, replace the body with one apiFetch call.
 * The return shape is stable.
 */
import { getTopics } from './vault-topics.js'
import { getEntities } from './vault-entities.js'

export async function getRecentContext() {
  const [tRes, eRes] = await Promise.all([
    getTopics().catch(() => ({ topics: [] })),
    getEntities().catch(() => ({ entities: [] })),
  ])

  const topics = (tRes.topics || [])
    .slice()
    .sort((a, b) => new Date(b.last_mentioned || 0) - new Date(a.last_mentioned || 0))
    .slice(0, 3)

  const entities = (eRes.entities || [])
    .slice()
    .sort((a, b) => new Date(b.last_interaction_at || 0) - new Date(a.last_interaction_at || 0))
    .slice(0, 5)

  // Moments: derive from topics' last_decision or current_summary as placeholder
  // until the real recent topic_mentions endpoint ships.
  const moments = topics
    .map((t, i) => ({
      id: `moment-${i}`,
      summary: t.last_decision || (t.current_summary || '').slice(0, 140),
      created_at: t.last_mentioned,
    }))
    .filter(m => m.summary)
    .slice(0, 3)

  return { topics, entities, moments }
}
```

- [ ] **Step 4: Run tests, commit.**

```bash
npm run test:run -- src/lib/api/vault-recent.test.js
# Expected: 1 passed
git add src/lib/api/vault-recent.js src/lib/api/vault-recent.test.js
git commit -m "feat(context): vault-recent client (frontend composition; backend ISS pending)"
```

---

## Task 19: ContextPanel.v2 idle state — render `getRecentContext`

**Files:**
- Modify: `src/components/demo/ContextPanel.v2.jsx`

- [ ] **Step 1: Add idle-state fetch.**

At the top of `ContextPanel.v2.jsx`, add to existing imports:

```javascript
import { useEffect, useState } from 'react'
import { getRecentContext } from '../../lib/api/vault-recent'
```

Inside the main `ContextPanel` function, BEFORE the `if (!retrievalTrace && !isLoading)` branch:

```javascript
const [recent, setRecent] = useState(null)
useEffect(() => {
  let cancelled = false
  if (!retrievalTrace && !isLoading) {
    getRecentContext().then(r => { if (!cancelled) setRecent(r) }).catch(() => {})
  }
  return () => { cancelled = true }
}, [retrievalTrace, isLoading])
```

- [ ] **Step 2: Replace the centered empty state with the populated idle state.**

Find the existing `if (!retrievalTrace && !isLoading) { return (<centered Brain icon ... />) }` block. Replace its return with:

```jsx
if (!retrievalTrace && !isLoading) {
  if (!recent) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-tertiary)] p-6">
        <p className="text-sm">Loading recent…</p>
      </div>
    )
  }
  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-4 py-3 z-10">
        <span className="text-sm font-semibold text-[var(--text-primary)]">Context</span>
        <p className="text-xs text-[var(--text-tertiary)]">Recent threads, people, and moments — switches as you talk.</p>
      </div>
      {recent.topics.length > 0 && (
        <Section title="Recent threads" icon={Tag} defaultOpen count={recent.topics.length}>
          {recent.topics.map((t, i) => <TopicCardV2 key={t.id || i} topic={t} />)}
        </Section>
      )}
      {recent.entities.length > 0 && (
        <Section title="Recently mentioned" icon={Users} defaultOpen count={recent.entities.length}>
          {recent.entities.map((e, i) => <EntityCard key={e.id || i} entity={normalizeEntity(e)} />)}
        </Section>
      )}
      {recent.moments.length > 0 && (
        <Section title="Recent moments" icon={MessageSquare} defaultOpen count={recent.moments.length}>
          {recent.moments.map((m, i) => <EpisodeCard key={m.id || i} episode={m} />)}
        </Section>
      )}
    </div>
  )
}
```

At the bottom of the file (outside the default export), add the normalize helper if not already there:

```javascript
function normalizeEntity(e) {
  return { ...e, name: e.canonical_name || e.name }
}
```

Confirm that `Tag`, `Users`, `MessageSquare`, `Section`, `EntityCard`, `EpisodeCard` are already imported / defined in this file (they should be — they came from the original ContextPanel.jsx).

- [ ] **Step 3: Manual smoke test.**

Flag ON, navigate `/vault/chat` BEFORE typing. Right panel should render:
- Header: "Context" + "Recent threads, people, and moments — switches as you talk."
- "Recent threads" with up to 3 most-recent topic cards
- "Recently mentioned" with up to 5 most-recent entity cards
- "Recent moments" with up to 3 snippets

Type a message → panel switches to standard retrieval view based on the message.

- [ ] **Step 4: Commit + push.**

```bash
git add src/components/demo/ContextPanel.v2.jsx
git commit -m "feat(context): idle state renders recent topics/entities/moments (F5 frontend)"
git push
```

---

## Task 20: File backend ISS for `GET /context/recent`

This is a **separate-repo action** in `AI_manager_v2`.

- [ ] **Step 1: Switch to backend repo.**

```bash
cd ~/Projects/AI_manager_v2
git status
# Confirm clean working tree before adding
```

- [ ] **Step 2: Add row to `docs/issues/README.md`.**

Add a fix-track row with the next ISS number (replace XXX):

```
| ISS-XXX | API | `GET /context/recent` for Vault redesign | NEW | open | Returns { topics: TopicSummary[3], entities: Entity[5], moments: TopicMention[3] } for the ContextPanel idle state. Reuse `get_recent_topics`, entities sorted by `last_interaction_at`, recent topic_mentions. |
```

- [ ] **Step 3: Create minimal stub file.**

`docs/issues/ISS-XXX-context-recent-endpoint.md`:

```markdown
# ISS-XXX: GET /context/recent for Vault redesign idle state

**Status:** open
**Track:** fix
**Owner:** TBD

## Summary
Tiny endpoint returning the three lists the new ContextPanel idle state
needs. Today the frontend composes them client-side from list endpoints
(see `vault-recent.js`); this consolidates to one round-trip.

## Shape
GET /context/recent → { topics, entities, moments } where:
- topics: top 3 by last_mentioned (Topic shape, full fields)
- entities: top 5 by last_interaction_at
- moments: top 3 topic_mentions.context_snippet by created_at

## Frontend pointer
`/Users/pratik/Projects/uFactorial website/.../src/lib/api/vault-recent.js`
```

- [ ] **Step 4: Commit + push.**

```bash
git add docs/issues/README.md docs/issues/ISS-XXX-context-recent-endpoint.md
git commit -m "chore(iss-XXX): file frontend dependency — GET /context/recent for Vault redesign"
git push
```

- [ ] **Step 5: Return to worktree.**

```bash
cd "/Users/pratik/Projects/uFactorial website/ufactorialcodebase.github.io/.worktrees/product-experience/vault-ux-redesign"
```

---

## Task 21: F5 phase-close

- [ ] Idle state works (manual)
- [ ] Backend ISS filed
- [ ] All tests green

---

## Task 22: `RailClusterPopover` component

**Files:**
- Create: `src/components/vault/RailClusterPopover.jsx`
- Create: `src/components/vault/RailClusterPopover.test.jsx`

- [ ] **Step 1: Write the failing test.**

```javascript
// src/components/vault/RailClusterPopover.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RailClusterPopover from './RailClusterPopover'

const items = [
  { path: '/vault/self', label: 'Self' },
  { path: '/vault/dates', label: 'Dates' },
  { path: '/vault/todos', label: 'Todos' },
]

describe('RailClusterPopover', () => {
  it('does not render content when closed', () => {
    render(<MemoryRouter><RailClusterPopover open={false} items={items} onSelect={() => {}} /></MemoryRouter>)
    expect(screen.queryByText('Self')).not.toBeInTheDocument()
  })

  it('renders all items when open', () => {
    render(<MemoryRouter><RailClusterPopover open items={items} onSelect={() => {}} /></MemoryRouter>)
    expect(screen.getByText('Self')).toBeInTheDocument()
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Todos')).toBeInTheDocument()
  })

  it('calls onSelect with path when item clicked', async () => {
    const user = userEvent.setup()
    let chosen = null
    render(<MemoryRouter><RailClusterPopover open items={items} onSelect={(p) => { chosen = p }} /></MemoryRouter>)
    await user.click(screen.getByText('Dates'))
    expect(chosen).toBe('/vault/dates')
  })
})
```

- [ ] **Step 2: Run to verify it fails.**

```bash
npm run test:run -- src/components/vault/RailClusterPopover.test.jsx
```

Expected: FAIL.

- [ ] **Step 3: Implement.**

```javascript
// src/components/vault/RailClusterPopover.jsx
import { useEffect, useRef } from 'react'

/**
 * Small popover anchored to a rail cluster icon. Lists sub-items;
 * click navigates via the parent's onSelect callback.
 */
export default function RailClusterPopover({ open, items, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose?.()
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute left-full top-0 ml-2 min-w-[160px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-lg py-1 z-50"
    >
      {items.map((item) => (
        <button
          key={item.path}
          role="menuitem"
          onClick={() => onSelect(item.path)}
          className="block w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests, commit.**

```bash
npm run test:run -- src/components/vault/RailClusterPopover.test.jsx
# Expected: 3 passed
git add src/components/vault/RailClusterPopover.jsx src/components/vault/RailClusterPopover.test.jsx
git commit -m "feat(rail): RailClusterPopover component for cluster sub-items"
```

---

## Task 23: `IconRail.v2` — 4 clusters

**Files:**
- Create: `src/components/vault/IconRail.v2.jsx`
- Create: `src/components/vault/IconRail.v2.test.jsx`

- [ ] **Step 1: Write the failing test.**

```javascript
// src/components/vault/IconRail.v2.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import IconRailV2 from './IconRail.v2'

describe('IconRailV2', () => {
  it('renders 4 cluster icons (Chat, You, Your World, Your Vault) + Settings', () => {
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    expect(screen.getByLabelText('Chat')).toBeInTheDocument()
    expect(screen.getByLabelText('You')).toBeInTheDocument()
    expect(screen.getByLabelText('Your World')).toBeInTheDocument()
    expect(screen.getByLabelText('Your Vault')).toBeInTheDocument()
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()
  })

  it('clicking "You" opens a popover with Self, Dates, Todos', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('You'))
    expect(screen.getByText('Self')).toBeInTheDocument()
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Todos')).toBeInTheDocument()
  })

  it('clicking "Your Vault" opens a popover with People, Threads, Lists, Artifacts', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('Your Vault'))
    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Threads')).toBeInTheDocument()
    expect(screen.getByText('Lists')).toBeInTheDocument()
    expect(screen.getByText('Artifacts')).toBeInTheDocument()
  })

  it('"Your World" does NOT open a popover (single sub-item)', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/vault/chat']}><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('Your World'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails.**

```bash
npm run test:run -- src/components/vault/IconRail.v2.test.jsx
```

Expected: FAIL.

- [ ] **Step 3: Implement.**

```javascript
// src/components/vault/IconRail.v2.jsx
//
// TODO(post-F6): first-visit tooltip callout pointing at the rail clusters
// (deferred — add after beta feedback indicates discoverability is an issue).
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, User, Globe, Archive, Settings } from 'lucide-react'
import RailClusterPopover from './RailClusterPopover'

const CLUSTERS = (base) => [
  {
    key: 'chat', label: 'Chat', icon: MessageCircle,
    items: [{ path: `${base}/chat`, label: 'Chat' }],
  },
  {
    key: 'you', label: 'You', icon: User,
    items: [
      { path: `${base}/self`, label: 'Self' },
      { path: `${base}/dates`, label: 'Dates' },
      { path: `${base}/todos`, label: 'Todos' },
    ],
  },
  {
    key: 'world', label: 'Your World', icon: Globe,
    items: [{ path: `${base}/world`, label: 'Graph' }],
  },
  {
    key: 'vault', label: 'Your Vault', icon: Archive,
    items: [
      { path: `${base}/people`, label: 'People' },
      { path: `${base}/topics`, label: 'Threads' },
      { path: `${base}/lists`, label: 'Lists' },
      { path: `${base}/artifacts`, label: 'Artifacts' },
    ],
  },
]

export default function IconRailV2({ basePath = '/vault' }) {
  const clusters = CLUSTERS(basePath)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [openKey, setOpenKey] = useState(null)

  const onClusterClick = (cluster) => {
    if (cluster.items.length === 1) {
      navigate(cluster.items[0].path)
      setOpenKey(null)
      return
    }
    setOpenKey(openKey === cluster.key ? null : cluster.key)
  }

  const isActiveCluster = (cluster) => cluster.items.some((it) => pathname.startsWith(it.path))

  return (
    <nav className="w-12 flex-shrink-0 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col items-center py-3 gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--accent-warm)] mb-2 select-none">
        Beta
      </span>

      {clusters.map((cluster) => {
        const Icon = cluster.icon
        const active = isActiveCluster(cluster)
        return (
          <div key={cluster.key} className="relative">
            <button
              aria-label={cluster.label}
              onClick={() => onClusterClick(cluster)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                active ? 'bg-[var(--bg-tertiary)] text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <Icon size={18} />
            </button>
            <RailClusterPopover
              open={openKey === cluster.key && cluster.items.length > 1}
              items={cluster.items}
              onSelect={(path) => { setOpenKey(null); navigate(path) }}
              onClose={() => setOpenKey(null)}
            />
          </div>
        )
      })}

      <div className="flex-1" />

      <button
        aria-label="Settings"
        onClick={() => navigate('/vault/profile')}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          pathname === '/vault/profile' ? 'bg-[var(--bg-tertiary)] text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >
        <Settings size={18} />
      </button>
    </nav>
  )
}
```

- [ ] **Step 4: Run tests, commit.**

```bash
npm run test:run -- src/components/vault/IconRail.v2.test.jsx
# Expected: 4 passed
git add src/components/vault/IconRail.v2.jsx src/components/vault/IconRail.v2.test.jsx
git commit -m "feat(rail): IconRail.v2 with 4 clusters (Chat / You / Your World / Your Vault)"
```

---

## Task 24: `IconRailContainer` + VaultLayout wiring

**Files:**
- Create: `src/components/vault/IconRailContainer.jsx`
- Modify: `src/components/vault/VaultLayout.jsx`

- [ ] **Step 1: Create container.**

```javascript
// src/components/vault/IconRailContainer.jsx
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import IconRail from './IconRail'
import IconRailV2 from './IconRail.v2'

export default function IconRailContainer(props) {
  const Rail = useFeatureFlag('vault_redesign') ? IconRailV2 : IconRail
  return <Rail {...props} />
}
```

- [ ] **Step 2: Modify `VaultLayout.jsx` to use container.**

In `src/components/vault/VaultLayout.jsx` change:

```javascript
import IconRail from './IconRail'
```

to:

```javascript
import IconRail from './IconRailContainer'
```

No other changes needed — container has interface-compatible default export.

- [ ] **Step 3: Manual smoke test.**

Flag ON, open `/vault/chat`. Rail should show 4 icons + Settings:
- 💬 Chat (active on `/vault/chat`)
- 👤 You — click opens popover with Self / Dates / Todos
- 🌐 Your World — click navigates directly to `/vault/world`
- 📁 Your Vault — click opens popover with People / Threads / Lists / Artifacts

Visit each sub-item via popover; URL changes to the existing route. Active state highlights the cluster (on `/vault/people`, "Your Vault" highlights).

Flag OFF, rail looks exactly like the old 9-tab version.

- [ ] **Step 4: Commit + push.**

```bash
git add src/components/vault/IconRailContainer.jsx src/components/vault/VaultLayout.jsx
git commit -m "feat(rail): IconRailContainer swaps v1/v2 by vault_redesign flag"
git push
```

---

## Task 25: F6 phase-close

- [ ] All tests green: `npm run test:run`
- [ ] Manual smoke pass (Flag ON: 4-cluster rail; Flag OFF: 9-tab rail)
- [ ] Mobile bottom nav unchanged — open Chrome devtools, switch to narrow viewport, confirm BottomNav shows Chat/Entities/Todos/World as before. Verify warm palette applies (cream-tinted bottom nav).

---

## Task 26: F6 sanity — mobile palette propagation

- [ ] **Step 1:** Open dev tools, narrow viewport.
- [ ] **Step 2:** Toggle flag ON, navigate `/vault/chat`. Confirm:
  - BottomNav background is cream (not navy)
  - Bottom-nav icon text is dark ink
  - More sheet (tap "More") inherits palette
- [ ] **Step 3:** No code changes expected; if anything looks broken, debug + commit a fix before proceeding.

---

## Task 27: `vault-last-seen` client

**Files:**
- Create: `src/lib/api/vault-last-seen.js`
- Create: `src/lib/api/vault-last-seen.test.js`

- [ ] **Step 1: Inspect existing API helpers.**

```bash
cat src/lib/api-client.js | head -40
```

Note the export `apiFetch` — that's what wraps fetch with auth. We'll use it (or fall back to direct fetch) and gracefully degrade to `null` on 404.

- [ ] **Step 2: Write the failing test.**

```javascript
// src/lib/api/vault-last-seen.test.js
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

describe('getLastSeen', () => {
  beforeEach(() => { vi.resetModules() })
  afterEach(() => { vi.restoreAllMocks() })

  it('returns ISO timestamp when endpoint responds', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.resolve({ last_seen_at: '2026-06-10T12:00:00Z' }),
    }))
    const { getLastSeen } = await import('./vault-last-seen')
    expect(await getLastSeen()).toBe('2026-06-10T12:00:00Z')
  })

  it('returns null when endpoint throws (e.g., 404)', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.reject(Object.assign(new Error('Not found'), { status: 404 })),
    }))
    const { getLastSeen } = await import('./vault-last-seen')
    expect(await getLastSeen()).toBeNull()
  })

  it('returns null on any other error', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.reject(new Error('net')),
    }))
    const { getLastSeen } = await import('./vault-last-seen')
    expect(await getLastSeen()).toBeNull()
  })

  it('returns null when payload has no last_seen_at key', async () => {
    vi.doMock('../api-client.js', () => ({
      apiFetch: () => Promise.resolve({}),
    }))
    const { getLastSeen } = await import('./vault-last-seen')
    expect(await getLastSeen()).toBeNull()
  })
})
```

- [ ] **Step 3: Run to verify it fails.**

```bash
npm run test:run -- src/lib/api/vault-last-seen.test.js
```

Expected: FAIL.

- [ ] **Step 4: Implement.**

```javascript
// src/lib/api/vault-last-seen.js
import { apiFetch } from '../api-client.js'

/**
 * Returns the user's last-seen timestamp (ISO) used by WelcomeStrip for the
 * "since you were last here" delta.
 *
 * Backed by MAX(chat_transcripts.updated_at) for the user — see spec §6 F7.
 * Returns null if the endpoint isn't yet shipped (404) or any error occurs;
 * the caller treats null as "use totals fallback wording."
 */
export async function getLastSeen() {
  try {
    const res = await apiFetch('/sessions/last-seen')
    return res?.last_seen_at || null
  } catch {
    return null
  }
}
```

- [ ] **Step 5: Run tests, commit.**

```bash
npm run test:run -- src/lib/api/vault-last-seen.test.js
# Expected: 4 passed
git add src/lib/api/vault-last-seen.js src/lib/api/vault-last-seen.test.js
git commit -m "feat(welcome): vault-last-seen client (graceful null when endpoint absent)"
```

---

## Task 28: Wire `last_seen` into `ChatTab` → `WelcomeStrip`

**Files:**
- Modify: `src/components/vault/ChatTab.jsx`

- [ ] **Step 1: Update the `useEffect` that loads counts to also load last-seen and compute deltas.**

In `src/components/vault/ChatTab.jsx`, REPLACE the welcome-strip wiring added in Task 9 with:

```javascript
import { getLastSeen } from '../../lib/api/vault-last-seen'

// inside ChatTab:
const flagOn = useFeatureFlag('vault_redesign')
const { user } = useAuth() || {}
const [counts, setCounts] = useState(null)
const [lastSeen, setLastSeen] = useState(undefined) // undefined = loading, null = unavailable, ISO string = present

useEffect(() => {
  if (!flagOn) return
  let cancelled = false
  Promise.all([
    getWelcomeCounts().then(c => { if (!cancelled) setCounts(c) }).catch(() => {}),
    getLastSeen().then(t => { if (!cancelled) setLastSeen(t) }).catch(() => { if (!cancelled) setLastSeen(null) }),
  ])
  return () => { cancelled = true }
}, [flagOn])

let daysSince = null
let deltas = null
if (lastSeen && counts && Array.isArray(counts._rawTopics) && Array.isArray(counts._rawEntities)) {
  const cutoff = new Date(lastSeen).getTime()
  if (!Number.isNaN(cutoff)) {
    daysSince = Math.max(0, Math.floor((Date.now() - cutoff) / 86400000))
    deltas = {
      newPeople: counts._rawEntities.filter(e => new Date(e.first_mentioned_at || e.created_at || 0).getTime() > cutoff).length,
      newThreads: counts._rawTopics.filter(t => new Date(t.first_mentioned || t.created_at || 0).getTime() > cutoff).length,
    }
  }
}
```

And the mount:

```javascript
<WelcomeStrip
  name={user?.user_metadata?.name || user?.email?.split('@')[0]}
  counts={counts || { people: 0, threads: 0, decisions: 0, openQuestions: 0 }}
  daysSince={daysSince}
  deltas={deltas}
/>
```

- [ ] **Step 2: Manual smoke test.**

Flag ON, `/vault/chat`:
- If backend `/sessions/last-seen` is shipped → diff wording: *"It's been N days since we last talked. While you were away I learned about X new people and opened Y new threads…"*
- If NOT shipped → totals fallback wording (Task 8 variant)

To force the totals fallback for testing, run dev tools and: `localStorage.removeItem('hridai_features'); location.reload();` — that turns the flag off. Or temporarily comment out the `getLastSeen` call.

- [ ] **Step 3: Commit + push.**

```bash
git add src/components/vault/ChatTab.jsx
git commit -m "feat(welcome): F7 — diff wording when last_seen_at is available, fallback to totals"
git push
```

---

## Task 29: File backend ISS for last-seen endpoint

- [ ] **Step 1: Switch to backend repo.**

```bash
cd ~/Projects/AI_manager_v2
```

- [ ] **Step 2: Add tracker row.**

In `docs/issues/README.md` add (replace YYY with next ISS number):

```
| ISS-YYY | API | `GET /sessions/last-seen` for Vault redesign welcome strip | NEW | open | Returns { last_seen_at: ISO } — MAX(chat_transcripts.updated_at) for the user. ~10 lines. |
```

- [ ] **Step 3: Create stub file.**

`docs/issues/ISS-YYY-sessions-last-seen.md`:

```markdown
# ISS-YYY: GET /sessions/last-seen for Vault redesign welcome strip

**Status:** open
**Track:** fix
**Owner:** TBD

## Summary
Tiny helper used by WelcomeStrip "since you were last here" sentence.
Returns MAX(chat_transcripts.updated_at) per user. No new column.

## Shape
GET /sessions/last-seen → { "last_seen_at": "2026-06-10T12:00:00Z" }

No transcripts for the user → { "last_seen_at": null } → frontend uses totals wording.

## Frontend pointer
src/lib/api/vault-last-seen.js (already gracefully degrades to null on 404)
```

- [ ] **Step 4: Commit, push, return to worktree.**

```bash
git add docs/issues/README.md docs/issues/ISS-YYY-sessions-last-seen.md
git commit -m "chore(iss-YYY): file frontend dependency — GET /sessions/last-seen for Vault redesign"
git push
cd "/Users/pratik/Projects/uFactorial website/ufactorialcodebase.github.io/.worktrees/product-experience/vault-ux-redesign"
```

---

## Task 30: `usePinnedItems` hook

**Files:**
- Create: `src/hooks/usePinnedItems.js`
- Create: `src/hooks/usePinnedItems.test.js`

- [ ] **Step 1: Write the failing test.**

```javascript
// src/hooks/usePinnedItems.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePinnedItems } from './usePinnedItems'

describe('usePinnedItems', () => {
  beforeEach(() => { localStorage.clear() })

  it('returns empty array initially', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    expect(result.current.pinned).toEqual([])
  })

  it('pin adds an id', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('topic-1') })
    expect(result.current.pinned).toContain('topic-1')
  })

  it('pin twice is idempotent', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('topic-1'); result.current.pin('topic-1') })
    expect(result.current.pinned).toEqual(['topic-1'])
  })

  it('unpin removes an id', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('topic-1') })
    act(() => { result.current.unpin('topic-1') })
    expect(result.current.pinned).toEqual([])
  })

  it('isPinned reports correctly', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('a') })
    expect(result.current.isPinned('a')).toBe(true)
    expect(result.current.isPinned('b')).toBe(false)
  })

  it('persists across hook re-renders via localStorage', () => {
    const { result } = renderHook(() => usePinnedItems('context'))
    act(() => { result.current.pin('persisted') })
    const { result: result2 } = renderHook(() => usePinnedItems('context'))
    expect(result2.current.pinned).toContain('persisted')
  })

  it('different namespaces do not collide', () => {
    const { result: a } = renderHook(() => usePinnedItems('nsA'))
    act(() => { a.current.pin('x') })
    const { result: b } = renderHook(() => usePinnedItems('nsB'))
    expect(b.current.pinned).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify it fails.**

```bash
npm run test:run -- src/hooks/usePinnedItems.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement.**

```javascript
// src/hooks/usePinnedItems.js
import { useState, useCallback } from 'react'

const KEY = (ns) => `hridai_pinned_${ns}`

function read(ns) {
  try {
    const raw = localStorage.getItem(KEY(ns))
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function write(ns, arr) {
  try { localStorage.setItem(KEY(ns), JSON.stringify(arr)) } catch { /* ignore */ }
}

export function usePinnedItems(namespace) {
  const [pinned, setPinned] = useState(() => read(namespace))

  const pin = useCallback((id) => {
    setPinned((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      write(namespace, next)
      return next
    })
  }, [namespace])

  const unpin = useCallback((id) => {
    setPinned((prev) => {
      const next = prev.filter((x) => x !== id)
      write(namespace, next)
      return next
    })
  }, [namespace])

  const isPinned = useCallback((id) => pinned.includes(id), [pinned])

  return { pinned, pin, unpin, isPinned }
}
```

- [ ] **Step 4: Run tests, commit.**

```bash
npm run test:run -- src/hooks/usePinnedItems.test.js
# Expected: 7 passed
git add src/hooks/usePinnedItems.js src/hooks/usePinnedItems.test.js
git commit -m "feat(pin): usePinnedItems hook (localStorage-backed, namespaced)"
```

---

## Task 31: Pin affordance in `TopicCardV2`

**Files:**
- Modify: `src/components/demo/TopicCard.v2.jsx`
- Modify: `src/components/demo/TopicCard.v2.test.jsx`
- Modify: `src/components/demo/ContextPanel.v2.jsx`

- [ ] **Step 1: Update test for pin button.**

Append to `src/components/demo/TopicCard.v2.test.jsx`:

```javascript
import userEvent from '@testing-library/user-event'

describe('TopicCardV2 — pin affordance', () => {
  it('renders pin button when onTogglePin is provided', () => {
    render(<TopicCardV2 topic={baseTopic} onTogglePin={() => {}} pinned={false} />)
    expect(screen.getByLabelText(/pin/i)).toBeInTheDocument()
  })

  it('does NOT render pin button when onTogglePin is missing', () => {
    render(<TopicCardV2 topic={baseTopic} />)
    expect(screen.queryByLabelText(/pin/i)).not.toBeInTheDocument()
  })

  it('clicking pin calls onTogglePin with topic.id', async () => {
    const user = userEvent.setup()
    let calledWith = null
    render(<TopicCardV2 topic={baseTopic} onTogglePin={(id) => { calledWith = id }} pinned={false} />)
    await user.click(screen.getByLabelText(/^pin$/i))
    expect(calledWith).toBe('t1')
  })

  it('renders "Unpin" label when pinned', () => {
    render(<TopicCardV2 topic={baseTopic} onTogglePin={() => {}} pinned />)
    expect(screen.getByLabelText(/unpin/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify the new tests fail.**

```bash
npm run test:run -- src/components/demo/TopicCard.v2.test.jsx
```

Expected: 4 new failures.

- [ ] **Step 3: Modify `TopicCard.v2.jsx`.**

Update imports:

```javascript
import { Tag, Clock, Pin } from 'lucide-react'
```

Update signature and header:

```javascript
export default function TopicCardV2({ topic, pinned = false, onTogglePin }) {
  // ...existing logic
  return (
    <article ...>
      <header className="flex items-start gap-2">
        <Tag className={`w-4 h-4 mt-0.5 ${config.textClass}`} />
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold ${config.textClass} leading-snug`}>{topic.name}</h4>
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${config.textClass} bg-white/40`}>
          {status}
        </span>
        {onTogglePin && (
          <button
            aria-label={pinned ? 'Unpin' : 'Pin'}
            onClick={(e) => { e.stopPropagation(); onTogglePin(topic.id) }}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <Pin size={14} fill={pinned ? 'currentColor' : 'none'} />
          </button>
        )}
      </header>
      {/* ...rest unchanged */}
    </article>
  )
}
```

- [ ] **Step 4: Wire `usePinnedItems` in `ContextPanel.v2.jsx`.**

Add at top of `ContextPanel.v2.jsx`:

```javascript
import { usePinnedItems } from '../../hooks/usePinnedItems'
```

Inside the main `ContextPanel` function, near the top:

```javascript
const { pin, unpin, isPinned } = usePinnedItems('context-topics')
```

Sort topics so pinned come first, and pass props:

```javascript
const sortedTopics = [...(topics_retrieved || [])].sort((a, b) => {
  const ap = isPinned(a.id) ? 0 : 1
  const bp = isPinned(b.id) ? 0 : 1
  return ap - bp
})

// in the Topics Section:
{sortedTopics.map((topic, i) => (
  <TopicCardV2
    key={topic.id || i}
    topic={topic}
    pinned={isPinned(topic.id)}
    onTogglePin={(id) => (isPinned(id) ? unpin(id) : pin(id))}
  />
))}
```

Do the SAME in the idle-state recent-threads block (Task 19), so pinning works there too:

```javascript
const sortedRecentTopics = [...recent.topics].sort((a, b) => {
  const ap = isPinned(a.id) ? 0 : 1
  const bp = isPinned(b.id) ? 0 : 1
  return ap - bp
})

{sortedRecentTopics.map((t, i) => (
  <TopicCardV2
    key={t.id || i}
    topic={t}
    pinned={isPinned(t.id)}
    onTogglePin={(id) => (isPinned(id) ? unpin(id) : pin(id))}
  />
))}
```

- [ ] **Step 5: Run tests.**

```bash
npm run test:run
# Expected: all green; TopicCardV2 now has 11 tests (7 + 4)
```

- [ ] **Step 6: Manual smoke test.**

Flag ON. Trigger context. Click pin icon on a TopicCard. Send another message that retrieves DIFFERENT topics. The pinned one stays at top.

- [ ] **Step 7: Commit + push.**

```bash
git add src/components/demo/TopicCard.v2.jsx src/components/demo/TopicCard.v2.test.jsx src/components/demo/ContextPanel.v2.jsx
git commit -m "feat(pin): pin/unpin TopicCard across context switches (localStorage)"
git push
```

---

## Task 32: F8 phase-close + full-suite green

- [ ] **Step 1: Full test suite.**

```bash
npm run test:run
```

Expected: ALL green. Note the counts roughly:
- useFeatureFlag: 6
- FeatureFlagsSection: 3
- VaultLayout: 2
- WelcomeStrip: 4
- TopicCardV2: 11
- ContextPanel idle state (none — manual)
- RailClusterPopover: 3
- IconRailV2: 4
- vault-recent: 1
- vault-last-seen: 4
- usePinnedItems: 7

Total ≈ 45 tests.

- [ ] **Step 2: Manual end-to-end smoke pass.**

```bash
npm run dev
```

With flag ON:
1. Land on `/vault/chat` → warm welcome strip appears with totals (or diff if backend shipped)
2. Right panel idle state shows recent threads + recently mentioned + recent moments
3. Type "Tell me about Mike" → panel switches to retrieved view; TopicCards show current_summary + decision + open questions
4. Pin a topic → send another message → pinned topic still at top
5. Click "You" cluster → popover opens with Self / Dates / Todos
6. Navigate to Self → "You" stays highlighted
7. Toggle flag OFF in Profile → everything returns to current UI

- [ ] **Step 3: Final push.**

```bash
git push
```

---

## Post-promote tasks (deferred — separate session)

When ready to roll the redesign out to everyone:

1. Change `useFeatureFlag` default for `vault_redesign` from `false` → `true` (or set `VITE_VAULT_REDESIGN_DEFAULT=true` in prod env).
2. Quiet observation period — gather feedback via Profile toggle.
3. Delete `ContextPanel.jsx`, `IconRail.jsx`. Rename `*.v2.jsx` → drop the `.v2`. Delete container files. Update imports.
4. Single PR; no behavior change.

Do NOT do this until explicitly approved.

---

## Self-review (already run)

**Spec coverage** — every spec section maps to tasks:
- §2 feature flag → Tasks 2 (hook) + 5 (Profile toggle) + 4 (theme switching)
- §3 visual register → Task 8 (WelcomeStrip wording) + Task 12 (panel header)
- §4.1 desktop rail → Tasks 22–24
- §4.2 mobile preserved → Task 25 (verification only)
- §4.3 chat landing → Tasks 8–9 (WelcomeStrip)
- §4.4 ContextPanel — KEEP, SIMPLIFY, DROP, NEW → Tasks 11–14, 15, 19, 31
- §5 data shape → Tasks 9, 15, 18, 27 (real fields, graceful fallbacks)
- §6 phasing F0–F8 → Tasks 1–32
- §7 graceful degradation → Tasks 8 (brand-new variant), 15 (omit-when-null), 27 (null on absent endpoint)
- §8 open questions → 1 (key naming) used; 2 (toggle copy) shipped in Task 5; 3 (preview URL) noted in Task 2 (env override)
- §9 H2 target → explicitly deferred (no tasks)
- §10 files affected → all created/modified
- §11 verification flow → Task 5 step 8 + Task 32
- §12 success criteria → measurable post-ship

**Placeholders:** none.

**Type consistency:** `vault_redesign` flag name spelled identically across tasks. `current_summary`, `last_decision`, `open_questions` field names match spec §5. `vault-theme-warm` class name consistent. `TopicCardV2` capitalisation consistent. `_rawTopics` / `_rawEntities` shape on `getWelcomeCounts` used identically in Task 28.

---

## Notes for the executing engineer

- **Worktree discipline:** All work happens in this worktree (`.worktrees/product-experience/vault-ux-redesign`). Never `cd` to the main checkout to commit — the branch will get out of sync.
- **Commit cadence:** Commit at the end of each task; push at the end of each phase (every 4-5 tasks).
- **Manual smoke tests:** When a step says "Flag ON / OFF" test, you must actually start `npm run dev` and click through. UI tests catch behavior; smoke tests catch visual regressions.
- **Backend ISS tasks:** Tasks 20 and 29 require switching to `~/Projects/AI_manager_v2`. Don't try to file backend tickets from this worktree.
- **Mobile:** No structural changes. Test on a narrow viewport in Chrome devtools to confirm BottomNav inherits the warm palette correctly.
- **If a step's exact code doesn't fit the current file:** read the file first, adapt the surrounding lines, but keep the named symbols (`useFeatureFlag`, `vault_redesign`, `WelcomeStrip`, etc.) exactly as specified — later tasks reference them by name.
