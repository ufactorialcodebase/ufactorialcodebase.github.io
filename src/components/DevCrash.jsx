// Dev-only helper — mount this via /dev/crash to prove ErrorBoundary works.
// Guarded by import.meta.env.DEV so the route is a no-op in production builds.

import React from 'react'

function BoomComponent() {
  throw new Error('DevCrash: intentional test crash')
}

export default function DevCrash() {
  if (!import.meta.env.DEV) return null
  return <BoomComponent />
}
