import { useState, useEffect } from 'react'
import { PGBLInput } from '../utils/calc'

interface Props {
  input: PGBLInput
  onChange: (v: PGBLInput) => void
}

function MoneyInput({ value, onCommit, label }: {
  value: number
  onCommit: (v: number) => void
  label: string
}) {
  const [display, setDisplay] = useState(value === 0 ? '' : value.toFixed(2).replace('.', ','))

  useEffect(() => {
    setDisplay(value === 0 ? '' : value.toFixed(2).replace('.', ','))
  }, [value])

  const handleBlur = () => {
    const parsed = parseFloat(display.replace(/\./g, '').replace(',', '.'))
    const safe = isNaN(parsed) || parsed < 0 ? 0 : parsed
    onCommit(safe)
    setDisplay(safe === 0 ? '' : safe.toFixed(2).replace('.', ','))
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onChange={e => setDisplay(e.target.value)}
          onBlur={handleBlur}
          placeholder="0,00"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition"
        />
      </div>
    </div>
  )
}

function DependentsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">Dependentes</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 text-lg font-medium hover:bg-slate-50 transition flex items-center justify-center select-none"
        >
          −
        </button>
        <div className="flex-1 h-10 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm font-semibold flex items-center justify-center">
          {value}
        </div>
        <button
          onClick={() => onChange(Math.min(10, value + 1))}
          className="w-9 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 text-lg font-medium hover:bg-slate-50 transition flex items-center justify-center select-none"
        >
          +
        </button>
      </div>
      {value > 0 && (
        <p className="text-xs text-slate-400">
          = {(value * 2275.08).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano deduzidos
        </p>
      )}
    </div>
  )
}

const PROFILES = [
  { label: 'Conservador', value: 10 },
  { label: 'Moderado', value: 12 },
  { label: 'Arrojado', value: 14 },
]

const HORIZONTE_OPTIONS = [10, 20, 30]

export default function InputPanel({ input, onChange }: Props) {
  const [returnDisplay, setReturnDisplay] = useState(String(input.annualReturn))

  useEffect(() => {
    setReturnDisplay(String(input.annualReturn))
  }, [input.annualReturn])

  const set = (patch: Partial<PGBLInput>) => onChange({ ...input, ...patch })

  const pgblMensal = (input.monthlyGross * input.pgblPct) / 100
  const pgblAnual = pgblMensal * 12

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      <h2 className="text-base font-semibold text-navy">Parâmetros da Simulação</h2>

      {/* Renda bruta — linha dedicada */}
      <MoneyInput
        label="Renda bruta mensal"
        value={input.monthlyGross}
        onCommit={v => set({ monthlyGross: v })}
      />

      {/* Deduções — 3 colunas alinhadas */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
          Deduções (Declaração Completa)
        </p>
        <div className="grid grid-cols-3 gap-4 items-start">
          <DependentsInput
            value={input.dependents}
            onChange={v => set({ dependents: v })}
          />
          <MoneyInput
            label="Saúde (anual)"
            value={input.healthAnnual}
            onCommit={v => set({ healthAnnual: v })}
          />
          <MoneyInput
            label="Educação (anual)"
            value={input.educationAnnual}
            onCommit={v => set({ educationAnnual: v })}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Saúde: sem limite · Educação: até R$ 3.561,50 por pessoa · Dependentes: R$ 2.275,08/dep.
        </p>
      </div>

      {/* PGBL Slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-slate-700">Contribuição PGBL</label>
          <span className="text-sm font-semibold text-navy">{input.pgblPct.toFixed(1)}% da renda bruta</span>
        </div>
        <input
          type="range"
          min={0}
          max={12}
          step={0.5}
          value={input.pgblPct}
          onChange={e => set({ pgblPct: parseFloat(e.target.value) })}
          className="w-full accent-gold"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>0%</span>
          <span className="text-gold font-medium">máximo dedutível: 12%</span>
        </div>
        {input.pgblPct > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            = <span className="font-medium text-navy">
              {pgblMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
            </span>
            {' '}·{' '}
            <span className="font-medium text-navy">
              {pgblAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano
            </span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
        {/* Horizonte */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Horizonte de acumulação</label>
          <div className="flex gap-2">
            {HORIZONTE_OPTIONS.map(y => (
              <button
                key={y}
                onClick={() => set({ years: y })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  input.years === y
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-navy/40'
                }`}
              >
                {y} anos
              </button>
            ))}
          </div>
        </div>

        {/* Rentabilidade */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Rentabilidade anual estimada</label>
          <div className="flex gap-2">
            {PROFILES.map(p => (
              <button
                key={p.label}
                onClick={() => {
                  set({ annualReturn: p.value })
                  setReturnDisplay(String(p.value))
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                  input.annualReturn === p.value
                    ? 'bg-gold text-navy border-gold'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-gold/60'
                }`}
              >
                {p.label}
                <span className="block text-[10px] opacity-70">{p.value}%</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={returnDisplay}
              onChange={e => setReturnDisplay(e.target.value)}
              onBlur={() => {
                const parsed = parseFloat(returnDisplay.replace(',', '.'))
                const safe = isNaN(parsed) || parsed <= 0 ? 10 : Math.min(parsed, 50)
                set({ annualReturn: safe })
                setReturnDisplay(String(safe))
              }}
              className="w-full pr-8 pl-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
