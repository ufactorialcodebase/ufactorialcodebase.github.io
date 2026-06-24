// src/components/vault/RailClusterPopover.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RailClusterPopover from './RailClusterPopover'

const items = [
  { path: '/vault/self', label: 'Self' },
  { path: '/vault/dates', label: 'Dates' },
  { path: '/vault/todos', label: 'Todos' },
]

describe('RailClusterPopover', () => {
  it('does not render content when closed', () => {
    render(<MemoryRouter><RailClusterPopover open={false} items={items} onSelect={() => {}} /></MemoryRouter>)
    expect(screen.queryByText('Self')).not.toBeInTheDocument()
  })

  it('renders all items when open', () => {
    render(<MemoryRouter><RailClusterPopover open items={items} onSelect={() => {}} /></MemoryRouter>)
    expect(screen.getByText('Self')).toBeInTheDocument()
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Todos')).toBeInTheDocument()
  })

  it('calls onSelect with path when item clicked', async () => {
    const user = userEvent.setup()
    let chosen = null
    render(<MemoryRouter><RailClusterPopover open items={items} onSelect={(p) => { chosen = p }} /></MemoryRouter>)
    await user.click(screen.getByText('Dates'))
    expect(chosen).toBe('/vault/dates')
  })
})
