import React, { useRef, useEffect } from 'react';
import { User, Bot, Loader2, Sparkles, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ToolCallCard, { shouldShowToolCall } from './ToolCallCard';
import { formatMessageTime } from '../../lib/format-utils';

// Whitelist: bold, italic, code, code blocks, lists, links, paragraphs.
// Headings unwrap to plain text so an LLM-emitted "# Section" doesn't
// blow up the chat bubble layout but the words still land in the bubble.
const MARKDOWN_DISALLOWED = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const MARKDOWN_COMPONENTS = {
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-500" />
  ),
  code: ({ node, inline, className, children, ...props }) => (
    inline || !className
      ? <code {...props} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-[0.9em] font-mono text-rose-600 dark:text-rose-300">{children}</code>
      : <code {...props} className={className}>{children}</code>
  ),
  pre: ({ node, ...props }) => (
    <pre {...props} className="my-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-900/70 text-[13px] font-mono overflow-x-auto" />
  ),
  ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-1.5 space-y-0.5" />,
  ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 my-1.5 space-y-0.5" />,
  li: ({ node, ...props }) => <li {...props} className="marker:text-slate-400 dark:marker:text-slate-500" />,
  p: ({ node, ...props }) => <p {...props} className="my-1 first:mt-0 last:mb-0 whitespace-pre-wrap" />,
};

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
          ? 'bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-500 dark:to-slate-700 text-white'
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
        {/* Tool calls — ISS-090: only show successful write tools */}
        {!isUser && message.toolCalls && message.toolCalls.filter(shouldShowToolCall).length > 0 && (
          <div className="mb-3 space-y-1 w-full">
            {message.toolCalls.filter(shouldShowToolCall).map((tc, idx) => (
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
              ? 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-md'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-md shadow-sm'
          }
        `}>
          {message.content ? (
            <>
              {isUser ? (
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {message.content}
                </div>
              ) : (
                <div className="text-[15px] leading-relaxed" data-testid="ai-message-body">
                  <ReactMarkdown
                    disallowedElements={MARKDOWN_DISALLOWED}
                    unwrapDisallowed
                    components={MARKDOWN_COMPONENTS}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              {message.timestamp && (
                <div
                  data-testid="message-timestamp"
                  className={`mt-1 text-right text-[10px] tabular-nums select-none ${
                    isUser
                      ? 'text-white/60'
                      : isError
                        ? 'text-red-600/70 dark:text-red-400/70'
                        : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {formatMessageTime(message.timestamp)}
                </div>
              )}
            </>
          ) : isStreaming ? (
            <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </span>
          ) : null}
        </div>
        
        {/* Timestamp or status */}
        {message.responseTimeMs && !isUser && (
          <div className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
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
export default function MessageList({ messages, isLoading, isInitializing = false, mode = 'try_it_out' }) {
  const bottomRef = useRef(null);
  const isAlexMode = mode === 'alex';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (isInitializing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Preparing your assistant...</p>
        </div>
      </div>
    );
  }

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
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            {isAlexMode ? "Welcome back, Alex!" : "Start a Conversation"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {isAlexMode
              ? "Ask about your schedule, family, or ongoing projects. Watch how HridAI remembers everything."
              : "Share something about yourself and watch HridAI build memory in real-time."
            }
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
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
