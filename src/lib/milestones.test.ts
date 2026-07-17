import { describe, expect, it } from 'vitest'
import type { MilestoneDef } from '../types/model'
import {
  createChimeTracker,
  milestonesFloorMin,
  milestonesToChime,
  passedBadgeMilestones,
} from './milestones'

const MILESTONES: MilestoneDef[] = [
  { id: 'jalon-30', atMin: 30, label: '30 min' },
  { id: 'golden-hour', atMin: 60, label: '60 min', badge: 'Golden hour', chime: true },
]

describe('milestonesToChime', () => {
  it('sonne une seule fois au franchissement observé en direct', () => {
    const tracker = createChimeTracker()
    expect(milestonesToChime(MILESTONES, 59, tracker)).toEqual([]) // armement
    const due = milestonesToChime(MILESTONES, 60, tracker)
    expect(due.map((m) => m.id)).toEqual(['golden-hour'])
    expect(milestonesToChime(MILESTONES, 61, tracker)).toEqual([]) // pas de re-bip
  })

  it('ne sonne pas pour un cas rouvert déjà au-delà du jalon', () => {
    const tracker = createChimeTracker()
    expect(milestonesToChime(MILESTONES, 75, tracker)).toEqual([]) // jamais armé
    expect(milestonesToChime(MILESTONES, 76, tracker)).toEqual([])
  })

  it('re-sonne après réinitialisation du suivi (nouveau cas)', () => {
    let tracker = createChimeTracker()
    milestonesToChime(MILESTONES, 59, tracker)
    expect(milestonesToChime(MILESTONES, 60, tracker)).toHaveLength(1)
    tracker = createChimeTracker() // reset / nouveau caseStartedAt
    milestonesToChime(MILESTONES, 10, tracker)
    expect(milestonesToChime(MILESTONES, 60, tracker)).toHaveLength(1)
  })

  it('ignore les jalons sans chime', () => {
    const tracker = createChimeTracker()
    milestonesToChime(MILESTONES, 29, tracker)
    expect(milestonesToChime(MILESTONES, 30, tracker)).toEqual([]) // jalon-30 : pas de chime
  })
})

describe('passedBadgeMilestones', () => {
  it('affiche le badge uniquement une fois le jalon franchi', () => {
    expect(passedBadgeMilestones(MILESTONES, 59 * 60_000)).toEqual([])
    expect(passedBadgeMilestones(MILESTONES, 60 * 60_000).map((m) => m.id)).toEqual([
      'golden-hour',
    ])
  })

  it('ignore les jalons sans badge', () => {
    expect(passedBadgeMilestones(MILESTONES, 45 * 60_000)).toEqual([]) // 30 min franchi mais sans badge
  })
})

describe('milestonesFloorMin', () => {
  it('renvoie la minute du jalon le plus tardif', () => {
    expect(milestonesFloorMin(MILESTONES)).toBe(60)
    expect(milestonesFloorMin([])).toBe(0)
  })
})
