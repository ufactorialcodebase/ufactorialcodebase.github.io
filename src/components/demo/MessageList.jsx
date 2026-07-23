import React, { useRef, useEffect } from 'react';
import { User, Bot, Loader2, Sparkles, Brain, Square, X, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ToolCallCard, { shouldShowToolCall } from './ToolCallCard';
import { formatMessageTime, formatDateRibbon, localDayKey } from '../../lib/format-utils';
import { useNow } from '../../hooks/useNow';

// Sticky ribbon between messages from different local days. Visually matches
// the existing chat mute palette (slate-100/800 pill) so it reads as a
// section header without shouting. `sticky top-2` keeps the current-day
// label pinned as the user scrolls — same feel as iMessage / WhatsApp.
//
// Overlap fix: CSS `position: sticky` on multiple siblings all use the
// same offset, which means every day boundary ends up with N ribbons
// stacked at the top row simultaneously. If the pill has any
// transparency, previous-day ribbons show through the newer one and
// read as ghosted duplicates. Fixed by (a) making the pill fully
// opaque so the newer (later-in-DOM) ribbon completely covers the
// older, and (b) tightening the shadow + adding a hairline border so
// the pill has enough visual weight to sit on top of the messages
// beneath it without the frosted-glass effect.
function DateRibbon({ text }) {
  return (
    <div className="flex justify-center sticky top-2 z-10 pointer-events-none" data-testid="date-ribbon">
      <div className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-md shadow-slate-900/5 dark:shadow-black/20">
        {text}
      </div>
    </div>
  );
}

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
 * Individual message bubble.
 *
 * Two extra message shapes on top of user / assistant:
 *
 *   `message.stopped === true` (assistant role) — a small green bubble that
 *   the AI says after the user hits Stop. Shares the emerald/teal avatar
 *   gradient with normal AI messages so the voice reads as continuous; the
 *   Square icon (rather than Sparkles) signals "response was cut here."
 *
 *   `message.pending === true` (user role) — a queued user message that
 *   hasn't been dispatched yet. Renders dimmed with a small × cancel button
 *   so the user can retract a queued follow-up before it fires. When the
 *   parent drains the queue it removes the pending flag and the same bubble
 *   becomes an ordinary user message.
 */
function MessageBubble({ message, mode, now, onCancelQueued }) {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const isError = message.isError;
  const isStopped = message.stopped;
  const isPending = message.pending;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} ${isPending ? 'opacity-55' : ''}`}>
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
        ) : isStopped ? (
          <Square className="w-3.5 h-3.5 fill-current" />
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
          inline-block px-4 py-3 relative
          ${isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl rounded-br-md shadow-lg shadow-slate-900/10'
            : isError
              ? 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-md'
              : isStopped
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl rounded-bl-md shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-md shadow-sm'
          }
        `}>
          {isPending && onCancelQueued && (
            // × affordance on queued user messages so the user can retract a
            // follow-up before the current turn finishes. Positioned outside
            // the bubble corner so it never overlaps the content.
            <button
              type="button"
              onClick={onCancelQueued}
              aria-label="Cancel queued message"
              className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-500 dark:hover:border-slate-400 flex items-center justify-center shadow-sm transition-colors"
              title="Cancel queued message"
            >
              <X className="w-3 h-3" />
            </button>
          )}
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
                        : isStopped
                          ? 'text-emerald-700/60 dark:text-emerald-300/60'
                          : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      queued
                    </span>
                  ) : (
                    formatMessageTime(message.timestamp, now)
                  )}
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
export default function MessageList({
  messages,
  isLoading,
  isInitializing = false,
  mode = 'try_it_out',
  // Queued (pending) user messages typed while the AI was processing.
  // Rendered as dimmed ghost bubbles AT THE END of the list so the user
  // can see them lined up. `onCancelQueued(index)` removes one.
  queuedMessages = [],
  onCancelQueued,
}) {
  const bottomRef = useRef(null);
  const isAlexMode = mode === 'alex';
  // ISS-248: single "now" reference for the whole list — persona
  // anchor in demo mode, real Date.now() for real users.
  const now = useNow();

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
  
  let prevDayKey = null;
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {messages.map((message, idx) => {
        const dayKey = localDayKey(message.timestamp);
        const showRibbon = dayKey && dayKey !== prevDayKey;
        prevDayKey = dayKey;
        const ribbonText = showRibbon ? formatDateRibbon(message.timestamp, now) : null;
        return (
          <React.Fragment key={message.id || idx}>
            {showRibbon && <DateRibbon text={ribbonText} />}
            <MessageBubble message={message} mode={mode} now={now} />
          </React.Fragment>
        );
      })}
      
      {/* Loading indicator */}
      {isLoading && (
        <MessageBubble
          message={{
            role: 'assistant',
            content: '',
            isStreaming: true
          }}
          mode={mode}
          now={now}
        />
      )}

      {/* Queued (pending) messages — dimmed ghost user bubbles that will
          fire back-to-back once the current turn completes or is stopped.
          Each has a small × affordance so the user can retract before it
          leaves the client. */}
      {queuedMessages.map((text, idx) => (
        <MessageBubble
          key={`queued-${idx}`}
          message={{
            role: 'user',
            content: text,
            pending: true,
            timestamp: new Date().toISOString(),
          }}
          mode={mode}
          now={now}
          onCancelQueued={onCancelQueued ? () => onCancelQueued(idx) : undefined}
        />
      ))}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
