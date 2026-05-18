// src/components/demo/PersonaOnboarding.jsx
import { useState } from 'react'

const ALEX_CONTEXT = {
  name: 'Alex Chen',
  subtitle: '34-year-old Senior Product Manager. Alex has been using his HridAI for 6 months — talking through personal milestones, life decisions, office challenges, and to feel like he isn\'t managing his life alone.',
  cards: [
    { emoji: '👨‍👩‍👦', label: 'Family', color: '#60a5fa', text: 'Wife Sarah (pregnant), son Max (5), Mom Linda in Phoenix' },
    { emoji: '🏠', label: 'Big Decision', color: '#14b8a6', text: 'Planning a move from SF to Phoenix — closer to Mom, more space for the baby' },
    { emoji: '💼', label: 'Work', color: '#f59e0b', text: 'Just promoted to Senior PM. Navigating remote work approval & Q2 roadmap stress' },
    { emoji: '🏃', label: 'Personal', color: '#ec4899', text: 'Training for a half marathon. Uses running to decompress from work & life stress' },
  ],
  vault: [
    { emoji: '👥', stat: '40 Entities', text: 'People, places & organizations from Alex\'s life — many interconnected' },
    { emoji: '✅', stat: '48 Todos', text: 'Baby prep, move logistics, work handoffs — auto-created from conversation' },
    { emoji: '💬', stat: '96 Topics', text: 'Life threads tracked across career, family, health, and decisions' },
    { emoji: '📅', stat: 'Key Dates', text: 'Birthdays, deadlines, baby due date — surfaced proactively' },
    { emoji: '📄', stat: '10 Artifacts', text: 'Plans, lists & documents created by HridAI — easy to access' },
    { emoji: '🌐', stat: 'World Graph', text: 'Visual map of how Alex\'s people, topics, and life connect' },
  ],
}

