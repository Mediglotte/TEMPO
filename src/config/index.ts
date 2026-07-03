import { buildActionIndex } from '../engine/evaluate'
import { buildProtocolIndex } from '../lib/protocol'
import { polytraumaProtocol } from './protocols/polytrauma'

/** Protocole actif (extensible : on pourrait choisir parmi un registre de filières). */
export const activeProtocol = polytraumaProtocol

/** Index construits une seule fois (le contenu est statique). */
export const protocolIndex = buildProtocolIndex(activeProtocol)
export const actionIndex = buildActionIndex(activeProtocol.actions)
