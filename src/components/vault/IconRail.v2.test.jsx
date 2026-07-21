// src/components/vault/IconRail.v2.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import IconRailV2 from './IconRail.v2'

describe('IconRailV2', () => {
  it('renders 4 cluster icons (Chat, Memory, Notebook, World) + Settings', () => {
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    expect(screen.getByLabelText('Chat')).toBeInTheDocument()
    expect(screen.getByLabelText('Memory')).toBeInTheDocument()
    expect(screen.getByLabelText('Notebook')).toBeInTheDocument()
    expect(screen.getByLabelText('World')).toBeInTheDocument()
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()
  })

  it('clicking "Memory" opens a popover with Self, Network, Threads', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('Memory'))
    expect(screen.getByText('Self')).toBeInTheDocument()
    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.getByText('Threads')).toBeInTheDocument()
    // Dates + Todos moved to Notebook.
    expect(screen.queryAllByText('Dates')).toHaveLength(0)
    expect(screen.queryAllByText('Todos')).toHaveLength(0)
  })

  it('clicking "Notebook" opens a popover with Dates, Todos, Lists, Artifacts (no Threads)', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('Notebook'))
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Lists')).toBeInTheDocument()
    expect(screen.getByText('Artifacts')).toBeInTheDocument()
    // Threads belongs to Memory now, not Notebook.
    expect(screen.queryAllByText('Threads')).toHaveLength(0)
  })

  it('"World" does NOT open a popover (single sub-item)', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/vault/chat']}><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('World'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
