import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { YearlySnapshot, MonthlySnapshot } from '../utils/calc'

interface Props {
  snapshots: YearlySnapshot[]
  monthlySnapshots: MonthlySnapshot[]
  years: number
}

function formatAxis(value: number): string {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$${(value / 1_000).toFixed(0)}K`
  return `R$${value}`
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

interface TooltipItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipItem[]
  label?: number
  monthly?: boolean
}

function CustomTooltip({ active, payload, label, monthly }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const order = ['CDB 100% CDI', 'Tesouro Selic', 'Poupança', 'Total Aportado']
  const sorted = [...payload].sort(
    (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
  )

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 min-w-[210px]">
      <p className="text-xs font-semibold text-slate-500 mb-3">
        {monthly ? `Mês ${label}` : `Ano ${label}`}
      </p>
      {sorted.map(item => (
        <div key={item.name} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-xs text-slate-500">{item.name}</span>
          </div>
          <span className="text-xs font-bold text-slate-700">{formatBRL(item.value)}</span>
        </div>
      ))}
    </div>
  )
}

function ChartLegend() {
  const items = [
    { label: 'CDB 100% CDI', color: '#3B82F6' },
    { label: 'Tesouro Selic', color: '#10B981' },
    { label: 'Poupança', color: '#EF4444' },
    { label: 'Total aportado', color: '#94A3B8', dashed: true },
  ]
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 justify-end pr-1">
      {items.map(it => (
        <div key={it.label} className="flex items-center gap-1.5">
          {it.dashed
            ? <div className="w-7 border-t-2 border-dashed" style={{ borderColor: it.color }} />
            : <div className="w-7 h-0.5 rounded" style={{ background: it.color }} />
          }
          <span className="text-xs text-slate-500">{it.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function EvolutionChart({ snapshots, monthlySnapshots, years }: Props) {
  const useMonthly = years < 5
  const data = useMonthly ? monthlySnapshots : snapshots
  const dataKey = useMonthly ? 'month' : 'year'

  // Ticks mensais: a cada 3 meses para prazos curtos, a cada 6 para prazos > 2 anos
  const monthlyTicks = useMonthly
    ? monthlySnapshots
        .filter(s => s.month % (years <= 2 ? 3 : 6) === 0)
        .map(s => s.month)
    : undefined

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-navy font-semibold text-base">Evolução Patrimonial</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Saldo líquido (após IR) · Valores nominais ·{' '}
            {useMonthly ? 'escala mensal' : 'escala anual'}
          </p>
        </div>
        <ChartLegend />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey={dataKey}
            ticks={monthlyTicks}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickFormatter={v => useMonthly ? `M${v}` : `${v}a`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickFormatter={formatAxis}
            width={75}
          />
          <Tooltip content={<CustomTooltip monthly={useMonthly} />} />
          <Legend content={() => null} />
          <Line
            type="monotone"
            dataKey="contributed"
            name="Total Aportado"
            stroke="#94A3B8"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 4, fill: '#94A3B8', strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="poupanca"
            name="Poupança"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#EF4444', strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="tesouroSelic"
            name="Tesouro Selic"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#10B981', strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="cdb"
            name="CDB 100% CDI"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#3B82F6', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
