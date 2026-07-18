import type { CaseHeader, CaseState, ValueEntry } from '../types/model'

/**
 * Fusion de deux états d'un même cas, sans perdre les saisies concurrentes.
 * - `values` : fusion champ par champ, la modification la plus RÉCENTE gagne
 *   (updatedAt, avec repli completedAt pour les états sérialisés anciens).
 *   → deux équipes qui remplissent des champs différents ne s'écrasent jamais,
 *   et une décoche (tombstone `value: null`) se propage comme une écriture.
 * - `header` : on complète les champs vides depuis l'autre côté ; en cas de conflit,
 *   on garde la valeur locale (les noms/délais changent rarement).
 *
 * Limite connue (prototype) : le LWW compare des horloges locales non
 * synchronisées entre postes — un poste à l'horloge très décalée peut gagner
 * des conflits à tort (pas d'horodatage serveur).
 */
function stamp(e: ValueEntry | undefined): number {
  return e?.updatedAt ?? e?.completedAt ?? 0
}

function mergeValues(
  local: Record<string, ValueEntry>,
  remote: Record<string, ValueEntry>,
): Record<string, ValueEntry> {
  const out: Record<string, ValueEntry> = { ...local }
  for (const k of Object.keys(remote)) {
    const r = remote[k]
    const l = out[k]
    if (!l || stamp(r) > stamp(l)) out[k] = r
  }
  return out
}

function mergeHeader(local: CaseHeader, remote: CaseHeader): CaseHeader {
  const out = { ...local } as unknown as Record<string, unknown>
  const rem = remote as unknown as Record<string, unknown>
  for (const key of Object.keys(rem)) {
    const rv = rem[key]
    const lv = out[key]
    const localEmpty = lv === undefined || lv === '' || lv === null
    if (rv !== undefined && rv !== '' && localEmpty) out[key] = rv
  }
  return out as unknown as CaseHeader
}

/** Garde structurelle : un état distant malformé ne doit jamais entrer dans la fusion. */
export function isCaseLike(c: unknown): c is CaseState {
  if (!c || typeof c !== 'object') return false
  const o = c as Record<string, unknown>
  return (
    typeof o.header === 'object' &&
    o.header !== null &&
    typeof o.values === 'object' &&
    o.values !== null
  )
}

export function mergeCases(local: CaseState, remote: CaseState): CaseState {
  return {
    protocolId: local.protocolId,
    header: mergeHeader(local.header, remote.header),
    values: mergeValues(local.values, remote.values),
  }
}

/** Signature stable pour détecter un vrai changement (indépendante de l'ordre des clés). */
export function caseSignature(c: CaseState): string {
  const vals = Object.keys(c.values)
    .sort()
    .map((k) => `${k}=${JSON.stringify(c.values[k].value)}@${c.values[k].updatedAt ?? c.values[k].completedAt}`)
    .join('|')
  const head = Object.keys(c.header)
    .sort()
    .map((k) => `${k}=${JSON.stringify((c.header as unknown as Record<string, unknown>)[k])}`)
    .join('|')
  return `${head}##${vals}`
}
