import type { ActionValue } from '../types/model'

/**
 * Scénario GUIDÉ (pas à pas) : rejoué automatiquement, une action après l'autre,
 * pour « voir » chaque clic et la cascade d'effets qu'il déclenche sur les autres pistes.
 *
 * L'ordre du tableau = ordre de lecture (narration) ; `offsetMin` = position sur la timeline.
 */
export interface GuidedStep {
  actionId: string
  value: ActionValue
  offsetMin: number
  narration: string
}

/** Durée d'une étape à vitesse 1× (ms). */
export const GUIDED_BASE_MS = 1700

export const guidedSteps: GuidedStep[] = [
  {
    actionId: 'regul.appel.vittel::cin-ejection',
    value: true,
    offsetMin: 0,
    narration: 'Régulation — critère de Vittel (cinétique : éjection du véhicule) : traumatisé sévère suspecté. Le SMUR va être invité à attribuer un grade.',
  },
  {
    actionId: 'regul.appel.vittel::cin-projete',
    value: true,
    offsetMin: 1,
    narration: 'Régulation — autre critère de cinétique coché (victime projetée/écrasée).',
  },
  {
    actionId: 'regul.moyens.vsav',
    value: true,
    offsetMin: 2,
    narration: 'Régulation — engagement du VSAV (sapeurs-pompiers).',
  },
  {
    actionId: 'regul.moyens.smur',
    value: true,
    offsetMin: 3,
    narration: 'Régulation — engagement du SMUR (équipe médicalisée).',
  },
  {
    actionId: 'prehosp.a.lvas',
    value: true,
    offsetMin: 5,
    narration: 'SMUR sur les lieux — A : libération des voies aériennes + immobilisation cervicale.',
  },
  {
    actionId: 'prehosp.c.pas',
    value: 82,
    offsetMin: 6,
    narration: 'SMUR — C : pression artérielle basse (PAS 82 mmHg).',
  },
  {
    actionId: 'prehosp.c.fc',
    value: 128,
    offsetMin: 6,
    narration: 'SMUR — C : tachycardie (FC 128/min).',
  },
  {
    actionId: 'prehosp.g.garrot',
    value: true,
    offsetMin: 7,
    narration: 'SMUR — contrôle d’une hémorragie externe (garrot).',
  },
  {
    actionId: 'prehosp.scores.abc::fast',
    value: true,
    offsetMin: 8,
    narration: 'SMUR — e-FAST POSITIF coché…',
  },
  {
    actionId: 'prehosp.scores.hemodynamique',
    value: 'instable',
    offsetMin: 9,
    narration: '…et patient INSTABLE → 💥 l’onglet BLOC se met à clignoter sur la régulation ET l’intra-hospitalier.',
  },
  {
    actionId: 'prehosp.scores.abc::penetrant',
    value: true,
    offsetMin: 8,
    narration: 'SMUR — item ABC : mécanisme pénétrant.',
  },
  {
    actionId: 'prehosp.scores.abc::pas90',
    value: true,
    offsetMin: 8,
    narration: 'SMUR — item ABC : PAS ≤ 90 mmHg.',
  },
  {
    actionId: 'prehosp.scores.abc::fc120',
    value: true,
    offsetMin: 8,
    narration: 'SMUR — item ABC : FC ≥ 120 → score ABC = 4 → 💥 l’onglet Transfusion massive clignote sur l’intra-hospitalier.',
  },
  {
    actionId: 'prehosp.g.txa',
    value: true,
    offsetMin: 10,
    narration: 'SMUR — acide tranexamique administré (risque hémorragique, < 3 h).',
  },
  {
    actionId: 'prehosp.scores.grade',
    value: 'A',
    offsetMin: 10,
    narration: 'SMUR — attribution du GRADE A → 💥 le Niveau I (CHU) s’allume sur la régulation et la pré-alerte se débloque.',
  },
  {
    actionId: 'regul.prealerte.centre',
    value: true,
    offsetMin: 12,
    narration: 'Régulation — pré-alerte du centre receveur → 💥 l’activation de l’équipe trauma se débloque à l’intra-hospitalier.',
  },
  {
    actionId: 'regul.tc.niveau1',
    value: true,
    offsetMin: 12,
    narration: 'Régulation — orientation validée vers le Niveau I.',
  },
  {
    actionId: 'intra.activation.equipe',
    value: true,
    offsetMin: 14,
    narration: 'Intra-hospitalier — équipe trauma activée avant l’arrivée du patient.',
  },
  {
    actionId: 'intra.imagerie.efast',
    value: true,
    offsetMin: 16,
    narration: 'Déchocage — e-FAST de contrôle à l’arrivée.',
  },
  {
    actionId: 'intra.transfusion.ptm',
    value: true,
    offsetMin: 16,
    narration: 'Déchocage — protocole de transfusion massive lancé (ratio ≈ 1:1:1).',
  },
  {
    actionId: 'intra.bloc.damagecontrol',
    value: true,
    offsetMin: 20,
    narration: 'Bloc — laparotomie d’hémostase / damage control. Parcours complet visualisé sur les 3 pistes.',
  },
]
