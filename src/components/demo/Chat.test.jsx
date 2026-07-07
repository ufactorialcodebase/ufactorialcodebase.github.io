// Chat greeting-mount reliability regression tests
// (follow-up to feature/greeting-reliability-and-error-ux).
//
// Contract under test:
//   1. When getGreeting returns { error }, Chat surfaces BOTH an inline
//      retry banner (role="alert") AND a sonner toast with a Retry action.
//   2. Clicking the inline Retry button re-invokes getGreeting; on the
//      second call succeeding, the banner clears and the greeting renders.
//   3. Failure leaves the mount latch open — proven observationally by the
//      retry actually re-firing the network call (greetingLoaded=true would
//      cause the retry path to be a no-op via short-circuit).
//
// We aggressively mock every hook Chat depends on. That keeps the test
// scoped to the mount + retry code path we changed and avoids pulling in
// Supabase / cache / router / feature-flag machinery.

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// --- Mocks ---
// Sonner: capture toast.error calls to assert on title + description + action.
const toastErrorSpy = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    error: (...args) => toastErrorSpy(...args),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    message: vi.fn(),
  },
}))

// API surface: only getGreeting matters for these tests. The rest are stubbed
// as vi.fn() so imports resolve. getSessionId returns null so handleReset /
// handleExit code paths that guard on it stay quiet.
const getGreetingMock = vi.fn()
vi.mock('../../lib/api/index.js', () => ({
  getGreeting: (...args) => getGreetingMock(...args),
  sendMessageStream: vi.fn(),
  clearSessionId: vi.fn(),
  clearAccessCode: vi.fn(),
  getSessionId: vi.fn(() => null),
  endSession: vi.fn().mockResolvedValue({ success: true }),
  endSessionBeacon: vi.fn(),
  createCheckoutSession: vi.fn(),
}))

vi.mock('../../lib/auth', () => ({
  signOut: vi.fn(),
}))

// Auth: pretend the user is signed in as a premium account so mount effect
// gates pass and we render the vault-style chat surface.
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    session: { access_token: 'test-token' },
    plan: 'premium',
    conversationsRemaining: 5,
    initialized: true,
  }),
}))

vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, toggle: vi.fn() }),
}))

// Daily-limit: never blocked in these tests. activate is a stable no-op —
// matches the real useCallback([], ...) contract Chat.jsx relies on.
const dailyActivate = vi.fn()
vi.mock('../../hooks/useDailyLimit', () => ({
  useDailyLimit: () => ({
    isBlocked: false,
    source: null,
    resetsAt: null,
    message: null,
    remainingMs: 0,
    remainingText: '',
    activate: dailyActivate,
    clear: vi.fn(),
  }),
}))

// VaultLayout: exports useMobileContextPanel via createContext. Stub as null
// so Chat's mobileCtx-sync effect no-ops. Skip the real module to avoid
// dragging vault-cache / router imports into the test graph.
vi.mock('../vault/VaultLayout', () => ({
  useMobileContextPanel: () => null,
}))

// ContextPanelContainer: touches feature flags + heavy panels. Not exercised
// by mount/retry flow; render an inert stub.
vi.mock('./ContextPanelContainer', () => ({
  default: () => <div data-testid="context-panel" />,
}))

// jsdom does not implement Element.scrollIntoView (MessageList calls it on
// every messages-change effect). Without this stub, the success path tears
// the React tree down mid-commit and the banner-clear assertion looks like
// a Chat.jsx bug when it's actually a jsdom limitation.
if (typeof window !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

// Import AFTER mocks so vi.mock hoisting takes effect for Chat's imports.
import Chat from './Chat'

const SUCCESS_RESULT = {
  greeting: 'Hey — welcome back!',
  messages: ['Hey — welcome back!'],
  session_id: 'sess_abc',
  tool_calls: [],
  retrieval_trace: null,
  response_time_ms: 42,
  is_resumed: false,
  relative_time_phrase: null,
}

describe('Chat greeting-mount reliability', () => {
  beforeEach(() => {
    toastErrorSpy.mockClear()
    getGreetingMock.mockReset()
    dailyActivate.mockClear()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('surfaces inline retry banner + sonner toast when initial greeting errors', async () => {
    getGreetingMock.mockResolvedValueOnce({ error: 'Simulated backend outage' })

    render(<Chat mode="try_it_out" />)

    // Mount effect fires exactly one greeting request.
    await waitFor(() => {
      expect(getGreetingMock).toHaveBeenCalledTimes(1)
    })

    // Inline banner appears with the server-provided detail.
    const alertBanner = await screen.findByRole('alert')
    expect(alertBanner.textContent).toMatch(/Simulated backend outage/)

    // Retry button is present in the banner.
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    expect(retryBtn).toBeInTheDocument()

    // Sonner toast fires with the branded title + description + retry action.
    // (First-call is not-a-retry, so the action SHOULD be present.)
    expect(toastErrorSpy).toHaveBeenCalledTimes(1)
    const [toastTitle, toastOpts] = toastErrorSpy.mock.calls[0]
    expect(toastTitle).toBe('Could not load your greeting')
    expect(toastOpts.description).toBe('Simulated backend outage')
    expect(toastOpts.action).toBeDefined()
    expect(toastOpts.action.label).toBe('Retry')
    expect(typeof toastOpts.action.onClick).toBe('function')

    // Daily-limit not activated — this was a plain error, not a 429.
    expect(dailyActivate).not.toHaveBeenCalled()
  })

  it('clicking Retry re-invokes getGreeting and clears the banner on success', async () => {
    getGreetingMock
      .mockResolvedValueOnce({ error: 'First-mount hiccup' })
      .mockResolvedValueOnce(SUCCESS_RESULT)

    const user = userEvent.setup()
    render(<Chat mode="try_it_out" />)

    // Wait for the failure banner to render.
    await screen.findByRole('alert')
    expect(getGreetingMock).toHaveBeenCalledTimes(1)

    // Click the inline retry button.
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    await user.click(retryBtn)

    // Second network call fires — this is the observable proof that the
    // mount-latch (greetingLoaded) did NOT lock closed after the failure.
    await waitFor(() => {
      expect(getGreetingMock).toHaveBeenCalledTimes(2)
    })

    // Banner clears and the greeting text lands in the message list.
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
    expect(await screen.findByText(/Hey — welcome back!/)).toBeInTheDocument()
  })

  it('retry that also fails suppresses the toast Retry action (avoids infinite chain)', async () => {
    getGreetingMock
      .mockResolvedValueOnce({ error: 'Boom 1' })
      .mockResolvedValueOnce({ error: 'Boom 2' })

    const user = userEvent.setup()
    render(<Chat mode="try_it_out" />)

    await screen.findByRole('alert')
    await user.click(screen.getByRole('button', { name: /retry/i }))

    await waitFor(() => {
      expect(getGreetingMock).toHaveBeenCalledTimes(2)
    })
    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledTimes(2)
    })

    // Second toast — the retry-triggered one — must NOT carry an action, so
    // the user cannot spam Retry from within the toast. The inline banner
    // is still there for manual retry, but the toast's action is gone.
    const [, secondOpts] = toastErrorSpy.mock.calls[1]
    expect(secondOpts.description).toBe('Boom 2')
    expect(secondOpts.action).toBeUndefined()
  })
})
