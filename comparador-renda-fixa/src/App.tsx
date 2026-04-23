import { useState, useMemo } from 'react'
import InputPanel from './components/InputPanel'
import ResultCards from './components/ResultCards'
import { calculate, ComparatorInput } from './utils/calc'

const DEFAULT_INPUT: ComparatorInput = {
  principal: 10000,
  days: 365,
  cdiRate: 14.75,
  cdbRateType: 'cdi',
  cdbRate: 100,
  lciLcaRateType: 'cdi',
  lciLcaRate: 90,
  lciLcaLabel: 'LCI',
}

export default function App() {
  const [input, setInput] = useState<ComparatorInput>(DEFAULT_INPUT)
  const result = useMemo(() => calculate(input), [input])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy border-b border-navy-dark shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-navy">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-base tracking-tight leading-none">
                  Comparador de Renda Fixa
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">CDB × LCI × LCA — tributado vs isento</p>
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
        <ResultCards result={result} input={input} />
      </main>

      <footer className="max-w-5xl mx-auto px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Tributação por dias corridos conforme tabela regressiva do IR · LCI e LCA isentas de IR para PF ·
          Simulação educacional — não constitui recomendação de investimento.
        </p>
      </footer>
    </div>
  )
}
