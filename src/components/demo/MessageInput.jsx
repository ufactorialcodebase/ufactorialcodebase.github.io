import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

/**
 * Message input component with auto-resize textarea
 */
export default function MessageInput({ onSend, disabled, placeholder }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  }, [message]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const canSend = message.trim() && !disabled;
  
  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || "Type a message..."}
              disabled={disabled}
              rows={1}
              className={`
                w-full px-4 py-3 rounded-2xl border-2
                bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-slate-300 dark:focus:border-slate-600 focus:shadow-sm
                resize-none overflow-hidden
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
                ${disabled ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
              `}
              style={{ minHeight: '52px', maxHeight: '150px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!canSend}
            className={`
              flex-shrink-0 p-3.5 rounded-xl transition-all duration-150 shadow-sm
              ${canSend
                ? 'bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-500 dark:to-slate-700 text-white hover:shadow-md hover:scale-105 active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }
            `}
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400">Shift+Enter</kbd> for new line</span>
          {message.length > 0 && (
            <span className={message.length > 2000 ? 'text-amber-500' : ''}>
              {message.length.toLocaleString()} characters
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
