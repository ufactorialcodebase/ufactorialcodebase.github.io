// src/components/vault/ChatTab.jsx
import Chat from '../demo/Chat'
import PrerecordedChat from './PrerecordedChat'
import { useDemo } from './DemoContext'

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
    return <PrerecordedChat personaId={demo.personaId} personaName={demo.personaName} />
  }

  return (
    <Chat
      mode="try_it_out"
      suggestedPrompts={DEFAULT_PROMPTS}
    />
  )
}
