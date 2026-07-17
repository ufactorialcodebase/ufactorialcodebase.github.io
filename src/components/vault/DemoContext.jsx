import { createContext, useContext } from 'react'

const DemoContext = createContext(null)

// ISS-248: `demoNow` (ISO date string) is the persona's frozen
// story-time anchor. When set, downstream date-relative rendering
// (via useNow / format-utils) treats it as "today" instead of the
// browser's real Date.now(). Real users are never wrapped in this
// provider so demoNow can't leak into their vault.
export function DemoProvider({ children, personaId, personaName, demoNow = null }) {
  return (
    <DemoContext.Provider value={{ isDemo: true, personaId, personaName, demoNow }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  return useContext(DemoContext)
}
