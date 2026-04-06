// src/components/vault/ChatTab.jsx
import Chat from '../demo/Chat'
import { useDemo } from './DemoContext'

const PERSONA_PROMPTS = {
  alex: [
    "I should start planning that Japan trip soon...",
    "Been slacking on my half marathon training lately",
    "Max is getting bored at home today, what should we do?",
    "Ugh, exhausting day at work today. Its Mike again!",
    "I think I'll be done with work early on Friday!",
  ],
}

const DEFAULT_PROMPTS = [
  "My brother Jack lives in Boston",
  "I'm planning a dinner party next Saturday",
  "I need to remember to call mom about the holiday plans",
  "My wife Sarah is vegetarian",
  "I have a meeting with Dr. Smith next Tuesday",
]

export default function ChatTab() {
  const demo = useDemo()

  if (demo?.isDemo) {
    return (
      <Chat
        mode="simulated"
        personaName={demo.personaName?.split(' ')[0] || 'the persona'}
        suggestedPrompts={PERSONA_PROMPTS[demo.personaId] || DEFAULT_PROMPTS}
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
