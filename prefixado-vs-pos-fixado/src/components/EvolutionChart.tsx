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
import { MonthlyPoint, formatBRL } from '../utils/calc'

interface Props {
  points: MonthlyPoint[]
}

function formatAxis(value: number): string {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$${(value / 1_000).toFixed(0)}K`
  return `R$${value}`
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="text-xs text-slate-500 font-medium mb-2">{label}</p>
      {payload.map(item => (
        <div key={item.name} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-slate-600 text-xs">{item.name}</span>
          </div>
          <span className="font-semibold text-slate-800 text-xs">{formatBRL(item.value)}</span>
        </div>
      ))}
    </div>
  )
}

// Show a tick every semester (6 months) to avoid clutter
function tickFilter(points: MonthlyPoint[]) {
  return points
    .filter(p => p.month % 6 === 0 || p.month === 1)
    .map(p => p.label)
}

export default function EvolutionChart({ points }: Props) {
  const ticks = tickFilter(points)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-navy mb-1">Evolução do saldo líquido</h3>
      <p className="text-xs text-slate-400 mb-5">Valores após IR pela tabela regressiva · em R$</p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={points} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="label"
            ticks={ticks}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAxis}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="prefixedNet"
            name="Prefixado"
            stroke="#1B3A5C"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#1B3A5C' }}
          />
          <Line
            type="monotone"
            dataKey="posFixadoNet"
            name="Pós-fixado CDI"
            stroke="#94A3B8"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4, fill: '#94A3B8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
