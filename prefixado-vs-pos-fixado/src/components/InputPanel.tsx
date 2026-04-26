import { useState, useEffect } from 'react'
import { CalcInput } from '../utils/calc'

interface Props {
  input: CalcInput
  onChange: (input: CalcInput) => void
}

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">
        {label}
        {hint && <span className="ml-1 text-slate-400 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(String(value))
  useEffect(() => { setDisplay(String(value)) }, [value])
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">R$</span>
      <input
        type="number" min={0} step={1000} value={display}
        onChange={e => setDisplay(e.target.value)}
        onBlur={() => {
          const v = parseFloat(display)
          const next = isNaN(v) ? 1000 : Math.max(v, 1000)
          onChange(next)
          setDisplay(String(next))
        }}
        className={`${inputClass} pl-9`}
      />
    </div>
  )
}

function RateInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(value.toFixed(2))
  useEffect(() => { setDisplay(value.toFixed(2)) }, [value])
  return (
    <div className="relative">
      <input
        type="number" min={0} max={30} step={0.25} value={display}
        onChange={e => setDisplay(e.target.value)}
        onBlur={() => {
          const v = parseFloat(display)
          const next = isNaN(v) ? 14.5 : Math.min(Math.max(v, 0), 30)
          onChange(next)
          setDisplay(next.toFixed(2))
        }}
        className={`${inputClass} pr-12`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">% a.a.</span>
    </div>
  )
}

const PRAZO_OPTIONS = [6, 12, 18, 24, 36, 48]

export default function InputPanel({ input, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-navy mb-4">Parâmetros da simulação</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Capital inicial">
          <MoneyInput value={input.principal} onChange={v => onChange({ ...input, principal: v })} />
        </Field>

        <Field label="Prazo">
          <select
            value={input.months}
            onChange={e => onChange({ ...input, months: Number(e.target.value) })}
            className={inputClass}
          >
            {PRAZO_OPTIONS.map(m => (
              <option key={m} value={m}>
                {m} meses {m >= 12 ? `(${m / 12} ${m === 12 ? 'ano' : 'anos'})` : ''}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Taxa prefixada" hint="CDB / LTN">
          <RateInput value={input.prefixedRate} onChange={v => onChange({ ...input, prefixedRate: v })} />
        </Field>
      </div>
    </div>
  )
}
