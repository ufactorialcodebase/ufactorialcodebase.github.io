// src/components/demo/StreamingStatus.test.jsx — ISS-257 C4 status strip,
// exercised through MessageList's streaming indicator bubble.
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MessageList from './MessageList'

// jsdom does not implement Element.scrollIntoView (MessageList's
// auto-scroll calls it on the bottom anchor) — same stub as Chat.test.jsx.
if (typeof window !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

const baseMessages = [
  { id: 'u1', role: 'user', content: 'update my doc', timestamp: new Date().toISOString() },
]

function renderList(streamStatus) {
  return render(
    <MemoryRouter>
      <MessageList messages={baseMessages} isLoading streamStatus={streamStatus} />
    </MemoryRouter>
  )
}

describe('streaming status strip', () => {
  it('null status renders the default "Thinking..."', () => {
    renderList(null)
    expect(screen.getByTestId('stream-status')).toHaveTextContent('Thinking...')
  })

  it('connecting phase renders before any backend work', () => {
    renderList({ kind: 'connecting' })
    expect(screen.getByTestId('stream-status')).toHaveTextContent('Connecting…')
  })

  it('working phase renders the default indicator', () => {
    renderList({ kind: 'working' })
    expect(screen.getByTestId('stream-status')).toHaveTextContent('Thinking...')
  })

  it('in-flight tool renders its display-ready label', () => {
    renderList({ kind: 'tool', label: "Updating 'Q3 plan'" })
    expect(screen.getByTestId('stream-status')).toHaveTextContent("Updating 'Q3 plan'…")
  })

  it('stalled renders the connection-lost state, not a silent hang', () => {
    renderList({ kind: 'stalled' })
    expect(screen.getByTestId('stream-status-stalled')).toHaveTextContent(
      'Connection lost — your message is still being processed.'
    )
  })
})
