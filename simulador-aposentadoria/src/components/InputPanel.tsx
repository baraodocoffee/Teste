import { useState, useEffect } from 'react'
import { SimulationInput, InvestorProfile, PROFILE_CONFIG } from '../utils/calc'

interface Props {
  input: SimulationInput
  onChange: (input: SimulationInput) => void
}

const PROFILE_KEYS: InvestorProfile[] = ['conservador', 'moderado', 'arrojado']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors'

function MoneyInput({ value, onChange, step = 1000 }: { value: number; onChange: (v: number) => void; step?: number }) {
  const [display, setDisplay] = useState(String(value))

  useEffect(() => {
    setDisplay(String(value))
  }, [value])

  const handleBlur = () => {
    const parsed = parseFloat(display)
    const next = isNaN(parsed) ? 0 : Math.max(parsed, 0)
    onChange(next)
    setDisplay(String(next))
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
        R$
      </span>
      <input
        type="number"
        min={0}
        step={step}
        value={display}
        onChange={e => setDisplay(e.target.value)}
        onBlur={handleBlur}
        className={`${inputClass} pl-9`}
      />
    </div>
  )
}

export default function InputPanel({ input, onChange }: Props) {
  const set = (partial: Partial<SimulationInput>) => onChange({ ...input, ...partial })

  const [ages, setAges] = useState({
    currentAge: String(input.currentAge),
    retirementAge: String(input.retirementAge),
  })

  useEffect(() => {
    setAges({
      currentAge: String(input.currentAge),
      retirementAge: String(input.retirementAge),
    })
  }, [input.currentAge, input.retirementAge])

  const handleAgeBlur = (field: 'currentAge' | 'retirementAge') => {
    const raw = ages[field]
    const parsed = parseInt(raw)
    if (isNaN(parsed)) {
      setAges(prev => ({ ...prev, [field]: String(input[field]) }))
      return
    }
    if (field === 'currentAge') {
      const clamped = Math.max(18, Math.min(parsed, 99))
      const retirementAge = Math.max(input.retirementAge, clamped + 1)
      set({ currentAge: clamped, retirementAge })
    } else {
      const clamped = Math.max(input.currentAge + 1, Math.min(parsed, 100))
      set({ retirementAge: clamped })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-navy font-semibold text-base">Seus Dados</h2>
        <p className="text-slate-400 text-xs mt-0.5">Preencha para simular sua aposentadoria</p>
      </div>

      {/* Período */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Período</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Idade atual">
            <input
              type="number"
              min={18}
              max={99}
              value={ages.currentAge}
              onChange={e => setAges(prev => ({ ...prev, currentAge: e.target.value }))}
              onBlur={() => handleAgeBlur('currentAge')}
              className={inputClass}
            />
          </Field>
          <Field label="Aposentadoria">
            <input
              type="number"
              min={input.currentAge + 1}
              max={100}
              value={ages.retirementAge}
              onChange={e => setAges(prev => ({ ...prev, retirementAge: e.target.value }))}
              onBlur={() => handleAgeBlur('retirementAge')}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
          <span className="text-xs text-slate-500">Prazo de acumulação</span>
          <span className="text-xs font-semibold text-navy">
            {input.retirementAge - input.currentAge} anos
          </span>
        </div>
      </div>

      {/* Valores */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Valores</p>
        <Field label="Patrimônio atual (R$)">
          <MoneyInput
            value={input.currentPatrimony}
            onChange={v => set({ currentPatrimony: v })}
            step={1000}
          />
        </Field>
        <Field label="Aporte mensal (R$)">
          <MoneyInput
            value={input.monthlyContribution}
            onChange={v => set({ monthlyContribution: v })}
            step={100}
          />
        </Field>
      </div>

      {/* Perfil */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Perfil de Investidor</p>
        <div className="space-y-2">
          {PROFILE_KEYS.map(key => {
            const p = PROFILE_CONFIG[key]
            const selected = input.profile === key
            return (
              <button
                key={key}
                onClick={() => set({ profile: key })}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-150 ${
                  selected
                    ? 'border-navy/30 bg-navy/5 ring-1 ring-navy/15'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${selected ? 'text-navy' : 'text-slate-700'}`}>
                      {p.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.sublabel}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      selected ? 'bg-navy text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.returnLabel}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
        Retornos em termos reais (acima da inflação). Simulação de caráter educacional — não constitui recomendação de investimento.
      </p>
    </div>
  )
}
