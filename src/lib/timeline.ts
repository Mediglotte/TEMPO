import type { ActionDef, CaseState, Protocol } from '../types/model'

/** Géométrie commune aux 3 pistes : un SEUL repère temporel partagé. */
export const PX_PER_MIN = 22
export const LEFT_COL_W = 212 // largeur de la colonne d'étiquettes (sticky)
export const LEFT_COL_W_COMPACT = 52 // rail d'icônes (colonne réduite)
export const PILL_W = 196
export const PILL_H = 44
export const ROW_GAP = 8
export const STRIP_PAD_Y = 10
export const END_MARGIN_MIN = 4

// Mode réduit (mini-icônes)
export const MINI_SIZE = 30
export const MINI_GAP = 6
export const MINI_PAD_Y = 8

/** Minute (depuis t0) à laquelle positionner une action. */
export function minutesOfAction(action: ActionDef, caseState: CaseState): number {
  const entry = caseState.values[action.id]
  if (entry?.completedAt != null) {
    return Math.max(0, (entry.completedAt - caseState.header.caseStartedAt) / 60_000)
  }
  return action.defaultTimeOffsetMin ?? 0
}

/** Durée totale affichée : englobe toutes les actions horodatées. */
export function computeTotalMinutes(protocol: Protocol, caseState: CaseState): number {
  let max = 0
  for (const action of protocol.actions) {
    max = Math.max(max, minutesOfAction(action, caseState))
  }
  return Math.ceil(max) + END_MARGIN_MIN
}

export function xOfMinute(min: number): number {
  return min * PX_PER_MIN
}

export function contentWidth(totalMinutes: number): number {
  return xOfMinute(totalMinutes) + PILL_W + 24
}

/** Placement vertical par empilement glouton pour éviter les chevauchements. */
export interface Placement<T> {
  item: T
  x: number
  top: number
}

export interface PackOptions {
  itemWidth?: number
  itemHeight?: number
  rowGap?: number
  padY?: number
}

export function packStrip<T>(
  entries: { item: T; min: number }[],
  options: PackOptions = {},
): { placements: Placement<T>[]; height: number } {
  const itemWidth = options.itemWidth ?? PILL_W
  const itemHeight = options.itemHeight ?? PILL_H
  const rowGap = options.rowGap ?? ROW_GAP
  const padY = options.padY ?? STRIP_PAD_Y

  const sorted = [...entries].sort((a, b) => a.min - b.min)
  const rowEnds: number[] = [] // x de fin (droite) du dernier élément de chaque rangée
  const placements: Placement<T>[] = []

  for (const { item, min } of sorted) {
    const x = xOfMinute(min)
    let row = rowEnds.findIndex((end) => x >= end + rowGap)
    if (row === -1) {
      row = rowEnds.length
      rowEnds.push(0)
    }
    rowEnds[row] = x + itemWidth
    placements.push({ item, x, top: padY + row * (itemHeight + rowGap) })
  }

  const rows = Math.max(1, rowEnds.length)
  const height = padY * 2 + rows * itemHeight + (rows - 1) * rowGap
  return { placements, height }
}

export function formatClock(epochMs: number): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(epochMs),
  )
}
