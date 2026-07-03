import {
  Activity,
  Baby,
  Brain,
  Building2,
  ClipboardList,
  Droplet,
  Droplets,
  Flame,
  Gauge,
  HeartPulse,
  Radio,
  Scan,
  Scissors,
  Siren,
  Stethoscope,
  Syringe,
  Thermometer,
  Truck,
  Wind,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/** Catégorie d'action → sert au choix d'icône (timeline réduite + glyphe des pastilles). */
export type ActionCategory =
  | 'regulation'
  | 'means'
  | 'destination'
  | 'burns'
  | 'pediatrics'
  | 'score'
  | 'medication'
  | 'hemorrhage'
  | 'airway'
  | 'breathing'
  | 'circulation'
  | 'vitals'
  | 'neuro'
  | 'exposure'
  | 'imaging'
  | 'transfusion'
  | 'gesture'
  | 'activation'
  | 'transmission'
  | 'surgery'
  | 'generic'

const CATEGORY_ICON: Record<ActionCategory, LucideIcon> = {
  regulation: Radio,
  means: Truck,
  destination: Building2,
  burns: Flame,
  pediatrics: Baby,
  score: Gauge,
  medication: Syringe,
  hemorrhage: Droplet,
  airway: Wind,
  breathing: Stethoscope,
  circulation: HeartPulse,
  vitals: Activity,
  neuro: Brain,
  exposure: Thermometer,
  imaging: Scan,
  transfusion: Droplets,
  gesture: Wrench,
  activation: Siren,
  transmission: ClipboardList,
  surgery: Scissors,
  generic: Activity,
}

export function iconForCategory(category?: ActionCategory): LucideIcon {
  return CATEGORY_ICON[category ?? 'generic']
}
