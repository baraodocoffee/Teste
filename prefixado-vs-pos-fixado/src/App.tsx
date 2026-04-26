import { useState, useMemo } from 'react'
import { CalcInput, Scenario, calculate } from './utils/calc'
import InputPanel from './components/InputPanel'
import ScenarioTabs from './components/ScenarioTabs'
import BreakevenCard from './components/BreakevenCard'
import EvolutionChart from './components/EvolutionChart'
import ResultCards from './components/ResultCards'

const DEFAULT_INPUT: CalcInput = {
  principal: 50000,
  months: 24,
  prefixedRate: 13.5,
  scenario: 'moderado',
}

const SELIC_ATUAL = '14,75%'
const CDI_ATUAL = '14,65%'

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function App() {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT)
  const result = useMemo(() => calculate(input), [input])

  const hoje = formatDate(new Date())

  function handleScenario(s: Scenario) {
    setInput(prev => ({ ...prev, scenario: s }))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy border-b border-navy-dark shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-navy">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-base tracking-tight leading-none">
                  Prefixado vs Pós-fixado
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">Ganho com taxas prefixadas em cenário de queda de juros</p>
              </div>
            </div>
            <a href="../" className="text-xs text-slate-400 hover:text-gold transition-colors hidden sm:block">
              ← Início
            </a>
          </div>
        </div>
      </header>

      {/* Data de referência */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="text-xs text-slate-400">
            Dados em: <span className="font-medium text-slate-600">{hoje}</span>
          </span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">
            Selic: <span className="font-medium text-slate-600">{SELIC_ATUAL} a.a.</span>
          </span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">
            CDI: <span className="font-medium text-slate-600">{CDI_ATUAL} a.a.</span>
          </span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">
            Fonte: <span className="font-medium text-slate-500">COPOM · Relatório Focus/BCB</span>
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <InputPanel input={input} onChange={setInput} />
        <ScenarioTabs selected={input.scenario} onChange={handleScenario} />
        <BreakevenCard result={result} />
        <EvolutionChart points={result.points} />
        <ResultCards input={input} result={result} />
      </main>

      <footer className="max-w-5xl mx-auto px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Trajetória Selic baseada no Relatório Focus — BCB (abril/2026) · CDI projetado com spread de 0,10 p.p. abaixo da Selic ·
          IR pela tabela regressiva · Simulação educacional — não constitui recomendação de investimento.
        </p>
      </footer>
    </div>
  )
}
