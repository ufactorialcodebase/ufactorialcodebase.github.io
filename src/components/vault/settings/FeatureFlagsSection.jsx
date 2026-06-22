// src/components/vault/settings/FeatureFlagsSection.jsx
import { useFeatureFlag, setFeatureFlag } from '../../../hooks/useFeatureFlag'

export default function FeatureFlagsSection() {
  const enabled = useFeatureFlag('vault_redesign')

  const onToggle = () => setFeatureFlag('vault_redesign', !enabled)

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Experiments</h2>
      <p className="text-sm text-[var(--text-tertiary)]">
        Try in-progress features early. Toggle off anytime to return to the current Vault.
      </p>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
        <button
          role="switch"
          type="button"
          aria-checked={enabled}
          aria-label="Try the new Vault (beta)"
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            enabled ? 'bg-[var(--accent-indigo)]' : 'bg-[var(--border-active)]'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">Try the new Vault (beta)</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
            A calmer redesign with a warm palette and a refreshed context panel. Your data is unchanged.
          </div>
        </div>
      </div>
    </div>
  )
}
