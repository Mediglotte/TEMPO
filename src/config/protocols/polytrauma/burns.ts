/**
 * Règle de Wallace (« règle des 9 ») — estimation de la surface cutanée brûlée (SCB)
 * chez l'adulte. Chaque zone cliquable vaut un pourcentage ; la somme des zones
 * sélectionnées donne la SCB totale (%).
 *
 * ⚠️ Adulte uniquement. Chez l'enfant, les proportions diffèrent (tête plus grande,
 * membres inférieurs plus petits) — table de Lund-Browder à privilégier. À valider.
 */

import type { SubField } from '../../../types/model'

/** Id de l'action calculée « SCB (Wallace) » — les zones sont stockées sous `${id}::<zoneId>`. */
export const WALLACE_ACTION_ID = 'prehosp.brulures.wallace'

export type BurnShape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx?: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }

export interface BurnZone {
  id: string
  label: string
  /** Pourcentage de surface corporelle (règle de Wallace, adulte). */
  pct: number
  side: 'front' | 'back'
  shape: BurnShape
}

/**
 * Géométrie schématique (deux silhouettes : face à gauche, dos à droite) dans un
 * viewBox 0 0 262 244. Volontairement simple et lisible plutôt qu'anatomique.
 * Total = 100 % (face 50,5 % + dos 49,5 %).
 */
export const WALLACE_ZONES: BurnZone[] = [
  // ---- Face (front) ----
  { id: 'f-head', label: 'Tête / cou (face)', pct: 4.5, side: 'front', shape: { kind: 'circle', cx: 60, cy: 26, r: 20 } },
  { id: 'f-arm-r', label: 'Membre sup. droit (face)', pct: 4.5, side: 'front', shape: { kind: 'rect', x: 8, y: 52, w: 22, h: 66, rx: 9 } },
  { id: 'f-arm-l', label: 'Membre sup. gauche (face)', pct: 4.5, side: 'front', shape: { kind: 'rect', x: 90, y: 52, w: 22, h: 66, rx: 9 } },
  { id: 'f-chest', label: 'Thorax (face)', pct: 9, side: 'front', shape: { kind: 'rect', x: 38, y: 50, w: 44, h: 34, rx: 4 } },
  { id: 'f-abdo', label: 'Abdomen (face)', pct: 9, side: 'front', shape: { kind: 'rect', x: 38, y: 86, w: 44, h: 34, rx: 4 } },
  { id: 'genit', label: 'Périnée / OGE', pct: 1, side: 'front', shape: { kind: 'rect', x: 54, y: 122, w: 12, h: 12, rx: 3 } },
  { id: 'f-leg-r', label: 'Membre inf. droit (face)', pct: 9, side: 'front', shape: { kind: 'rect', x: 38, y: 136, w: 20, h: 88, rx: 9 } },
  { id: 'f-leg-l', label: 'Membre inf. gauche (face)', pct: 9, side: 'front', shape: { kind: 'rect', x: 62, y: 136, w: 20, h: 88, rx: 9 } },
  // ---- Dos (back) ----
  { id: 'b-head', label: 'Tête / cou (dos)', pct: 4.5, side: 'back', shape: { kind: 'circle', cx: 200, cy: 26, r: 20 } },
  { id: 'b-arm-r', label: 'Membre sup. droit (dos)', pct: 4.5, side: 'back', shape: { kind: 'rect', x: 148, y: 52, w: 22, h: 66, rx: 9 } },
  { id: 'b-arm-l', label: 'Membre sup. gauche (dos)', pct: 4.5, side: 'back', shape: { kind: 'rect', x: 230, y: 52, w: 22, h: 66, rx: 9 } },
  { id: 'b-upper', label: 'Dos (haut)', pct: 9, side: 'back', shape: { kind: 'rect', x: 178, y: 50, w: 44, h: 34, rx: 4 } },
  { id: 'b-lower', label: 'Dos (bas) / fesses', pct: 9, side: 'back', shape: { kind: 'rect', x: 178, y: 86, w: 44, h: 34, rx: 4 } },
  { id: 'b-leg-r', label: 'Membre inf. droit (dos)', pct: 9, side: 'back', shape: { kind: 'rect', x: 178, y: 136, w: 20, h: 88, rx: 9 } },
  { id: 'b-leg-l', label: 'Membre inf. gauche (dos)', pct: 9, side: 'back', shape: { kind: 'rect', x: 202, y: 136, w: 20, h: 88, rx: 9 } },
]

/** Clés d'entrée (values) pour l'action calculée « SCB (Wallace) ». */
export const WALLACE_INPUT_IDS = WALLACE_ZONES.map((z) => `${WALLACE_ACTION_ID}::${z.id}`)

/** Poids (%) par input pour le score calculé pondéré. */
export const WALLACE_WEIGHTS: Record<string, number> = Object.fromEntries(
  WALLACE_ZONES.map((z) => [`${WALLACE_ACTION_ID}::${z.id}`, z.pct]),
)

/** Sous-champs déclarés (repli/accessibilité) — le rendu réel est le schéma corporel. */
export const WALLACE_SUBFIELDS: SubField[] = WALLACE_ZONES.map((z) => ({
  id: z.id,
  type: 'checkbox',
  label: `${z.label} — ${z.pct} %`,
  group: z.side === 'front' ? 'Face' : 'Dos',
}))

export const WALLACE_REMINDER = `Règle de Wallace (« règle des 9 ») — surface cutanée brûlée (SCB) chez l'adulte.
Tête/cou 9 % · chaque membre supérieur 9 % · face antérieure du tronc 18 % · face postérieure du tronc 18 % · chaque membre inférieur 18 % · périnée 1 %.
Cliquer les zones brûlées (face + dos) ; la somme donne la SCB totale. Ne comptez que les brûlures du 2ᵉ/3ᵉ degré.
Repère : la paume de la main du patient (doigts inclus) ≈ 1 %.
⚠️ Adulte. Chez l'enfant, utiliser la table de Lund-Browder (tête proportionnellement plus grande). À valider par le médecin référent.`

export const BURN_FLUID_REMINDER = `Remplissage du brûlé grave (SCB > 20 %) — protocole préhospitalier local ici retenu : 20 ml/kg de cristalloïdes (Ringer lactate) sur la 1ʳᵉ heure.
À relayer en intra-hospitalier par une réanimation guidée sur une formule (ex. Parkland : 4 ml/kg/% SCB sur 24 h, moitié sur les 8 premières heures) et titrée sur la diurèse.
⚠️ Volumes et schéma à valider par le médecin référent selon le protocole local.`
