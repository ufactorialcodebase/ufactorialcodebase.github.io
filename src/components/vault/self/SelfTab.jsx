// src/components/vault/self/SelfTab.jsx
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import IdentityCard from './IdentityCard'
import ProfileSection from './ProfileSection'
import GoalItem from './GoalItem'
import PreferenceItem from './PreferenceItem'
import { getSelf, updateSelf } from '../../../lib/api/vault-self'

export default function SelfTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wellnessVisible, setWellnessVisible] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  // TODO: Replace with real tier check once GET /api/vault/stats returns tier
  const readOnly = false

  useEffect(() => {
    let cancelled = false
    async function fetchSelf() {
      try {
        const result = await getSelf()
        if (!cancelled) { setData(result); setLoading(false) }
      } catch (err) {
        if (!cancelled) { setError(err.message); setLoading(false) }
      }
    }
    fetchSelf()
    return () => { cancelled = true }
  }, [retryCount])

  const handleUpdate = async (aspect, updatedItems) => {
    try {
      await updateSelf(aspect, updatedItems)
      setData((prev) => ({ ...prev, [aspect]: updatedItems }))
    } catch (err) {
      alert('Failed to save: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Self" subtitle="Everything HridAI knows about you" />
        <div className="animate-pulse space-y-3">
          <div className="h-28 bg-[var(--bg-secondary)] rounded-xl" />
          <div className="h-14 bg-[var(--bg-secondary)] rounded-xl" />
          <div className="h-14 bg-[var(--bg-secondary)] rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Self" subtitle="Everything HridAI knows about you" />
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => { setLoading(true); setError(null); setRetryCount(c => c + 1) }}
            className="mt-3 text-[var(--accent-indigo)] text-sm hover:underline">Retry</button>
        </div>
      </div>
    )
  }

  const info = data?.info || {}
  const goals = data?.goals || []
  const preferences = data?.preferences || []
  const hobbies = data?.hobbies || []
  const wellness = data?.wellness || []
  const hasInfo = info && (info.name || info.location || info.occupation)
  const isEmpty = !data || (!hasInfo && goals.length === 0 && preferences.length === 0 && hobbies.length === 0)

  if (isEmpty) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Self" subtitle="Everything HridAI knows about you" />
        <EmptyState icon="👤"
          message="Start chatting with HridAI to build your profile. I'll learn about you through conversation — or you can add details here directly."
          ctaLabel="Go to Chat" ctaPath="/vault/chat" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <PageHeader title="Your Self" subtitle="Everything HridAI knows about you" />
      <IdentityCard info={info} />

      {goals.length > 0 && (
        <ProfileSection title="Goals & Aspirations" color="var(--accent-amber)" count={goals.length} defaultOpen>
          {goals.map((goal, i) => (
            <GoalItem key={goal.id || i} goal={goal} readOnly={readOnly}
              onUpdate={(updated) => {
                const next = goals.map((g, j) => j === i ? updated : g)
                handleUpdate('goals', next)
              }}
              onDelete={() => {
                const next = goals.filter((_, j) => j !== i)
                handleUpdate('goals', next)
              }} />
          ))}
        </ProfileSection>
      )}

      {preferences.length > 0 && (
        <ProfileSection title="Preferences" color="var(--accent-rose)" count={preferences.length}>
          {preferences.map((pref, i) => (
            <PreferenceItem key={pref.id || i} preference={pref} readOnly={readOnly}
              onUpdate={(updated) => {
                const next = preferences.map((p, j) => j === i ? updated : p)
                handleUpdate('preferences', next)
              }}
              onDelete={() => {
                const next = preferences.filter((_, j) => j !== i)
                handleUpdate('preferences', next)
              }} />
          ))}
        </ProfileSection>
      )}

      {hobbies.length > 0 && (
        <ProfileSection title="Hobbies & Interests" color="var(--accent-teal)" count={hobbies.length}>
          <div className="flex flex-wrap gap-2">
            {hobbies.map((hobby, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                {hobby.value || hobby.name || hobby}
              </span>
            ))}
          </div>
        </ProfileSection>
      )}

      {wellness.length > 0 && (
        <ProfileSection title="Wellness" color="var(--accent-violet)" count={wellness.length} badge="Private">
          <div className="mb-2">
            <button
              onClick={() => setWellnessVisible(!wellnessVisible)}
              className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {wellnessVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              {wellnessVisible ? 'Hide' : 'Show wellness data'}
            </button>
          </div>
          {wellnessVisible && wellness.map((item, i) => (
            <div key={i} className="p-3 bg-[var(--bg-tertiary)] rounded-lg mb-2">
              <span className="text-[var(--text-primary)] text-sm">{item.value || item.name || item}</span>
            </div>
          ))}
        </ProfileSection>
      )}
    </div>
  )
}
