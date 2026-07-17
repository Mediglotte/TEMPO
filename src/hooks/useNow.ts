import { useEffect, useState } from 'react'

/**
 * Horloge partagée à la seconde. Remplace les setInterval dupliqués
 * (chrono, jalons). Se resynchronise immédiatement quand `active` (re)devient
 * vrai, pour éviter une seconde d'affichage périmé à la reprise.
 */
export function useNow(active = true): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [active])

  return now
}
