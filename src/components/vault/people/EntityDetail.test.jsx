// src/components/vault/people/EntityDetail.test.jsx — entity-view editing
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EntityDetail from './EntityDetail'

const ENTITY = {
  id: 'e1',
  name: 'Smita',
  type: 'person',
  relationship_to_self: 'mother',
  aliases: ['Smi'],
  attributes: {},
}

const CONNECTIONS = [
  { relId: 'rel-1', otherId: 'e2', otherLabel: 'Karwar', otherType: 'place', relation: 'lives in' },
  { relId: null, otherId: 'e3', otherLabel: 'Chanda', otherType: 'person', relation: 'sister of' },
]

function startInlineEdit(displayText) {
  fireEvent.click(screen.getByText(displayText))
  return screen.getByDisplayValue(displayText)
}

describe('EntityDetail editing', () => {
  it('renaming keeps the old name as an alias and propagates via onUpdate', () => {
    const onUpdate = vi.fn()
    render(<EntityDetail entity={ENTITY} onUpdate={onUpdate} />)
    const input = startInlineEdit('Smita')
    fireEvent.change(input, { target: { value: 'Smitha' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Smitha', aliases: ['Smi', 'Smita'] })
    )
  })

  it('case-only rename does not alias the old name', () => {
    const onUpdate = vi.fn()
    render(<EntityDetail entity={ENTITY} onUpdate={onUpdate} />)
    const input = startInlineEdit('Smita')
    fireEvent.change(input, { target: { value: 'SMITA' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'SMITA', aliases: ['Smi'] })
    )
  })

  it('underscored relationships display humanized and store snake_case', () => {
    const onUpdate = vi.fn()
    render(
      <EntityDetail
        entity={{ ...ENTITY, relationship_to_self: 'extended_family' }}
        onUpdate={onUpdate}
      />
    )
    // Display form has no underscore
    const input = startInlineEdit('extended family')
    fireEvent.change(input, { target: { value: 'in law' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    // Storage form goes back to snake_case — backend matchers stay intact
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ relationship_to_self: 'in_law' })
    )
  })

  it('relationship-to-self is editable and propagates', () => {
    const onUpdate = vi.fn()
    render(<EntityDetail entity={ENTITY} onUpdate={onUpdate} />)
    const input = startInlineEdit('mother')
    fireEvent.change(input, { target: { value: 'mom' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ relationship_to_self: 'mom' })
    )
  })

  it('renders connections; clicking a name selects that entity', () => {
    const onSelectEntity = vi.fn()
    render(
      <EntityDetail entity={ENTITY} connections={CONNECTIONS} onSelectEntity={onSelectEntity} />
    )
    expect(screen.getByTestId('entity-connections')).toHaveTextContent('Connected to (2)')
    fireEvent.click(screen.getByText('Karwar'))
    expect(onSelectEntity).toHaveBeenCalledWith('e2')
  })

  it('relationship label with a row id is editable; without one it is static', () => {
    const onUpdateRelationship = vi.fn()
    render(
      <EntityDetail
        entity={ENTITY}
        connections={CONNECTIONS}
        onUpdateRelationship={onUpdateRelationship}
      />
    )
    // rel-1 has an id → editable
    const input = startInlineEdit('lives in')
    fireEvent.change(input, { target: { value: 'hometown of' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onUpdateRelationship).toHaveBeenCalledWith('rel-1', 'hometown of')
    // relId null → plain text, clicking does not open an editor
    fireEvent.click(screen.getByText('sister of'))
    expect(screen.queryByDisplayValue('sister of')).not.toBeInTheDocument()
  })
})
