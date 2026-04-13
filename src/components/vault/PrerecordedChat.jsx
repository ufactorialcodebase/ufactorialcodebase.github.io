import { useRef, useEffect, useState } from 'react'
import { Brain, User, CheckCircle2, Database, Search, ChevronRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Demo conversation data (based on real Alex transcript sessions 4 & 8)
// ---------------------------------------------------------------------------

const DEMO_CONVERSATION = [
  {
    role: 'assistant',
    content: "Hey Priya! Good to see you again. I've been thinking about your Razorpay PM interview coming up on April 15th \u2014 how's the prep going? And I know you've been worried about your mom's knee pain too. How are things on that front?",
    isGreeting: true,
  },
  {
    role: 'user',
    content: "Mom called yesterday \u2014 the knee pain is getting worse. I need to find a good orthopedic doctor in Pune for her. My colleague mentioned Dr. Shah.",
    prompt: "Mom called yesterday \u2014 the knee pain is getting worse...",
  },
  {
    role: 'assistant',
    content: "I'm sorry to hear Sunita's knee pain is worsening \u2014 that must be concerning for both of you. Dr. Shah sounds like a promising lead since he comes recommended by a colleague.\n\nI've stored Dr. Shah as a contact and created an urgent task to book the appointment. Given that the pain is getting worse, I'd suggest calling his office first thing tomorrow morning.",
    toolCalls: [
      { name: 'memory_store_entity', status: 'done', description: 'Stored Dr. Shah (orthopedic specialist in Pune)' },
      { name: 'todo_create', status: 'done', description: 'Book urgent appointment with Dr. Shah for Mom \u2014 HIGH priority' },
    ],
    retrievalContext: {
      entities: ['Sunita (Mom)', 'Dr. Shah'],
      topics: ["Sunita's knee pain health concerns"],
      strategies: ['Family retrieval', 'Health topic match'],
    },
  },
  {
    role: 'user',
    content: "What do I have coming up? I feel like I'm losing track of things.",
    prompt: "What do I have coming up? I feel like I'm losing track...",
  },
  {
    role: 'assistant',
    content: "Here's what you have coming up, organized by priority and timing:\n\n**Urgent:**\n\u2022 Book Dr. Shah appointment for Mom's knee \u2014 pain is worsening\n\n**This Week:**\n\u2022 Get Rohan's costume materials for school annual day (due March 31st)\n\u2022 Continue Razorpay PM interview prep \u2014 case study practice\n\n**Coming Up:**\n\u2022 Razorpay PM interview \u2014 April 15th\n\u2022 Buy silk saree for Mom's birthday \u2014 due May 1st\n\u2022 Schedule Anika's vaccination \u2014 before end of May\n\u2022 Rohan's annual day performance \u2014 April 25th",
    toolCalls: [
      { name: 'todo_list', status: 'done', description: 'Retrieved 8 pending tasks' },
      { name: 'memory_get_self', status: 'done', description: 'Retrieved key dates and goals' },
    ],
    retrievalContext: {
      entities: ['Rohan', 'Anika', 'Sunita (Mom)', 'Razorpay'],
      topics: ['Razorpay PM interview', "Mom's birthday planning", "Sunita's knee pain"],
      strategies: ['Todo retrieval', 'Key dates', 'Active topics'],
    },
  },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToolCallPill({ tool }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      <span className="text-emerald-300 font-mono text-[11px]">{tool.name}</span>
      <span className="text-[var(--text-tertiary)] text-[11px] ml-1">{tool.description}</span>
    </div>
  )
}

function MessageBubble({ message, messageRef }) {
  const isUser = message.role === 'user'

  return (
    <div ref={messageRef} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm
        ${isUser
          ? 'bg-gradient-to-br from-slate-600 to-slate-800 text-white'
          : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
        }
      `}>
        {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Tool calls above assistant message */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {message.toolCalls.map((tc, idx) => (
              <ToolCallPill key={idx} tool={tc} />
            ))}
          </div>
        )}

        {/* Text bubble */}
        <div className={`
          inline-block px-4 py-3
          ${isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl rounded-br-md shadow-lg shadow-slate-900/10'
            : 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl rounded-bl-md shadow-sm'
          }
        `}>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {renderFormattedText(message.content)}
          </div>
        </div>

        {/* Greeting badge */}
        {message.isGreeting && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-violet-400/60">
            <Database className="w-3 h-3" />
            <span>Proactive greeting from memory</span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Minimal markdown: bold **text** rendering */
function renderFormattedText(text) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function ContextSidebar({ context }) {
  if (!context) return null

  return (
    <div className="w-64 flex-shrink-0 border-l border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 overflow-y-auto">
      <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
        Context Retrieved
      </h3>

      {/* Entities */}
      {context.entities && context.entities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[11px] font-medium text-violet-400 mb-2 flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            Entities
          </h4>
          <div className="space-y-1">
            {context.entities.map((e, i) => (
              <div key={i} className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2.5 py-1.5 rounded-md">
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {context.topics && context.topics.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[11px] font-medium text-indigo-400 mb-2 flex items-center gap-1.5">
            <Search className="w-3 h-3" />
            Topics
          </h4>
          <div className="space-y-1">
            {context.topics.map((t, i) => (
              <div key={i} className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2.5 py-1.5 rounded-md">
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retrieval strategies */}
      {context.strategies && context.strategies.length > 0 && (
        <div>
          <h4 className="text-[11px] font-medium text-emerald-400 mb-2 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3" />
            Strategies
          </h4>
          <div className="space-y-1">
            {context.strategies.map((s, i) => (
              <div key={i} className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-primary)] px-2.5 py-1.5 rounded-md font-mono">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PrerecordedChat({ personaId, personaName }) {
  const chatEndRef = useRef(null)
  const messageRefs = useRef({})
  const [activeContext, setActiveContext] = useState(null)

  // Set context from last assistant message with retrievalContext
  useEffect(() => {
    const lastWithContext = [...DEMO_CONVERSATION]
      .reverse()
      .find(m => m.retrievalContext)
    if (lastWithContext) {
      setActiveContext(lastWithContext.retrievalContext)
    }
  }, [])

  // Collect helper prompts (user messages with prompt field)
  const helperPrompts = DEMO_CONVERSATION
    .filter(m => m.role === 'user' && m.prompt)
    .map((m, idx) => ({ text: m.prompt, index: idx }))

  const scrollToExchange = (userMsgIndex) => {
    // Find the index of this user message among all user messages
    let userCount = -1
    for (let i = 0; i < DEMO_CONVERSATION.length; i++) {
      if (DEMO_CONVERSATION[i].role === 'user' && DEMO_CONVERSATION[i].prompt) {
        userCount++
        if (userCount === userMsgIndex) {
          const ref = messageRefs.current[i]
          if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          // Also update context sidebar to match the next assistant message
          const nextAssistant = DEMO_CONVERSATION[i + 1]
          if (nextAssistant?.retrievalContext) {
            setActiveContext(nextAssistant.retrievalContext)
          }
          break
        }
      }
    }
  }

  return (
    <div className="flex h-full">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {DEMO_CONVERSATION.map((msg, idx) => (
              <MessageBubble
                key={idx}
                message={msg}
                messageRef={el => { messageRefs.current[idx] = el }}
              />
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Helper prompts bar */}
        <div className="flex-shrink-0 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Jump to exchange
            </p>
            <div className="flex flex-wrap gap-2">
              {helperPrompts.map((hp, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToExchange(idx)}
                  className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-primary)]
                    px-3 py-1.5 rounded-full hover:border-violet-500/40 hover:text-violet-300 transition-all cursor-pointer"
                >
                  {hp.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Context sidebar (hidden on mobile) */}
      <div className="hidden lg:block">
        <ContextSidebar context={activeContext} />
      </div>
    </div>
  )
}
