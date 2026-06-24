import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopicCardV2 from './TopicCard.v2'

const baseTopic = {
  id: 't1',
  name: 'HridAI conference presentation and introduction strategy',
  current_summary: 'Successfully presented at conference; gathered feedback.',
  current_status: 'active',
  last_mentioned: '2026-05-22T18:00:00Z',
}

describe('TopicCardV2', () => {
  it('renders the name and current_summary', () => {
    render(<TopicCardV2 topic={baseTopic} />)
    expect(screen.getByText(baseTopic.name)).toBeInTheDocument()
    expect(screen.getByText(/Successfully presented/i)).toBeInTheDocument()
  })

  it('renders status chip', () => {
    render(<TopicCardV2 topic={baseTopic} />)
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('renders last_decision when present', () => {
    const t = { ...baseTopic, last_decision: 'Will work backwards from connections.' }
    render(<TopicCardV2 topic={t} />)
    expect(screen.getByText(/decided:/i)).toBeInTheDocument()
    expect(screen.getByText(/Will work backwards/i)).toBeInTheDocument()
  })

  it('omits last_decision block when missing', () => {
    render(<TopicCardV2 topic={baseTopic} />)
    expect(screen.queryByText(/decided:/i)).not.toBeInTheDocument()
  })

  it('renders open_questions as a bulleted list, capped at 3 with +N more', () => {
    const t = { ...baseTopic, open_questions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] }
    render(<TopicCardV2 topic={t} />)
    expect(screen.getByText('Q1')).toBeInTheDocument()
    expect(screen.getByText('Q2')).toBeInTheDocument()
    expect(screen.getByText('Q3')).toBeInTheDocument()
    expect(screen.queryByText('Q4')).not.toBeInTheDocument()
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('omits open_questions block when array is empty', () => {
    const t = { ...baseTopic, open_questions: [] }
    render(<TopicCardV2 topic={t} />)
    expect(screen.queryByText(/^open$/i)).not.toBeInTheDocument()
  })

  it('falls back to topic.context when current_summary is missing', () => {
    const t = { ...baseTopic, current_summary: undefined, context: 'fallback narrative' }
    render(<TopicCardV2 topic={t} />)
    expect(screen.getByText('fallback narrative')).toBeInTheDocument()
  })
})

describe('TopicCardV2 — pin affordance', () => {
  it('renders pin button when onTogglePin is provided', () => {
    render(<TopicCardV2 topic={baseTopic} onTogglePin={() => {}} pinned={false} />)
    expect(screen.getByLabelText(/pin/i)).toBeInTheDocument()
  })

  it('does NOT render pin button when onTogglePin is missing', () => {
    render(<TopicCardV2 topic={baseTopic} />)
    expect(screen.queryByLabelText(/pin/i)).not.toBeInTheDocument()
  })

  it('clicking pin calls onTogglePin with topic.id', async () => {
    const user = userEvent.setup()
    let calledWith = null
    render(<TopicCardV2 topic={baseTopic} onTogglePin={(id) => { calledWith = id }} pinned={false} />)
    await user.click(screen.getByLabelText(/^pin$/i))
    expect(calledWith).toBe('t1')
  })

  it('renders "Unpin" label when pinned', () => {
    render(<TopicCardV2 topic={baseTopic} onTogglePin={() => {}} pinned />)
    expect(screen.getByLabelText(/unpin/i)).toBeInTheDocument()
  })
})
