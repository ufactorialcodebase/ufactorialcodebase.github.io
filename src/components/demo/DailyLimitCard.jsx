import React from 'react'
import { Clock } from 'lucide-react'

/**
 * Persistent "you've hit today's usage limit" card (ISS-214).
 *
 * Assistant-muted styling — informational, not error-red. Same slate palette
 * as the rest of Chat so it reads as part of the conversation surface.
 *
 * @param {string} message  — backend-provided message, rendered verbatim
 * @param {string} remainingText — countdown text like "4h 23m" / "12m" / "<1m"
 * @param {'inline' | 'empty'} variant — 'empty' is the greeting-blocked
 *   placeholder (fills the message area), 'inline' sits below an existing
 *   thread after a send was blocked
 */
export default function DailyLimitCard({ message, remainingText, variant = 'inline' }) {
  const isEmpty = variant === 'empty'
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        isEmpty
          ? 'flex-1 min-h-0 flex items-center justify-center px-4 sm:px-6 py-8'
          : 'px-4 sm:px-6 pt-2 pb-4'
      }
    >
      <div
        className={
          'max-w-md w-full mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 ' +
          'bg-slate-50/80 dark:bg-slate-800/50 px-5 py-5 sm:px-6 sm:py-6 ' +
          'shadow-sm'
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 p-2 rounded-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Clock className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
              {message}
            </p>
            {remainingText && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Resets in <span className="font-medium text-slate-600 dark:text-slate-300">{remainingText}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
