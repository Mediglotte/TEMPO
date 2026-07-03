import { useEffect } from 'react'
import { Pause, Play, RotateCcw, X } from 'lucide-react'
import { GUIDED_BASE_MS, guidedSteps } from '../config/guidedScenario'
import { useCaseStore } from '../store/caseStore'
import { usePlayerStore } from '../store/playerStore'

const SPEEDS = [0.5, 1, 2]

export function GuidedPlayer() {
  const status = usePlayerStore((s) => s.status)
  const index = usePlayerStore((s) => s.index)
  const speed = usePlayerStore((s) => s.speed)
  const stepCount = usePlayerStore((s) => s.stepCount)
  const play = usePlayerStore((s) => s.play)
  const pause = usePlayerStore((s) => s.pause)
  const restart = usePlayerStore((s) => s.restart)
  const exit = usePlayerStore((s) => s.exit)
  const setSpeed = usePlayerStore((s) => s.setSpeed)
  const setIndex = usePlayerStore((s) => s.setIndex)
  const finish = usePlayerStore((s) => s.finish)
  const setActive = usePlayerStore((s) => s.setActive)
  const setValueAt = useCaseStore((s) => s.setValueAt)

  // Moteur de lecture : applique l'étape courante, met en évidence l'action,
  // fait défiler jusqu'à elle, puis programme l'étape suivante.
  useEffect(() => {
    if (status !== 'playing') return
    if (index >= guidedSteps.length) {
      finish()
      return
    }
    const step = guidedSteps[index]
    const startedAt = useCaseStore.getState().caseState.header.caseStartedAt
    setValueAt(step.actionId, step.value, startedAt + step.offsetMin * 60_000)
    setActive(step.actionId)
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-action-id="${step.actionId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    })
    const timer = setTimeout(() => setIndex(index + 1), GUIDED_BASE_MS / speed)
    return () => clearTimeout(timer)
  }, [status, index, speed, setValueAt, setActive, setIndex, finish])

  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={play}
        className="group flex w-full items-center gap-4 rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-left text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20 ring-2 ring-white/40 transition group-hover:scale-105">
          <Play size={24} className="ml-1 fill-white" />
        </span>
        <span className="flex flex-col">
          <span className="text-base font-bold sm:text-lg">Démo guidée — déroulé automatique commenté</span>
          <span className="text-sm text-indigo-100">
            On « voit » chaque action se cocher pas à pas et les alertes se déclencher en direct (≈ 35 s).
          </span>
        </span>
        <span className="ml-auto hidden shrink-0 rounded-lg bg-white/15 px-4 py-2 text-sm font-bold ring-1 ring-white/30 sm:block">
          Lancer ▶
        </span>
      </button>
    )
  }

  const playing = status === 'playing'
  const finished = status === 'finished'
  const current = guidedSteps[Math.min(index, guidedSteps.length - 1)]
  const shown = Math.min(index + (finished ? 0 : 1), stepCount)
  const pct = Math.round((Math.min(index, stepCount) / stepCount) * 100)

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {finished ? (
          <button
            type="button"
            onClick={restart}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RotateCcw size={15} /> Rejouer
          </button>
        ) : (
          <button
            type="button"
            onClick={playing ? pause : play}
            className="flex w-28 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? 'Pause' : 'Reprendre'}
          </button>
        )}

        <button
          type="button"
          onClick={restart}
          title="Recommencer depuis le début"
          className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-2.5 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        >
          <RotateCcw size={15} />
        </button>

        <div className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-white p-0.5 text-xs">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`rounded px-1.5 py-0.5 font-semibold ${
                speed === s ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold tabular-nums text-indigo-700">
          {finished ? `Terminé · ${stepCount}/${stepCount}` : `Étape ${shown}/${stepCount}`}
        </span>

        <button
          type="button"
          onClick={exit}
          title="Quitter la démo guidée"
          className="ml-auto rounded-md p-1 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
        <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      <p className="mt-2 text-sm leading-snug text-indigo-900">
        {finished ? 'Démonstration terminée — parcours complet visualisé sur les 3 pistes.' : current.narration}
      </p>
    </div>
  )
}
