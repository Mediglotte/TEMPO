import type { ActionValue, CaseState } from '../types/model'

/**
 * Scénario de démonstration : un polytraumatisé instable, grade A.
 * Déroule l'enchaînement des déclencheurs (FAST+/instable → BLOC, ABC ≥ 2 →
 * transfusion massive, grade A → Niveau I, pré-alerte → activation équipe...).
 * À ouvrir tel quel pour un pitch, ou à partager via le lien.
 */
type Step = [actionId: string, value: ActionValue, offsetMin: number]

const STEPS: Step[] = [
  ['regul.appel.vittel::cin-ejection', true, 0],
  ['regul.appel.vittel::phys-pas', true, 0],
  ['regul.appel.vittel::cin-projete', true, 1],
  ['regul.moyens.vsav', true, 2],
  ['regul.moyens.smur', true, 3],
  ['prehosp.a.lvas', true, 5],
  ['prehosp.b.spo2', 90, 6],
  ['prehosp.c.pas', 82, 6],
  ['prehosp.c.fc', 128, 6],
  ['prehosp.d.gcs', 12, 7],
  ['prehosp.g.vvp', true, 7],
  ['prehosp.g.garrot', true, 7],
  ['prehosp.scores.abc::penetrant', true, 8],
  ['prehosp.scores.abc::fast', true, 8],
  ['prehosp.scores.abc::pas90', true, 8],
  ['prehosp.scores.abc::fc120', true, 8],
  ['prehosp.scores.batt::pas100', true, 8],
  ['prehosp.scores.batt::gcs12', true, 8],
  ['prehosp.scores.batt::fc100', true, 8],
  ['prehosp.scores.batt::penetrant', true, 8],
  ['prehosp.scores.batt::cinetique', true, 8],
  ['prehosp.scores.hemodynamique', 'instable', 9],
  ['prehosp.scores.grade', 'A', 10],
  ['prehosp.g.txa', true, 10],
  ['prehosp.transmission.bilan', true, 11],
  ['regul.orientation.destination', 'niveau1', 12],
  ['regul.prealerte.centre', true, 12],
  ['regul.tc.niveau1', true, 12],
  ['regul.prealerte.rea', true, 13],
  ['intra.activation.equipe', true, 14],
  ['intra.imagerie.efast', true, 16],
  ['intra.imagerie.bio', true, 16],
  ['intra.transfusion.ptm', true, 18],
  ['intra.bloc.damagecontrol', true, 20],
]

export function buildDemoCase(now: number): CaseState {
  const values: CaseState['values'] = {}
  for (const [id, value, offsetMin] of STEPS) {
    values[id] = { value, completedAt: now + offsetMin * 60_000 }
  }
  return {
    protocolId: 'polytrauma',
    header: {
      smurName: 'SMUR Beaujon',
      regulateurName: 'Dr R. — SAMU 92',
      serviceReceveur: 'Déchocage CHU (Niveau I)',
      delaiEstimeMin: 18,
      caseStartedAt: now,
    },
    values,
  }
}
