import { useState, useEffect } from 'react'
import { SavingsInput } from '../utils/calc'

interface Props {
  input: SavingsInput
  onChange: (input: SavingsInput) => void
}

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">
        {label}
        {hint && <span className="ml-1 text-slate-400">({hint})</span>}
      </label>
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

function RateInput({ value, onChange, suffix, step = 0.25 }: {
  value: number; onChange: (v: number) => void; suffix: string; step?: number
}) {
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
        type="number" min={0} step={step} value={display}
        onChange={e => setDisplay(e.target.value)}
        onBlur={handleBlur}
        className={`${inputClass} pr-14`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium whitespace-nowrap">{suffix}</span>
    </div>
  )
}

const YEAR_SHORTCUTS = [5, 10, 20, 30]

export default function InputPanel({ input, onChange }: Props) {
  const set = (partial: Partial<SavingsInput>) => onChange({ ...input, ...partial })

  const [yearsDisplay, setYearsDisplay] = useState(String(input.years))
  useEffect(() => { setYearsDisplay(String(input.years)) }, [input.years])
  const handleYearsBlur = () => {
    const parsed = parseInt(yearsDisplay)
    const next = isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), 40)
    set({ years: next })
    setYearsDisplay(String(next))
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Parâmetros de investimento */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Investimento</p>
          <Field label="Valor inicial">
            <MoneyInput value={input.principal} onChange={v => set({ principal: v })} />
          </Field>
          <Field label="Aporte mensal">
            <MoneyInput value={input.monthlyContrib} onChange={v => set({ monthlyContrib: v })} />
          </Field>
          <Field label="Prazo">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="number" min={1} max={40} value={yearsDisplay}
                  onChange={e => setYearsDisplay(e.target.value)}
                  onBlur={handleYearsBlur}
                  className={`${inputClass} pr-10`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">anos</span>
              </div>
              <div className="flex gap-1.5">
                {YEAR_SHORTCUTS.map(y => (
                  <button
                    key={y}
                    onClick={() => { set({ years: y }); setYearsDisplay(String(y)) }}
                    className={`flex-1 text-xs py-1.5 rounded-md border font-medium transition-colors ${
                      input.years === y
                        ? 'bg-navy text-white border-navy'
                        : 'border-slate-200 text-slate-500 hover:border-navy/50 hover:text-navy'
                    }`}
                  >
                    {y}a
                  </button>
                ))}
              </div>
            </div>
          </Field>
        </div>

        {/* Taxas de mercado */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Taxas de Mercado</p>
          <Field label="Selic atual" hint="% a.a.">
            <RateInput value={input.selic} onChange={v => set({ selic: Math.max(v, 0.01) })} suffix="% a.a." />
          </Field>
          <Field label="IPCA esperado" hint="inflação">
            <RateInput value={input.ipca} onChange={v => set({ ipca: Math.max(v, 0) })} suffix="% a.a." />
          </Field>

          {/* Info box sobre regra da poupança */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
            <p className="text-xs font-semibold text-amber-800 mb-1">Regra da Poupança</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              {input.selic > 8.5
                ? <>Selic &gt; 8,5% → rendimento <strong>travado em 0,5% a.m.</strong> = ~6,17% a.a. + TR</>
                : <>Selic ≤ 8,5% → rende <strong>70% da Selic</strong> a.a.</>
              }
            </p>
          </div>
        </div>

        {/* Ativos comparados */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ativos Comparados</p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
              <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-900">Poupança</p>
                <p className="text-xs text-red-600">
                  {input.selic > 8.5 ? '0,5% a.m. + TR · isento IR' : `${(input.selic * 0.70).toFixed(2)}% a.a. · isento IR`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-900">Tesouro Selic</p>
                <p className="text-xs text-emerald-700">
                  {Math.max(input.selic - 0.20, 0).toFixed(2)}% a.a. bruto · IR 15%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-900">CDB 100% CDI</p>
                <p className="text-xs text-blue-700">
                  {Math.max(input.selic - 0.10, 0).toFixed(2)}% a.a. bruto · IR 15%
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
