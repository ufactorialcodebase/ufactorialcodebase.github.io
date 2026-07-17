// src/components/vault/ChatTab.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Chat from '../demo/Chat'
import { useDemo } from './DemoContext'
import { clearCache, setDemoMode } from '../../lib/vault-cache'
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import { useAuth } from '../../hooks/useAuth'
import { useNow } from '../../hooks/useNow'
import WelcomeStrip from './WelcomeStrip'
import { getWelcomeCounts } from '../../lib/api/vault-counts'
import { getLastSeen } from '../../lib/api/vault-last-seen'

const DEFAULT_PROMPTS = [
  "My brother Jack lives in Boston",
  "I'm planning a dinner party next Saturday",
  "I need to remember to call mom about the holiday plans",
  "My wife Sarah is vegetarian",
  "I have a meeting with Dr. Smith next Tuesday",
]

const ALEX_PROMPTS = [
  "Ugh.. I'm exhausted",
  "What should I be doing to get ready for the baby?",
  "Plan something fun for Sarah this weekend — she's been stressed",
  "I wonder how Max is going to handle all these changes",
]

const BRUCE_PROMPTS = [
  "Show me everything we had on the Owls",
  "What's overdue that I've been dodging?",
  "Walk me through the whole board fight from December",
  "Alfred's medication schedule — read it back",
]

const DEFAULT_DEMO_PROMPTS = [
  "Just checking in - what's on my plate?",
  "What should I focus on today?",
  "I've been feeling off lately...",
]

const ALEX_GREETINGS = [
  "Hey Alex! I was looking at your upcoming dates — Sarah's birthday is coming up soon, and you've got the half marathon in October. Also, I noticed you haven't updated the baby prep checklist in a while. Want to go through it?",
  "Hey Alex! Busy week ahead — the Q2 roadmap review is coming up, and I noticed a few open todos around the move. How are you feeling about everything?",
  "Hey Alex! I see Max's school orientation is next week. Also, your mom mentioned wanting to video call — it's been a couple weeks. What's on your mind today?",
  "Hey Alex! Quick heads up — you've got a few things converging this month. The baby prep list has some pending items, and I noticed the half marathon training plan could use an update. What would you like to tackle first?",
]

const BRUCE_GREETINGS = [
  "Welcome back. Gordon pulled Talon-forged steel off a Grand Ave crew earlier this week — the Court's waking up. The financials review is queued through August; Barbara starts network mapping in the morning. What are you working?",
  "Welcome back. Alfred cleared his June cardiology follow-up — regimen stepped down to maintenance. Damian's in Blüdhaven with Dick for the summer plan you signed off on. Duke's first daytime training block is underway. Anything else surfacing?",
  "Welcome back. Selina's ledger page from the memorial window is now operational evidence — the Kosov thread ties into the new Talon-steel network. Owls file is active again. Where do you want to start?",
  "Welcome back. Shareholder meeting is July 23, Tokyo review is August 3 — both on the calendar. The own-checkup you've been deferring since April is still open. What's the plan for the day?",
]

const PERSONA_PROMPTS = {
  alex: ALEX_PROMPTS,
  bruce: BRUCE_PROMPTS,
}

const PERSONA_GREETINGS = {
  alex: ALEX_GREETINGS,
  bruce: BRUCE_GREETINGS,
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function ChatTab() {
  const demo = useDemo()
  const navigate = useNavigate()

  const flagOn = useFeatureFlag('vault_redesign')
  const { user } = useAuth()
  const [counts, setCounts] = useState(null)
  const [lastSeen, setLastSeen] = useState(undefined) // undefined=loading, null=unavailable, ISO=present
  // ISS-248: persona anchor in demo, real Date.now() otherwise.
  const now = useNow()

  useEffect(() => {
    if (!flagOn) return
    let cancelled = false
    Promise.all([
      getWelcomeCounts().then(c => { if (!cancelled) setCounts(c) }).catch(() => {}),
      getLastSeen().then(t => { if (!cancelled) setLastSeen(t) }).catch(() => { if (!cancelled) setLastSeen(null) }),
    ])
    return () => { cancelled = true }
  }, [flagOn])

  let chatElement
  if (demo?.isDemo) {
    const prompts = PERSONA_PROMPTS[demo.personaId] || DEFAULT_DEMO_PROMPTS
    const greetingList = PERSONA_GREETINGS[demo.personaId]
    const greeting = greetingList ? pickRandom(greetingList) : null
    const handleDemoExit = () => {
      setDemoMode(false)
      clearCache()
      sessionStorage.removeItem('hrdai_persona_id')
      sessionStorage.removeItem('hrdai_persona_name')
      navigate('/demo/simulated')
    }
    chatElement = (
      <Chat
        mode="simulated"
        personaName={demo.personaName?.split(' ')[0] || demo.personaId}
        suggestedPrompts={prompts}
        initialGreeting={greeting}
        onExit={handleDemoExit}
        showThemeToggle={false}
      />
    )
  } else {
    chatElement = (
      <Chat
        mode="try_it_out"
        suggestedPrompts={DEFAULT_PROMPTS}
        showThemeToggle={false}
      />
    )
  }

  if (flagOn) {
    // Pull a real display name from Supabase user_metadata. Skip the
    // email-prefix fallback — exposing "pratikcpednekar" instead of "Pratik"
    // is awkward and arguably leaks identifier into the UI. If no name is
    // set on the account, WelcomeStrip falls back to "there".
    const displayName =
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.first_name ||
      undefined

    // Derive daysSince + deltas only when we have both lastSeen + raw lists.
    // When lastSeen is null (endpoint absent or error), daysSince stays null
    // and WelcomeStrip falls back to totals wording automatically.
    let daysSince = null
    let deltas = null
    if (lastSeen && counts && Array.isArray(counts._rawTopics) && Array.isArray(counts._rawEntities)) {
      const cutoff = new Date(lastSeen).getTime()
      if (!Number.isNaN(cutoff)) {
        daysSince = Math.max(0, Math.floor((now.getTime() - cutoff) / 86400000))
        deltas = {
          newPeople: counts._rawEntities.filter(e => new Date(e.first_mentioned_at || e.created_at || 0).getTime() > cutoff).length,
          newThreads: counts._rawTopics.filter(t => new Date(t.first_mentioned || t.created_at || 0).getTime() > cutoff).length,
        }
      }
    }

    // Pass counts straight through (no zero-fallback). WelcomeStrip now
    // distinguishes "loading/failed" (null) from "real zero" (threads === 0)
    // and renders nothing in either case — see WelcomeStrip header comment.
    return (
      <>
        <WelcomeStrip name={displayName} counts={counts} daysSince={daysSince} deltas={deltas} />
        {chatElement}
      </>
    )
  }

  return chatElement
}
