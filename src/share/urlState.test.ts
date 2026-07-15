import { describe, expect, it } from 'vitest'
import type { CaseState } from '../types/model'
import { decodeCase, encodeCase } from './urlState'

const sample: CaseState = {
  protocolId: 'polytrauma',
  header: { smurName: 'SMUR X', delaiEstimeMin: 18, caseStartedAt: 1_700_000_000_000 },
  values: {
    'prehosp.c.fast': { value: 'positive', completedAt: 1_700_000_060_000 },
    'prehosp.scores.grade': { value: 'A', completedAt: 1_700_000_120_000 },
    'prehosp.b.spo2': { value: 90 },
  },
}

describe('partage par lien', () => {
  it('encode puis décode sans perte', () => {
    const restored = decodeCase(encodeCase(sample))
    expect(restored).toEqual(sample)
  })

  it('renvoie null sur une charge invalide', () => {
    expect(decodeCase('nawak-pas-valide')).toBeNull()
  })
})
