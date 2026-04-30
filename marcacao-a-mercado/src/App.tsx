import { useState, useMemo } from 'react'
import { CalcInput, calculate } from './utils/calc'
import InputPanel from './components/InputPanel'
import MetricsCards from './components/MetricsCards'
import SensitivityChart from './components/SensitivityChart'
import ConvergenceChart from './components/ConvergenceChart'

const DEFAULT_INPUT: CalcInput = {
  ltnId: 'jan27',
  purchaseDate: new Date(2025, 9, 27), // 27/out/2025
  purchaseRate: 14.25,
  marketRate: 13.00,
  capital: 50000,
}

const SELIC_ATUAL = '14,50%'
const CDI_ATUAL = '14,40%'

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function App() {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT)
  const result = useMemo(() => calculate(input), [input])
  const hoje = formatDate(new Date())

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy border-b border-navy-dark shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-navy">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-4 4 4 5-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-base tracking-tight leading-none">
                  Marcação a Mercado — LTN
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">Ganho de capital antes do vencimento em cenário de queda de juros</p>
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
            Convenção: <span className="font-medium text-slate-500">du/252 · Calendário ANBIMA</span>
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <InputPanel input={input} onChange={setInput} />

        {result ? (
          <>
            <MetricsCards result={result} purchaseRate={input.purchaseRate} />
            <SensitivityChart
              points={result.sensitivityPoints}
              purchaseRate={input.purchaseRate}
              marketRate={input.marketRate}
              capital={input.capital}
            />
            <ConvergenceChart
              path={result.convergencePath}
              purchaseRate={input.purchaseRate}
              marketRate={input.marketRate}
            />
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-amber-700 font-medium">
              Verifique os parâmetros — o título selecionado pode ter vencido ou a data de compra é inválida.
            </p>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Precificação pela convenção du/252 (BM&F/ANBIMA) · Calendário de feriados nacionais com feriados móveis calculados via Algoritmo de Meeus ·
          IR pela tabela regressiva · Simulação educacional — não constitui recomendação de investimento.
        </p>
      </footer>
    </div>
  )
}
