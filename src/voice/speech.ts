/**
 * Accès minimal à la Web Speech API (reconnaissance + synthèse), avec types
 * réduits (l'API n'est pas typée dans la lib DOM standard).
 *
 * ⚠️ Prototype : la reconnaissance vocale du navigateur nécessite un contexte
 * sécurisé (localhost via `npm run dev`, ou site en https). Sur un fichier
 * ouvert en double-clic (file://), le micro est généralement bloqué.
 */

export interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string; confidence: number }
}
export interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
export interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onstart: (() => void) | null
}
export type SpeechRecognitionCtor = new () => SpeechRecognitionLike

interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionCtor
  webkitSpeechRecognition?: SpeechRecognitionCtor
}

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as SpeechWindow
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}

export function isSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function isFileProtocol(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'file:'
}

let cachedVoice: SpeechSynthesisVoice | null = null

function pickFrenchVoice(): SpeechSynthesisVoice | null {
  if (!isSynthesisSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice
  cachedVoice =
    voices.find((v) => v.lang?.toLowerCase().startsWith('fr')) ?? voices[0] ?? null
  return cachedVoice
}

/** Lit un texte à voix haute (fr-FR). `onDone` est appelé à la fin (ou en cas d'échec). */
export function speak(text: string, onStart?: () => void, onDone?: () => void): void {
  if (!isSynthesisSupported() || !text.trim()) {
    onDone?.()
    return
  }
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  const voice = pickFrenchVoice()
  if (voice) u.voice = voice
  u.rate = 1
  u.onstart = () => onStart?.()
  u.onend = () => onDone?.()
  u.onerror = () => onDone?.()
  synth.speak(u)
}

export function cancelSpeech(): void {
  if (isSynthesisSupported()) window.speechSynthesis.cancel()
}
