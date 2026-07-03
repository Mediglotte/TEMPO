/**
 * Normalisation des nombres énoncés en français.
 * La reconnaissance vocale renvoie souvent déjà des chiffres (« 86 »), mais
 * parfois des mots (« quatre-vingt-six »). On convertit les mots en chiffres
 * pour que l'analyseur n'ait plus qu'à lire des entiers.
 *
 * Couvre la plage utile aux constantes vitales (0–999).
 */

/** Minuscule + suppression des accents (pour un appariement robuste). */
export function deburr(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const SMALL: Record<string, number> = {
  zero: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7,
  huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14,
  quinze: 15, seize: 16, vingt: 20, vingts: 20, trente: 30, quarante: 40,
  cinquante: 50, soixante: 60, quatrevingt: 80, quatrevingts: 80,
}

function isNumberToken(t: string): boolean {
  return t in SMALL || t === 'cent' || t === 'cents' || t === 'mille'
}

/** Convertit une suite de mots-nombres en entier (ex. ['cent','dix'] → 110). */
function runToInt(tokens: string[]): number | null {
  let total = 0
  let current = 0
  let any = false
  for (const t of tokens) {
    if (t === 'et') continue
    if (t === 'cent' || t === 'cents') {
      current = (current === 0 ? 1 : current) * 100
      any = true
    } else if (t === 'mille') {
      total += (current === 0 ? 1 : current) * 1000
      current = 0
      any = true
    } else if (t in SMALL) {
      current += SMALL[t]
      any = true
    } else {
      return null
    }
  }
  return any ? total + current : null
}

/**
 * Remplace, dans un texte déjà « deburré », chaque suite de mots-nombres par sa
 * valeur chiffrée. Les chiffres présents tels quels sont conservés.
 */
export function normalizeNumbers(deburred: string): string {
  // « quatre-vingt(s) » → jeton unique pour éviter 4×20.
  const merged = deburred.replace(/quatre[-\s]vingts?/g, ' quatrevingt ')
  const raw = merged.replace(/-/g, ' ').split(/\s+/).filter(Boolean)

  const out: string[] = []
  let run: string[] = []

  const flush = () => {
    if (run.length === 0) return
    const n = runToInt(run)
    out.push(n === null ? run.join(' ') : String(n))
    run = []
  }

  for (let i = 0; i < raw.length; i++) {
    const t = raw[i]
    if (isNumberToken(t)) {
      run.push(t)
    } else if (t === 'et' && run.length > 0 && i + 1 < raw.length && isNumberToken(raw[i + 1])) {
      // « vingt et un » : le « et » relie deux nombres → il fait partie du run.
      run.push(t)
    } else if (/^\d+$/.test(t)) {
      flush()
      out.push(t)
    } else {
      flush()
      out.push(t)
    }
  }
  flush()
  return out.join(' ')
}

/** Prépare un transcript pour l'analyse : deburr + nombres en chiffres. */
export function normalizeTranscript(text: string): string {
  return normalizeNumbers(deburr(text))
}
