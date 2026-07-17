import type { Protocol } from '../../../types/model'
import { actions } from './actions'
import { milestones } from './milestones'
import { rules } from './rules'
import { tracks } from './tracks'

export const polytraumaProtocol: Protocol = {
  id: 'polytrauma',
  label: 'Traumatisé sévère (polytraumatisé)',
  tracks,
  actions,
  rules,
  milestones,
}
