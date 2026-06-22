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
