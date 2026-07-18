/**
 * Serveur de salons TEMPO — point d'entrée du Worker.
 *
 * Même API que l'ancien plugin WordPress « TEMPO Sync » :
 *   GET  …/room/<code>  → { v, case }            (v=0, case=null si salon vide)
 *   POST …/room/<code>  → { v, case }            (body { case }, v incrémenté)
 * Le chemin WordPress historique `/wp-json/tempo/v1/room/<code>` est accepté
 * aussi, pour que le client n'ait qu'un seul format d'URL quel que soit le
 * serveur pointé pendant la transition.
 *
 * Chaque salon = un Durable Object (ordre total des écritures, incrément de
 * version atomique), épinglé en juridiction UE quand la plateforme le permet.
 */

export { TempoRoom } from './room'

export interface Env {
  ROOMS: DurableObjectNamespace
}

/** Code de salon : mêmes caractères et même longueur max que le plugin WordPress. */
const ROOM_PATH = /\/room\/([A-Za-z0-9-]{1,80})$/

const ALLOWED_ORIGINS = new Set([
  'https://pierre-balaz.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
])

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  if (origin && ALLOWED_ORIGINS.has(origin)) h['Access-Control-Allow-Origin'] = origin
  return h
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    const match = new URL(request.url).pathname.match(ROOM_PATH)
    if (!match) return json({ error: 'route inconnue' }, 404, origin)
    if (request.method !== 'GET' && request.method !== 'POST') {
      return json({ error: 'méthode non autorisée' }, 405, origin)
    }
    // Un navigateur hors liste n'aurait de toute façon pas accès à la réponse
    // (CORS) ; on refuse aussi côté serveur pour bloquer l'écriture.
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: 'origine non autorisée' }, 403, origin)
    }

    let ns = env.ROOMS
    try {
      ns = env.ROOMS.jurisdiction('eu')
    } catch {
      // Juridiction indisponible sur ce plan : espace par défaut.
    }
    const stub = ns.get(ns.idFromName(match[1]))
    const res = await stub.fetch(request)

    const out = new Response(res.body, res)
    for (const [k, v] of Object.entries(corsHeaders(origin))) out.headers.set(k, v)
    return out
  },
}
