import { useState, useMemo } from 'react'
import InputPanel from './components/InputPanel'
import ImmediateResult from './components/ImmediateResult'
import LongTermResult from './components/LongTermResult'
import PGBLWarning from './components/PGBLWarning'
import Disclaimers from './components/Disclaimers'
import { calculate, PGBLInput } from './utils/calc'

const DEFAULT_INPUT: PGBLInput = {
  monthlyGross: 10000,
  pgblPct: 12,
  dependents: 0,
  healthAnnual: 0,
  educationAnnual: 0,
  years: 20,
  annualReturn: 10,
}

export default function App() {
  const [input, setInput] = useState<PGBLInput>(DEFAULT_INPUT)
  const result = useMemo(() => calculate(input), [input])

  const pgblNotRecommended = input.monthlyGross <= 7350

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy border-b border-navy-dark shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-navy">
                  <path d="M9 14l-4-4 4-4" />
                  <path d="M5 10h11a4 4 0 0 1 0 8h-1" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-base tracking-tight leading-none">
                  Simulador PGBL
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">Benefício fiscal na declaração completa do IR</p>
              </div>
            </div>
            <a href="../" className="text-xs text-slate-400 hover:text-gold transition-colors hidden sm:block">
              ← Início
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <InputPanel input={input} onChange={setInput} />

        <PGBLWarning monthlyGross={input.monthlyGross} />

        <ImmediateResult result={result} pgblPct={input.pgblPct} monthlyGross={input.monthlyGross} />

        {input.pgblPct > 0 && !pgblNotRecommended && (
          <LongTermResult result={result} years={input.years} annualReturn={input.annualReturn} />
        )}

        {input.pgblPct > 0 && pgblNotRecommended && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <p className="text-slate-500 text-sm font-medium">Projeção de longo prazo não exibida</p>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              O PGBL não é recomendado para esta faixa de renda. A projeção seria enganosa pois
              o custo tributário na saída tende a superar o benefício fiscal na entrada.
              Considere simular o VGBL ou outros investimentos de longo prazo.
            </p>
          </div>
        )}

        <Disclaimers />
      </main>

      <footer className="max-w-5xl mx-auto px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          PGBL é indicado para quem faz declaração completa do IR e recolhe INSS ou contribuição a regime próprio ·
          Simulação educacional — não constitui recomendação de investimento
        </p>
      </footer>
    </div>
  )
}
