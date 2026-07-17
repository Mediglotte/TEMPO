import type { MilestoneDef } from '../../../types/model'

/**
 * Jalons temporels de la filière (CONTENU clinique — comme le reste de la
 * config, seuils à valider par le médecin référent). La minute 60 porte la
 * « golden hour » : badge clignotant près du chrono + bip au franchissement.
 */
export const milestones: MilestoneDef[] = [
  { id: 'jalon-30', atMin: 30, label: '30 min' },
  { id: 'golden-hour', atMin: 60, label: '60 min', badge: 'Golden hour', chime: true },
]
