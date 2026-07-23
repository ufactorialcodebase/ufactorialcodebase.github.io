// src/components/vault/TabHint.test.jsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import TabHint, { tabHintKey } from './TabHint'

describe('TabHint', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => { vi.useRealTimers() })

  it('renders empty-variant copy when count is 0', () => {
    render(<TabHint tab="people" count={0} />)
    expect(screen.getByText("Everyone we've talked about lives here.")).toBeInTheDocument()
    expect(screen.getByText(/they show up here/)).toBeInTheDocument()
  })

  it('renders populated-variant copy with the count', () => {
    render(<TabHint tab="people" count={14} />)
    expect(screen.getByText('14 already here')).toBeInTheDocument()
  })

  it('does not render when previously dismissed', () => {
    localStorage.setItem(tabHintKey('todos'), 'true')
    render(<TabHint tab="todos" count={3} />)
    expect(screen.queryByTestId('tab-hint-todos')).not.toBeInTheDocument()
  })

  it('renders nothing for an unknown tab key', () => {
    const { container } = render(<TabHint tab="nonsense" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('fades in after the 400ms delay', () => {
    render(<TabHint tab="dates" count={0} />)
    const hint = screen.getByTestId('tab-hint-dates')
    expect(hint.className).toContain('opacity-0')
    act(() => { vi.advanceTimersByTime(400) })
    expect(hint.className).toContain('opacity-100')
  })

  it('X dismisses and persists to localStorage', () => {
    render(<TabHint tab="topics" count={9} />)
    fireEvent.click(screen.getByLabelText('Dismiss hint'))
    expect(localStorage.getItem(tabHintKey('topics'))).toBe('true')
    expect(screen.queryByTestId('tab-hint-topics')).not.toBeInTheDocument()
  })

  it('Escape dismisses once visible', () => {
    render(<TabHint tab="world" count={22} />)
    // Before the fade-in delay, Escape is ignored
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByTestId('tab-hint-world')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(400) })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(localStorage.getItem(tabHintKey('world'))).toBe('true')
    expect(screen.queryByTestId('tab-hint-world')).not.toBeInTheDocument()
  })
})
