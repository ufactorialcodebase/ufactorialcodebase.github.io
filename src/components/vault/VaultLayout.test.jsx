// src/components/vault/VaultLayout.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { setFeatureFlag } from '../../hooks/useFeatureFlag'

// Mock heavy dependencies so the test doesn't need env vars or network
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    userId: null,
    refreshSubscription: null,
  }),
  AuthProvider: ({ children }) => children,
}))

vi.mock('../../lib/vault-cache', () => ({
  getCached: () => null,
  setCached: () => {},
}))

vi.mock('../../lib/api/vault-world', () => ({
  getWorld: () => Promise.resolve({}),
}))

// Stub heavy sub-components that render nothing needed for this test
vi.mock('./ChatTab', () => ({ default: () => <div data-testid="chat-tab" /> }))
vi.mock('./AcceptanceGate', () => ({ default: () => null }))
vi.mock('./BetaWelcome', () => ({ default: () => null }))
vi.mock('./IconRail', () => ({ default: () => null }))
vi.mock('./BottomNav', () => ({ default: () => null }))
vi.mock('./MobileTopBar', () => ({ default: () => null }))

import VaultLayout from './VaultLayout'

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/vault/chat']}>
      <VaultLayout />
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
