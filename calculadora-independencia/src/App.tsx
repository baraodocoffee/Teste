import { useState, useMemo } from 'react'
import InputPanel from './components/InputPanel'
import ResultPanel from './components/ResultPanel'
import TimelineChart from './components/TimelineChart'
import { calculate, CalcInput } from './utils/calc'

const DEFAULT_INPUT: CalcInput = {
  currentAge: 35,
  currentPatrimony: 50000,
  monthlyContribution: 2000,
  desiredMonthlyIncome: 10000,
  profile: 'moderado',
}

export default function App() {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT)
  const result = useMemo(() => calculate(input), [input])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy border-b border-navy-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-navy">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-base tracking-tight leading-none">
                  Calculadora de Independência Financeira
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">Descubra quando você pode parar de trabalhar</p>
              </div>
            </div>
            <a href="../" className="text-xs text-slate-400 hover:text-gold transition-colors hidden sm:block">
              ← Início
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <InputPanel input={input} onChange={setInput} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ResultPanel result={result} />
            <TimelineChart snapshots={result.snapshots} fireNumber={result.fireNumber} ageAtFire={result.ageAtFire} />
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Cálculo baseado na Regra dos 4% (Trinity Study) · Retornos reais acima da inflação ·
          Conservador 4% · Moderado 6% · Arrojado 8% a.a.
        </p>
      </footer>
    </div>
  )
}
