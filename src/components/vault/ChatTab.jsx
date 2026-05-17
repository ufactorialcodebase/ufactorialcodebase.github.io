// src/components/vault/ChatTab.jsx
import Chat from '../demo/Chat'
import { useDemo } from './DemoContext'

const DEFAULT_PROMPTS = [
  "My brother Jack lives in Boston",
  "I'm planning a dinner party next Saturday",
  "I need to remember to call mom about the holiday plans",
  "My wife Sarah is vegetarian",
  "I have a meeting with Dr. Smith next Tuesday",
]

const ALEX_PROMPTS = [
  "Ugh, Mike is at it again with the roadmap pushback...",
  "What should I be doing to get ready for the baby?",
  "Plan something fun for Sarah this weekend — she's been stressed",
  "I feel like I'm forgetting something this month...",
]

const DEFAULT_DEMO_PROMPTS = [
  "Just checking in - what's on my plate?",
  "What should I focus on today?",
  "I've been feeling off lately...",
]

export default function ChatTab() {
  const demo = useDemo()

  if (demo?.isDemo) {
    const prompts = demo.personaId === 'alex' ? ALEX_PROMPTS : DEFAULT_DEMO_PROMPTS
    return (
      <Chat
        mode="simulated"
        personaName={demo.personaName?.split(' ')[0] || demo.personaId}
        suggestedPrompts={prompts}
      />
    )
  }

  return (
    <Chat
      mode="try_it_out"
      suggestedPrompts={DEFAULT_PROMPTS}
    />
  )
}
