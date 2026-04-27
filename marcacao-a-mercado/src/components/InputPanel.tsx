import { useState, useEffect } from 'react'
import { CalcInput, LTN_LIST } from '../utils/calc'

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

function RateInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(value.toFixed(2))
  useEffect(() => { setDisplay(value.toFixed(2)) }, [value])
  return (
    <div className="relative">
      <input
        type="number" min={0.1} max={40} step={0.05} value={display}
        onChange={e => setDisplay(e.target.value)}
        onBlur={() => {
          const v = parseFloat(display)
          const next = isNaN(v) ? 14 : Math.min(Math.max(v, 0.1), 40)
          onChange(next)
          setDisplay(next.toFixed(2))
        }}
        className={`${inputClass} pr-14`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">% a.a.</span>
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
        type="number" min={1000} step={1000} value={display}
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

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fromInputDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function InputPanel({ input, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-navy mb-4">Parâmetros da operação</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Título LTN">
          <select
            value={input.ltnId}
            onChange={e => onChange({ ...input, ltnId: e.target.value })}
            className={inputClass}
          >
            {LTN_LIST.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Data de compra">
          <input
            type="date"
            value={toInputDate(input.purchaseDate)}
            max={toInputDate(new Date())}
            onChange={e => {
              if (e.target.value) onChange({ ...input, purchaseDate: fromInputDate(e.target.value) })
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Capital investido">
          <MoneyInput value={input.capital} onChange={v => onChange({ ...input, capital: v })} />
        </Field>

        <Field label="Taxa de compra" hint="% a.a. na data da operação">
          <RateInput value={input.purchaseRate} onChange={v => onChange({ ...input, purchaseRate: v })} />
        </Field>

        <Field label="Taxa de mercado hoje" hint="taxa para o prazo restante">
          <RateInput value={input.marketRate} onChange={v => onChange({ ...input, marketRate: v })} />
        </Field>
      </div>
    </div>
  )
}
