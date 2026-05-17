import { useEffect, useState, useRef } from 'react'
import { useNavigate, Outlet, Navigate, useLocation, useParams } from 'react-router-dom'
import { DemoProvider } from '../../components/vault/DemoContext'
import IconRail from '../../components/vault/IconRail'
import ChatTab from '../../components/vault/ChatTab'
import { apiFetch } from '../../lib/api-client'
import { setCached, clearCache, setDemoMode } from '../../lib/vault-cache'
import { normalizeEntity } from '../../components/vault/people/entity-utils'
import { getAccessCode, startPersonaSession, endPersonaSession } from '../../lib/api/index.js'

export default function DemoSimulatedVault() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const initStarted = useRef(false)

  const { personaId } = useParams()
  const personaName = sessionStorage.getItem('hrdai_persona_name')

  // Redirect to chat if at root
  if (isReady && (location.pathname === `/demo/simulated/${personaId}/vault` || location.pathname === `/demo/simulated/${personaId}/vault/`)) {
    return <Navigate to={`/demo/simulated/${personaId}/vault/chat`} replace />
  }

  useEffect(() => {
    if (initStarted.current) return
    initStarted.current = true

    if (!personaId) { navigate('/demo/simulated'); return }

    const init = async () => {
      try {
        // Step 1: Start persona session (clones data to visitor's space for chat)
        const accessCode = getAccessCode()
        if (accessCode) {
          const sessionResult = await startPersonaSession(accessCode, personaId)
          if (!sessionResult.success) {
            setError(sessionResult.error || 'Failed to start persona session')
            return
          }
        }

        // Step 2: Load demo vault data (baseline for vault tabs)
        const data = await apiFetch(`/vault/demo/${personaId}`)

        // Pre-populate vault cache with all persona data
        setCached('self', data.self || {})
        setCached('entities', (data.entities || []).map(normalizeEntity))
        setCached('topics', data.topics || [])
        setCached('todos', data.todos || [])
        setCached('dates', data.dates || [])
        setCached('artifacts', data.artifacts || [])
        setCached('lists', data.lists || [])
        setCached('world', data.world || { nodes: [], edges: [] })

        // Enable demo mode — tabs use cache only, no API refresh
        setDemoMode(true)
        setIsReady(true)
      } catch (err) {
        console.error('Failed to initialize demo:', err)
        setError(err.message || 'Failed to load demo data')
      }
    }

    init()

    // Cleanup on unmount
    return () => {
      setDemoMode(false)
      clearCache()
    }
  }, [navigate, personaId])

  // Handle browser close — end persona session
  useEffect(() => {
    const handleBeforeUnload = () => {
      const accessCode = getAccessCode()
      if (accessCode && personaId) {
        const url = `${import.meta.env.VITE_API_URL || 'https://aimanagerv2-production.up.railway.app'}/api/personas/end-session`
        const data = JSON.stringify({
          access_code: accessCode,
          persona_id: personaId
        })
        navigator.sendBeacon(url, data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [personaId])

  const handleExit = async () => {
    // End persona session
    const accessCode = getAccessCode()
    if (accessCode && personaId) {
      try {
        await endPersonaSession(accessCode, personaId)
      } catch (e) {
        console.warn('Failed to end persona session:', e)
      }
    }

    setDemoMode(false)
    clearCache()
    sessionStorage.removeItem('hrdai_persona_id')
    sessionStorage.removeItem('hrdai_persona_name')
    navigate('/demo/simulated')
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div className="max-w-md mx-auto p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Session Error</h2>
              <p className="text-sm text-white/60 mb-4">{error}</p>
              <button onClick={() => navigate('/demo/simulated')}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
                Back to Persona Selection
              </button>
            </div>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-3" />
              <p className="text-sm text-white/60">Loading {personaName || 'persona'} demo...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  const isChatActive = location.pathname === `/demo/simulated/${personaId}/vault/chat`

  return (
    <DemoProvider personaId={personaId} personaName={personaName}>
      <div className="vault-theme h-screen flex bg-[var(--bg-primary)]">
        <IconRail basePath={`/demo/simulated/${personaId}/vault`} />
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Demo banner */}
          <div className="flex-shrink-0 px-4 py-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-violet-500/20 flex items-center justify-between">
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
          {/* Chat (always mounted) */}
          <div className={`flex-1 overflow-y-auto ${isChatActive ? '' : 'hidden'}`}>
            <ChatTab />
          </div>
          {/* Other tabs */}
          {!isChatActive && (
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </DemoProvider>
  )
}
