// src/components/vault/OnboardingTour.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OnboardingTour, { ONBOARDING_KEY } from './OnboardingTour'

describe('OnboardingTour', () => {
  beforeEach(() => { localStorage.clear() })

  it('renders pane 1 for a fresh user', () => {
    render(<OnboardingTour />)
    expect(screen.getByText('Welcome to your HridAI')).toBeInTheDocument()
    expect(screen.getByText('1 of 2')).toBeInTheDocument()
  })

  it('does not render when already completed', () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    render(<OnboardingTour />)
    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument()
  })

  it('advances to pane 2 and back', () => {
    render(<OnboardingTour />)
    fireEvent.click(screen.getByText("See what's inside →"))
    expect(screen.getByText('Everything gets organized here')).toBeInTheDocument()
    expect(screen.getByText('2 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByText('← Back'))
    expect(screen.getByText('Welcome to your HridAI')).toBeInTheDocument()
  })

  it('pane 2 shows the four vault sections', () => {
    render(<OnboardingTour />)
    fireEvent.click(screen.getByText("See what's inside →"))
    for (const name of ['Chat', 'World', 'Memory', 'Notebook']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('completing via "Let\'s start" sets the flag and calls onComplete', () => {
    const onComplete = vi.fn()
    render(<OnboardingTour onComplete={onComplete} />)
    fireEvent.click(screen.getByText("See what's inside →"))
    fireEvent.click(screen.getByText("Let's start →"))
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('true')
    expect(onComplete).toHaveBeenCalledOnce()
    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument()
  })

  it('skip link sets the flag and dismisses', () => {
    const onComplete = vi.fn()
    render(<OnboardingTour onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Skip tour'))
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('true')
    expect(onComplete).toHaveBeenCalledOnce()
    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument()
  })

  it('Escape key skips the tour', () => {
    render(<OnboardingTour />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('true')
    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument()
  })

  it('arrow keys navigate between panes', () => {
    render(<OnboardingTour />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('2 of 2')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('1 of 2')).toBeInTheDocument()
  })
})
