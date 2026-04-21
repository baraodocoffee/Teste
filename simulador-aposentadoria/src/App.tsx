import { useState, useEffect } from 'react'
import InputPanel from './components/InputPanel'
import ResultPanel from './components/ResultPanel'
import PatrimonyChart from './components/PatrimonyChart'
import { simulate, SimulationInput, SimulationResult } from './utils/calc'

const DEFAULT_INPUT: SimulationInput = {
  currentAge: 35,
  retirementAge: 60,
  currentPatrimony: 50000,
  monthlyContribution: 2000,
  profile: 'moderado',
}

export default function App() {
  const [input, setInput] = useState<SimulationInput>(DEFAULT_INPUT)
  const [result, setResult] = useState<SimulationResult>(() => simulate(DEFAULT_INPUT))

  useEffect(() => {
    setResult(simulate(input))
  }, [input])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-navy border-b border-navy-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-4 h-4 text-navy"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-semibold text-base tracking-tight leading-none">
                Simulador de Aposentadoria
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">Planejamento Financeiro Pessoal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Input panel */}
          <div className="lg:col-span-1">
            <InputPanel input={input} onChange={setInput} />
          </div>

          {/* Results + Chart */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ResultPanel result={result} input={input} />
            <PatrimonyChart snapshots={result.snapshots} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Simulação com retornos reais (acima da inflação) · Regra dos 4% para renda passiva ·
          Valores de referência: Conservador 4% a.a. · Moderado 6% a.a. · Arrojado 8% a.a.
        </p>
      </footer>
    </div>
  )
}
