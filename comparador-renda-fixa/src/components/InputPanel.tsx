import { useState, useEffect } from 'react'
import { ComparatorInput, RateType, LciLcaLabel } from '../utils/calc'

interface Props {
  input: ComparatorInput
  onChange: (input: ComparatorInput) => void
}

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(String(value))
  useEffect(() => { setDisplay(String(value)) }, [value])
  const handleBlur = () => {
    const parsed = parseFloat(display)
    const next = isNaN(parsed) ? 0 : Math.max(parsed, 0)
    onChange(next)
    setDisplay(String(next))
  }
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">R$</span>
      <input
        type="number" min={0} step={1000} value={display}
        onChange={e => setDisplay(e.target.value)}
        onBlur={handleBlur}
        className={`${inputClass} pl-9`}
      />
    </div>
  )
}

function RateInput({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix: string }) {
  const [display, setDisplay] = useState(String(value))
  useEffect(() => { setDisplay(String(value)) }, [value])
  const handleBlur = () => {
    const parsed = parseFloat(display)
    const next = isNaN(parsed) ? 0 : Math.max(parsed, 0)
    onChange(next)
    setDisplay(String(next))
  }
  return (
    <div className="relative">
      <input
        type="number" min={0} step={0.25} value={display}
        onChange={e => setDisplay(e.target.value)}
        onBlur={handleBlur}
        className={`${inputClass} pr-16`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium whitespace-nowrap">{suffix}</span>
    </div>
  )
}

function RateTypeField({
  rateType, rate, onTypeChange, onRateChange,
}: {
  rateType: RateType; rate: number;
  onTypeChange: (t: RateType) => void; onRateChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
        {(['cdi', 'prefixado'] as RateType[]).map(t => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`flex-1 py-2 font-medium transition-colors ${
              rateType === t ? 'bg-navy text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t === 'cdi' ? '% do CDI' : '% a.a. Pré'}
          </button>
        ))}
      </div>
      <RateInput
        value={rate}
        onChange={onRateChange}
        suffix={rateType === 'cdi' ? '% CDI' : '% a.a.'}
      />
    </div>
  )
}

const SHORTCUTS = [
  { label: '6 meses', days: 180 },
  { label: '1 ano', days: 365 },
  { label: '2 anos', days: 730 },
]

export default function InputPanel({ input, onChange }: Props) {
  const set = (partial: Partial<ComparatorInput>) => onChange({ ...input, ...partial })

  const [daysDisplay, setDaysDisplay] = useState(String(input.days))
  useEffect(() => { setDaysDisplay(String(input.days)) }, [input.days])
  const handleDaysBlur = () => {
    const parsed = parseInt(daysDisplay)
    const next = isNaN(parsed) ? 1 : Math.max(parsed, 1)
    set({ days: next })
    setDaysDisplay(String(next))
  }

  const handleCdbTypeChange = (t: RateType) => {
    if (t === 'prefixado') {
      set({ cdbRateType: t, cdbRate: Math.max(input.cdiRate - 1.0, 0) })
    } else {
      set({ cdbRateType: t, cdbRate: 100 })
    }
  }

  const handleLciLcaTypeChange = (t: RateType) => {
    if (t === 'prefixado') {
      set({ lciLcaRateType: t, lciLcaRate: Math.max(input.cdiRate - 2.0, 0) })
    } else {
      set({ lciLcaRateType: t, lciLcaRate: 90 })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Parâmetros gerais */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Parâmetros</p>
          <Field label="Valor investido">
            <MoneyInput value={input.principal} onChange={v => set({ principal: v })} />
          </Field>
          <Field label="Prazo (dias corridos)">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="number" min={1} value={daysDisplay}
                  onChange={e => setDaysDisplay(e.target.value)}
                  onBlur={handleDaysBlur}
                  className={`${inputClass} pr-10`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">dias</span>
              </div>
              <div className="flex gap-1.5">
                {SHORTCUTS.map(s => (
                  <button
                    key={s.days}
                    onClick={() => { set({ days: s.days }); setDaysDisplay(String(s.days)) }}
                    className={`flex-1 text-xs py-1.5 rounded-md border font-medium transition-colors ${
                      input.days === s.days
                        ? 'bg-navy text-white border-navy'
                        : 'border-slate-200 text-slate-500 hover:border-navy/50 hover:text-navy'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </Field>
          <Field label="CDI atual (% a.a.)">
            <RateInput
              value={input.cdiRate}
              onChange={v => set({ cdiRate: Math.max(v, 0.01) })}
              suffix="% a.a."
            />
          </Field>
        </div>

        {/* CDB */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">CDB</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <span className="text-sm font-semibold text-blue-900">CDB</span>
              <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">Tributado</span>
            </div>
            <RateTypeField
              rateType={input.cdbRateType}
              rate={input.cdbRate}
              onTypeChange={handleCdbTypeChange}
              onRateChange={v => set({ cdbRate: v })}
            />
          </div>
        </div>

        {/* LCI / LCA */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Isento</p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">L</span>
              </div>
              <div className="flex rounded-md border border-emerald-200 overflow-hidden text-xs">
                {(['LCI', 'LCA'] as LciLcaLabel[]).map(l => (
                  <button
                    key={l}
                    onClick={() => set({ lciLcaLabel: l })}
                    className={`px-3 py-1.5 font-semibold transition-colors ${
                      input.lciLcaLabel === l
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <span className="ml-auto text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">Isento IR</span>
            </div>
            <RateTypeField
              rateType={input.lciLcaRateType}
              rate={input.lciLcaRate}
              onTypeChange={handleLciLcaTypeChange}
              onRateChange={v => set({ lciLcaRate: v })}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
