// src/components/demo/ToolCallCard.test.jsx — ISS-257 C4 reveal + label rules
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ToolCallCard, { shouldShowToolCall } from './ToolCallCard'

const base = { name: 'update_artifact', input: { title: 'Q3 plan' } }

describe('shouldShowToolCall (ISS-257 D1 reveal rules)', () => {
  it('slow_expected pending tool (revealed:true) shows immediately', () => {
    expect(shouldShowToolCall({ ...base, success: null, revealed: true })).toBe(true)
  })

  it('fast pending tool below the 2.5s threshold (revealed:false) is hidden', () => {
    expect(shouldShowToolCall({ ...base, success: null, revealed: false })).toBe(false)
  })

  it('completed tool always shows regardless of reveal flag', () => {
    // revealed:false only gates PENDING tools — a stale false must never
    // hide a completion receipt (the receipt is the retry-loop breaker).
    expect(shouldShowToolCall({ ...base, success: true, revealed: false, result: {} })).toBe(true)
    expect(shouldShowToolCall({ ...base, success: true, revealed: true })).toBe(true)
  })

  it('legacy tool entries without the reveal flag keep the old behavior', () => {
    expect(shouldShowToolCall({ ...base, success: null })).toBe(true)
    expect(shouldShowToolCall({ ...base, success: true })).toBe(true)
  })

  it('failed and non-whitelisted tools stay hidden', () => {
    expect(shouldShowToolCall({ ...base, success: false })).toBe(false)
    expect(shouldShowToolCall({ name: 'memory_search', success: true })).toBe(false)
  })
})

describe('ToolCallCard pending label (ISS-257)', () => {
  it("prefers the backend's display-ready label while pending", () => {
    render(
      <MemoryRouter>
        <ToolCallCard toolCall={{ ...base, success: null, label: "Updating 'Q3 plan'" }} />
      </MemoryRouter>
    )
    expect(screen.getByText("Updating 'Q3 plan'")).toBeInTheDocument()
  })

  it('falls back to the per-tool loading string without a label', () => {
    render(
      <MemoryRouter>
        <ToolCallCard toolCall={{ ...base, success: null }} />
      </MemoryRouter>
    )
    expect(screen.getByText('Updating artifact...')).toBeInTheDocument()
  })
})
