import { Radio, Truck, Building2 } from 'lucide-react'
import type { CaseHeader as CaseHeaderType } from '../types/model'
import { useCaseStore } from '../store/caseStore'
import { DelaiEstimeTab } from './DelaiEstimeTab'

interface FieldProps {
  icon: React.ReactNode
  label: string
  field: keyof Pick<CaseHeaderType, 'regulateurName' | 'smurName' | 'serviceReceveur'>
  placeholder: string
  accent: string
}

function IntervenantTab({ icon, label, field, placeholder, accent }: FieldProps) {
  const value = useCaseStore((s) => s.caseState.header[field])
  const setHeader = useCaseStore((s) => s.setHeader)
  return (
    <label className={`flex min-w-[170px] flex-1 flex-col gap-1 rounded-lg border px-3 py-2 ${accent}`}>
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {icon} {label}
      </span>
      <input
        type="text"
        value={(value as string) ?? ''}
        placeholder={placeholder}
        onChange={(e) => setHeader({ [field]: e.target.value || undefined })}
        className="bg-transparent text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
      />
    </label>
  )
}

export function CaseHeader() {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <IntervenantTab
        icon={<Radio size={12} />}
        label="Régulateur"
        field="regulateurName"
        placeholder="Dr / SAMU…"
        accent="border-sky-200 bg-sky-50 text-sky-800"
      />
      <IntervenantTab
        icon={<Truck size={12} />}
        label="SMUR / VSAV"
        field="smurName"
        placeholder="Équipe préhosp…"
        accent="border-amber-200 bg-amber-50 text-amber-900"
      />
      <IntervenantTab
        icon={<Building2 size={12} />}
        label="Service receveur"
        field="serviceReceveur"
        placeholder="Déchocage / SAUV…"
        accent="border-rose-200 bg-rose-50 text-rose-800"
      />
      <DelaiEstimeTab />
    </div>
  )
}
