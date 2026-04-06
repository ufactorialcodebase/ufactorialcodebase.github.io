import { createContext, useContext } from 'react'

const DemoContext = createContext(null)

export function DemoProvider({ children, personaId, personaName }) {
  return (
    <DemoContext.Provider value={{ isDemo: true, personaId, personaName }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  return useContext(DemoContext)
}
