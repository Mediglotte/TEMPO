import type { DerivedUiState, Effect, EffectLevel } from '../types/model'

const LEVEL_RANK: Record<EffectLevel, number> = {
  info: 0,
  recommended: 1,
  warn: 2,
  critical: 3,
}

/** Applique un effet à l'état dérivé (mutation maîtrisée de l'accumulateur). */
export function applyEffect(derived: DerivedUiState, effect: Effect): void {
  const current = derived[effect.targetId] ?? {}

  switch (effect.kind) {
    case 'unlock':
      current.unlocked = true
      break
    case 'blink':
      current.blink = true
      break
    case 'highlight':
      current.highlighted = true
      break
    case 'showSection':
      current.unlocked = true
      break
    case 'setStatus':
      current.highlighted = true
      break
  }

  // On conserve le niveau d'alerte le plus élevé en cas d'effets multiples.
  if (effect.level) {
    if (!current.level || LEVEL_RANK[effect.level] > LEVEL_RANK[current.level]) {
      current.level = effect.level
      current.note = effect.note ?? current.note
    } else if (!current.note && effect.note) {
      current.note = effect.note
    }
  } else if (effect.note && !current.note) {
    current.note = effect.note
  }

  derived[effect.targetId] = current
}
