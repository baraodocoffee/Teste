import { useState, useEffect } from 'react'
import { CalcInput, InvestorProfile, PROFILE_CONFIG } from '../utils/calc'

interface Props {
  input: CalcInput
  onChange: (input: CalcInput) => void
}

const PROFILE_KEYS: InvestorProfile[] = ['conservador', 'moderado', 'arrojado']

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
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">R$</span>
      <input
        type="number"
        min={0}
        step={500}
        value={value}
        onChange={e => onChange(Math.max(parseFloat(e.target.value) || 0, 0))}
        className={`${inputClass} pl-9`}
      />
    </div>
  )
}

export default function InputPanel({ input, onChange }: Props) {
  const set = (partial: Partial<CalcInput>) => onChange({ ...input, ...partial })

  const [ageDisplay, setAgeDisplay] = useState(String(input.currentAge))

  useEffect(() => {
    setAgeDisplay(String(input.currentAge))
  }, [input.currentAge])

  const handleAgeBlur = () => {
    const parsed = parseInt(ageDisplay)
    if (isNaN(parsed)) { setAgeDisplay(String(input.currentAge)); return }
    set({ currentAge: Math.max(18, Math.min(parsed, 80)) })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-navy font-semibold text-base">Seus Dados</h2>
        <p className="text-slate-400 text-xs mt-0.5">Preencha para descobrir sua data de liberdade</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Situação Atual</p>
        <Field label="Idade atual">
          <input
            type="number"
            min={18}
            max={80}
            value={ageDisplay}
            onChange={e => setAgeDisplay(e.target.value)}
            onBlur={handleAgeBlur}
            className={inputClass}
          />
        </Field>
        <Field label="Patrimônio investido hoje (R$)">
          <MoneyInput value={input.currentPatrimony} onChange={v => set({ currentPatrimony: v })} />
        </Field>
        <Field label="Quanto você poupa por mês (R$)">
          <MoneyInput value={input.monthlyContribution} onChange={v => set({ monthlyContribution: v })} />
        </Field>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sua Meta</p>
        <Field label="Renda mensal desejada na independência (R$)">
          <MoneyInput value={input.desiredMonthlyIncome} onChange={v => set({ desiredMonthlyIncome: Math.max(v, 1) })} />
        </Field>
        <div className="bg-slate-50 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">Patrimônio necessário (regra dos 4%)</span>
          <span className="text-xs font-semibold text-navy">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(
              (input.desiredMonthlyIncome * 12) / 0.04
            )}
          </span>
        </div>
      </div>

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
                  selected ? 'border-navy/30 bg-navy/5 ring-1 ring-navy/15' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${selected ? 'text-navy' : 'text-slate-700'}`}>{p.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.sublabel}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${selected ? 'bg-navy text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {p.returnLabel}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
        Retornos em termos reais (acima da inflação). Simulação educacional — não constitui recomendação de investimento.
      </p>
    </div>
  )
}
