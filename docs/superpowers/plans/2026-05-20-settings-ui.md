# Settings Page UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `/vault/profile` into a grouped, row-list **Settings** home with three in-page drill-in sub-views (Profile edit, Manage subscription, Privacy settings), relocate the dark-mode toggle into it, and support light + dark consistently with the chat.

**Architecture:** A container (`pages/Profile.jsx`) owns all data + a `view` state machine and renders one of four presentational views from `components/vault/settings/`. Theming uses Tailwind `dark:` variants on a slate palette (NOT the fixed-dark `--bg-*` vault vars), matching the shared chat component. No new routes — sub-views are component state.

**Tech Stack:** React 19, React Router 7, Tailwind 3 (`darkMode: 'class'`), lucide-react, Supabase auth, existing `useAuth` / `useTheme` hooks.

**Spec:** `docs/superpowers/specs/2026-05-20-settings-ui-design.md`
**Visual source of truth:** `docs/mockups/settings-ui-mockup.html` (phone + desktop, theme-switchable).

**Testing note:** This repo has **no JS unit-test framework** (only ESLint — see `package.json`). "Verify" steps therefore use `npm run lint`, `npm run build`, and manual checks in `npm run dev` at **375px** and **1280px**, in **both light and dark**. There is no `npm test`.

**Branch:** `product-experience/settings-ui` (already created, spec + mockup already committed).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/components/vault/settings/Toggle.jsx` | Create | Accessible on/off switch (indigo when on) |
| `src/components/vault/settings/SettingsSection.jsx` | Create | Uppercase label + rounded card wrapper |
| `src/components/vault/settings/SettingsRow.jsx` | Create | One row: label + value/right/chevron/toggle, inset divider, optional description, danger, link/button/div |
| `src/components/vault/settings/SettingsHome.jsx` | Create | The main sectioned page (all sections + footer) |
| `src/components/vault/settings/ProfileEdit.jsx` | Create | Edit sub-view: display name, email, password (+eye), user ID |
| `src/components/vault/settings/ManageSubscription.jsx` | Create | Sub-view: plan + greyed Upgrade |
| `src/components/vault/settings/PrivacySettings.jsx` | Create | Sub-view: data-sharing toggles |
| `src/pages/Profile.jsx` | Rewrite | Container: data, handlers, `view` state, renders the above |
| `src/components/vault/MobileTopBar.jsx` | Modify | Remove the Sun/Moon theme toggle |
| `src/components/demo/Chat.jsx` | Modify | Add `showThemeToggle` prop (default `true`); hide toggle when false |
| `src/components/vault/ChatTab.jsx` | Modify | Pass `showThemeToggle={false}` to both `<Chat>` renders |

**Palette (light default → dark override), consistent with the chat:**
- page `bg-white dark:bg-slate-900` · card `bg-slate-50 dark:bg-slate-800` · border `border-slate-200 dark:border-slate-700`
- text primary `text-slate-900 dark:text-slate-100` · secondary `text-slate-500 dark:text-slate-400` · label `text-slate-400 dark:text-slate-500`
- row hover `hover:bg-slate-100 dark:hover:bg-slate-700/50` · accent `indigo-500` · danger `rose-500 dark:rose-300`
- upgrade gradient `from-amber-500 to-orange-500` · "coming soon" pill `text-teal-600 dark:text-teal-400 bg-teal-500/10`

---

## Task 1: Shared primitives (Toggle, SettingsSection, SettingsRow)

**Files:**
- Create: `src/components/vault/settings/Toggle.jsx`
- Create: `src/components/vault/settings/SettingsSection.jsx`
- Create: `src/components/vault/settings/SettingsRow.jsx`

- [ ] **Step 1: Create `Toggle.jsx`**

```jsx
// src/components/vault/settings/Toggle.jsx
export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative flex-none w-[46px] h-[27px] rounded-full transition-colors ${
        checked ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-[22px]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}
