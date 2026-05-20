// src/components/vault/settings/SettingsRow.jsx
import { ChevronRight } from 'lucide-react'

export default function SettingsRow({
  label, value, description, right, onClick, href, chevron = false, danger = false,
}) {
  const stacked = Boolean(description)
  const base =
    'relative flex w-full gap-3 px-4 text-left ' +
    (stacked ? 'items-start py-3.5 ' : 'items-center justify-between min-h-[54px] ') +
    'after:absolute after:left-4 after:right-4 after:bottom-0 after:h-px after:bg-slate-200 dark:after:bg-slate-700 last:after:hidden ' +
    (onClick || href ? 'transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 ' : '')
  const labelCls = `text-[15px] font-medium ${danger ? 'text-rose-500 dark:text-rose-300' : 'text-slate-900 dark:text-slate-100'}`

  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className={labelCls}>{label}</div>
        {description && (
          <div className="mt-1 max-w-[230px] text-[12.5px] leading-snug text-slate-500 dark:text-slate-400">
            {description}
          </div>
        )}
      </div>
      <div className="flex flex-none items-center gap-2">
        {value && <span className="max-w-[185px] truncate text-[14px] text-slate-500 dark:text-slate-400">{value}</span>}
        {right}
        {chevron && <ChevronRight className="h-[18px] w-[18px] text-slate-400 dark:text-slate-500" />}
      </div>
    </>
  )

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={base}>{inner}</a>
  }
  if (onClick) {
    return <button type="button" onClick={onClick} className={base}>{inner}</button>
  }
  return <div className={base}>{inner}</div>
}
