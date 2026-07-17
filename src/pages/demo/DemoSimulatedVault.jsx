import { useEffect, useState, useRef } from 'react'
import { useNavigate, Outlet, Navigate, useLocation, useParams } from 'react-router-dom'
import { DemoProvider } from '../../components/vault/DemoContext'
import IconRail from '../../components/vault/IconRail'
import BottomNav from '../../components/vault/BottomNav'
import MobileTopBar from '../../components/vault/MobileTopBar'
import ChatTab from '../../components/vault/ChatTab'
import PersonaOnboarding from '../../components/demo/PersonaOnboarding'
import { apiFetch } from '../../lib/api-client'
import { setCached, clearCache, setDemoMode } from '../../lib/vault-cache'
import { normalizeEntity } from '../../components/vault/people/entity-utils'
import { getAccessCode, startPersonaSession, endPersonaSession } from '../../lib/api/index.js'

export default function DemoSimulatedVault() {
  const navigate = useNavigate()
  const location = useLocation()
  const { personaId } = useParams()
  const personaName = sessionStorage.getItem('hrdai_persona_name')

  const [vaultReady, setVaultReady] = useState(false)
  const [chatReady, setChatReady] = useState(false)
  const [error, setError] = useState(null)
  const [showOverlay, setShowOverlay] = useState(true)
  // ISS-248: persona's frozen story-time anchor from /vault/demo/{persona}.
  // Passed to DemoProvider so useNow() returns this instead of real Date.now()
  // for every relative-date render in the demo vault.
  const [demoNow, setDemoNow] = useState(null)
  const initStarted = useRef(false)

  // Load vault data + start persona session in parallel
  useEffect(() => {
    if (initStarted.current) return
    initStarted.current = true

    if (!personaId) { navigate('/demo/simulated'); return }

    const accessCode = getAccessCode()

    // Task A: Load vault data (fast — reads from alex_demo baseline, no clone)
    const loadVault = async () => {
      try {
        const data = await apiFetch(`/vault/demo/${personaId}`)
        setCached('self', data.self || {})
        setCached('entities', (data.entities || []).map(normalizeEntity))
        setCached('topics', data.topics || [])
        setCached('todos', data.todos || [])
        setCached('dates', data.dates || [])
        setCached('artifacts', data.artifacts || [])
        setCached('lists', data.lists || [])
        setCached('world', data.world || { nodes: [], edges: [] })
        // ISS-248: demo_now is the persona's frozen anchor. If backend
        // hasn't shipped the field yet, demoNow stays null and useNow()
        // falls through to real Date.now() — same as pre-fix.
        if (data.demo_now) setDemoNow(data.demo_now)
        setDemoMode(true)
        setVaultReady(true)
      } catch (err) {
        console.error('Failed to load vault data:', err)
        setError(err.message || 'Failed to load demo data')
      }
    }

    // Task B: Start persona session (slower — clones data for chat)
    const startSession = async () => {
      if (!accessCode) return
      try {
        const result = await startPersonaSession(accessCode, personaId)
        if (!result.success) {
          setError(result.error || 'Failed to start persona session')
          return
        }
        setChatReady(true)
      } catch (err) {
        console.error('Failed to start persona session:', err)
        setError(err.message || 'Session error')
      }
    }

    // Run both in parallel
    loadVault()
    startSession()

    return () => {
      setDemoMode(false)
      clearCache()
    }
  }, [navigate, personaId])

  // Handle browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const accessCode = getAccessCode()
      if (accessCode && personaId) {
        const url = `${import.meta.env.VITE_API_URL || 'https://aimanagerv2-production.up.railway.app'}/api/personas/end-session`
        navigator.sendBeacon(url, JSON.stringify({ access_code: accessCode, persona_id: personaId }))
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [personaId])

  const handleExit = async () => {
    const accessCode = getAccessCode()
    if (accessCode && personaId) {
      try { await endPersonaSession(accessCode, personaId) } catch (e) { console.warn(e) }
    }
    setDemoMode(false)
    clearCache()
    sessionStorage.removeItem('hrdai_persona_id')
    sessionStorage.removeItem('hrdai_persona_name')
    navigate('/demo/simulated')
  }

  const handleEnterDemo = () => {
    setShowOverlay(false)
  }

  // === Conditional returns AFTER all hooks ===

  // Show onboarding overlay (replaces old loading spinner)
  if (showOverlay) {
    return (
      <PersonaOnboarding
        personaId={personaId}
        personaName={personaName}
        isLoading={!vaultReady || !chatReady}
        error={error}
        onEnter={handleEnterDemo}
        onBack={() => navigate('/demo/simulated')}
      />
    )
  }

  // Redirect to chat tab if at vault root
  if (location.pathname === `/demo/simulated/${personaId}/vault` || location.pathname === `/demo/simulated/${personaId}/vault/`) {
    return <Navigate to={`/demo/simulated/${personaId}/vault/chat`} replace />
  }

  const basePath = `/demo/simulated/${personaId}/vault`
  const isChatActive = location.pathname === `${basePath}/chat`

  return (
    <DemoProvider personaId={personaId} personaName={personaName} demoNow={demoNow}>
      {/* Mirrors VaultLayout structure exactly: flex-col on mobile, flex-row on desktop */}
      <div className="vault-theme h-dvh flex flex-col md:flex-row bg-[var(--bg-primary)]">

        {/* Desktop: side rail (hidden on mobile) — same as VaultLayout */}
        <div className="hidden md:block">
          <IconRail basePath={basePath} />
        </div>

        {/* Mobile: top bar (hidden on desktop) — same component as VaultLayout */}
        <div className="md:hidden shrink-0">
          <MobileTopBar basePath={basePath} onExit={handleExit} />
        </div>

        {/* Demo banner — desktop only (mobile has Exit in MobileTopBar) */}
        <main className="flex-1 overflow-y-auto relative min-h-0 flex flex-col">
          <div className="hidden md:flex flex-shrink-0 px-4 py-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-violet-500/20 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 text-[10px] font-semibold uppercase tracking-wider">Demo</span>
              <span className="text-[var(--text-tertiary)] text-[10px]">
                Exploring as {personaName || personaId}
              </span>
            </div>
            <button onClick={handleExit}
              className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              Exit Demo
            </button>
          </div>

          {/* Chat always mounted — hidden when other tabs active (same as VaultLayout) */}
          <div className={isChatActive ? 'flex-1 min-h-0' : 'hidden'}>
            <ChatTab />
          </div>
          {/* Other tabs via Outlet */}
          {!isChatActive && <Outlet />}
        </main>

        {/* Mobile: bottom nav (hidden on desktop) — same component as VaultLayout */}
        <div className="md:hidden shrink-0">
          <BottomNav basePath={basePath} />
        </div>
      </div>
    </DemoProvider>
  )
}
