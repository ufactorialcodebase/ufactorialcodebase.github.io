// src/components/vault/ChatTab.jsx
import Chat from '../demo/Chat'

export default function ChatTab() {
  return (
    <Chat
      mode="try_it_out"
      suggestedPrompts={[
        "My brother Jack lives in Boston",
        "I'm planning a dinner party next Saturday",
        "I need to remember to call mom about the holiday plans",
        "My wife Sarah is vegetarian",
        "I have a meeting with Dr. Smith next Tuesday",
      ]}
    />
  )
}
