import { useState, useEffect } from 'react'
import { CalcInput, InstrumentType } from '../utils/calc'

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

const PRAZO_OPTIONS = [6, 12, 18, 24, 36, 48, 60]

const INSTRUMENTS: { id: InstrumentType; label: string; sub: string; defaultRate: number }[] = [
  { id: 'cdb', label: 'CDB / LTN', sub: 'Tributado — IR regressivo', defaultRate: 13.5 },
  { id: 'lca', label: 'LCA Prefixada', sub: 'Isento de IR para PF', defaultRate: 11.0 },
]

const POS_INSTRUMENTS = [
  { isExempt: false, label: 'CDB / Tesouro Selic', sub: 'Tributado — IR regressivo', defaultPct: 100, min: 100, max: 115 },
  { isExempt: true,  label: 'LCI / LCA',           sub: 'Isento de IR para PF',      defaultPct: 90,  min: 80,  max: 98  },
]

export default function InputPanel({ input, onChange }: Props) {
  function handleInstrument(type: InstrumentType) {
    const inst = INSTRUMENTS.find(i => i.id === type)!
    onChange({ ...input, instrumentType: type, prefixedRate: inst.defaultRate })
  }

  function handlePosInstrument(isExempt: boolean) {
    const posInst = POS_INSTRUMENTS.find(p => p.isExempt === isExempt)!
    onChange({ ...input, posIsExempt: isExempt, cdiPct: posInst.defaultPct })
  }

  const rateHint = input.instrumentType === 'lca' ? 'LCA Pré · isenta de IR' : 'CDB / LTN'
  const posInst = POS_INSTRUMENTS.find(p => p.isExempt === input.posIsExempt)!

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-navy mb-4">Parâmetros da simulação</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">Instrumento prefixado</p>
          <div className="flex gap-2">
            {INSTRUMENTS.map(inst => (
              <button
                key={inst.id}
                onClick={() => handleInstrument(inst.id)}
                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  input.instrumentType === inst.id
                    ? 'border-navy bg-navy/5'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className={`text-sm font-semibold ${input.instrumentType === inst.id ? 'text-navy' : 'text-slate-600'}`}>
                  {inst.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{inst.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">Instrumento pós-fixado</p>
          <div className="flex gap-2">
            {POS_INSTRUMENTS.map(p => (
              <button
                key={String(p.isExempt)}
                onClick={() => handlePosInstrument(p.isExempt)}
                className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  input.posIsExempt === p.isExempt
                    ? 'border-navy bg-navy/5'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className={`text-sm font-semibold ${input.posIsExempt === p.isExempt ? 'text-navy' : 'text-slate-600'}`}>
                  {p.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

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

        <Field label="Taxa prefixada" hint={rateHint}>
          <RateInput value={input.prefixedRate} onChange={v => onChange({ ...input, prefixedRate: v })} />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="Rentabilidade do pós-fixado"
          hint={input.posIsExempt ? 'LCI / LCA isento' : 'CDB tributado'}
        >
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={posInst.min}
              max={posInst.max}
              step={1}
              value={input.cdiPct}
              onChange={e => onChange({ ...input, cdiPct: Number(e.target.value) })}
              className="flex-1 h-2 rounded-full accent-navy cursor-pointer"
            />
            <span className="text-sm font-semibold text-navy w-28 text-right whitespace-nowrap">
              {input.cdiPct}% {input.posIsExempt ? 'CDI líquido' : 'do CDI'}
            </span>
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            <span className="text-[10px] text-slate-400">{posInst.min}%</span>
            <span className="text-[10px] text-slate-400">{posInst.max}%</span>
          </div>
        </Field>
      </div>
    </div>
  )
}
