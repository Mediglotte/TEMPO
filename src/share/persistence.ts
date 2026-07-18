import type { CaseState } from '../types/model'

const STORAGE_KEY = 'balaz.case.v1'
/** Filet de sécurité : l'ancien cas est mis de côté quand un AUTRE cas l'écrase
 *  (ex. ouverture du lien partagé d'un collègue) — une seule clé sinon. */
const BACKUP_KEY = 'balaz.case.backup'

export function saveCase(caseState: CaseState): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const prev = JSON.parse(raw) as CaseState
        if (prev?.header?.caseStartedAt !== caseState.header.caseStartedAt) {
          localStorage.setItem(BACKUP_KEY, raw)
        }
      } catch {
        /* ancien contenu illisible : rien à sauvegarder */
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(caseState))
  } catch {
    /* quota / mode privé : on ignore silencieusement (prototype) */
  }
}

export function loadCase(): CaseState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CaseState
    if (!parsed?.values || !parsed?.header) return null
    // Garde de schéma : sans caseStartedAt numérique, tout le calcul de
    // timeline (chrono, positions, PDF) part en NaN.
    if (typeof parsed.header.caseStartedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function clearCase(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
