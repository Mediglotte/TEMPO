import type { Condition, Protocol } from '../types/model'
import { buildProtocolIndex } from '../lib/protocol'

/**
 * Validateur de configuration (exécuté en dev) : repère les cibles orphelines
 * dans les règles avant qu'un bug silencieux ne passe en démo. Couvre :
 * cibles d'effets, conditions et inputs calculés (y compris les références de
 * sous-champ « parent::sub »), liens `bindTo`, doublons d'ids, jalons.
 */
export function validateProtocol(protocol: Protocol): string[] {
  const { actionMap, sectionMap } = buildProtocolIndex(protocol)
  const errors: string[] = []

  /* --- doublons d'identifiants ----------------------------------------- */
  const seenActions = new Set<string>()
  for (const action of protocol.actions) {
    if (seenActions.has(action.id)) errors.push(`Action en double : « ${action.id} ».`)
    seenActions.add(action.id)
  }
  const seenRules = new Set<string>()
  for (const rule of protocol.rules) {
    if (seenRules.has(rule.id)) errors.push(`Règle en double : « ${rule.id} ».`)
    seenRules.add(rule.id)
  }

  /* --- résolution d'une référence de valeur ---------------------------- */
  // Une référence est soit un id d'action, soit « parent::sub » (sous-champ).
  // Un sous-champ `bindTo` stocke sa valeur SOUS L'ACTION LIÉE : le référencer
  // via « parent::sub » ne verrait jamais de valeur — signalé comme erreur.
  const checkRef = (owner: string, ref: string) => {
    if (!ref.includes('::')) {
      if (!actionMap.has(ref)) errors.push(`${owner} : référence inconnue « ${ref} ».`)
      return
    }
    const [parentId, subId] = ref.split('::')
    const parent = actionMap.get(parentId)
    const sub = parent?.detail?.subFields?.find((sf) => sf.id === subId)
    if (!parent || !sub) {
      errors.push(`${owner} : sous-champ inconnu « ${ref} ».`)
      return
    }
    if (sub.bindTo) {
      errors.push(
        `${owner} : « ${ref} » est lié (bindTo) à « ${sub.bindTo} » — référencer cette action à la place.`,
      )
    }
  }

  const checkCondition = (ruleId: string, cond: Condition) => {
    if (cond.kind === 'and' || cond.kind === 'or') {
      cond.conditions.forEach((c) => checkCondition(ruleId, c))
      return
    }
    checkRef(`Règle « ${ruleId} »`, cond.actionId)
  }

  const targetExists = (targetId: string): boolean => {
    if (targetId.startsWith('section:')) return sectionMap.has(targetId.slice('section:'.length))
    return actionMap.has(targetId)
  }

  /* --- règles : conditions + cibles d'effets --------------------------- */
  for (const rule of protocol.rules) {
    checkCondition(rule.id, rule.when)
    for (const effect of rule.then) {
      if (!targetExists(effect.targetId)) {
        errors.push(`Règle « ${rule.id} » : cible inconnue « ${effect.targetId} ».`)
      }
    }
  }

  /* --- actions calculées + sous-champs --------------------------------- */
  for (const action of protocol.actions) {
    if (action.type === 'computed') {
      const inputs = action.computed?.inputs ?? []
      for (const input of inputs) {
        const refs =
          typeof input === 'string'
            ? [input]
            : 'any' in input
              ? input.any.map((c) => c.ref)
              : [input.ref]
        for (const ref of refs) checkRef(`Action calculée « ${action.id} »`, ref)
      }
      // Clés de `weights` : une clé orpheline retombe silencieusement à 1
      // (spec.weights?.[inp] ?? 1) — un score serait faux sans aucune erreur.
      const stringInputs = new Set(inputs.filter((i): i is string => typeof i === 'string'))
      for (const key of Object.keys(action.computed?.weights ?? {})) {
        if (!stringInputs.has(key)) {
          errors.push(
            `Action calculée « ${action.id} » : poids « ${key} » sans input correspondant (poids ignoré, retombe à 1).`,
          )
        }
      }
    }
    for (const sf of action.detail?.subFields ?? []) {
      if (sf.bindTo && !actionMap.has(sf.bindTo)) {
        errors.push(
          `Sous-champ « ${action.id}::${sf.id} » : bindTo inconnu « ${sf.bindTo} ».`,
        )
      }
    }
  }

  /* --- cycles entre actions calculées ----------------------------------- */
  // resolveValue est récursif sans garde : une boucle computed→computed
  // provoquerait une RangeError (stack overflow) au premier evaluate.
  {
    // Seules les refs SANS « :: » récursent (resolveValue) : une ref de
    // sous-champ lit une valeur stockée, jamais un calcul.
    const inputRefsOf = (id: string): string[] => {
      const a = actionMap.get(id)
      if (a?.type !== 'computed') return []
      const refs: string[] = []
      for (const input of a.computed?.inputs ?? []) {
        if (typeof input === 'string') refs.push(input)
        else if ('any' in input) refs.push(...input.any.map((c) => c.ref))
        else refs.push(input.ref)
      }
      return refs.filter((r) => !r.includes('::'))
    }
    const cycles = new Set<string>()
    const visiting = new Set<string>()
    const done = new Set<string>()
    const visit = (id: string, path: string[]) => {
      if (done.has(id)) return
      if (visiting.has(id)) {
        cycles.add(`Cycle d'actions calculées : ${[...path, id].join(' → ')}.`)
        return
      }
      visiting.add(id)
      for (const ref of inputRefsOf(id)) visit(ref, [...path, id])
      visiting.delete(id)
      done.add(id)
    }
    for (const action of protocol.actions) {
      if (action.type === 'computed') visit(action.id, [])
    }
    errors.push(...cycles)
  }

  /* --- garde « filled » des comparaisons numériques ---------------------- */
  // Une valeur non renseignée vaut 0 dans lt/lte : sans condition `filled`
  // compagne sur la même action, la règle se déclencherait sur un cas vide.
  {
    const collectFilled = (cond: Condition, acc: Set<string>) => {
      if (cond.kind === 'and' || cond.kind === 'or') {
        cond.conditions.forEach((c) => collectFilled(c, acc))
      } else if (cond.kind === 'filled') {
        acc.add(cond.actionId)
      }
    }
    const collectLtWithoutFilled = (ruleId: string, cond: Condition, filled: Set<string>) => {
      if (cond.kind === 'and' || cond.kind === 'or') {
        cond.conditions.forEach((c) => collectLtWithoutFilled(ruleId, c, filled))
        return
      }
      if ((cond.kind === 'lt' || cond.kind === 'lte') && !filled.has(cond.actionId)) {
        errors.push(
          `Règle « ${ruleId} » : comparaison ${cond.kind} sur « ${cond.actionId} » sans garde filled — un champ vide vaut 0 et déclencherait la règle sur un cas vierge.`,
        )
      }
    }
    for (const rule of protocol.rules) {
      const filled = new Set<string>()
      collectFilled(rule.when, filled)
      collectLtWithoutFilled(rule.id, rule.when, filled)
    }
  }

  /* --- jalons ----------------------------------------------------------- */
  const seenMilestones = new Set<string>()
  for (const m of protocol.milestones ?? []) {
    if (seenMilestones.has(m.id)) errors.push(`Jalon en double : « ${m.id} ».`)
    seenMilestones.add(m.id)
    if (m.atMin < 0) errors.push(`Jalon « ${m.id} » : minute négative (${m.atMin}).`)
  }

  return errors
}
