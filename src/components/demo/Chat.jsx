import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { PanelRightOpen, PanelRightClose, RotateCcw, LogOut, Sparkles, Brain, Moon, Sun, Zap, RefreshCw } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ContextPanel from './ContextPanelContainer';
import DailyLimitCard from './DailyLimitCard';
import { sendMessageStream, clearSessionId, clearAccessCode, getSessionId, endSession, endSessionBeacon, getGreeting, createCheckoutSession } from '../../lib/api/index.js';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useDailyLimit } from '../../hooks/useDailyLimit';
import { useMobileContextPanel } from '../vault/VaultLayout';

/**
 * Generate a unique message ID
 */
function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copy shown in the green "stopped" bubble after the user hits stop.
 * Randomly picked with anti-repeat guard so a rapid double-stop doesn't
 * surface the same wording twice in a row (would read as canned).
 */
const STOPPED_VARIANTS = [
  "Got it, stopped there. What did you want instead?",
  "OK, holding off. What did you want to do instead?",
  "Stopped. What would you like me to do instead?",
  "Alright, dropping that. Where should we go instead?",
  "Sure, pausing there. What did you have in mind?",
  "Understood — stopped. What did you want to do?",
];

function pickStoppedVariant(lastIndex) {
  let idx;
  do {
    idx = Math.floor(Math.random() * STOPPED_VARIANTS.length);
  } while (idx === lastIndex && STOPPED_VARIANTS.length > 1);
  return { text: STOPPED_VARIANTS[idx], index: idx };
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
  // Messages typed while the AI was processing. Drained back-to-back as
  // fresh turns once the current turn completes OR the user hits stop.
  const [queuedMessages, setQueuedMessages] = useState([]);
  // Ref keeps the last-shown stopped-variant index stable across renders
  // without triggering a re-render on update — used to prevent immediate
  // repeats when the user stops twice in a row.
  const lastStoppedIndexRef = useRef(null);
  // Guard against re-firing the drain effect on the same transition.
  // Without this, React's batching could result in two dispatches for one
  // isLoading→false event under StrictMode's double-invoke.
  const drainingRef = useRef(false);
  const [usedPrompts, setUsedPrompts] = useState(new Set());
  // session-carryover (ISS-113) — resumption hints surfaced by the backend greeting
  const [sessionMeta, setSessionMeta] = useState({
    isResumed: false,
    relativeTimePhrase: null,
  });
  // Greeting-mount reliability (root-cause-greeting-mount.md):
  //   * greetingInFlightRef guards against StrictMode's double-fire of the
  //     mount effect (dev only) AND against a real re-render race.
  //   * greetingLoaded is the *terminal* success flag — set only after the
  //     network round-trip completes without error. On failure, both flags
  //     go false so the user can retry via the inline chip or toast action.
  //   * greetingError holds the last-failure message for the empty-state
  //     retry chip; sonner surfaces the same message so it's visible even
  //     when the user has switched away from Chat.
  const greetingInFlightRef = useRef(false);
  const greetingLoaded = useRef(false);
  const [greetingError, setGreetingError] = useState(null);

  // Daily usage limit (ISS-214) — persistent "you've hit today's cap" state.
  // The hook hydrates from localStorage on mount, ticks the countdown, and
  // calls onReset when the countdown reaches zero so we auto-refetch the
  // greeting and re-enable the composer. loadGreeting is defined below; we
  // reach it through a ref so this hook can be declared once at the top.
  const loadGreetingRef = useRef(null);
  // Imperative handle on MessageInput used to restore the just-sent text
  // after a daily-limit 429 lands (the composer clears synchronously on
  // submit but the 429 arrives async, so we push the text back in).
  const messageInputRef = useRef(null);
  const dailyLimit = useDailyLimit({
    onReset: useCallback(() => {
      setMessages([]);
      messageInputRef.current?.setValue('');
      loadGreetingRef.current?.();
    }, []),
  });
  // Destructure the stable activate() reference so useCallback deps below
  // can point at the primitive function instead of the whole `dailyLimit`
  // object (which is a new literal on every render).
  const activateDailyLimit = dailyLimit.activate;

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
    // When the LLM streams "…good." → [tool] → "The next step is…", the
    // Anthropic tool-use protocol sends the pre-tool text as content deltas,
    // the tool as a separate block, then the post-tool text as new content
    // deltas — with no whitespace on either side of the tool. Concatenating
    // naively produces "good.The next step". We track the boundary here and
    // splice a single space back in when BOTH sides are non-whitespace.
    let toolBoundaryPending = false;
    
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
        // Mark the boundary so the next content delta gets a space when the
        // pre-tool buffer ended mid-sentence.
        toolBoundaryPending = true;
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
        // Re-arm the boundary — some backends emit tool_complete without a
        // preceding tool_start (bulk-execute path), and content that resumes
        // after tool_complete still needs the space fix.
        toolBoundaryPending = true;
        // Tool execution finished - update the tool in the list. Forward
        // `result` when the backend sends it (currently absent from the
        // tool_complete SSE payload; ISS-231 will populate it so artifact
        // deep-links can prefer id-based routing over title-based).
        toolCalls = toolCalls.map(tc =>
          tc.name === toolData.name && tc.success === null
            ? { ...tc, success: toolData.success, duration_ms: toolData.duration_ms, error: toolData.error, result: toolData.result }
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
        if (toolBoundaryPending && assistantContent.length > 0 && delta.length > 0) {
          const lastChar = assistantContent.charAt(assistantContent.length - 1);
          const firstChar = delta.charAt(0);
          // Only bridge with a space when neither side already has one; if
          // either side is punctuation-adjacent whitespace or a newline the
          // join is already fine.
          if (!/\s/.test(lastChar) && !/\s/.test(firstChar)) {
            assistantContent += ' ';
          }
          toolBoundaryPending = false;
        }
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

      // Daily usage limit (ISS-214) — persistent state, not an error. Push
      // the just-sent text back into the composer via its imperative handle
      // (MessageInput cleared its local state synchronously on submit, and
      // the 429 arrives async). Do NOT clear the session or add an error
      // bubble — the user's message stays in the thread and the
      // DailyLimitCard renders below it.
      onDailyLimit: ({ resetsAt, message }) => {
        setIsLoading(false);
        setIsRetrieving(false);
        activateDailyLimit(resetsAt, message, 'message');
        messageInputRef.current?.setValue(text);
      },
    });
    
    setAbortFn(() => abort);
  }, [activateDailyLimit]);

  /**
   * Enqueue a follow-up message the user typed while the AI is still
   * processing. It fires as a fresh turn after the current one completes
   * (via the drain effect below) or after the user hits Stop.
   */
  const handleQueue = useCallback((text) => {
    setQueuedMessages((prev) => [...prev, text]);
  }, []);

  /**
   * Retract a queued message that hasn't been dispatched yet. Bound to the
   * × affordance on each pending user bubble.
   */
  const handleCancelQueued = useCallback((idx) => {
    setQueuedMessages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  /**
   * User clicked Stop mid-response.
   *
   * Client-only abort per Q3: close the SSE stream on the client and mark
   * the turn as terminated visually. The backend will continue running
   * until its next `yield` hits the closed socket, then unwind — any tool
   * calls it dispatched before we aborted complete normally in the vault.
   *
   * The partial AI response (whatever streamed before the click) stays
   * visible per Q2. A short green "stopped" bubble is appended below it.
   *
   * Queue drain kicks in via the drain effect once isLoading flips false.
   */
  const handleStop = useCallback(() => {
    abortFn?.();
    setIsLoading(false);
    setIsRetrieving(false);
    const { text, index } = pickStoppedVariant(lastStoppedIndexRef.current);
    lastStoppedIndexRef.current = index;
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: 'assistant',
        content: text,
        stopped: true,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [abortFn]);

  /**
   * Drain the queue back-to-back once the current turn ends (naturally
   * via `done` OR by user-initiated stop). The `drainingRef` guard
   * prevents React StrictMode's double-invoke of this effect from
   * dispatching the same message twice.
   *
   * Uses microtask deferral so the state update from setQueuedMessages
   * commits BEFORE handleSend fires — otherwise handleSend's own
   * setIsLoading(true) would race with the still-in-flight state batch.
   */
  useEffect(() => {
    if (isLoading || isInitializing) return;
    if (queuedMessages.length === 0) return;
    if (drainingRef.current) return;
    drainingRef.current = true;
    const next = queuedMessages[0];
    setQueuedMessages((prev) => prev.slice(1));
    Promise.resolve().then(() => {
      drainingRef.current = false;
      handleSend(next);
    });
  }, [isLoading, isInitializing, queuedMessages, handleSend]);

  // loadStaticIntro removed - all modes now use loadGreeting()
  // Backend handles new vs returning user logic and returns appropriate messages

  /**
   * Load greeting from API (all modes)
   * Backend returns `messages` array - each becomes a separate chat bubble.
   * New users: [static intro, LLM opener]
   * Returning users: [personalized greeting]
   *
   * Reliability contract (see docs/root-cause-greeting-mount.md):
   * on failure we clear greetingLoaded so a retry (mount effect re-run,
   * inline chip click, sonner action) can re-enter. Success is terminal.
   */
  const loadGreeting = useCallback(async ({ isRetry = false } = {}) => {
    if (greetingInFlightRef.current) return;
    greetingInFlightRef.current = true;
    setIsInitializing(true);
    setGreetingError(null);

    try {
      const result = await getGreeting();

      // Daily usage limit (ISS-214) — greeting-blocked. Hand to the hook and
      // render the DailyLimitCard as the empty-state. The rest of the app
      // (vault, entities, nav) is untouched because this state lives in Chat.
      if (result.dailyLimit) {
        activateDailyLimit(result.dailyLimit.resetsAt, result.dailyLimit.message, 'greeting');
        setMessages([]);
        greetingLoaded.current = true;
        return;
      }

      if (result.error) {
        console.error('Greeting error:', result.error);
        setGreetingError(result.error);
        // Sonner surfaces the failure even if the user has already
        // navigated to another tab. Duration is long enough to catch a
        // glance, but the inline chip stays until manually retried.
        toast.error('Could not load your greeting', {
          description: result.error,
          action: !isRetry
            ? { label: 'Retry', onClick: () => loadGreetingRef.current?.({ isRetry: true }) }
            : undefined,
        });
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
      greetingLoaded.current = true;
    } catch (e) {
      console.error('Failed to load greeting:', e);
      const message = 'Network error. Please try again.';
      setGreetingError(message);
      toast.error('Could not load your greeting', {
        description: message,
        action: !isRetry
          ? { label: 'Retry', onClick: () => loadGreetingRef.current?.({ isRetry: true }) }
          : undefined,
      });
    } finally {
      setIsInitializing(false);
      greetingInFlightRef.current = false;
    }
  }, [activateDailyLimit]);

  const retryGreeting = useCallback(() => {
    loadGreetingRef.current?.({ isRetry: true });
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
    setGreetingError(null);
    clearSessionId();

    // Load new greeting for fresh session (all modes use backend). loadGreeting
    // owns the greetingLoaded latch — success sets it, failure leaves it
    // false so retry from the empty-state chip re-enters cleanly.
    greetingLoaded.current = false;
    await loadGreeting();
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
  
  // Keep loadGreetingRef pointing at the current loadGreeting so the daily-
  // limit hook's onReset callback can invoke it after countdown expiry
  // without creating a dependency cycle in hook declaration order.
  useEffect(() => {
    loadGreetingRef.current = loadGreeting;
  }, [loadGreeting]);

  // ISS-026 + ISS-052: Load greeting on mount, but only after auth is initialized.
  // Without this gate, getAuthHeaders() races against Supabase session recovery
  // and returns empty headers → greeting silently fails.
  //
  // Greeting-mount reliability (root-cause-greeting-mount.md): the latch is
  // greetingLoaded (terminal success) + greetingInFlightRef (in-flight guard,
  // set inside loadGreeting itself). If loadGreeting hits an error branch,
  // both refs go false so a subsequent effect run or retry can re-enter.
  useEffect(() => {
    if (!authInitialized) return;
    if (greetingLoaded.current) return;
    if (greetingInFlightRef.current) return;

    // Daily usage limit (ISS-214) — if we hydrated the blocked state from
    // localStorage, don't fire a greeting request that would just come back
    // as a 429. The DailyLimitCard renders directly from the persisted state.
    if (dailyLimit.isBlocked) {
      greetingLoaded.current = true;
      setIsInitializing(false);
      return;
    }

    // Use pre-generated greeting if provided (demo mode — skip LLM call)
    if (initialGreeting) {
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: initialGreeting,
        toolCalls: [],
        timestamp: new Date().toISOString(),
      }]);
      greetingLoaded.current = true;
      setIsInitializing(false);
      return;
    }

    loadGreeting();
  }, [authInitialized, loadGreeting, initialGreeting, dailyLimit.isBlocked]);
  
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

        {/* Greeting-mount failure banner (root-cause-greeting-mount.md). Sits
            above the message list so the retry is visible without hunting for
            a toast. Sonner shows the same failure as a secondary channel for
            users who have already navigated to another tab. */}
        {greetingError && !isInitializing && !dailyLimit.isBlocked && (
          <div
            role="alert"
            className="mx-4 sm:mx-6 mt-3 mb-1 flex items-center justify-between gap-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-sm text-amber-800 dark:text-amber-200"
          >
            <span className="min-w-0 truncate">
              Couldn't load your greeting — {greetingError}
            </span>
            <button
              type="button"
              onClick={retryGreeting}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/60 px-3 py-1 text-xs font-medium text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {/* Messages area — isInitializing renders the spinner INSIDE
            MessageList's flex-1 space instead of a sibling flex-1, preventing
            the layout thrash that caused the second greeting bubble to paint
            empty on first render.

            Daily usage limit (ISS-214): when the block originated from a
            greeting request (or from a stored-mount hydration where there is
            no thread), the card replaces the message list entirely. When the
            block originated from a send, the just-sent user message stays in
            the thread and the card renders below it as an inline notice. */}
        {dailyLimit.isBlocked && dailyLimit.source !== 'message' ? (
          <DailyLimitCard
            variant="empty"
            message={dailyLimit.message}
            remainingText={dailyLimit.remainingText}
          />
        ) : (
          <>
            <MessageList
              messages={messages}
              isLoading={isLoading && messages.length > 0}
              isInitializing={isInitializing}
              mode={mode}
              queuedMessages={queuedMessages}
              onCancelQueued={handleCancelQueued}
            />
            {dailyLimit.isBlocked && (
              <DailyLimitCard
                variant="inline"
                message={dailyLimit.message}
                remainingText={dailyLimit.remainingText}
              />
            )}
          </>
        )}

        {/* Suggested prompts - for Alex and Simulated modes to guide users through memory demo */}
        {/* ISS-032: Try It Out should be blank slate, Alex/Simulated modes need prompts */}
        {showHelperPrompts && !isLoading && !isInitializing && !dailyLimit.isBlocked && (
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
          ref={messageInputRef}
          onSend={handleSend}
          onQueue={handleQueue}
          onStop={handleStop}
          // Hard-block only for states where nothing should be typeable
          // (initializing, free-tier exhausted, daily cap). isLoading is
          // NOT a hard block anymore — the textarea stays enabled during
          // processing so the user can type follow-ups that get queued
          // via handleQueue and drained back-to-back once the current
          // turn ends (either normally or via stop).
          disabled={isInitializing || (isFreeUser && conversationsRemaining <= 0) || dailyLimit.isBlocked}
          isProcessing={isLoading}
          queuedCount={queuedMessages.length}
          placeholder={(isAlexMode || isSimulatedMode) ? `Chat as ${personaName}...` : "Type a message..."}
          footer={dailyLimit.isBlocked
            ? `Daily limit reached — resets in ${dailyLimit.remainingText}`
            : null}
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
