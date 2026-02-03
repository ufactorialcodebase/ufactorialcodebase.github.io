import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../../components/demo/Chat';
import { getAccessCode, startPersonaSession, endPersonaSession } from '../../lib/api';

/**
 * Simulated demo chat page
 * Wraps Chat component with persona session management
 */
export default function SimulatedChat() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [personaUserId, setPersonaUserId] = useState(null);
  
  // Get persona info from session storage
  const personaId = sessionStorage.getItem('hrdai_persona_id');
  const personaName = sessionStorage.getItem('hrdai_persona_name');
  
  // Check for access code and persona on mount
  useEffect(() => {
    const accessCode = getAccessCode();
    
    if (!accessCode) {
      navigate('/demo');
      return;
    }
    
    if (!personaId) {
      // No persona selected, go back to selection
      navigate('/demo/simulated');
      return;
    }
    
    // Start persona session
    const initSession = async () => {
      try {
        const result = await startPersonaSession(accessCode, personaId);
        
        if (result.success) {
          setPersonaUserId(result.userId);
          setIsReady(true);
        } else {
          setError(result.error || 'Failed to start persona session');
        }
      } catch (e) {
        console.error('Failed to start persona session:', e);
        setError('Failed to initialize session');
      }
    };
    
    initSession();
  }, [navigate, personaId]);
  
  // Handle browser close - end persona session
  useEffect(() => {
    const handleBeforeUnload = () => {
      const accessCode = getAccessCode();
      if (accessCode && personaId) {
        // Use sendBeacon to end persona session
        const url = `${import.meta.env.VITE_API_URL || 'https://aimanagerv2-production.up.railway.app'}/api/personas/end-session`;
        const data = JSON.stringify({ 
          access_code: accessCode,
          persona_id: personaId 
        });
        navigator.sendBeacon(url, data);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [personaId]);
  
  const handleExit = async () => {
    const accessCode = getAccessCode();
    
    // End persona session (this also resets snapshot)
    if (accessCode && personaId) {
      try {
        await endPersonaSession(accessCode, personaId);
      } catch (e) {
        console.warn('Failed to end persona session:', e);
      }
    }
    
    // Clear persona from session storage
    sessionStorage.removeItem('hrdai_persona_id');
    sessionStorage.removeItem('hrdai_persona_name');
    
    // Go back to persona selection
    navigate('/demo/simulated');
  };
  
  // Persona-specific prompts - conversational, not interrogatory
  const getPrompts = () => {
    if (personaId === 'alex') {
      return [
        "I should start planning that Japan trip soon...",
        "Been slacking on my half marathon training lately",
        "Max is getting bored at home today, what should we do?",
        "Ugh, exhausting day at work today. Its Mike again!",
        "I think I'll be done with work early on Friday!",
      ];
    }
    // Default prompts for other personas
    return [
      "Just checking in - what's on my plate?",
      "Been thinking about my family lately",
      "What should I focus on today?",
    ];
  };
  
  // Loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div className="max-w-md mx-auto p-6">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Session Error</h2>
              <p className="text-sm text-slate-600 mb-4">{error}</p>
              <button
                onClick={() => navigate('/demo/simulated')}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Back to Persona Selection
              </button>
            </div>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-3"></div>
              <p className="text-sm text-slate-600">Loading {personaName || 'persona'}...</p>
            </>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Chat 
      mode="simulated"
      onExit={handleExit}
      personaName={personaName?.split(' ')[0] || 'the persona'}
      suggestedPrompts={getPrompts()}
    />
  );
}
