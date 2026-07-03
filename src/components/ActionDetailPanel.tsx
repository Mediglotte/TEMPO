import { Check, X } from 'lucide-react'
import type { ActionValue, SubField } from '../types/model'
import { protocolIndex } from '../config'
import { useCaseStore } from '../store/caseStore'
import { canEditTrack, useUiStore } from '../store/uiStore'
import { BurnBodyMap } from './BurnBodyMap'

export function ActionDetailPanel() {
  const openActionId = useUiStore((s) => s.openActionId)
  const closeAction = useUiStore((s) => s.closeAction)
  const values = useCaseStore((s) => s.caseState.values)
  const setValue = useCaseStore((s) => s.setValue)

  const action = openActionId ? protocolIndex.actionMap.get(openActionId) : undefined
  const editable = useUiStore((s) =>
    action ? canEditTrack(s.activeRole, s.roleChosen, action.trackId) : false,
  )
  if (!action) return null

  const track = protocolIndex.trackMap.get(action.trackId)
  const section = protocolIndex.sectionMap.get(action.sectionId)
  const subFields = action.detail?.subFields ?? []

  // Regroupe les sous-champs par `group` (en préservant l'ordre).
  const groups: { group: string | undefined; items: SubField[] }[] = []
  for (const sf of subFields) {
    const last = groups[groups.length - 1]
    if (last && last.group === sf.group) last.items.push(sf)
    else groups.push({ group: sf.group, items: [sf] })
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-slate-900/30" onClick={closeAction} />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {track?.shortLabel} · {section?.label}
            </p>
            <h2 className="text-lg font-bold text-slate-900">{action.label}</h2>
          </div>
          <button
            type="button"
            onClick={closeAction}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {action.detail?.reminder && (
          <div className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
            {action.detail.reminder}
          </div>
        )}

        {action.detail?.widget === 'burnBodyMap' && (
          <BurnBodyMap actionId={action.id} editable={editable} />
        )}

        {groups.length > 0 && (
          <div className="flex flex-col gap-4">
            {groups.map((g, gi) => (
              <div key={g.group ?? gi} className="flex flex-col gap-2">
                {g.group && (
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {g.group}
                  </h3>
                )}
                {g.items.map((sf) => {
                  const key = `${action.id}::${sf.id}`
                  return (
                    <SubFieldInput
                      key={sf.id}
                      subField={sf}
                      value={values[key]?.value ?? null}
                      onChange={(v) => setValue(key, v)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {action.detail?.references && action.detail.references.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Références</h3>
            <ul className="space-y-1 text-xs text-slate-500">
              {action.detail.references.map((r) => (
                <li key={r.label}>
                  <span className="font-medium text-slate-700">{r.label}</span> — {r.note}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-auto text-[11px] text-slate-400">
          Astuce : l’action se renseigne aussi directement sur sa carte dans la timeline.
        </p>
      </aside>
    </>
  )
}

function SubFieldInput({
  subField,
  value,
  onChange,
}: {
  subField: SubField
  value: ActionValue
  onChange: (v: ActionValue) => void
}) {
  if (subField.type === 'checkbox') {
    const checked = value === true
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-start gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-left text-sm hover:bg-slate-50"
      >
        <span
          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
            checked ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300 bg-white'
          }`}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </span>
        <span className="text-slate-700">{subField.label}</span>
      </button>
    )
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{subField.label}</span>
      {subField.type === 'select' ? (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="rounded border border-slate-300 px-2 py-1 focus:border-slate-500 focus:outline-none"
        >
          <option value="">—</option>
          {subField.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={subField.type === 'number' ? 'number' : 'text'}
          value={value === null || value === undefined ? '' : String(value)}
          placeholder={subField.placeholder}
          onChange={(e) =>
            onChange(
              e.target.value === ''
                ? null
                : subField.type === 'number'
                  ? Number(e.target.value)
                  : e.target.value,
            )
          }
          className="rounded border border-slate-300 px-2 py-1 focus:border-slate-500 focus:outline-none"
        />
      )}
    </label>
  )
}
