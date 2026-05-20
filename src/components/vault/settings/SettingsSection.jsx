// src/components/vault/settings/SettingsSection.jsx
export default function SettingsSection({ label, children, className = '' }) {
  return (
    <div className={`mt-6 ${className}`}>
      {label && (
        <div className="px-1.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
          {label}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {children}
      </div>
    </div>
  )
}
