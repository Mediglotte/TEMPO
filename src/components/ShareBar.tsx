import { useRef, useState } from 'react'
import { AppWindow, Check, FileDown, Link2, MessageCircle, RotateCcw } from 'lucide-react'
import { useCaseStore } from '../store/caseStore'
import { buildShareUrl, writeCaseToHash } from '../share/urlState'
import { clearCase } from '../share/persistence'
import { activeProtocol } from '../config'
import { exportCasePdf } from '../lib/pdf'

export function ShareBar() {
  const caseState = useCaseStore((s) => s.caseState)
  const reset = useCaseStore((s) => s.reset)
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    const url = buildShareUrl(caseState)
    writeCaseToHash(caseState)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copiez le lien de partage\u00A0:', url)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const onWhatsApp = () => {
    const url = buildShareUrl(caseState)
    writeCaseToHash(caseState)
    const text = encodeURIComponent(`TEMPO — partition d’urgence — suivez le cas\u00A0: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
  }

  const onPdf = () => {
    void exportCasePdf(caseState, activeProtocol).catch(() => {
      window.alert('Export PDF indisponible.')
    })
  }

  const onReset = () => {
    clearCase()
    reset()
    history.replaceState(null, '', window.location.pathname)
  }

  // Hold-to-confirm : « Réinitialiser » efface tout le cas, un simple clic ne suffit pas.
  const [holding, setHolding] = useState(false)
  const holdTimer = useRef<number | undefined>(undefined)
  const startHold = () => {
    setHolding(true)
    holdTimer.current = window.setTimeout(() => {
      setHolding(false)
      onReset()
    }, 2000)
  }
  const cancelHold = () => {
    setHolding(false)
    window.clearTimeout(holdTimer.current)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onCopy}
        className="flex w-36 items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-slate-700 active:scale-[0.96]"
      >
        <span className="relative grid size-[15px] place-items-center">
          <Check
            size={15}
            className={`col-start-1 row-start-1 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
              copied ? 'scale-100 opacity-100 blur-0' : 'scale-[0.25] opacity-0 blur-[4px]'
            }`}
          />
          <Link2
            size={15}
            className={`col-start-1 row-start-1 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
              copied ? 'scale-[0.25] opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-0'
            }`}
          />
        </span>
        {copied ? 'Lien copié\u00A0!' : 'Copier le lien'}
      </button>
      <button
        type="button"
        onClick={onWhatsApp}
        title="Partager le lien par WhatsApp"
        aria-label="Partager le lien par WhatsApp"
        className="relative flex items-center justify-center rounded-lg bg-[oklch(0.761_0.201_149.74)] p-2.5 text-slate-900 transition-[filter,transform] duration-150 ease-out before:absolute before:-inset-1 hover:brightness-95 active:scale-[0.96]"
      >
        <MessageCircle size={18} />
      </button>
      <button
        type="button"
        onClick={onPdf}
        title="Exporter le récapitulatif des actions en PDF"
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <FileDown size={15} /> Exporter PDF
      </button>
      <button
        type="button"
        onClick={() => window.open(window.location.href, '_blank', 'noopener')}
        title="Ouvrir une 2ᵉ fenêtre synchronisée (même machine)"
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <AppWindow size={15} /> 2ᵉ fenêtre
      </button>
      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          // Activation clavier / techno d'assistance (pas de « maintien » possible).
          if (e.detail === 0 && window.confirm('Effacer le cas en cours et repartir de zéro ?')) onReset()
        }}
        title="Maintenir 2 s pour effacer le cas en cours"
        className="relative flex min-w-[8.5rem] select-none items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span aria-hidden className={`pointer-events-none absolute inset-0 bg-rose-200 ${holding ? 'hold-fill-active' : 'hold-fill'}`} />
        <span className="relative flex items-center gap-1.5">
          <RotateCcw size={15} /> {holding ? 'Maintenir…' : 'Réinitialiser'}
        </span>
      </button>
    </div>
  )
}
