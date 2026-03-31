// src/components/vault/artifacts/ArtifactsTab.jsx
import { useState, useEffect } from 'react'
import PageHeader from '../PageHeader'
import EmptyState from '../EmptyState'
import SidePanel from '../SidePanel'
import ArtifactCard from './ArtifactCard'
import ArtifactReader from './ArtifactReader'
import { getArtifacts, getArtifact, deleteArtifact } from '../../../lib/api/vault-artifacts'
import { useVaultData, setCached } from '../../../lib/vault-cache'

export default function ArtifactsTab() {
  const { data: artifactData, loading, error, refetch } = useVaultData('artifacts', getArtifacts, {
    transform: (result) => result.artifacts || [],
  })
  const [artifacts, setArtifacts] = useState([])
  const [selectedArtifact, setSelectedArtifact] = useState(null)
  const [loadingFull, setLoadingFull] = useState(false)

  useEffect(() => { if (artifactData) setArtifacts(artifactData) }, [artifactData])

  const handleCardClick = async (artifact) => {
    // Open panel immediately with metadata, then load full content
    setSelectedArtifact(artifact)
    if (!artifact.content) {
      setLoadingFull(true)
      try {
        const full = await getArtifact(artifact.id)
        setSelectedArtifact(full)
      } catch (err) {
        // Keep showing partial data
      } finally {
        setLoadingFull(false)
      }
    }
  }

  const handleDelete = async (artifact) => {
    try {
      await deleteArtifact(artifact.id)
      setArtifacts((prev) => {
        const updated = prev.filter((a) => a.id !== artifact.id)
        setCached('artifacts', updated)
        return updated
      })
      setSelectedArtifact(null)
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Artifacts" subtitle="Documents and structured content" />
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Artifacts" subtitle="Documents and structured content" />
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-[var(--accent-indigo)] text-sm hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (artifacts.length === 0) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader title="Your Artifacts" subtitle="Documents and structured content" />
        <EmptyState
          icon="📄"
          message="No documents yet. Ask HridAI to create an action plan, decision brief, or any structured document."
          ctaLabel="Go to Chat"
          ctaPath="/vault/chat"
        />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <PageHeader title="Your Artifacts" subtitle="Documents and structured content" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            onClick={handleCardClick}
          />
        ))}
      </div>

      <SidePanel
        open={!!selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
        title={selectedArtifact?.title || 'Document'}
      >
        {selectedArtifact && (
          loadingFull
            ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-[var(--bg-tertiary)] rounded w-3/4" />
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/3" />
                <div className="h-48 bg-[var(--bg-tertiary)] rounded" />
              </div>
            )
            : (
              <ArtifactReader
                artifact={selectedArtifact}
                onDelete={handleDelete}
              />
            )
        )}
      </SidePanel>
    </div>
  )
}
