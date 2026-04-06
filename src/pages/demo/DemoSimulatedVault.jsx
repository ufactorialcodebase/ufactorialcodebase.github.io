import { useEffect, useState, useRef } from 'react'
import { useNavigate, Outlet, Navigate, useLocation } from 'react-router-dom'
import { getAccessCode, startPersonaSession, endPersonaSession } from '../../lib/api/index.js'
import { DemoProvider } from '../../components/vault/DemoContext'
import IconRail from '../../components/vault/IconRail'
import ChatTab from '../../components/vault/ChatTab'

/**
 * Demo Vault — wraps the full vault UI in demo/persona mode.
 * Replicates session management from SimulatedChat but renders
 * the vault layout (IconRail + tabs) instead of bare Chat.
 */
export default function DemoSimulatedVault() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const initStarted = useRef(false)

  const personaId = sessionStorage.getItem('hrdai_persona_id')
  const personaName = sessionStorage.getItem('hrdai_persona_name')

  // Redirect to chat if at the root demo vault path
  if (isReady && (location.pathname === '/demo/simulated/vault' || location.pathname === '/demo/simulated/vault/')) {
    return <Navigate to="/demo/simulated/vault/chat" replace />
  }

  useEffect(() => {
    if (initStarted.current) return
    initStarted.current = true

    const accessCode = getAccessCode()
    if (!accessCode) { navigate('/demo'); return }
    if (!personaId) { navigate('/demo/simulated'); return }

    const initSession = async () => {
      try {
        const result = await startPersonaSession(accessCode, personaId)
        if (result.success) {
          setIsReady(true)
        } else {
          setError(result.error || 'Failed to start persona session')
        }
      } catch (e) {
        console.error('Failed to start persona session:', e)
        setError('Failed to initialize session')
      }
    }
    initSession()
  }, [navigate, personaId])

  // Cleanup on browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const accessCode = getAccessCode()
      if (accessCode && personaId) {
        const url = `${import.meta.env.VITE_API_URL || 'https://aimanagerv2-production.up.railway.app'}/api/personas/end-session`
        const data = JSON.stringify({
          access_code: accessCode,
          persona_id: personaId,
        })
        navigator.sendBeacon(url, data)
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [personaId])

  const handleExit = async () => {
    const accessCode = getAccessCode()
    if (accessCode && personaId) {
      try { await endPersonaSession(accessCode, personaId) } catch (e) {
        console.warn('Failed to end persona session:', e)
      }
    }
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
              <button
                onClick={() => navigate('/demo/simulated')}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Back to Persona Selection
              </button>
            </div>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-3" />
              <p className="text-sm text-white/60">Loading {personaName || 'persona'} vault...</p>
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
          {/* Demo banner — compact, doesn't push content */}
          <div className="flex-shrink-0 px-4 py-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-violet-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 text-[10px] font-semibold uppercase tracking-wider">Demo</span>
              <span className="text-[var(--text-tertiary)] text-[10px]">
                Exploring as {personaName || personaId} — changes won't be saved
              </span>
            </div>
            <button
              onClick={handleExit}
              className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Exit Demo
            </button>
          </div>
          {/* Chat always mounted for session persistence */}
          <div className={`flex-1 overflow-y-auto ${isChatActive ? '' : 'hidden'}`}>
            <ChatTab />
          </div>
          {/* Other tabs render via Outlet */}
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
