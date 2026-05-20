// src/components/vault/ChatTab.jsx
import { useNavigate } from 'react-router-dom'
import Chat from '../demo/Chat'
import { useDemo } from './DemoContext'
import { clearCache, setDemoMode } from '../../lib/vault-cache'

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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function ChatTab() {
  const demo = useDemo()
  const navigate = useNavigate()

  if (demo?.isDemo) {
    const prompts = demo.personaId === 'alex' ? ALEX_PROMPTS : DEFAULT_DEMO_PROMPTS
    const greeting = demo.personaId === 'alex' ? pickRandom(ALEX_GREETINGS) : null
    const handleDemoExit = () => {
      setDemoMode(false)
      clearCache()
      sessionStorage.removeItem('hrdai_persona_id')
      sessionStorage.removeItem('hrdai_persona_name')
      navigate('/demo/simulated')
    }
    return (
      <Chat
        mode="simulated"
        personaName={demo.personaName?.split(' ')[0] || demo.personaId}
        suggestedPrompts={prompts}
        initialGreeting={greeting}
        onExit={handleDemoExit}
      />
    )
  }

  return (
    <Chat
      mode="try_it_out"
      suggestedPrompts={DEFAULT_PROMPTS}
      showThemeToggle={false}
    />
  )
}
