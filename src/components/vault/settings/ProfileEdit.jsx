// src/components/vault/settings/ProfileEdit.jsx
import { ArrowLeft, Eye, EyeOff, Copy } from 'lucide-react'

const fieldWrap = 'relative px-4 py-4 after:absolute after:left-4 after:right-4 after:bottom-0 after:h-px after:bg-slate-200 dark:after:bg-slate-700 last:after:hidden'
const labelCls = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400 dark:text-slate-500'
const inputCls = 'w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

export default function ProfileEdit({ s, onBack }) {
  return (
    <div>
      <div className="flex items-center gap-3 px-1 pb-1 pt-3.5">
        <button onClick={onBack} aria-label="Back" className="rounded-lg p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-[24px] font-bold tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          Profile settings
        </h2>
      </div>

      <div className="mt-3.5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {/* Display name */}
        <div className={fieldWrap}>
          <label className={labelCls}>Display name</label>
          <div className="flex gap-2">
            <input className={inputCls} value={s.displayName} onChange={(e) => s.setDisplayName(e.target.value)} placeholder="Your name" />
            <button onClick={s.handleUpdateName} disabled={s.loading}
              className="rounded-[10px] bg-indigo-500 px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-indigo-600 disabled:opacity-50">
              Save
            </button>
          </div>
        </div>

        {/* Email */}
        <div className={fieldWrap}>
          <label className={labelCls}>Email</label>
          <input className={`${inputCls} text-slate-400 dark:text-slate-500`} value={s.user?.email || ''} readOnly />
        </div>

        {/* Change password */}
        <div className={fieldWrap}>
          <label className={labelCls}>Change password</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className={`${inputCls} pr-10`}
                type={s.showPassword ? 'text' : 'password'}
                value={s.newPassword}
                onChange={(e) => s.setNewPassword(e.target.value)}
                placeholder="New password (8+ chars)"
                minLength={8}
              />
              <button type="button" tabIndex={-1} onClick={() => s.setShowPassword(!s.showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {s.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button onClick={s.handleChangePassword} disabled={s.loading || s.newPassword.length < 8}
              className="rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Update
            </button>
          </div>
          <button onClick={s.handlePasswordReset} className="mt-2 text-[13px] text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300">
            Send reset email instead
          </button>
        </div>

        {/* User ID */}
        <div className={fieldWrap}>
          <label className={labelCls}>User ID</label>
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate font-mono text-[12.5px] text-slate-400 dark:text-slate-500">{s.userId}</span>
            <button onClick={s.handleCopyUserId} aria-label="Copy user ID"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300">
              <Copy size={15} />
            </button>
          </div>
        </div>
      </div>

      {(s.message || s.error) && (
        <div className={`mt-4 px-1 text-sm ${s.error ? 'text-rose-500' : 'text-emerald-500'}`}>{s.error || s.message}</div>
      )}
    </div>
  )
}
