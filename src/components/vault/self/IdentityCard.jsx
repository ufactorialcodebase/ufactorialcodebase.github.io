// src/components/vault/self/IdentityCard.jsx
export default function IdentityCard({ info }) {
  const name = info?.name || 'Unknown'
  const initial = name.charAt(0).toUpperCase()
  const location = info?.location || info?.lives_in
  const occupation = info?.occupation
  const timezone = info?.timezone

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-5 mb-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-indigo)] to-[var(--accent-rose)] flex items-center justify-center text-white text-lg font-semibold">
          {initial}
        </div>
        <div>
          <div className="text-[var(--text-primary)] text-base font-semibold">{name}</div>
          {location && <div className="text-[var(--text-secondary)] text-xs">{location}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {occupation && (
          <div className="p-2.5 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide">Occupation</div>
            <div className="text-[var(--text-primary)] text-sm mt-0.5">{occupation}</div>
          </div>
        )}
        {timezone && (
          <div className="p-2.5 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wide">Timezone</div>
            <div className="text-[var(--text-primary)] text-sm mt-0.5">{timezone}</div>
          </div>
        )}
      </div>
    </div>
  )
}
