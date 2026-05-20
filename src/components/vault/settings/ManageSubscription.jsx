// src/components/vault/settings/ManageSubscription.jsx
import { ArrowLeft } from 'lucide-react'
import SettingsRow from './SettingsRow'

export default function ManageSubscription({ s, onBack }) {
  return (
    <div>
      <div className="flex items-center gap-3 px-1 pb-1 pt-3.5">
        <button onClick={onBack} aria-label="Back" className="rounded-lg p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-[24px] font-bold tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          Manage subscription
        </h2>
      </div>

      <div className="mt-3.5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <SettingsRow
          label="Current plan"
          right={<span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Closed beta</span>}
        />
        <SettingsRow label="What you get" description="Free full access to all HridAI features until Beta launch." />
      </div>

      {/* Wired but disabled until launch — see docs/project/launch_checklist.md */}
      <button
        onClick={s.handleUpgrade}
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-2xl bg-slate-200 py-3.5 text-[15px] font-bold text-slate-400 dark:bg-slate-700 dark:text-slate-500"
      >
        Upgrade to Premium
      </button>
      <div className="mt-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500">
        Premium unlocks at launch — you'll keep beta access until then.
      </div>
    </div>
  )
}
