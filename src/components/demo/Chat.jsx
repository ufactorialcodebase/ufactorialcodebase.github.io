import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PanelRightOpen, PanelRightClose, RotateCcw, LogOut, Sparkles, Brain, Moon, Sun, Zap } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ContextPanel from './ContextPanelContainer';
import { sendMessageStream, clearSessionId, clearAccessCode, getSessionId, endSession, endSessionBeacon, getGreeting, createCheckoutSession } from '../../lib/api/index.js';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useMobileContextPanel } from '../vault/VaultLayout';

/**
 * Generate a unique message ID
 */
function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Main chat container component
 */
export default function Chat({
  mode = 'try_it_out',
  onExit,
  personaName = 'Alex',
  suggestedPrompts = [
    "My brother Jack lives in Boston",
    "I'm planning a dinner party next Saturday",
    "I need to call mom about the holiday plans",
  ],
  initialGreeting = null,
  showThemeToggle = true,
}) {
  const { session, plan, conversationsRemaining, initialized: authInitialized } = useAuth();
  const isAuthUser = !!session;
  const isFreeUser = isAuthUser && plan === 'free';
  const { isDark, toggle: toggleTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // ISS-026: Loading greeting
  const [showContextPanel, setShowContextPanel] = useState(() => {
    // Default to hidden on mobile, shown on desktop
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [currentRetrievalTrace, setCurrentRetrievalTrace] = useState(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [abortFn, setAbortFn] = useState(null);
  const [usedPrompts, setUsedPrompts] = useState(new Set());
  // session-carryover (ISS-113) — resumption hints surfaced by the backend greeting
  const [sessionMeta, setSessionMeta] = useState({
    isResumed: false,
    relativeTimePhrase: null,
  });
  const greetingLoaded = useRef(false); // Prevent double greeting from StrictMode

  // Sync mobile context panel toggle with local state
  const mobileCtx = useMobileContextPanel()
  useEffect(() => {
    if (mobileCtx) setShowContextPanel(mobileCtx.show)
  }, [mobileCtx?.show])
  
  /**
   * Handle sending a message
   */
  const handleSend = useCallback((text) => {
    // Add user message
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsRetrieving(true);
    setCurrentRetrievalTrace(null);
    
    // Create placeholder for assistant message
    const assistantId = generateId();
    let assistantContent = '';
    let toolCalls = [];
    let responseTimeMs = null;
    
    // Start streaming
    const abort = sendMessageStream(text, {
      onRetrievalTrace: (trace) => {
        setCurrentRetrievalTrace(trace);
        setIsRetrieving(false);
      },
      
      onToolCalls: (calls) => {
        // Legacy handler (not used by current backend)
        toolCalls = calls;
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              toolCalls: calls,
            };
          }
          return updated;
        });
      },
      
      onToolStart: (toolData) => {
        // Tool execution starting - add to list with pending state
        const newTool = {
          id: toolData.tool_id || `tool_${Date.now()}`,
          name: toolData.name,
          input: toolData.input || {},
          success: null, // Pending
          duration_ms: null,
        };
        toolCalls = [...toolCalls, newTool];
        
        // Update message with new tool call
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.id === assistantId) {
            return prev.map(m =>
              m.id === assistantId
                ? { ...m, toolCalls: [...toolCalls] }
                : m
            );
          } else {
            // Create assistant message with tool call
            return [...prev, {
              id: assistantId,
              role: 'assistant',
              content: '',
              toolCalls: [...toolCalls],
              timestamp: new Date().toISOString(),
            }];
          }
        });
      },
      
      onToolComplete: (toolData) => {
        // Tool execution finished - update the tool in the list
        toolCalls = toolCalls.map(tc =>
          tc.name === toolData.name && tc.success === null
            ? { ...tc, success: toolData.success, duration_ms: toolData.duration_ms, error: toolData.error }
            : tc
        );
        
        // Update message with completed tool
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, toolCalls: [...toolCalls] }
            : m
        ));
      },
      
      onContent: (delta) => {
        assistantContent += delta;
        
        // Add or update assistant message
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.id === assistantId) {
            // Update existing
            return prev.map(m => 
              m.id === assistantId 
                ? { ...m, content: assistantContent }
                : m
            );
          } else {
            // Add new
            return [...prev, {
              id: assistantId,
              role: 'assistant',
              content: assistantContent,
              toolCalls,
              timestamp: new Date().toISOString(),
            }];
          }
        });
      },
      
      onDone: (data) => {
        responseTimeMs = data.response_time_ms;
        setIsLoading(false);
        setIsRetrieving(false);
        
        // Update final message with response time
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { ...m, responseTimeMs }
            : m
        ));
      },
      
      onError: (error) => {
        console.error('Chat error:', error);
        setIsLoading(false);
        setIsRetrieving(false);
        
        // Clear session to force fresh start (backend clears corrupted orchestrator)
        clearSessionId();
        
        // Add error message
        setMessages(prev => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: `Sorry, there was an error: ${error}. The session has been reset - please try again.`,
          isError: true,
          timestamp: new Date().toISOString(),
        }]);
      },
    });
    
    setAbortFn(() => abort);
  }, []);
  
  // loadStaticIntro removed - all modes now use loadGreeting()
  // Backend handles new vs returning user logic and returns appropriate messages

  /**
   * Load greeting from API (all modes)
   * Backend returns `messages` array - each becomes a separate chat bubble.
   * New users: [static intro, LLM opener]
   * Returning users: [personalized greeting]
   */
  const loadGreeting = useCallback(async () => {
    setIsInitializing(true);

    try {
      const result = await getGreeting();

      if (result.error) {
        console.error('Greeting error:', result.error);
        // Fall back to empty chat - user can still interact
        setIsInitializing(false);
        return;
      }

      // Use messages array for multi-bubble display, fall back to single greeting
      const greetingMessages = result.messages && result.messages.length > 0
        ? result.messages
        : result.greeting ? [result.greeting] : [];

      if (greetingMessages.length > 0) {
        const now = new Date().toISOString();
        setMessages(
          greetingMessages.map((text, i) => ({
            id: generateId(),
            role: 'assistant',
            content: text,
            // Attach tool calls to last message only
            toolCalls: i === greetingMessages.length - 1 ? result.toolCalls : [],
            timestamp: now,
          }))
        );

        // Set retrieval trace for context panel
        if (result.retrievalTrace) {
          setCurrentRetrievalTrace(result.retrievalTrace);
        }
      }

      // session-carryover (ISS-113) — only the FETCHED greeting path surfaces
      // resumption hints. Pre-generated demo greetings never count as a resumption.
      setSessionMeta({
        isResumed: Boolean(result.isResumed),
        relativeTimePhrase: result.relativeTimePhrase || null,
      });
    } catch (e) {
      console.error('Failed to load greeting:', e);
    } finally {
      setIsInitializing(false);
    }
  }, []);
  
  /**
   * Handle reset conversation
   */
  const handleReset = useCallback(async () => {
    // Abort any in-flight request
    abortFn?.();
    
    // End session on backend to trigger persistence
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        const result = await endSession(sessionId);
        if (result.success) {
          console.log(`Session ended: ${result.episodesCreated} episodes created`);
        }
      } catch (e) {
        console.warn('Failed to end session:', e);
      }
    }
    
    // Clear state
    setMessages([]);
    setCurrentRetrievalTrace(null);
    setIsLoading(false);
    setIsRetrieving(false);
    setSessionMeta({ isResumed: false, relativeTimePhrase: null });
    clearSessionId();
    
    // Load new greeting for fresh session (all modes use backend)
    greetingLoaded.current = false;
    await loadGreeting();
    greetingLoaded.current = true;
  }, [abortFn, loadGreeting]);
  
  /**
   * Handle exit demo
   */
  const handleExit = useCallback(async () => {
    abortFn?.();

    // End session on backend to trigger persistence
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        const result = await endSession(sessionId);
        if (result.success) {
          console.log(`Session ended: ${result.episodesCreated} episodes created`);
        }
      } catch (e) {
        console.warn('Failed to end session:', e);
      }
    }

    clearSessionId();
    clearAccessCode();

    // Sign out of Supabase Auth for authenticated users
    if (isAuthUser) {
      try { await signOut(); } catch (e) { console.warn('Sign out error:', e); }
      window.location.href = '/signup';
      return;
    }

    onExit?.();
  }, [abortFn, onExit, isAuthUser]);
  
  const handleUpgrade = async () => {
    try {
      const url = await createCheckoutSession()
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
    }
  }

  const isAlexMode = mode === 'alex';
  const isSimulatedMode = mode === 'simulated';
  const showHelperPrompts = isAlexMode || isSimulatedMode;
  
  // ISS-026 + ISS-052: Load greeting on mount, but only after auth is initialized.
  // Without this gate, getAuthHeaders() races against Supabase session recovery
  // and returns empty headers → greeting silently fails.
  useEffect(() => {
    if (!authInitialized) return;
    if (greetingLoaded.current) return;
    greetingLoaded.current = true;

    // Use pre-generated greeting if provided (demo mode — skip LLM call)
    if (initialGreeting) {
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: initialGreeting,
        toolCalls: [],
        timestamp: new Date().toISOString(),
      }]);
      setIsInitializing(false);
      return;
    }

    loadGreeting();
  }, [authInitialized, loadGreeting, initialGreeting]);
  
  // Handle browser close/refresh - persist session using sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = getSessionId();
      if (sessionId) {
        // Use sendBeacon for reliability on page close
        endSessionBeacon(sessionId);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-hide panel on mobile when resizing down
      if (window.innerWidth < 1024 && showContextPanel) {
        // Don't auto-close if user explicitly opened it
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showContextPanel]);
  
  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — hidden on mobile (MobileTopBar provides HridAI + gear) */}
        <header className="hidden md:block flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                (isAlexMode || isSimulatedMode)
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              } text-white shadow-lg shadow-${(isAlexMode || isSimulatedMode) ? 'violet' : 'emerald'}-500/25`}>
                {(isAlexMode || isSimulatedMode) ? <Brain className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {isSimulatedMode ? 'Simulated Demo' : (isAlexMode ? 'See It In Action' : 'Your HridAI')}
              </h1>
              {/* Upgrade button (free) or Premium badge (premium) */}
              {isFreeUser ? (
                <button
                  onClick={handleUpgrade}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                  title="Upgrade to Premium"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade</span>
                </button>
              ) : isAuthUser && plan === 'premium' ? (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap className="w-3 h-3" />
                  Premium
                </span>
              ) : null}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Theme toggle — hidden in the real vault (moved to Settings); shown in demos */}
              {showThemeToggle && (
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Reset button */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              
              {/* Toggle context panel */}
              <button
                onClick={() => setShowContextPanel(!showContextPanel)}
                className={`p-2.5 rounded-full transition-all duration-150 ${
                  showContextPanel
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={showContextPanel ? 'Hide context panel' : 'Show context panel'}
              >
                {showContextPanel ? (
                  <PanelRightClose className="w-5 h-5" />
                ) : (
                  <PanelRightOpen className="w-5 h-5" />
                )}
              </button>
              
              {/* Exit / Sign off button — hidden on mobile (use Settings > Sign Out) */}
              <button
                onClick={onExit ? onExit : handleExit}
                className="hidden md:flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
                title={isAuthUser ? "Sign off & exit" : "Exit demo"}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{isAuthUser ? 'Sign off & Exit' : 'Exit'}</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* session-carryover (ISS-113) — subtle badge shown when the backend
            resumed a recent session. Renders above the messages list so it sits
            near the greeting bubble. */}
        {sessionMeta.isResumed && sessionMeta.relativeTimePhrase && (
          <div
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 self-start mx-4 sm:mx-6 mt-3 px-2.5 py-1 rounded-full text-xs text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/60"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Continuing from {sessionMeta.relativeTimePhrase}
          </div>
        )}

        {/* Messages area — isInitializing renders the spinner INSIDE
            MessageList's flex-1 space instead of a sibling flex-1, preventing
            the layout thrash that caused the second greeting bubble to paint
            empty on first render. */}
        <MessageList
          messages={messages}
          isLoading={isLoading && messages.length > 0}
          isInitializing={isInitializing}
          mode={mode}
        />
        
        {/* Suggested prompts - for Alex and Simulated modes to guide users through memory demo */}
        {/* ISS-032: Try It Out should be blank slate, Alex/Simulated modes need prompts */}
        {showHelperPrompts && !isLoading && !isInitializing && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">{personaName} might say:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, i) => {
                const isUsed = usedPrompts.has(prompt)
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isUsed) {
                        setUsedPrompts(prev => new Set(prev).add(prompt))
                        handleSend(prompt)
                      }
                    }}
                    disabled={isUsed}
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm border transition-all duration-150 ${
                      isUsed
                        ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-600 cursor-default'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    "{prompt}"
                  </button>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Conversation limit banner */}
        {isFreeUser && conversationsRemaining <= 0 && (
          <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 text-center">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You've used all 5 conversations this week. Resets Monday.
            </p>
            <button
              onClick={handleUpgrade}
              className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              Upgrade for unlimited →
            </button>
          </div>
        )}

        {/* Input area */}
        <MessageInput
          onSend={handleSend}
          disabled={isLoading || isInitializing || (isFreeUser && conversationsRemaining <= 0)}
          placeholder={(isAlexMode || isSimulatedMode) ? `Chat as ${personaName}...` : "Type a message..."}
        />
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 py-0.5 md:py-1">
          HridAI may make mistakes — verify its responses
        </p>
      </div>
      
      {/* Context panel sidebar - responsive */}
      {showContextPanel && (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/20 dark:bg-black/50 z-40"
            onClick={() => setShowContextPanel(false)}
          />
          
          {/* Sidebar panel */}
          <aside className={`
            fixed lg:relative inset-y-0 right-0 z-50
            w-[85vw] sm:w-96 lg:w-96
            border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
            shadow-2xl lg:shadow-lg lg:shadow-slate-200/50 dark:lg:shadow-slate-950/50
            transform transition-transform duration-300 ease-out
            ${showContextPanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            {/* Mobile close button */}
            <button
              onClick={() => setShowContextPanel(false)}
              className="lg:hidden absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
            >
              <PanelRightClose className="w-5 h-5" />
            </button>
            
            <ContextPanel 
              retrievalTrace={currentRetrievalTrace}
              isLoading={isRetrieving}
            />
          </aside>
        </>
      )}
    </div>
  );
}
