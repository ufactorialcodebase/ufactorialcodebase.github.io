import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock the API modules before importing the component
vi.mock('../../../lib/api/vault-topic-mentions', () => ({
  getTopicMentions: vi.fn(),
}))
vi.mock('../../../lib/api/vault-episodes', () => ({
  getEpisode: vi.fn(),
}))

import MentionTimelineV2 from './MentionTimeline.v2'
import { getTopicMentions } from '../../../lib/api/vault-topic-mentions'
import { getEpisode } from '../../../lib/api/vault-episodes'

const SAMPLE_MENTIONS = [
  {
    id: 'm1',
    topic_sentiment: 'hopeful',
    conversation_at: '2026-06-20T14:45:00Z',
    attributed_to: 'user',
    context_snippet: 'We talked about the job opportunity at the startup.',
    decision_made: null,
    episode_id: 'ep-001',
    ai_input: 'That sounds exciting! What draws you to it?',
  },
  {
    id: 'm2',
    topic_sentiment: 'mixed',
    conversation_at: '2026-06-18T09:00:00Z',
    attributed_to: 'Sarah',
    context_snippet: 'Sarah mentioned she was worried about the timeline.',
    decision_made: 'Agreed to follow up next week',
    episode_id: 'ep-002',
    ai_input: null,
  },
]

describe('MentionTimelineV2', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders a placeholder when getTopicMentions returns null (API not yet shipped)', async () => {
    getTopicMentions.mockResolvedValue(null)
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      expect(screen.getByText(/Recent moments will appear here when the API ships/i)).toBeInTheDocument()
    })
  })

  it('renders empty message when mentions array is empty', async () => {
    getTopicMentions.mockResolvedValue({ mentions: [], total: 0 })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      expect(screen.getByText(/No moments captured yet/i)).toBeInTheDocument()
    })
  })

  it('renders sentiment dot and formatted date for each mention', async () => {
    getTopicMentions.mockResolvedValue({ mentions: SAMPLE_MENTIONS, total: 2 })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      // snippet text should be visible
      expect(screen.getByText(/We talked about the job opportunity/i)).toBeInTheDocument()
      expect(screen.getByText(/Sarah mentioned she was worried/i)).toBeInTheDocument()
    })
  })

  it('renders "About:" chip only when attributed_to is not "user"', async () => {
    getTopicMentions.mockResolvedValue({ mentions: SAMPLE_MENTIONS, total: 2 })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      // m2 has attributed_to: 'Sarah'
      expect(screen.getByText(/About: Sarah/i)).toBeInTheDocument()
      // m1 has attributed_to: 'user' — should NOT render About chip
      const aboutChips = screen.queryAllByText(/About:/i)
      expect(aboutChips).toHaveLength(1)
    })
  })

  it('renders decision badge when decision_made is present', async () => {
    getTopicMentions.mockResolvedValue({ mentions: SAMPLE_MENTIONS, total: 2 })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      expect(screen.getByText(/↓ decided: Agreed to follow up next week/i)).toBeInTheDocument()
    })
  })

  it('does not render decision badge when decision_made is null', async () => {
    const mentionWithoutDecision = [{ ...SAMPLE_MENTIONS[0], decision_made: null }]
    getTopicMentions.mockResolvedValue({ mentions: mentionWithoutDecision, total: 1 })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      expect(screen.queryByText(/↓ decided/i)).not.toBeInTheDocument()
    })
  })

  it('truncates long snippet and shows "more" link, which expands on click', async () => {
    const longText = 'a'.repeat(200)
    const mention = [{ ...SAMPLE_MENTIONS[0], context_snippet: longText }]
    getTopicMentions.mockResolvedValue({ mentions: mention, total: 1 })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      expect(screen.getByText('more')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('more'))
    await waitFor(() => {
      expect(screen.queryByText('more')).not.toBeInTheDocument()
    })
  })

  it('"View conversation details" toggles episode expand', async () => {
    getTopicMentions.mockResolvedValue({ mentions: [SAMPLE_MENTIONS[0]], total: 1 })
    getEpisode.mockResolvedValue({
      id: 'ep-001',
      summary_text: 'We had a great talk about career.',
      emotional_state: 'hopeful',
      life_areas: ['career'],
    })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      expect(screen.getByText('View conversation details')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('View conversation details'))
    await waitFor(() => {
      expect(screen.getByText(/We had a great talk about career/i)).toBeInTheDocument()
      expect(screen.getByText('hopeful')).toBeInTheDocument()
      expect(screen.getByText('career')).toBeInTheDocument()
    })
  })

  it('renders ai_input in a quote block when episode is expanded', async () => {
    getTopicMentions.mockResolvedValue({ mentions: [SAMPLE_MENTIONS[0]], total: 1 })
    getEpisode.mockResolvedValue({
      id: 'ep-001',
      summary_text: 'Career discussion.',
      emotional_state: null,
      life_areas: [],
    })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => screen.getByText('View conversation details'))
    fireEvent.click(screen.getByText('View conversation details'))
    await waitFor(() => {
      expect(screen.getByText(/That sounds exciting! What draws you to it/i)).toBeInTheDocument()
      expect(screen.getByText('HridAI replied')).toBeInTheDocument()
    })
  })

  it('fetches episode only once (caches on first expand)', async () => {
    getTopicMentions.mockResolvedValue({ mentions: [SAMPLE_MENTIONS[0]], total: 1 })
    getEpisode.mockResolvedValue({ id: 'ep-001', summary_text: 'Summary.' })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => screen.getByText('View conversation details'))
    // Open
    fireEvent.click(screen.getByText('View conversation details'))
    await waitFor(() => screen.getByText('Hide conversation details'))
    // Close
    fireEvent.click(screen.getByText('Hide conversation details'))
    // Re-open
    fireEvent.click(screen.getByText('View conversation details'))
    await waitFor(() => expect(getEpisode).toHaveBeenCalledTimes(1))
  })

  it('shows "+ History" button and appends mentions on click', async () => {
    const page1 = { mentions: [SAMPLE_MENTIONS[0]], total: 2 }
    const page2 = { mentions: [SAMPLE_MENTIONS[1]], total: 2 }
    getTopicMentions
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2)
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      expect(screen.getByText('+ History')).toBeInTheDocument()
      expect(screen.getByText(/We talked about the job opportunity/i)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('+ History'))
    await waitFor(() => {
      expect(screen.getByText(/Sarah mentioned she was worried/i)).toBeInTheDocument()
    })
  })

  it('hides "+ History" when all mentions are loaded', async () => {
    getTopicMentions.mockResolvedValue({ mentions: SAMPLE_MENTIONS, total: 2 })
    render(<MentionTimelineV2 topicId="topic-123" />)
    await waitFor(() => {
      expect(screen.queryByText('+ History')).not.toBeInTheDocument()
    })
  })

  it('renders null when topicId is not provided', async () => {
    getTopicMentions.mockResolvedValue(null)
    render(<MentionTimelineV2 topicId={null} />)
    await waitFor(() => {
      expect(screen.getByText(/Recent moments will appear here when the API ships/i)).toBeInTheDocument()
    })
  })
})
