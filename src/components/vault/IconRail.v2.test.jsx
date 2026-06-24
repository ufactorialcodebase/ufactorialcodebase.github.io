// src/components/vault/IconRail.v2.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import IconRailV2 from './IconRail.v2'

describe('IconRailV2', () => {
  it('renders 4 cluster icons (Chat, You, Your Memory, Your World) + Settings', () => {
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    expect(screen.getByLabelText('Chat')).toBeInTheDocument()
    expect(screen.getByLabelText('You')).toBeInTheDocument()
    expect(screen.getByLabelText('Your Memory')).toBeInTheDocument()
    expect(screen.getByLabelText('Your World')).toBeInTheDocument()
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()
  })

  it('clicking "You" opens a popover with Self, Dates, Todos, Network', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('You'))
    expect(screen.getByText('Self')).toBeInTheDocument()
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Network')).toBeInTheDocument()
  })

  it('clicking "Your Memory" opens a popover with Threads, Lists, Artifacts (no Network)', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('Your Memory'))
    expect(screen.getByText('Threads')).toBeInTheDocument()
    expect(screen.getByText('Lists')).toBeInTheDocument()
    expect(screen.getByText('Artifacts')).toBeInTheDocument()
    // Network belongs to "You" now, not "Your Memory".
    expect(screen.queryAllByText('Network')).toHaveLength(0)
  })

  it('"Your World" does NOT open a popover (single sub-item)', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/vault/chat']}><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('Your World'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
