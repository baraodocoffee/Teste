import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Label,
} from 'recharts'
import { SensitivityPoint, formatBRL, formatPct } from '../utils/calc'

interface Props {
  points: SensitivityPoint[]
  purchaseRate: number
  marketRate: number
  capital: number
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: number
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="text-slate-500 mb-1">Taxa de mercado: <span className="font-semibold text-slate-800">{formatPct(label ?? 0)}</span></p>
      <p className="text-slate-500">Valor da posição: <span className="font-semibold text-navy">{formatBRL(payload[0].value)}</span></p>
    </div>
  )
}

function formatK(v: number) {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`
  return `R$${(v / 1_000).toFixed(0)}K`
}

export default function SensitivityChart({ points, purchaseRate, marketRate, capital }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-navy mb-1">Sensibilidade ao juro — convexidade</h3>
      <p className="text-xs text-slate-400 mb-5">
        Valor da posição conforme a taxa de mercado varia · linha azul = taxa de compra · linha cinza = taxa atual
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={points} margin={{ top: 4, right: 16, left: 8, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="rate"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v.toFixed(1)}%`}
          >
            <Label value="Taxa de mercado (% a.a.)" position="insideBottom" offset={-12} style={{ fontSize: 11, fill: '#94A3B8' }} />
          </XAxis>
          <YAxis
            tickFormatter={formatK}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={purchaseRate}
            stroke="#1B3A5C"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: 'Compra', position: 'top', fontSize: 10, fill: '#1B3A5C' }}
          />
          <ReferenceLine
            x={parseFloat(marketRate.toFixed(2))}
            stroke="#64748B"
            strokeWidth={1.5}
            label={{ value: 'Hoje', position: 'top', fontSize: 10, fill: '#64748B' }}
          />
          <ReferenceLine y={capital} stroke="#B8973E" strokeDasharray="3 3" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1B3A5C"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#1B3A5C' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
