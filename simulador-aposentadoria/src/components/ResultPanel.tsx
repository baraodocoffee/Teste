import { SimulationResult, SimulationInput } from '../utils/calc'

interface Props {
  result: SimulationResult
  input: SimulationInput
}

function brl(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function MetricCard({
  label,
  value,
  sub,
  variant = 'default',
}: {
  label: string
  value: string
  sub?: string
  variant?: 'default' | 'primary' | 'gold'
}) {
  const styles = {
    default: 'bg-white border border-slate-200 text-navy',
    primary: 'bg-navy text-white',
    gold: 'bg-gradient-to-br from-gold-dark to-gold border border-gold/20 text-white',
  }
  const labelStyles = {
    default: 'text-slate-500',
    primary: 'text-slate-300',
    gold: 'text-yellow-100',
  }
  const subStyles = {
    default: 'text-slate-400',
    primary: 'text-slate-300',
    gold: 'text-yellow-100',
  }

  return (
    <div className={`rounded-xl p-5 ${styles[variant]}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${labelStyles[variant]}`}>{label}</p>
      <p className="text-2xl font-bold mt-1.5 leading-none">{value}</p>
      {sub && <p className={`text-xs mt-2 ${subStyles[variant]}`}>{sub}</p>}
    </div>
  )
}

export default function ResultPanel({ result, input }: Props) {
  const contributedPct = Math.round((result.totalContributed / result.finalPatrimony) * 100)
  const returnsPct = 100 - contributedPct
  const multiplier = (result.finalPatrimony / result.totalContributed).toFixed(1)

  return (
    <div className="space-y-4">
      {/* Principais métricas */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Patrimônio na aposentadoria"
          value={brl(result.finalPatrimony)}
          sub={`Em valores reais — poder de compra de hoje`}
          variant="primary"
        />
        <MetricCard
          label="Renda mensal passiva"
          value={brl(result.monthlyPassiveIncome)}
          sub={`Pela regra dos 4% ao ano`}
          variant="gold"
        />
        <MetricCard
          label="Total aportado"
          value={brl(result.totalContributed)}
          sub={`Em ${input.retirementAge - input.currentAge} anos de disciplina`}
        />
        <MetricCard
          label="Rendimentos gerados"
          value={brl(result.totalReturns)}
          sub={`Capital multiplicado por ${multiplier}×`}
        />
      </div>

      {/* Composição */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">
          Composição do Patrimônio Final
        </p>
        <div className="flex rounded-full overflow-hidden h-2.5">
          <div
            className="bg-navy transition-all duration-500"
            style={{ width: `${contributedPct}%` }}
          />
          <div
            className="bg-gold transition-all duration-500"
            style={{ width: `${returnsPct}%` }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-navy flex-shrink-0" />
            <span className="text-xs text-slate-600">
              Aportes: <span className="font-semibold">{contributedPct}%</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0" />
            <span className="text-xs text-slate-600">
              Rendimentos: <span className="font-semibold">{returnsPct}%</span>
            </span>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-slate-400">
              Retorno real: <span className="font-semibold text-slate-600">{(result.annualRealReturn * 100).toFixed(0)}% a.a.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
