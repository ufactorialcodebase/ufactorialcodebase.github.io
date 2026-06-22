// src/components/vault/settings/SettingsHome.jsx
import { LogOut } from 'lucide-react'
import SettingsSection from './SettingsSection'
import SettingsRow from './SettingsRow'
import Toggle from './Toggle'

export default function SettingsHome({ s, onNavigate, onBack }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-1 pt-3">
        <h1
          className="text-[30px] font-bold tracking-tight text-slate-900 dark:text-slate-100"
          style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
        >
          Settings
        </h1>
        <button
          onClick={onBack}
          className="text-[13px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Back to chat
        </button>
      </div>

      {/* Profile settings (collapsed) */}
      <SettingsSection className="mt-3.5">
        <button
          type="button"
          onClick={() => onNavigate('edit')}
          className="relative flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
        >
          <div>
            <div className="text-[15px] font-medium text-slate-900 dark:text-slate-100">Account settings</div>
            <div className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Email &amp; password</div>
          </div>
          <span className="text-[14px] font-semibold text-indigo-500">Edit</span>
        </button>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection label="Preferences">
        <SettingsRow label="Dark mode" right={<Toggle checked={s.isDark} onChange={s.toggleTheme} label="Dark mode" />} />
        <SettingsRow label="Language" value="English" />
      </SettingsSection>

      {/* Subscription */}
      <SettingsSection label="Subscription">
        <SettingsRow
          label="Current plan"
          right={<span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Closed beta</span>}
        />
        <SettingsRow label="Manage subscription" chevron onClick={() => onNavigate('subscription')} />
      </SettingsSection>

      {/* Data & Privacy */}
      <SettingsSection label="Data &amp; Privacy">
        <SettingsRow label="Privacy settings" chevron onClick={() => onNavigate('privacy')} />
        <SettingsRow label="Export my data" right={<ComingSoon />} />
        <SettingsRow label="Delete my data" danger right={<ComingSoon />} />
        <SettingsRow label="Delete my account" danger right={<ComingSoon />} />
      </SettingsSection>

      {/* Experiments */}
      <SettingsSection label="Experiments">
        <SettingsRow label="🧪 Experiments" description="Try features in beta" chevron onClick={() => onNavigate('features')} />
      </SettingsSection>

      {/* About */}
      <SettingsSection label="About">
        <SettingsRow label="Version" value="2.0" />
        <SettingsRow label="Terms of Service" chevron href="/terms" />
        <SettingsRow label="Privacy Policy" chevron href="/privacy" />
        <SettingsRow label="Contact" chevron href="/contact" />
      </SettingsSection>

      {/* Footer */}
      <div className="px-2 pb-3 pt-9 text-center">
        <div
          className="text-[20px] font-bold tracking-tight text-slate-500 dark:text-slate-400"
          style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
        >
          <span className="text-slate-900 dark:text-slate-100">Hrid</span>AI
        </div>
        <div className="mt-1.5 text-[12.5px] text-slate-400 dark:text-slate-500">Your personal AI manager</div>
        {(s.message || s.error) && (
          <div className={`mt-4 text-sm ${s.error ? 'text-rose-500' : 'text-emerald-500'}`}>{s.error || s.message}</div>
        )}
        <button
          onClick={s.handleLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/30 py-3.5 text-[15px] font-semibold text-rose-500 transition-colors hover:bg-rose-500/[0.06] dark:text-rose-300"
        >
          <LogOut className="h-[15px] w-[15px]" /> Sign out
        </button>
      </div>
    </div>
  )
}

function ComingSoon() {
  return (
    <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-[3px] text-[10.5px] font-semibold text-teal-600 dark:text-teal-400">
      Coming soon
    </span>
  )
}
