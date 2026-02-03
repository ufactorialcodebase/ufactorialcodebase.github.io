import React, { useState, useCallback, useEffect } from 'react';
import { PanelRightOpen, PanelRightClose, RotateCcw, LogOut, Sparkles, Brain } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ContextPanel from './ContextPanel';
import { sendMessageStream, clearSessionId, clearAccessCode, getSessionId, endSession, endSessionBeacon, getGreeting } from '../../lib/api';

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
}) {
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
        toolCalls = calls;
        // Update message with tool calls
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
  
  /**
   * Load greeting from API
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
      
      // Add greeting as first message
      if (result.greeting) {
        setMessages([{
          id: generateId(),
          role: 'assistant',
          content: result.greeting,
          toolCalls: result.toolCalls,
          timestamp: new Date().toISOString(),
        }]);
        
        // Set retrieval trace for context panel
        if (result.retrievalTrace) {
          setCurrentRetrievalTrace(result.retrievalTrace);
        }
      }
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
    clearSessionId();
    
    // Load new greeting for fresh session
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
    onExit?.();
  }, [abortFn, onExit]);
  
  const isAlexMode = mode === 'alex';
  const isSimulatedMode = mode === 'simulated';
  const showHelperPrompts = isAlexMode || isSimulatedMode;
  
  // ISS-026: Load greeting on mount
  useEffect(() => {
    loadGreeting();
  }, [loadGreeting]);
  
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
    <div className="h-screen flex bg-gradient-to-br from-slate-50 to-white">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                (isAlexMode || isSimulatedMode)
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              } text-white shadow-lg shadow-${(isAlexMode || isSimulatedMode) ? 'violet' : 'emerald'}-500/25`}>
                {(isAlexMode || isSimulatedMode) ? <Brain className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  {isSimulatedMode ? 'Simulated Demo' : (isAlexMode ? 'See It In Action' : 'Try It Yourself')}
                </h1>
                <p className="text-xs text-slate-500">
                  {isSimulatedMode
                    ? "Chat as a persona and see rich context retrieval"
                    : (isAlexMode 
                      ? "Chat as Alex and see rich context retrieval"
                      : "Start fresh and watch memory build")
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Reset button */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-150"
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
                    ? 'bg-slate-100 text-slate-700' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title={showContextPanel ? 'Hide context panel' : 'Show context panel'}
              >
                {showContextPanel ? (
                  <PanelRightClose className="w-5 h-5" />
                ) : (
                  <PanelRightOpen className="w-5 h-5" />
                )}
              </button>
              
              {/* Exit button */}
              <button
                onClick={handleExit}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                title="Exit demo"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Messages area */}
        <MessageList 
          messages={messages} 
          isLoading={isLoading && messages.length > 0}
          mode={mode}
        />
        
        {/* Loading indicator while greeting loads */}
        {isInitializing && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Preparing your assistant...</p>
            </div>
          </div>
        )}
        
        {/* Suggested prompts - for Alex and Simulated modes to guide users through memory demo */}
        {/* ISS-032: Try It Out should be blank slate, Alex/Simulated modes need prompts */}
        {showHelperPrompts && !isLoading && !isInitializing && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xs font-medium text-slate-500 mb-3">Try asking {personaName} about:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-150"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <MessageInput 
          onSend={handleSend} 
          disabled={isLoading || isInitializing}
          placeholder={(isAlexMode || isSimulatedMode) ? `Chat as ${personaName}...` : "Type a message..."}
        />
      </div>
      
      {/* Context panel sidebar - responsive */}
      {showContextPanel && (
        <>
          {/* Mobile overlay backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowContextPanel(false)}
          />
          
          {/* Sidebar panel */}
          <aside className={`
            fixed lg:relative inset-y-0 right-0 z-50
            w-[85vw] sm:w-96 lg:w-96
            border-l border-slate-200 bg-white
            shadow-2xl lg:shadow-lg lg:shadow-slate-200/50
            transform transition-transform duration-300 ease-out
            ${showContextPanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            {/* Mobile close button */}
            <button
              onClick={() => setShowContextPanel(false)}
              className="lg:hidden absolute top-4 left-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors z-10"
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
