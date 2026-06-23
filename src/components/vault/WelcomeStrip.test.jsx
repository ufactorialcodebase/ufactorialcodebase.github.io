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

  it('renders nothing when counts are all zero (chat greeting carries the welcome)', () => {
    const { container } = render(<WelcomeStrip name="Pratik" counts={{ people: 0, threads: 0, decisions: 0, openQuestions: 0 }} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when counts is null (still loading or fetch failed)', () => {
    const { container } = render(<WelcomeStrip name="Pratik" counts={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('uses "there" fallback when name is missing', () => {
    render(<WelcomeStrip counts={{ people: 1, threads: 1, decisions: 1, openQuestions: 1 }} />)
    expect(screen.getByText(/Hi there/i)).toBeInTheDocument()
  })
})
