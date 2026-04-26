import { CalcResult, formatPct } from '../utils/calc'

interface Props {
  result: CalcResult
}

export default function BreakevenCard({ result }: Props) {
  const { breakevenCDI, avgProjectedCDI, advantage } = result
  const gap = breakevenCDI - avgProjectedCDI
  const prefixadoVence = advantage > 0

  return (
    <div className={`rounded-2xl border-2 p-6 ${
      prefixadoVence
        ? 'border-navy/30 bg-navy/5'
        : 'border-slate-200 bg-slate-50'
    }`}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Taxa de breakeven
      </p>

      <p className="text-sm text-slate-600 mb-5 leading-relaxed">
        Para o <span className="font-semibold text-slate-800">pós-fixado vencer</span>, o CDI precisaria
        se manter em média acima de:
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">CDI médio necessário</p>
          <p className="text-3xl font-bold text-slate-800">{formatPct(breakevenCDI)}</p>
          <p className="text-xs text-slate-400 mt-1">ao ano, durante todo o período</p>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">CDI médio projetado</p>
          <p className={`text-3xl font-bold ${avgProjectedCDI < breakevenCDI ? 'text-red-500' : 'text-green-600'}`}>
            {formatPct(avgProjectedCDI)}
          </p>
          <p className="text-xs text-slate-400 mt-1">pelo cenário selecionado</p>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Diferença</p>
          <p className={`text-3xl font-bold ${gap > 0 ? 'text-navy' : 'text-slate-500'}`}>
            {gap > 0 ? '-' : '+'}{formatPct(Math.abs(gap))}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {gap > 0 ? 'abaixo do necessário' : 'acima do necessário'}
          </p>
        </div>
      </div>

      <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
        prefixadoVence
          ? 'bg-navy text-white'
          : 'bg-green-600 text-white'
      }`}>
        {prefixadoVence
          ? `O prefixado vence neste cenário: o CDI projetado fica ${formatPct(gap)} abaixo do breakeven.`
          : `O pós-fixado vence neste cenário: o CDI projetado supera o breakeven em ${formatPct(Math.abs(gap))}.`
        }
      </div>
    </div>
  )
}
