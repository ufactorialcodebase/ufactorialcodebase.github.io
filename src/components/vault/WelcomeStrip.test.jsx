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
