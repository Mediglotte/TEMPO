import type { CaseState, Condition } from '../types/model'
import { type ActionIndex, numericOf, resolveValue } from './computed'

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (typeof value === 'boolean') return value === true
  return true
}

/** Évalue une condition déclarative contre l'état du cas. Fonction pure. */
export function evaluateCondition(
  cond: Condition,
  caseState: CaseState,
  index: ActionIndex,
): boolean {
  switch (cond.kind) {
    case 'and':
      return cond.conditions.every((c) => evaluateCondition(c, caseState, index))
    case 'or':
      return cond.conditions.some((c) => evaluateCondition(c, caseState, index))
    case 'isChecked':
      return resolveValue(cond.actionId, caseState, index) === true
    case 'filled':
      return isFilled(resolveValue(cond.actionId, caseState, index))
    case 'equals':
      return resolveValue(cond.actionId, caseState, index) === cond.value
    case 'gt':
      return numericOf(resolveValue(cond.actionId, caseState, index)) > cond.value
    case 'gte':
      return numericOf(resolveValue(cond.actionId, caseState, index)) >= cond.value
    case 'lt':
      return numericOf(resolveValue(cond.actionId, caseState, index)) < cond.value
    case 'lte':
      return numericOf(resolveValue(cond.actionId, caseState, index)) <= cond.value
    default: {
      // Exhaustivité : si un nouveau kind est ajouté sans être traité, TS le signale.
      const _exhaustive: never = cond
      return Boolean(_exhaustive)
    }
  }
}
