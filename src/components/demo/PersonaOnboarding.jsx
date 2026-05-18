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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1729', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{
        background: '#1a2238',
        borderRadius: 20,
        maxWidth: 800,
        width: '90%',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>

        {slide === 0 && (
          <div>
            <div style={{ display: 'flex' }}>
              <div style={{
                flex: '0 0 240px',
                background: 'linear-gradient(180deg, #243049 0%, #1a2238 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px 24px',
                borderRight: '1px solid rgba(255,255,255,0.06)',
              }}>
                <img
                  src="/images/alex-persona.png"
                  alt="Alex Chen"
                  style={{ width: 160, height: 'auto', marginBottom: 16 }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  display: 'none', alignItems: 'center', justifyContent: 'center',
                  fontSize: 56, marginBottom: 16,
                  boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                }}>👨‍💼</div>
                <div style={{ color: '#6366f1', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Persona Demo
                </div>
              </div>

              <div style={{ flex: 1, padding: '36px 32px' }}>
                <h1 style={{ color: '#e8edf5', fontSize: 22, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                  You are {ctx.name}
                </h1>
                <p style={{ color: '#8b95a8', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
                  {ctx.subtitle}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ctx.cards.map((card, i) => (
                    <div key={i} style={{ background: '#243049', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ color: card.color, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                        {card.emoji} {card.label}
                      </div>
                      <div style={{ color: '#c5cdd8', fontSize: 12, lineHeight: 1.5 }}>{card.text}</div>
                    </div>
                  ))}
                </div>
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
            <div style={{ padding: '28px 32px 0' }}>
              <div style={{ color: '#6366f1', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                Simulated Persona Demo
              </div>
              <h1 style={{ color: '#e8edf5', fontSize: 20, fontWeight: 700, margin: '0 0 6px', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                What's inside {ctx.name.split(' ')[0]}'s Vault
              </h1>
              <p style={{ color: '#5a6478', fontSize: 12, margin: '0 0 22px', lineHeight: 1.6 }}>
                This demo was created by simulating {ctx.name.split(' ')[0]}'s conversations with his HridAI, turn by turn — the same way a real user would. Here's what his HridAI built from 6 months of talking.
              </p>
            </div>

            <div style={{ padding: '0 32px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {ctx.vault.map((item, i) => (
                <div key={i} style={{ background: '#243049', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{item.emoji}</div>
                  <div style={{ color: '#e8edf5', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.stat}</div>
                  <div style={{ color: '#5a6478', fontSize: 11, lineHeight: 1.4 }}>{item.text}</div>
                </div>
              ))}
            </div>

            <div style={{
              margin: '0 32px 24px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(79,70,229,0.05) 100%)',
              borderRadius: 12, padding: '20px 24px',
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <div style={{ color: '#e8edf5', fontSize: 14, fontWeight: 600, lineHeight: 1.6, marginBottom: 6 }}>
                {ctx.name.split(' ')[0]}'s HridAI self-organized, structured, and connected his life — so he doesn't have to.
              </div>
              <div style={{ color: '#8b95a8', fontSize: 12, lineHeight: 1.6 }}>
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
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '18px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(15,23,41,0.5)',
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i === slide ? '#6366f1' : 'rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
            onClick={() => {
              if (i === 0 && onPrev) onPrev()
              if (i === 1 && onNext) onNext()
            }}
          />
        ))}
        <span style={{ color: '#5a6478', fontSize: 11, marginLeft: 8 }}>{slide + 1} of {total}</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {onPrev && (
          <button onClick={onPrev} style={{
            padding: '10px 20px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#8b95a8', fontSize: 13,
            cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            {prevLabel}
          </button>
        )}
        {onNext && (
          <button onClick={onNext} style={{
            padding: '10px 20px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#8b95a8', fontSize: 13,
            cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            {nextLabel}
          </button>
        )}
        <button
          onClick={onEnter}
          disabled={isLoading}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: isLoading ? '#3730a3' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white', fontSize: 13, fontWeight: 600,
            cursor: isLoading ? 'default' : 'pointer',
            boxShadow: isLoading ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            opacity: isLoading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {isLoading && (
            <div style={{
              width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
          {isLoading ? 'Preparing Alex...' : enterLabel}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
