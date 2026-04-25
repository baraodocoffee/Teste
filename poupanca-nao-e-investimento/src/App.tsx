import { useState, useMemo } from 'react'
import InputPanel from './components/InputPanel'
import EvolutionChart from './components/EvolutionChart'
import ResultPanel from './components/ResultPanel'
import { calculate, SavingsInput } from './utils/calc'

const DEFAULT_INPUT: SavingsInput = {
  principal: 10000,
  monthlyContrib: 0,
  years: 10,
  selic: 14.75,
  ipca: 4.5,
}

export default function App() {
  const [input, setInput] = useState<SavingsInput>(DEFAULT_INPUT)
  const result = useMemo(() => calculate(input), [input])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy border-b border-navy-dark shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-navy">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-base tracking-tight leading-none">
                  Poupança não é Investimento
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">Veja quanto você perde mantendo dinheiro na poupança</p>
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
        <EvolutionChart snapshots={result.snapshots} />
        <ResultPanel result={result} input={input} />
      </main>

      <footer className="max-w-5xl mx-auto px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Comparativo educacional · Poupança vs renda fixa de baixo risco ·
          Valores nominais · IR 15% sobre ganhos (LP) · Não constitui recomendação de investimento.
        </p>
      </footer>
    </div>
  )
}
