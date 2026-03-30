// src/components/vault/PageHeader.jsx
export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">{subtitle}</p>
      )}
    </div>
  )
}