export default function PersonaOnboarding({ personaId, personaName, isLoading, error, onEnter, onBack }) {
  const [slide, setSlide] = useState(0)
  const ctx = ALEX_CONTEXT

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1729' }}>
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Session Error</h2>
          <p className="text-sm mb-4" style={{ color: '#8b95a8' }}>{error}</p>
          <button onClick={onBack}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ background: '#6366f1' }}>
            Back to Persona Selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f1729', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="w-full max-w-[800px] overflow-hidden" style={{
        background: '#1a2238',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
      }}>

        {slide === 0 && (
          <div>
            <div className="p-5 md:px-8 md:pt-7">
              {/* Kicker — same position as slide 2 */}
              <div style={{ color: '#6366f1', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                Simulated Demo
              </div>

              {/* Title */}
              <h1 className="text-lg md:text-[22px] font-bold mb-3" style={{ color: '#e8edf5', lineHeight: 1.3, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                You are {ctx.name}
              </h1>

              {/* Subtitle (left ~70%) + Alex image (right ~30%) */}
              <div className="flex gap-4 md:gap-6 mb-4 md:mb-5">
                <p className="flex-[7] text-xs md:text-[13px]" style={{ color: '#8b95a8', lineHeight: 1.6 }}>
                  {ctx.subtitle}
                </p>
                <div className="flex-[3] flex items-center justify-center">
                  <img
                    src="/images/alex-persona.png"
                    alt="Alex Chen"
                    className="w-24 md:w-36 h-auto"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="hidden items-center justify-center" style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    fontSize: 40,
                    boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                  }}>👨‍💼</div>
                </div>
              </div>

              {/* Context cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-[10px]">
                {ctx.cards.map((card, i) => (
                  <div key={i} className="rounded-[10px] p-3" style={{ background: '#243049', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: card.color, letterSpacing: 1 }}>
                      {card.emoji} {card.label}
                    </div>
                    <div className="text-xs" style={{ color: '#c5cdd8', lineHeight: 1.5 }}>{card.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <BottomBar
              slide={0}
              total={2}
              isLoading={isLoading}
              onPrev={null}
              onNext={() => setSlide(1)}
              onEnter={onEnter}
              nextLabel="What's in his vault? →"
              enterLabel="Chat as Alex"
            />
          </div>
        )}

        {slide === 1 && (
          <div>
            <div className="p-5 pb-0 md:px-8 md:pt-7">
              <div style={{ color: '#6366f1', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                Simulated Demo
              </div>
              <h1 className="text-lg md:text-xl font-bold mb-1" style={{ color: '#e8edf5', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                What's inside {ctx.name.split(' ')[0]}'s Vault
              </h1>
              <p className="text-xs mb-4 md:mb-5" style={{ color: '#5a6478', lineHeight: 1.6 }}>
                This demo was created by simulating {ctx.name.split(' ')[0]}'s conversations with his HridAI, turn by turn — the same way a real user would. Here's what his HridAI built from 6 months of talking.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-[10px] px-5 md:px-8 pb-4">
              {ctx.vault.map((item, i) => (
                <div key={i} className="rounded-xl p-3 md:p-4 text-center" style={{ background: '#243049', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xl md:text-[26px] mb-1 md:mb-2">{item.emoji}</div>
                  <div className="text-xs md:text-[13px] font-semibold mb-1" style={{ color: '#e8edf5' }}>{item.stat}</div>
                  <div className="text-[10px] md:text-[11px] hidden sm:block" style={{ color: '#5a6478', lineHeight: 1.4 }}>{item.text}</div>
                </div>
              ))}
            </div>

            <div className="mx-5 md:mx-8 mb-4 md:mb-6 rounded-xl p-4 md:p-5" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(79,70,229,0.05) 100%)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <div className="text-xs md:text-sm font-semibold mb-1" style={{ color: '#e8edf5', lineHeight: 1.6 }}>
                {ctx.name.split(' ')[0]}'s HridAI self-organized, structured, and connected his life — so he doesn't have to.
              </div>
              <div className="text-[11px] md:text-xs" style={{ color: '#8b95a8', lineHeight: 1.6 }}>
                It supports his mental load with personal intelligence, organizes and structures his data so he can see, control, and adjust it when he needs to, and proactively surfaces what matters when it matters.
              </div>
            </div>

            <BottomBar
              slide={1}
              total={2}
              isLoading={isLoading}
              onPrev={() => setSlide(0)}
              onNext={null}
              onEnter={onEnter}
              prevLabel="← Meet Alex"
              enterLabel="Chat as Alex & Explore his Vault"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function BottomBar({ slide, total, isLoading, onPrev, onNext, onEnter, prevLabel, nextLabel, enterLabel }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between px-5 md:px-8 py-4" style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(15,23,41,0.5)',
    }}>
      {/* Pagination dots */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="w-2 h-2 rounded-full cursor-pointer" style={{
            background: i === slide ? '#6366f1' : 'rgba(255,255,255,0.1)',
          }}
            onClick={() => {
              if (i === 0 && onPrev) onPrev()
              if (i === 1 && onNext) onNext()
            }}
          />
        ))}
        <span className="text-[11px] ml-2" style={{ color: '#5a6478' }}>{slide + 1} of {total}</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
        {onPrev && (
          <button onClick={onPrev} className="flex-1 sm:flex-none px-4 py-2.5 rounded-[10px] text-xs md:text-[13px] cursor-pointer" style={{
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#8b95a8',
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            {prevLabel}
          </button>
        )}
        {onNext && (
          <button onClick={onNext} className="flex-1 sm:flex-none px-4 py-2.5 rounded-[10px] text-xs md:text-[13px] cursor-pointer" style={{
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#8b95a8',
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            {nextLabel}
          </button>
        )}
        <button
          onClick={onEnter}
          disabled={isLoading}
          className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-[10px] text-xs md:text-[13px] font-semibold flex items-center justify-center gap-2"
          style={{
            border: 'none',
            background: isLoading ? '#3730a3' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            cursor: isLoading ? 'default' : 'pointer',
            boxShadow: isLoading ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{
              borderColor: 'rgba(255,255,255,0.3)',
              borderTopColor: 'white',
            }} />
          )}
          {isLoading ? 'Preparing...' : enterLabel}
        </button>
      </div>
    </div>
  )
}
