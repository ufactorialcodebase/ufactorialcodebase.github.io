// src/components/vault/SpotlightTour.test.jsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import SpotlightTour, { SPOTLIGHT_KEY } from './SpotlightTour'

// jsdom has no matchMedia; the component treats its absence as mobile.
function mockDesktop(matches = true) {
  window.matchMedia = vi.fn().mockReturnValue({ matches })
}

// jsdom reports 0x0 rects; give every data-tour-anchor a real-looking one.
function addAnchor(name, rect) {
  const el = document.createElement('div')
  el.setAttribute('data-tour-anchor', name)
  el.getBoundingClientRect = () => ({
    width: 100, height: 40, top: 300, left: 10, right: 110, bottom: 340,
    ...rect,
  })
  document.body.appendChild(el)
  return el
}

function addAllAnchors() {
  addAnchor('composer', { top: 500, bottom: 560 })
  addAnchor('world', { top: 200 })
  addAnchor('memory', { top: 100 })
  addAnchor('notebook', { top: 150 })
}

async function renderActiveTour() {
  render(<SpotlightTour enabled />)
  // First measurement is deferred 350ms so the welcome modal can unmount.
  await act(async () => { vi.advanceTimersByTime(350) })
}

describe('SpotlightTour', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    mockDesktop(true)
    addAllAnchors()
  })
  afterEach(() => {
    vi.useRealTimers()
    document.querySelectorAll('[data-tour-anchor]').forEach((el) => el.remove())
  })

  it('shows step 1 (chat composer) when enabled on desktop', async () => {
    await renderActiveTour()
    expect(screen.getByText('This is your chat.')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-hole')).toBeInTheDocument()
  })

  it('does not render when disabled', async () => {
    render(<SpotlightTour enabled={false} />)
    await act(async () => { vi.advanceTimersByTime(350) })
    expect(screen.queryByTestId('spotlight-tour')).not.toBeInTheDocument()
  })

  it('does not render when already completed', async () => {
    localStorage.setItem(SPOTLIGHT_KEY, 'true')
    await renderActiveTour()
    expect(screen.queryByTestId('spotlight-tour')).not.toBeInTheDocument()
  })

  it('does not render on mobile and leaves the flag unset', async () => {
    mockDesktop(false)
    await renderActiveTour()
    expect(screen.queryByTestId('spotlight-tour')).not.toBeInTheDocument()
    expect(localStorage.getItem(SPOTLIGHT_KEY)).toBeNull()
  })

  it('does not render when the anchor is missing (e.g. hidden layout)', async () => {
    document.querySelectorAll('[data-tour-anchor]').forEach((el) => el.remove())
    await renderActiveTour()
    expect(screen.queryByTestId('spotlight-tour')).not.toBeInTheDocument()
  })

  it('walks through all four steps and finishes', async () => {
    await renderActiveTour()
    fireEvent.click(screen.getByText('Next →'))
    expect(screen.getByText('Your world, visualized.')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Next →'))
    expect(screen.getByText('Everything I remember about your world.')).toBeInTheDocument()
    // Memory step carries the 5 Self example rows
    expect(screen.getByText('Location · San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByText('Health · Running weekly, sleep 7 hrs')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Next →'))
    expect(screen.getByText('The things I keep for you.')).toBeInTheDocument()
    expect(screen.getByText(/You can directly create, edit, or delete them in the Notebook/)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Let's start →"))
    expect(localStorage.getItem(SPOTLIGHT_KEY)).toBe('true')
    expect(screen.queryByTestId('spotlight-tour')).not.toBeInTheDocument()
  })

  it('Back returns to the previous step and is disabled on step 1', async () => {
    await renderActiveTour()
    expect(screen.getByText('← Back')).toBeDisabled()
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('← Back'))
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('Skip tour sets the flag and dismisses', async () => {
    await renderActiveTour()
    fireEvent.click(screen.getByText('Skip tour'))
    expect(localStorage.getItem(SPOTLIGHT_KEY)).toBe('true')
    expect(screen.queryByTestId('spotlight-tour')).not.toBeInTheDocument()
  })

  it('Escape skips; arrow keys navigate', async () => {
    await renderActiveTour()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    await act(async () => { vi.advanceTimersByTime(0) })
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    await act(async () => { vi.advanceTimersByTime(0) })
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(localStorage.getItem(SPOTLIGHT_KEY)).toBe('true')
  })
})
