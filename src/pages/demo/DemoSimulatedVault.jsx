import { useEffect, useState, useRef } from 'react'
import { useNavigate, Outlet, Navigate, useLocation } from 'react-router-dom'
import { DemoProvider } from '../../components/vault/DemoContext'
import IconRail from '../../components/vault/IconRail'
import ChatTab from '../../components/vault/ChatTab'
import { apiFetch } from '../../lib/api-client'
import { setCached, clearCache, setDemoMode } from '../../lib/vault-cache'
import { normalizeEntity } from '../../components/vault/people/entity-utils'

export default function DemoSimulatedVault() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const fetchStarted = useRef(false)

  const personaId = sessionStorage.getItem('hrdai_persona_id')
  const personaName = sessionStorage.getItem('hrdai_persona_name')

  // Redirect to chat if at root
  if (isReady && (location.pathname === '/demo/simulated/vault' || location.pathname === '/demo/simulated/vault/')) {
    return <Navigate to="/demo/simulated/vault/chat" replace />
  }

  useEffect(() => {
    if (fetchStarted.current) return
    fetchStarted.current = true

    if (!personaId) { navigate('/demo/simulated'); return }

    const loadDemoData = async () => {
      try {
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
        console.error('Failed to load demo data:', err)
        setError(err.message || 'Failed to load demo data')
      }
    }

    loadDemoData()

    // Cleanup on unmount
    return () => {
      setDemoMode(false)
      clearCache()
    }
  }, [navigate, personaId])

  const handleExit = () => {
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
              <h2 className="text-lg font-semibold text-white mb-2">Demo Error</h2>
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

  const isChatActive = location.pathname === '/demo/simulated/vault/chat'

  return (
    <DemoProvider personaId={personaId} personaName={personaName}>
      <div className="vault-theme h-screen flex bg-[var(--bg-primary)]">
        <IconRail basePath="/demo/simulated/vault" />
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Demo banner */}
          <div className="flex-shrink-0 px-4 py-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-violet-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 text-[10px] font-semibold uppercase tracking-wider">Demo</span>
              <span className="text-[var(--text-tertiary)] text-[10px]">
                Exploring as {personaName || personaId} — read only
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