```

- [ ] **Step 2: Create `SettingsSection.jsx`**

```jsx
// src/components/vault/settings/SettingsSection.jsx
export default function SettingsSection({ label, children, className = '' }) {
  return (
    <div className={`mt-6 ${className}`}>
      {label && (
        <div className="px-1.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
          {label}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `SettingsRow.jsx`**

```jsx
// src/components/vault/settings/SettingsRow.jsx
import { ChevronRight } from 'lucide-react'

export default function SettingsRow({
  label, value, description, right, onClick, href, chevron = false, danger = false,
}) {
  const stacked = Boolean(description)
  const base =
    'relative flex w-full gap-3 px-4 text-left ' +
    (stacked ? 'items-start py-3.5 ' : 'items-center justify-between min-h-[54px] ') +
    'after:absolute after:left-4 after:right-4 after:bottom-0 after:h-px after:bg-slate-200 dark:after:bg-slate-700 last:after:hidden ' +
    (onClick || href ? 'transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 ' : '')
  const labelCls = `text-[15px] font-medium ${danger ? 'text-rose-500 dark:text-rose-300' : 'text-slate-900 dark:text-slate-100'}`

  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className={labelCls}>{label}</div>
        {description && (
          <div className="mt-1 max-w-[230px] text-[12.5px] leading-snug text-slate-500 dark:text-slate-400">
            {description}
          </div>
        )}
      </div>
      <div className="flex flex-none items-center gap-2">
        {value && <span className="max-w-[185px] truncate text-[14px] text-slate-500 dark:text-slate-400">{value}</span>}
        {right}
        {chevron && <ChevronRight className="h-[18px] w-[18px] text-slate-400 dark:text-slate-500" />}
      </div>
    </>
  )

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={base}>{inner}</a>
  }
  if (onClick) {
    return <button type="button" onClick={onClick} className={base}>{inner}</button>
  }
  return <div className={base}>{inner}</div>
}
```

- [ ] **Step 4: Verify lint passes**

Run: `npm run lint`
Expected: no errors for the three new files (unused-var/parsing). They aren't imported yet, which is fine.

- [ ] **Step 5: Commit**

```bash
git add src/components/vault/settings/Toggle.jsx src/components/vault/settings/SettingsSection.jsx src/components/vault/settings/SettingsRow.jsx
git commit -m "feat(settings): shared row/section/toggle primitives"
```

---

## Task 2: Container scaffold (`pages/Profile.jsx`)

Rewrite `Profile.jsx` to own data + handlers + the `view` state machine, rendering `SettingsHome` (created next task — for this task, render a placeholder so the file compiles and the route loads).

**Files:**
- Rewrite: `src/pages/Profile.jsx`

- [ ] **Step 1: Replace `pages/Profile.jsx` with the container**

```jsx
// src/pages/Profile.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { resetPassword, updatePassword, signOut } from '../lib/auth'
import { createCheckoutSession } from '../lib/api/index.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function Profile() {
  const navigate = useNavigate()
  const { user, session, userId, clear, plan } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()

  const [view, setView] = useState('home') // 'home' | 'edit' | 'subscription' | 'privacy'
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) { navigate('/login'); return }
    fetch(`${API_BASE}/user/profile`, { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => r.json())
      .then((data) => { if (data.display_name) setDisplayName(data.display_name) })
      .catch(() => {})
  }, [session, navigate])

  const flash = useCallback((msg, isError = false) => {
    if (isError) { setError(msg); setMessage(null) } else { setMessage(msg); setError(null) }
    setTimeout(() => { setMessage(null); setError(null) }, 4000)
  }, [])

  const handleUpdateName = async () => {
    if (!session || !displayName.trim()) return
    setLoading(true)
    try {
      await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName }),
      })
      flash('Display name updated.')
    } catch { flash('Failed to update.', true) } finally { setLoading(false) }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setLoading(true)
    try { await resetPassword(user.email); flash('Reset email sent.') }
    catch { flash('Failed to send reset email.', true) } finally { setLoading(false) }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { flash('Min 8 characters.', true); return }
    setLoading(true)
    try { await updatePassword(newPassword); setNewPassword(''); flash('Password updated.') }
    catch { flash('Failed to change password.', true) } finally { setLoading(false) }
  }

  const handleCopyUserId = async () => {
    try { await navigator.clipboard.writeText(userId || ''); flash('User ID copied.') }
    catch { flash('Copy failed.', true) }
  }

  const handleLogout = async () => { await signOut(); clear(); navigate('/login') }

  // Wired but disabled until launch (button stays disabled — see launch_checklist.md)
  const handleUpgrade = async () => {
    setLoading(true)
    try { const url = await createCheckoutSession(); window.location.href = url }
    catch (err) { flash(err.message, true) } finally { setLoading(false) }
  }

  if (!session) return null

  const shared = {
    user, userId, plan, isDark, toggleTheme,
    displayName, setDisplayName, newPassword, setNewPassword,
    showPassword, setShowPassword, message, error, loading,
    handleUpdateName, handlePasswordReset, handleChangePassword,
    handleCopyUserId, handleLogout, handleUpgrade,
    goHome: () => setView('home'),
  }

  return (
    <div className="min-h-full bg-white dark:bg-slate-900">
      <div className="mx-auto w-full max-w-[520px] px-4 py-6 sm:py-8">
        {view === 'home' && (
          <div className="text-sm text-slate-500 dark:text-slate-400">Settings home — implemented in Task 3.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the route compiles and loads**

Run: `npm run dev`, open `http://localhost:5173/vault/profile` (sign in first).
Expected: page shows the white/slate background and the placeholder text; no console errors.

- [ ] **Step 3: Verify lint**

Run: `npm run lint`
Expected: no errors. (`createCheckoutSession`, `plan`, `handleUpgrade`, `setView` are referenced.)

- [ ] **Step 4: Commit**

```bash
git add src/pages/Profile.jsx
git commit -m "refactor(settings): Profile container with data + view state"
```

---

## Task 3: SettingsHome view

The main sectioned page. Renders into the container; receives `shared` props + `onNavigate(view)`.

**Files:**
- Create: `src/components/vault/settings/SettingsHome.jsx`
- Modify: `src/pages/Profile.jsx` (import + render it)

- [ ] **Step 1: Create `SettingsHome.jsx`**

```jsx
// src/components/vault/settings/SettingsHome.jsx
import { LogOut } from 'lucide-react'
import SettingsSection from './SettingsSection'
import SettingsRow from './SettingsRow'
import Toggle from './Toggle'

export default function SettingsHome({ s, onNavigate, onBack }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-1 pt-3">
        <h1 className="text-[30px] font-bold tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          Settings
        </h1>
        <button onClick={onBack} className="text-[13px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          Back to chat
        </button>
      </div>

      {/* Profile settings (collapsed) */}
      <SettingsSection className="mt-3.5">
        <button
          type="button"
          onClick={() => onNavigate('edit')}
          className="relative flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
        >
          <div>
            <div className="text-[15px] font-medium text-slate-900 dark:text-slate-100">Profile settings</div>
            <div className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Name, email &amp; password</div>
          </div>
          <span className="text-[14px] font-semibold text-indigo-500">Edit</span>
        </button>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection label="Preferences">
        <SettingsRow label="Dark mode" right={<Toggle checked={s.isDark} onChange={s.toggleTheme} label="Dark mode" />} />
        <SettingsRow label="Language" value="English" chevron />
      </SettingsSection>

      {/* Subscription */}
      <SettingsSection label="Subscription">
        <SettingsRow
          label="Current plan"
          right={<span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Closed beta</span>}
        />
        <SettingsRow label="Manage subscription" chevron onClick={() => onNavigate('subscription')} />
      </SettingsSection>

      {/* Data & Privacy */}
      <SettingsSection label="Data &amp; Privacy">
        <SettingsRow label="Privacy settings" chevron onClick={() => onNavigate('privacy')} />
        <SettingsRow label="Export my data" right={<ComingSoon />} />
        <SettingsRow label="Delete my data" danger right={<ComingSoon />} />
        <SettingsRow label="Delete my account" danger right={<ComingSoon />} />
      </SettingsSection>

      {/* About */}
      <SettingsSection label="About">
        <SettingsRow label="Version" value="2.0" />
        <SettingsRow label="Terms of Service" chevron href="/terms" />
        <SettingsRow label="Privacy Policy" chevron href="/privacy" />
        <SettingsRow label="Contact" chevron href="/contact" />
      </SettingsSection>

      {/* Footer */}
      <div className="px-2 pb-3 pt-9 text-center">
        <div className="text-[20px] font-bold tracking-tight text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          <span className="text-slate-900 dark:text-slate-100">Hrid</span>AI
        </div>
        <div className="mt-1.5 text-[12.5px] text-slate-400 dark:text-slate-500">Your personal AI manager</div>
        {(s.message || s.error) && (
          <div className={`mt-4 text-sm ${s.error ? 'text-rose-500' : 'text-emerald-500'}`}>{s.error || s.message}</div>
        )}
        <button
          onClick={s.handleLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/30 py-3.5 text-[15px] font-semibold text-rose-500 transition-colors hover:bg-rose-500/[0.06] dark:text-rose-300"
        >
          <LogOut className="h-[15px] w-[15px]" /> Sign out
        </button>
      </div>
    </div>
  )
}

function ComingSoon() {
  return (
    <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-[3px] text-[10.5px] font-semibold text-teal-600 dark:text-teal-400">
      Coming soon
    </span>
  )
}
```

- [ ] **Step 2: Wire it into the container**

In `src/pages/Profile.jsx`, add the import at the top:

```jsx
import SettingsHome from '../components/vault/settings/SettingsHome'
```

Replace the `{view === 'home' && (...)}` placeholder block with:

```jsx
{view === 'home' && (
  <SettingsHome s={shared} onNavigate={setView} onBack={() => navigate('/vault/chat')} />
)}
```

- [ ] **Step 3: Verify visually (light + dark, both widths)**

Run: `npm run dev` → `/vault/profile`.
Expected: full sectioned Settings home. Toggle "Dark mode" flips the whole page light/dark (matches the chat). At 375px and 1280px the column stays centered (max 520px). Terms/Privacy/Contact open in a **new tab**. Sign out works.

- [ ] **Step 4: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/vault/settings/SettingsHome.jsx src/pages/Profile.jsx
git commit -m "feat(settings): settings home (sections, dark-mode toggle, legal links)"
```

---

## Task 4: ProfileEdit sub-view

**Files:**
- Create: `src/components/vault/settings/ProfileEdit.jsx`
- Modify: `src/pages/Profile.jsx` (render when `view === 'edit'`)

- [ ] **Step 1: Create `ProfileEdit.jsx`**

```jsx
// src/components/vault/settings/ProfileEdit.jsx
import { ArrowLeft, Eye, EyeOff, Copy } from 'lucide-react'

const fieldWrap = 'relative px-4 py-4 after:absolute after:left-4 after:right-4 after:bottom-0 after:h-px after:bg-slate-200 dark:after:bg-slate-700 last:after:hidden'
const labelCls = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400 dark:text-slate-500'
const inputCls = 'w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

export default function ProfileEdit({ s, onBack }) {
  return (
    <div>
      <div className="flex items-center gap-3 px-1 pb-1 pt-3.5">
        <button onClick={onBack} aria-label="Back" className="rounded-lg p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-[24px] font-bold tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          Profile settings
        </h2>
      </div>

      <div className="mt-3.5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {/* Display name */}
        <div className={fieldWrap}>
          <label className={labelCls}>Display name</label>
          <div className="flex gap-2">
            <input className={inputCls} value={s.displayName} onChange={(e) => s.setDisplayName(e.target.value)} placeholder="Your name" />
            <button onClick={s.handleUpdateName} disabled={s.loading}
              className="rounded-[10px] bg-indigo-500 px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-indigo-600 disabled:opacity-50">
              Save
            </button>
          </div>
        </div>

        {/* Email */}
        <div className={fieldWrap}>
          <label className={labelCls}>Email</label>
          <input className={`${inputCls} text-slate-400 dark:text-slate-500`} value={s.user?.email || ''} readOnly />
        </div>

        {/* Change password */}
        <div className={fieldWrap}>
          <label className={labelCls}>Change password</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className={`${inputCls} pr-10`}
                type={s.showPassword ? 'text' : 'password'}
                value={s.newPassword}
                onChange={(e) => s.setNewPassword(e.target.value)}
                placeholder="New password (8+ chars)"
                minLength={8}
              />
              <button type="button" tabIndex={-1} onClick={() => s.setShowPassword(!s.showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {s.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button onClick={s.handleChangePassword} disabled={s.loading || s.newPassword.length < 8}
              className="rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Update
            </button>
          </div>
          <button onClick={s.handlePasswordReset} className="mt-2 text-[13px] text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300">
            Send reset email instead
          </button>
        </div>

        {/* User ID */}
        <div className={fieldWrap}>
          <label className={labelCls}>User ID</label>
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate font-mono text-[12.5px] text-slate-400 dark:text-slate-500">{s.userId}</span>
            <button onClick={s.handleCopyUserId} aria-label="Copy user ID"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300">
              <Copy size={15} />
            </button>
          </div>
        </div>
      </div>

      {(s.message || s.error) && (
        <div className={`mt-4 px-1 text-sm ${s.error ? 'text-rose-500' : 'text-emerald-500'}`}>{s.error || s.message}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Wire into container**

In `src/pages/Profile.jsx`, add import:

```jsx
import ProfileEdit from '../components/vault/settings/ProfileEdit'
```

Add after the `home` block:

```jsx
{view === 'edit' && <ProfileEdit s={shared} onBack={shared.goHome} />}
```

- [ ] **Step 3: Verify**

Run: `npm run dev` → Settings → "Edit". Test: change display name + Save (toast), type a password + eye toggle + Update, "Send reset email instead", copy User ID, back arrow returns home. Check light + dark, 375px + 1280px.

- [ ] **Step 4: Lint + build**

Run: `npm run lint && npm run build`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/vault/settings/ProfileEdit.jsx src/pages/Profile.jsx
git commit -m "feat(settings): profile edit sub-view (name, password+eye, user id)"
```

---

## Task 5: ManageSubscription sub-view

**Files:**
- Create: `src/components/vault/settings/ManageSubscription.jsx`
- Modify: `src/pages/Profile.jsx` (render when `view === 'subscription'`)

- [ ] **Step 1: Create `ManageSubscription.jsx`**

```jsx
// src/components/vault/settings/ManageSubscription.jsx
import { ArrowLeft } from 'lucide-react'
import SettingsRow from './SettingsRow'

export default function ManageSubscription({ s, onBack }) {
  return (
    <div>
      <div className="flex items-center gap-3 px-1 pb-1 pt-3.5">
        <button onClick={onBack} aria-label="Back" className="rounded-lg p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-[24px] font-bold tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          Manage subscription
        </h2>
      </div>

      <div className="mt-3.5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <SettingsRow
          label="Current plan"
          right={<span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Closed beta</span>}
        />
        <SettingsRow label="What you get" description="Free full access to all HridAI features until Beta launch." />
      </div>

      {/* Wired but disabled until launch — see docs/project/launch_checklist.md */}
      <button
        onClick={s.handleUpgrade}
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-2xl bg-slate-200 py-3.5 text-[15px] font-bold text-slate-400 dark:bg-slate-700 dark:text-slate-500"
      >
        Upgrade to Premium
      </button>
      <div className="mt-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500">
        Premium unlocks at launch — you'll keep beta access until then.
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire into container**

Add import:

```jsx
import ManageSubscription from '../components/vault/settings/ManageSubscription'
```

Add render branch:

```jsx
{view === 'subscription' && <ManageSubscription s={shared} onBack={shared.goHome} />}
```

- [ ] **Step 3: Verify**

`/vault/profile` → Subscription → "Manage subscription". Plan shows "Closed beta", Upgrade is greyed/disabled (no navigation), back arrow works. Light + dark, both widths.

- [ ] **Step 4: Lint + build**

Run: `npm run lint && npm run build` — pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/vault/settings/ManageSubscription.jsx src/pages/Profile.jsx
git commit -m "feat(settings): manage subscription sub-view (greyed upgrade)"
```

---

## Task 6: PrivacySettings sub-view

Local-only toggles (no backend persistence yet — see launch_checklist.md). Default all on.

**Files:**
- Create: `src/components/vault/settings/PrivacySettings.jsx`
- Modify: `src/pages/Profile.jsx` (render when `view === 'privacy'`)

- [ ] **Step 1: Create `PrivacySettings.jsx`**

```jsx
// src/components/vault/settings/PrivacySettings.jsx
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import SettingsRow from './SettingsRow'
import Toggle from './Toggle'

const ITEMS = [
  { key: 'analytics', label: 'Usage analytics', description: 'Help us improve HridAI by sharing anonymous usage data (e.g. which features you use). No personal memory content is included.' },
  { key: 'crash', label: 'Crash reports', description: 'Automatically send crash reports when something goes wrong. Helps us fix bugs faster.' },
  { key: 'ai', label: 'AI improvement', description: "Allow anonymized, aggregated patterns to help improve HridAI's models. Your individual data is never shared." },
]

export default function PrivacySettings({ onBack }) {
  // Local-only until a privacy_settings backend store exists (launch_checklist.md)
  const [state, setState] = useState({ analytics: true, crash: true, ai: true })
  const flip = (k) => setState((p) => ({ ...p, [k]: !p[k] }))

  return (
    <div>
      <div className="flex items-center gap-3 px-1 pb-1 pt-3.5">
        <button onClick={onBack} aria-label="Back" className="rounded-lg p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-[24px] font-bold tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          Privacy settings
        </h2>
      </div>

      <p className="px-1.5 py-3 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
        Control how your data is used. These settings don't affect the core functionality of HridAI — your memory and insights always remain private to you.
      </p>

      <div className="mt-1 px-1.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Data sharing</div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {ITEMS.map((it) => (
          <SettingsRow
            key={it.key}
            label={it.label}
            description={it.description}
            right={<Toggle checked={state[it.key]} onChange={() => flip(it.key)} label={it.label} />}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire into container**

Add import:

```jsx
import PrivacySettings from '../components/vault/settings/PrivacySettings'
```

Add render branch:

```jsx
{view === 'privacy' && <PrivacySettings onBack={shared.goHome} />}
```

- [ ] **Step 3: Verify**

`/vault/profile` → Data & Privacy → "Privacy settings". Three toggles render with descriptions, flip independently, back arrow works. Light + dark, both widths.

- [ ] **Step 4: Lint + build**

Run: `npm run lint && npm run build` — pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/vault/settings/PrivacySettings.jsx src/pages/Profile.jsx
git commit -m "feat(settings): privacy settings sub-view (data-sharing toggles)"
```

---

## Task 7: Relocate the dark-mode toggle out of the chat

Two toggles to remove from the vault chat surface and rely on Settings instead.

**Files:**
- Modify: `src/components/vault/MobileTopBar.jsx`
- Modify: `src/components/demo/Chat.jsx`
- Modify: `src/components/vault/ChatTab.jsx`

- [ ] **Step 1: Remove the toggle from `MobileTopBar.jsx`**

Delete the theme-toggle button (the `<button onClick={toggleTheme}>` block with the `Sun`/`Moon` icons), and remove the now-unused imports/hook. Specifically:
- Remove `Sun, Moon` from the lucide import (keep `Settings, Brain`).
- Remove the line `import { useTheme } from '../../hooks/useTheme'`.
- Remove the line `const { isDark, toggle: toggleTheme } = useTheme()`.
- Remove the entire `{/* Theme toggle */}` button block.

- [ ] **Step 2: Add `showThemeToggle` prop to `Chat.jsx`**

In `src/components/demo/Chat.jsx`, add `showThemeToggle = true` to the destructured props in the `export default function Chat({ ... })` signature (around line 22-32). Then wrap the theme-toggle button (the `<button onClick={toggleTheme} ...>` around line 432) so it only renders when enabled:

```jsx
{showThemeToggle && (
  <button
    onClick={toggleTheme}
    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    className="/* keep the existing classes from the current button */"
  >
    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
)}
```

(Keep the exact existing button `className` and any `aria`/wrapper attributes — only add the `{showThemeToggle && (...)}` guard.)

- [ ] **Step 3: Pass `showThemeToggle={false}` from `ChatTab.jsx`**

In `src/components/vault/ChatTab.jsx`, add `showThemeToggle={false}` to **both** `<Chat ... />` renders (the demo branch and the default `try_it_out` branch). Example for the default branch:

```jsx
return (
  <Chat
    mode="try_it_out"
    suggestedPrompts={DEFAULT_PROMPTS}
    showThemeToggle={false}
  />
)
```

- [ ] **Step 4: Verify the toggle moved, not lost**

Run: `npm run dev`.
Expected:
- Vault chat (`/vault/chat`) desktop: **no** moon/sun toggle in the chat header.
- Vault chat mobile (375px): **no** toggle in the top bar.
- Public demo chat (`/demo` → try it / a persona): the chat header **still** shows the toggle (its consumers don't pass `showThemeToggle`, default `true`).
- Settings → Preferences → Dark mode still flips theme globally (persists across reload).

- [ ] **Step 5: Lint + build**

Run: `npm run lint && npm run build`
Expected: pass (no unused `useTheme`/`Sun`/`Moon` warnings in `MobileTopBar`).

- [ ] **Step 6: Commit**

```bash
git add src/components/vault/MobileTopBar.jsx src/components/demo/Chat.jsx src/components/vault/ChatTab.jsx
git commit -m "feat(settings): relocate dark-mode toggle from chat into settings"
```

---

## Task 8: Full verification pass

**Files:** none (verification + final commit if any cleanup).

- [ ] **Step 1: Lint + production build**

Run: `npm run lint && npm run build`
Expected: both clean.

- [ ] **Step 2: Manual matrix — at 375px and 1280px, in light and dark**

Verify on `/vault/profile`:
- Home: all sections render; section labels, inset dividers, hover states correct in both themes.
- Dark mode toggle flips the whole Settings page and the chat consistently; persists across reload.
- Display name save → toast; password update + eye; reset email; copy User ID → toast.
- Manage subscription: greyed Upgrade (disabled); back works.
- Privacy: 3 toggles flip; back works.
- About: Terms / Privacy / Contact each open in a **new tab**; Version shows 2.0.
- Sign out returns to login.
- No layout breakage at 375px (column ~520px max, full-width on mobile) or 1280px (centered within icon-rail shell). Bottom nav (mobile) / icon rail (desktop) still render.

- [ ] **Step 3: Confirm scope hygiene**

Run: `git status`
Expected: only files listed in this plan changed. **No** changes under `src/components/vault/self/*` (parallel session owns Self).

- [ ] **Step 4: Final commit (if any cleanup)**

```bash
git add -A
git commit -m "chore(settings): verification pass cleanup" || echo "nothing to commit"
```

---

## Self-Review (completed by author)

- **Spec coverage:** Profile-collapsed→edit (T3/T4), Preferences = Dark mode + Language (T3), Subscription = Closed beta + Manage→greyed Upgrade (T3/T5), Data & Privacy = Privacy page + Export/Delete coming-soon (T3/T6), About = 2.0 + legal new-tab (T3), footer sign-out (T3), dark-mode relocation incl. both toggles + `showThemeToggle` prop (T7), light/dark via slate `dark:` variants (all tasks), in-page sub-views no routing change (T2). ✓
- **Placeholders:** none — every component has full code; the one intentional stub (Task 2 home placeholder) is replaced in Task 3.
- **Type/prop consistency:** the `shared` object (`s`) prop is defined in Task 2 and consumed identically in Tasks 3-6; `onNavigate(view)`/`onBack`/`goHome` names are consistent; `Toggle` uses `checked`/`onChange`/`label` everywhere; `SettingsRow` uses `label/value/description/right/onClick/href/chevron/danger` everywhere.
- **Out of scope honored:** no Self files; Upgrade/Language/Privacy-persistence/Export/Delete left unwired per launch_checklist.
