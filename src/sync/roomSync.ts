import type { CaseState } from '../types/model'

/** Réponse du serveur pour une salle. */
export interface RoomState {
  v: number
  case: CaseState | null
}

// Chemin historique du plugin WordPress, conservé comme format unique : le
// serveur Cloudflare (server/) accepte aussi ce préfixe, si bien que la même
// URL de base fonctionne quel que soit le serveur pointé.
function roomUrl(baseUrl: string, code: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  return `${base}/wp-json/tempo/v1/room/${encodeURIComponent(code)}`
}

/** Une requête qui pend (Wi-Fi mort sans RST, proxy captif) gèlerait la boucle
 *  de polling — et le statut resterait figé sur « En direct ». */
const FETCH_TIMEOUT_MS = 8000

function withTimeout(signal?: AbortSignal): AbortSignal | undefined {
  if (typeof AbortSignal.timeout !== 'function') return signal
  const t = AbortSignal.timeout(FETCH_TIMEOUT_MS)
  if (!signal) return t
  return typeof AbortSignal.any === 'function' ? AbortSignal.any([signal, t]) : signal
}

export async function fetchRoom(baseUrl: string, code: string, signal?: AbortSignal): Promise<RoomState> {
  const res = await fetch(roomUrl(baseUrl, code), { method: 'GET', signal: withTimeout(signal) })
  if (!res.ok) throw new Error(`GET ${res.status}`)
  return (await res.json()) as RoomState
}

export async function pushRoom(
  baseUrl: string,
  code: string,
  caseState: CaseState,
  signal?: AbortSignal,
): Promise<RoomState> {
  const res = await fetch(roomUrl(baseUrl, code), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case: caseState }),
    signal: withTimeout(signal),
  })
  if (!res.ok) throw new Error(`POST ${res.status}`)
  return (await res.json()) as RoomState
}
