import { useMemo } from 'react'
import type { ActionValue, DerivedUiState } from '../types/model'
import { evaluate, resolveValue } from '../engine/evaluate'
import { actionIndex, activeProtocol } from '../config'
import { useCaseStore } from './caseStore'

/** État visuel dérivé (clignotement / déblocage / highlight) recalculé à chaque saisie. */
export function useDerivedUiState(): DerivedUiState {
  const caseState = useCaseStore((s) => s.caseState)
  return useMemo(() => evaluate(activeProtocol, caseState, actionIndex), [caseState])
}

/** Valeur résolue d'une action (calcule les `computed`).
 *  Le sélecteur retourne la valeur résolue elle-même : Zustand compare par
 *  Object.is, donc la cellule ne re-rend que si SA valeur change — et non à
 *  chaque frappe dans n'importe quel champ du cas. */
export function useResolvedValue(actionId: string): ActionValue {
  return useCaseStore((s) => resolveValue(actionId, s.caseState, actionIndex))
}
