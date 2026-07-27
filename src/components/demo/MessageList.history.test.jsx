// src/components/demo/MessageList.history.test.jsx — rolling transcripts UI
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MessageList from './MessageList'

if (typeof window !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

const HISTORY = [
  { id: 'h1', role: 'user', content: 'old question', timestamp: '2026-07-25T10:00:00Z', historical: true },
  { id: 'h2', role: 'assistant', content: 'old answer', timestamp: '2026-07-25T10:00:30Z', historical: true },
]
const LIVE = [
  { id: 'm1', role: 'assistant', content: 'fresh greeting', timestamp: '2026-07-27T09:00:00Z' },
]

describe('MessageList history rendering', () => {
  it('renders history above live messages in one stream', () => {
    render(<MessageList messages={LIVE} isLoading={false} historyMessages={HISTORY} />)
    const texts = screen.getAllByText(/old question|old answer|fresh greeting/).map((n) => n.textContent)
    expect(texts).toEqual(['old question', 'old answer', 'fresh greeting'])
  })

  it('separates different days with date ribbons across the combined stream', () => {
    render(<MessageList messages={LIVE} isLoading={false} historyMessages={HISTORY} />)
    // 07-25 (history) and 07-27 (live) → two ribbons
    expect(screen.getAllByTestId('date-ribbon').length).toBe(2)
  })

  it('shows Load older messages only when more history exists', () => {
    const onLoadOlder = vi.fn()
    const { rerender } = render(
      <MessageList messages={LIVE} isLoading={false} historyMessages={HISTORY} hasMoreHistory onLoadOlder={onLoadOlder} />
    )
    fireEvent.click(screen.getByTestId('load-older-messages'))
    expect(onLoadOlder).toHaveBeenCalledOnce()

    rerender(
      <MessageList messages={LIVE} isLoading={false} historyMessages={HISTORY} hasMoreHistory={false} />
    )
    expect(screen.queryByTestId('load-older-messages')).not.toBeInTheDocument()
  })

  it('load-older button shows loading state and disables', () => {
    render(
      <MessageList messages={LIVE} isLoading={false} historyMessages={HISTORY} hasMoreHistory loadingOlder />
    )
    const btn = screen.getByTestId('load-older-messages')
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('Loading…')
  })

  it('history alone suppresses the empty-state (continuation with no new messages)', () => {
    render(<MessageList messages={[]} isLoading={false} historyMessages={HISTORY} />)
    expect(screen.queryByText('Start a Conversation')).not.toBeInTheDocument()
    expect(screen.getByText('old answer')).toBeInTheDocument()
  })
})
