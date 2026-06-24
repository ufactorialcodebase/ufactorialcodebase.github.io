// src/components/vault/IconRail.v2.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import IconRailV2 from './IconRail.v2'

describe('IconRailV2', () => {
  it('renders 4 cluster icons (Chat, You, Your World, Your Vault) + Settings', () => {
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    expect(screen.getByLabelText('Chat')).toBeInTheDocument()
    expect(screen.getByLabelText('You')).toBeInTheDocument()
    expect(screen.getByLabelText('Your World')).toBeInTheDocument()
    expect(screen.getByLabelText('Your Vault')).toBeInTheDocument()
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()
  })

  it('clicking "You" opens a popover with Self, Dates, Todos', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('You'))
    expect(screen.getByText('Self')).toBeInTheDocument()
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Todos')).toBeInTheDocument()
  })

  it('clicking "Your Vault" opens a popover with People, Threads, Lists, Artifacts', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('Your Vault'))
    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Threads')).toBeInTheDocument()
    expect(screen.getByText('Lists')).toBeInTheDocument()
    expect(screen.getByText('Artifacts')).toBeInTheDocument()
  })

  it('"Your World" does NOT open a popover (single sub-item)', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/vault/chat']}><IconRailV2 basePath="/vault" /></MemoryRouter>)
    await user.click(screen.getByLabelText('Your World'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
