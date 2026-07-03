import { Clock } from 'lucide-react'
import { useCaseStore } from '../store/caseStore'

/** Délai estimé d'acheminement : allonge visuellement la timeline. */
export function DelaiEstimeTab() {
  const delai = useCaseStore((s) => s.caseState.header.delaiEstimeMin)
  const setHeader = useCaseStore((s) => s.setHeader)

  return (
    <label className="flex min-w-[150px] flex-col gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
        <Clock size={12} /> Délai estimé
      </span>
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          min={0}
          value={delai ?? ''}
          placeholder="—"
          onChange={(e) =>
            setHeader({ delaiEstimeMin: e.target.value === '' ? undefined : Number(e.target.value) })
          }
          className="w-16 border-b border-rose-300 bg-transparent text-lg font-bold tabular-nums text-rose-900 focus:outline-none"
        />
        <span className="text-xs text-rose-700">min → allonge la timeline</span>
      </div>
    </label>
  )
}
