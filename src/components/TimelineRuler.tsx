import { LEFT_COL_W, contentWidth, xOfMinute } from '../lib/timeline'

interface Props {
  totalMinutes: number
  delaiEstimeMin?: number
}

export function TimelineRuler({ totalMinutes, delaiEstimeMin }: Props) {
  const ticks: number[] = []
  for (let m = 0; m <= totalMinutes; m += 5) ticks.push(m)

  return (
    <div className="flex">
      <div
        className="sticky left-0 z-20 flex shrink-0 items-end justify-end border-r border-slate-200 bg-slate-50 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
        style={{ width: LEFT_COL_W }}
      >
        Temps (min)
      </div>
      <div className="relative h-8 grow" style={{ minWidth: contentWidth(totalMinutes) }}>
        {ticks.map((m) => (
          <div key={m} className="absolute bottom-0 flex flex-col items-center" style={{ left: xOfMinute(m) }}>
            <span className="text-[10px] tabular-nums text-slate-400">{m}</span>
            <span className="h-2 w-px bg-slate-300" />
          </div>
        ))}
        {delaiEstimeMin != null && delaiEstimeMin > 0 && (
          <div
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: xOfMinute(delaiEstimeMin) }}
          >
            <span className="whitespace-nowrap rounded bg-rose-600 px-1 text-[9px] font-semibold text-white">
              arrivée ~{delaiEstimeMin}′
            </span>
            <span className="h-2 w-px bg-rose-500" />
          </div>
        )}
      </div>
    </div>
  )
}
