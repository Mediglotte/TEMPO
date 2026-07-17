import type { MilestoneDef } from '../types/model'

/**
 * Suivi pur du franchissement des jalons sonores (testable sans DOM).
 * Un jalon ne sonne que si son approche a été OBSERVÉE en direct (armé quand
 * elapsed < atMin) : rouvrir un cas déjà au-delà du jalon ne déclenche rien.
 */
export interface ChimeTracker {
  armed: Set<string>
  beeped: Set<string>
}

export function createChimeTracker(): ChimeTracker {
  return { armed: new Set(), beeped: new Set() }
}

/** Met à jour le suivi et renvoie les jalons à faire sonner maintenant. */
export function milestonesToChime(
  milestones: readonly MilestoneDef[],
  elapsedMin: number,
  tracker: ChimeTracker,
): MilestoneDef[] {
  const due: MilestoneDef[] = []
  for (const m of milestones) {
    if (!m.chime) continue
    if (elapsedMin < m.atMin) {
      tracker.armed.add(m.id)
    } else if (tracker.armed.has(m.id) && !tracker.beeped.has(m.id)) {
      tracker.beeped.add(m.id)
      due.push(m)
    }
  }
  return due
}

/** Jalons dont le badge doit être affiché (franchis). */
export function passedBadgeMilestones(
  milestones: readonly MilestoneDef[],
  elapsedMs: number,
): MilestoneDef[] {
  return milestones.filter((m) => m.badge && elapsedMs >= m.atMin * 60_000)
}

/** Minute plancher de la timeline pour que tous les jalons restent visibles. */
export function milestonesFloorMin(milestones: readonly MilestoneDef[]): number {
  return milestones.reduce((mx, m) => Math.max(mx, m.atMin), 0)
}
