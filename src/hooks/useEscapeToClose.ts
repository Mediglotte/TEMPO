import { useEffect } from 'react'

/** Pile des surfaces fermables actuellement ouvertes (ordre d'ouverture). */
const stack: Array<() => void> = []

/**
 * Ferme la surface à la touche Échap — mais seulement la DERNIÈRE ouverte :
 * panneau de détail + modale Récap ouverts ensemble ne se ferment pas d'un
 * seul coup. Passer un `onClose` stable (action Zustand ou useCallback).
 */
export function useEscapeToClose(active: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!active) return
    stack.push(onClose)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === onClose) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      const i = stack.lastIndexOf(onClose)
      if (i !== -1) stack.splice(i, 1)
      window.removeEventListener('keydown', onKey)
    }
  }, [active, onClose])
}
