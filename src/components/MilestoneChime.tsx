import { useEffect, useRef } from 'react'
import { activeProtocol } from '../config'
import { useNow } from '../hooks/useNow'
import { createChimeTracker, milestonesToChime } from '../lib/milestones'
import { useCaseStore } from '../store/caseStore'

/** Bip d'une seconde. */
function playBeep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const beep = () => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.value = 0.18
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = ctx.currentTime
      osc.start(t)
      osc.stop(t + 1) // bip d'1 seconde
      osc.onended = () => ctx.close()
    }
    if (ctx.state === 'suspended') ctx.resume().then(beep).catch(() => {})
    else beep()
  } catch {
    /* audio indisponible — sans conséquence */
  }
}

/**
 * Bip d'1 s au franchissement des jalons sonores du protocole (`chime: true`).
 * Le témoin visuel est affiché dans le cadre du chrono (voir Stopwatch).
 * Un cas rouvert déjà au-delà d'un jalon ne sonne pas (voir lib/milestones).
 */
export function MilestoneChime() {
  const startedAt = useCaseStore((s) => s.caseState.header.caseStartedAt)
  const now = useNow(true)
  const trackerRef = useRef(createChimeTracker())

  useEffect(() => {
    trackerRef.current = createChimeTracker()
  }, [startedAt])

  useEffect(() => {
    const elapsedMin = (now - startedAt) / 60_000
    const due = milestonesToChime(activeProtocol.milestones ?? [], elapsedMin, trackerRef.current)
    if (due.length > 0) playBeep()
  }, [now, startedAt])

  return null
}
