import React, { useRef, useEffect } from 'react';
import { User, Bot, Loader2, Sparkles, Brain } from 'lucide-react';
import ToolCallCard from './ToolCallCard';

/**
 * Individual message bubble
 */
function MessageBubble({ message, mode }) {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const isError = message.isError;
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm
        ${isUser 
          ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white' 
          : mode === 'alex'
            ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
        }
      `}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : mode === 'alex' ? (
          <Brain className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>
      
      {/* Message content */}
      <div className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Tool calls (shown before AI response) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-3 space-y-2 w-full">
            {message.toolCalls.map((tc, idx) => (
              <ToolCallCard key={tc.id || idx} toolCall={tc} />
            ))}
          </div>
        )}
        
        {/* Text content */}
        <div className={`
          inline-block px-4 py-3 
          ${isUser 
            ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl rounded-br-md shadow-lg shadow-slate-900/10' 
            : isError
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-2xl rounded-bl-md'
              : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md shadow-sm'
          }
        `}>
          {message.content ? (
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {message.content}
            </div>
          ) : isStreaming ? (
            <span className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </span>
          ) : null}
        </div>
        
        {/* Timestamp or status */}
        {message.responseTimeMs && !isUser && (
          <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {(message.responseTimeMs / 1000).toFixed(1)}s response
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Message list component with auto-scroll
 */
export default function MessageList({ messages, isLoading, mode = 'try_it_out' }) {
  const bottomRef = useRef(null);
  const isAlexMode = mode === 'alex';
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center max-w-sm">
          <div className={`
            w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg
            ${isAlexMode 
              ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/25' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'
            }
          `}>
            {isAlexMode ? (
              <Brain className="w-10 h-10 text-white" />
            ) : (
              <Sparkles className="w-10 h-10 text-white" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {isAlexMode ? "Welcome back, Alex!" : "Start a Conversation"}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {isAlexMode 
              ? "Ask about your schedule, family, or ongoing projects. Watch how HridAI remembers everything."
              : "Share something about yourself and watch HridAI build memory in real-time."
            }
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ready to chat
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {messages.map((message, idx) => (
        <MessageBubble key={message.id || idx} message={message} mode={mode} />
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <MessageBubble 
          message={{ 
            role: 'assistant', 
            content: '', 
            isStreaming: true 
          }}
          mode={mode}
        />
      )}
      
      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
