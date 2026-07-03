import type { CaseState, DerivedUiState, Protocol } from '../types/model'
import { type ActionIndex, buildActionIndex } from './computed'
import { evaluateCondition } from './conditions'
import { applyEffect } from './effects'

export { buildActionIndex, resolveValue, computeValue, numericOf } from './computed'
export type { ActionIndex } from './computed'

/**
 * Cœur du concept : transforme (protocole + état saisi) en une carte d'effets visuels
 * (clignotement, déblocage, highlight) répartis sur N'IMPORTE quelle piste.
 *
 * Fonction PURE et déterministe : l'UI est une simple fonction de cet état dérivé.
 */
export function evaluate(
  protocol: Protocol,
  caseState: CaseState,
  index?: ActionIndex,
): DerivedUiState {
  const idx = index ?? buildActionIndex(protocol.actions)
  const derived: DerivedUiState = {}

  for (const rule of protocol.rules) {
    if (evaluateCondition(rule.when, caseState, idx)) {
      for (const effect of rule.then) {
        applyEffect(derived, effect)
      }
    }
  }

  return derived
}

/** Liste des règles actuellement actives (utile pour debug / panneau « pourquoi »). */
export function activeRules(protocol: Protocol, caseState: CaseState): string[] {
  const idx = buildActionIndex(protocol.actions)
  return protocol.rules
    .filter((r) => evaluateCondition(r.when, caseState, idx))
    .map((r) => r.id)
}
