import { useMemo } from 'react'
import { activeProtocol } from '../config'
import { LEFT_COL_W, computeTotalMinutes, contentWidth, xOfMinute } from '../lib/timeline'
import { useCaseStore } from '../store/caseStore'
import { useUiStore } from '../store/uiStore'
import { useDerivedUiState } from '../store/selectors'
import { TimelineRuler } from './TimelineRuler'
import { TrackLane } from './TrackLane'

export function ScoreBoard() {
  const caseState = useCaseStore((s) => s.caseState)
  const derived = useDerivedUiState()
  const activeRole = useUiStore((s) => s.activeRole)
  const roleChosen = useUiStore((s) => s.roleChosen)

  const totalMinutes = useMemo(
    () => computeTotalMinutes(activeProtocol, caseState),
    [caseState],
  )
  const width = LEFT_COL_W + contentWidth(totalMinutes)
  const delai = caseState.header.delaiEstimeMin ?? 0

  return (
    <div className="timeline-scroll overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative w-full" style={{ minWidth: width }}>
        {delai > 0 && (
          <div
            className="pointer-events-none absolute inset-y-0 z-0 w-px bg-rose-300"
            style={{ left: LEFT_COL_W + xOfMinute(delai) }}
          />
        )}
        <TimelineRuler totalMinutes={totalMinutes} delaiEstimeMin={delai} />
        {activeProtocol.tracks.map((track) => (
          <TrackLane
            key={track.id}
            track={track}
            derived={derived}
            totalMinutes={totalMinutes}
            dimmed={roleChosen && activeRole !== 'observer' && activeRole !== track.id}
          />
        ))}
      </div>
    </div>
  )
}
