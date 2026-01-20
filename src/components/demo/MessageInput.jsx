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
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50">
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
                bg-slate-50 text-slate-800 placeholder:text-slate-400
                focus:outline-none focus:bg-white focus:border-slate-300 focus:shadow-sm
                resize-none overflow-hidden
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
                ${disabled ? 'border-slate-200' : 'border-slate-200 hover:border-slate-300'}
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
                ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white hover:shadow-md hover:scale-105 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
        
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-500">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-500">Shift+Enter</kbd> for new line</span>
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
