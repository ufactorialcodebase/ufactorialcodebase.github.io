// src/components/vault/settings/PrivacySettings.jsx
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import SettingsRow from './SettingsRow'
import Toggle from './Toggle'

const ITEMS = [
  { key: 'analytics', label: 'Usage analytics', description: 'Help us improve HridAI by sharing anonymous usage data (e.g. which features you use). No personal memory content is included.' },
  { key: 'crash', label: 'Crash reports', description: 'Automatically send crash reports when something goes wrong. Helps us fix bugs faster.' },
  { key: 'ai', label: 'AI improvement', description: "Allow anonymized, aggregated patterns to help improve HridAI's models. Your individual data is never shared." },
]

export default function PrivacySettings({ onBack }) {
  // Local-only until a privacy_settings backend store exists (launch_checklist.md)
  const [state, setState] = useState({ analytics: true, crash: true, ai: true })
  const flip = (k) => setState((p) => ({ ...p, [k]: !p[k] }))

  return (
    <div>
      <div className="flex items-center gap-3 px-1 pb-1 pt-3.5">
        <button onClick={onBack} aria-label="Back" className="rounded-lg p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-[24px] font-bold tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          Privacy settings
        </h2>
      </div>

      <p className="px-1.5 py-3 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
        Control how your data is used. These settings don't affect the core functionality of HridAI — your memory and insights always remain private to you.
      </p>

      <div className="mt-1 px-1.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Data sharing</div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {ITEMS.map((it) => (
          <SettingsRow
            key={it.key}
            label={it.label}
            description={it.description}
            right={<Toggle checked={state[it.key]} onChange={() => flip(it.key)} label={it.label} />}
          />
        ))}
      </div>
    </div>
  )
}
