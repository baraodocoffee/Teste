import { CalcResult } from '../utils/calc'

interface Props { result: CalcResult }

function brl(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}

function MetricCard({ label, value, sub, variant = 'default' }: {
  label: string; value: string; sub?: string; variant?: 'default' | 'primary' | 'green'
}) {
  const styles = { default: 'bg-white border border-slate-200', primary: 'bg-navy', green: 'bg-emerald-600' }
  const textStyles = { default: 'text-navy', primary: 'text-white', green: 'text-white' }
  const labelStyles = { default: 'text-slate-500', primary: 'text-slate-300', green: 'text-emerald-100' }
  const subStyles = { default: 'text-slate-400', primary: 'text-slate-300', green: 'text-emerald-100' }
  return (
    <div className={`rounded-xl p-5 ${styles[variant]}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${labelStyles[variant]}`}>{label}</p>
      <p className={`text-2xl font-bold mt-1.5 leading-none ${textStyles[variant]}`}>{value}</p>
      {sub && <p className={`text-xs mt-2 ${subStyles[variant]}`}>{sub}</p>}
    </div>
  )
}

export default function ResultPanel({ result }: Props) {
  if (result.alreadyFree) {
    return (
      <div className="bg-emerald-600 rounded-2xl p-6 text-white text-center">
        <p className="text-4xl mb-2">🎉</p>
        <h2 className="text-xl font-bold">Você já é financeiramente independente!</h2>
        <p className="text-emerald-100 text-sm mt-2">
          Seu patrimônio de {brl(result.fireNumber)} já gera {brl(result.currentPassiveIncome)}/mês.
        </p>
      </div>
    )
  }

  const progressPct = result.currentProgress
  const notReachable = !result.reachable

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Número da Liberdade"
          value={brl(result.fireNumber)}
          sub="Patrimônio necessário pela regra dos 4%"
          variant="primary"
        />
        {result.reachable && result.yearsToFire !== null && result.ageAtFire !== null ? (
          <MetricCard
            label="Conquista em"
            value={`${result.yearsToFire} anos`}
            sub={`Aos ${result.ageAtFire} anos de idade`}
            variant="green"
          />
        ) : (
          <div className="rounded-xl p-5 bg-amber-50 border border-amber-200">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Situação</p>
            <p className="text-base font-bold mt-1.5 text-amber-700">Meta não atingida em 50 anos</p>
            <p className="text-xs mt-2 text-amber-600">Aumente o aporte mensal para viabilizar</p>
          </div>
        )}
        <MetricCard
          label="Renda passiva hoje"
          value={`${brl(result.currentPassiveIncome)}/mês`}
          sub="Gerada pelo patrimônio atual"
        />
        <MetricCard
          label="Rendimentos projetados"
          value={brl(result.totalReturns)}
          sub={`Sobre ${brl(result.totalContributed)} aportados`}
        />
      </div>

      {/* Barra de progresso */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Progresso Rumo à Liberdade</p>
          <span className="text-sm font-bold text-navy">{progressPct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${notReachable ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-400">R$ 0</span>
          <span className="text-xs text-slate-400">{brl(result.fireNumber)}</span>
        </div>
      </div>
    </div>
  )
}
