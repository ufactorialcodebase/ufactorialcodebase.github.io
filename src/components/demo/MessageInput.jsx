import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send, Loader2, Square } from 'lucide-react';

/**
 * Message input component with auto-resize textarea.
 *
 * Exposes an imperative `setValue(text)` handle so the parent can re-populate
 * the composer when a send is blocked by the daily cap (ISS-214). Doing this
 * imperatively (rather than a `restoreValue` prop) sidesteps set-state-in-
 * effect / adjust-state-in-render lint rules and avoids re-rendering the
 * parent tree on every keystroke.
 *
 * Props:
 *   onSend       — called when user submits and AI is idle
 *   onQueue      — called when user submits while AI is processing; the parent
 *                  queues the message and dispatches it after the current turn
 *                  completes (or is stopped by the user)
 *   onStop       — called when user clicks the stop button during processing
 *   disabled     — hard block (daily limit, initializing, free-tier exhausted).
 *                  Nothing works. Semantically distinct from isProcessing.
 *   isProcessing — AI is currently generating. Textarea STAYS enabled so the
 *                  user can type follow-ups; send button becomes a stop button.
 *   queuedCount  — number of already-queued messages; surfaced in the footer
 *                  as "N queued" so the user has feedback that Enter worked.
 */
const MessageInput = forwardRef(function MessageInput({
  onSend,
  onQueue,
  onStop,
  disabled,
  isProcessing,
  queuedCount = 0,
  placeholder,
  footer,
}, ref) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setValue: (v) => setMessage(typeof v === 'string' ? v : ''),
  }), []);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  }, [message]);

  // Auto-focus when AI finishes responding so the user can keep typing without
  // re-clicking. Desktop only — focusing on touch devices pops the on-screen
  // keyboard mid-flow.
  const prevDisabledRef = useRef(disabled);
  useEffect(() => {
    if (prevDisabledRef.current && !disabled && textareaRef.current) {
      const desktop =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(pointer: fine)').matches;
      if (desktop) textareaRef.current.focus();
    }
    prevDisabledRef.current = disabled;
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Stop-button click: only meaningful during processing; delegates to the
    // parent's abort + queue-drain path. Textarea is intentionally NOT
    // cleared — user's typed content stays in place for their next attempt.
    if (isProcessing) {
      onStop?.();
      return;
    }
    if (!message.trim() || disabled) return;
    if (isProcessing) {
      // Defence-in-depth: unreachable given the guard above, but keeps the
      // send-vs-queue routing explicit so future refactors don't accidentally
      // fall into the wrong branch when someone changes the state model.
      onQueue?.(message.trim());
    } else {
      onSend(message.trim());
    }
    setMessage('');
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Enter during processing → queue. Enter otherwise → send. Handled
      // inline here (not via handleSubmit) because handleSubmit's stop-branch
      // would fire on Enter with content, which would drop the message.
      if (isProcessing) {
        if (message.trim()) {
          onQueue?.(message.trim());
          setMessage('');
        }
        return;
      }
      if (message.trim() && !disabled) {
        onSend(message.trim());
        setMessage('');
      }
    }
  };

  // "Can act on the button" — both send AND stop are actions the button can
  // take. Send needs non-empty text + not blocked; stop just needs processing.
  const canSend = message.trim() && !disabled && !isProcessing;
  const canStop = isProcessing;
  const buttonActive = canSend || canStop;
  
  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                placeholder
                  || (isProcessing ? "Type your next message…" : "Type a message...")
              }
              // Only hard-block the textarea when `disabled` is set (daily
              // limit, initializing, free-tier exhausted). During normal AI
              // processing, textarea stays enabled so the user can type
              // follow-ups that queue for the next turn.
              disabled={disabled}
              rows={1}
              className={`
                w-full px-4 py-3 rounded-2xl border-2
                bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-slate-300 dark:focus:border-slate-600 focus:shadow-sm
                resize-none overflow-y-auto
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
                ${disabled ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
              `}
              style={{ minHeight: '52px', maxHeight: '150px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!buttonActive}
            aria-label={isProcessing ? "Stop response" : "Send message"}
            title={isProcessing ? "Stop response" : "Send message"}
            className={`
              flex-shrink-0 p-3.5 rounded-xl transition-all duration-150 shadow-sm
              ${canStop
                ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white hover:shadow-md hover:scale-105 active:scale-95'
                : canSend
                  ? 'bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-500 dark:to-slate-700 text-white hover:shadow-md hover:scale-105 active:scale-95'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }
            `}
          >
            {disabled && !isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isProcessing ? (
              // Square icon w/ filled center reads as "stop" better than the
              // Loader2 spinner that used to occupy this slot (spinner just
              // meant "wait" — it wasn't clickable).
              <Square className="w-5 h-5 fill-current" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="mt-1 md:mt-2.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          {footer ? (
            <span className="text-slate-500 dark:text-slate-400">{footer}</span>
          ) : isProcessing ? (
            <span className="text-slate-500 dark:text-slate-400">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400">Enter</kbd> to queue for next turn
              {queuedCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
                  {queuedCount} queued
                </span>
              )}
            </span>
          ) : (
            <span className="hidden md:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400">Shift+Enter</kbd> for new line</span>
          )}
          {!footer && message.length > 0 && (
            <span className={message.length > 2000 ? 'text-amber-500' : ''}>
              {message.length.toLocaleString()} characters
            </span>
          )}
        </div>
      </div>
    </form>
  );
});

export default MessageInput;
