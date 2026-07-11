// src/components/vault/artifacts/ArtifactsTab.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
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
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => { if (artifactData) setArtifacts(artifactData) }, [artifactData])

  // Deep-link from chat.
  //   ?open=<id>          → opens the SidePanel by artifact_id (preferred;
  //                          requires backend to surface artifact_id in the
  //                          tool_complete SSE payload — see ISS-231)
  //   ?openTitle=<title>  → opens the FIRST matching artifact by title
  //                          (fallback that works today because create_artifact
  //                          tool_start already carries input.title)
  useEffect(() => {
    if (loading) return
    const openId = searchParams.get('open')
    const openTitle = searchParams.get('openTitle')
    if (!openId && !openTitle) return

    if (openId) {
      if (selectedArtifact?.id === openId) return
      const inList = artifacts.find((a) => a.id === openId)
      if (inList) {
        setSelectedArtifact(inList)
        if (!inList.content) {
          setLoadingFull(true)
          getArtifact(openId)
            .then((full) => setSelectedArtifact(full))
            .catch(() => { /* keep partial */ })
            .finally(() => setLoadingFull(false))
        }
      } else {
        setLoadingFull(true)
        getArtifact(openId)
          .then((full) => setSelectedArtifact(full))
          .catch(() => toast.error('Could not open that artifact'))
          .finally(() => setLoadingFull(false))
      }
      return
    }

    // openTitle path — case-insensitive first-match. If the artifact was
    // just created, it should be at the top of the list by updated_at desc.
    const wanted = openTitle.trim().toLowerCase()
    const match = artifacts.find((a) => (a.title || '').trim().toLowerCase() === wanted)
    if (!match) return
    if (selectedArtifact?.id === match.id) return
    setSelectedArtifact(match)
    if (!match.content) {
      setLoadingFull(true)
      getArtifact(match.id)
        .then((full) => setSelectedArtifact(full))
        .catch(() => { /* keep partial */ })
        .finally(() => setLoadingFull(false))
    }
  }, [searchParams, loading, artifacts])

  const closeSelected = () => {
    setSelectedArtifact(null)
    // Clear the ?open=/?openTitle= param so a subsequent click on another
    // artifact isn't clobbered by the useEffect re-opening the linked one.
    if (searchParams.get('open') || searchParams.get('openTitle')) {
      const next = new URLSearchParams(searchParams)
      next.delete('open')
      next.delete('openTitle')
      setSearchParams(next, { replace: true })
    }
  }

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
      toast.error('Failed to delete: ' + err.message)
    }
  }

  const handleUpdate = (updatedArtifact) => {
    setArtifacts((prev) => {
      const next = prev.map((a) => (a.id === updatedArtifact.id ? { ...a, ...updatedArtifact } : a))
      setCached('artifacts', next)
      return next
    })
    setSelectedArtifact((current) =>
      current?.id === updatedArtifact.id ? { ...current, ...updatedArtifact } : current
    )
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
        onClose={closeSelected}
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
                onUpdate={handleUpdate}
              />
            )
        )}
      </SidePanel>
    </div>
  )
}
