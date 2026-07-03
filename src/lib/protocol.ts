import type { ActionDef, Protocol, SectionDef, TrackDef, TrackId } from '../types/model'

/** Index et helpers de lecture d'un protocole (mémoïsables côté appelant). */
export function buildProtocolIndex(protocol: Protocol) {
  const actionMap = new Map<string, ActionDef>(protocol.actions.map((a) => [a.id, a]))
  const sectionMap = new Map<string, SectionDef>()
  const trackMap = new Map<TrackId, TrackDef>()
  for (const track of protocol.tracks) {
    trackMap.set(track.id, track)
    for (const section of track.sections) sectionMap.set(section.id, section)
  }
  return { actionMap, sectionMap, trackMap }
}

export function actionsOfSection(protocol: Protocol, sectionId: string): ActionDef[] {
  return protocol.actions.filter((a) => a.sectionId === sectionId)
}

export function actionsOfTrack(protocol: Protocol, trackId: TrackId): ActionDef[] {
  return protocol.actions.filter((a) => a.trackId === trackId)
}
