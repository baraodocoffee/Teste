import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import { ConvergencePoint } from '../utils/calc'

interface Props {
  path: ConvergencePoint[]
  purchaseRate: number
  marketRate: number
}

interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="text-slate-500 font-medium mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-500">{p.name}</span>
          </div>
          <span className="font-semibold text-slate-800">
            R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ConvergenceChart({ path, purchaseRate, marketRate }: Props) {
  const todayPoint = path.find(p => p.isToday)

  // Show every other label on X to avoid crowding
  const ticks = path
    .filter((_, i) => i % 3 === 0 || i === path.length - 1)
    .map(p => p.label)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-navy mb-1">Convergência ao par — pull to par</h3>
      <p className="text-xs text-slate-400 mb-5">
        Ambas as curvas convergem a R$ 1.000 no vencimento · gap hoje = ganho/perda de marcação
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={path} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="label"
            ticks={ticks}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['auto', 1005]}
            tickFormatter={v => `R$${v.toFixed(0)}`}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={value => <span className="text-xs text-slate-600">{value}</span>}
          />
          {todayPoint && (
            <ReferenceLine
              x={todayPoint.label}
              stroke="#B8973E"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              label={{ value: 'Hoje', position: 'top', fontSize: 10, fill: '#B8973E' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="puNatural"
            name={`À taxa de compra (${purchaseRate.toFixed(2).replace('.', ',')}%)`}
            stroke="#1B3A5C"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="puMarket"
            name={`À taxa de mercado hoje (${marketRate.toFixed(2).replace('.', ',')}%)`}
            stroke="#64748B"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
