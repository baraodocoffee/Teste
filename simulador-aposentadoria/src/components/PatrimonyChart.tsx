import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { YearlySnapshot } from '../utils/calc'

interface Props {
  snapshots: YearlySnapshot[]
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

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const patrimony = payload.find(p => p.name === 'Patrimônio Total')
  const contributed = payload.find(p => p.name === 'Total Aportado')

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 min-w-[200px]">
      <p className="text-xs font-semibold text-slate-500 mb-3">{label} anos de idade</p>
      {patrimony && (
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-xs text-slate-500">Patrimônio</span>
          </div>
          <span className="text-xs font-bold text-navy">{formatBRL(patrimony.value)}</span>
        </div>
      )}
      {contributed && (
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-navy" />
            <span className="text-xs text-slate-500">Aportado</span>
          </div>
          <span className="text-xs font-semibold text-slate-700">{formatBRL(contributed.value)}</span>
        </div>
      )}
      {patrimony && contributed && (
        <>
          <div className="border-t border-slate-100 my-2" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">Rendimentos</span>
            <span className="text-xs font-semibold text-gold-dark">
              {formatBRL(patrimony.value - contributed.value)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

function CustomLegend() {
  return (
    <div className="flex items-center gap-6 justify-end pr-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-0.5 bg-gold rounded" />
        <span className="text-xs text-slate-500">Patrimônio Total</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 border-t-2 border-dashed border-navy/60" />
        <span className="text-xs text-slate-500">Total Aportado</span>
      </div>
    </div>
  )
}

export default function PatrimonyChart({ snapshots }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-navy font-semibold text-base">Evolução Patrimonial</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Projeção em valores reais — poder de compra de hoje
          </p>
        </div>
        <CustomLegend />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={snapshots} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B8973E" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#B8973E" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="age"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickFormatter={v => `${v}a`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickFormatter={formatAxis}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={() => null} />
          <Area
            type="monotone"
            dataKey="patrimony"
            name="Patrimônio Total"
            stroke="#B8973E"
            strokeWidth={2.5}
            fill="url(#goldGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#B8973E', strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="contributed"
            name="Total Aportado"
            stroke="#1B3A5C"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 4, fill: '#1B3A5C', strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
