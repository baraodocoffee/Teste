import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { YearlySnapshot } from '../utils/calc'

interface Props {
  snapshots: YearlySnapshot[]
  fireNumber: number
  ageAtFire: number | null
}

function formatAxis(value: number): string {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$${(value / 1_000).toFixed(0)}K`
  return `R$${value}`
}

function brl(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}

interface TooltipItem { name: string; value: number; color: string }
interface TooltipProps { active?: boolean; payload?: TooltipItem[]; label?: number }

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  const patrimony = payload.find(p => p.name === 'Patrimônio')
  const contributed = payload.find(p => p.name === 'Aportado')
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 min-w-[190px]">
      <p className="text-xs font-semibold text-slate-500 mb-3">{label} anos de idade</p>
      {patrimony && (
        <div className="flex justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-xs text-slate-500">Patrimônio</span>
          </div>
          <span className="text-xs font-bold text-navy">{brl(patrimony.value)}</span>
        </div>
      )}
      {contributed && (
        <div className="flex justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-navy" />
            <span className="text-xs text-slate-500">Aportado</span>
          </div>
          <span className="text-xs font-semibold text-slate-700">{brl(contributed.value)}</span>
        </div>
      )}
    </div>
  )
}

export default function TimelineChart({ snapshots, fireNumber, ageAtFire }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-navy font-semibold text-base">Trajetória até a Independência</h2>
          <p className="text-slate-400 text-xs mt-0.5">Projeção em valores reais — poder de compra de hoje</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gold rounded" />
            <span className="text-xs text-slate-500">Patrimônio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 border-t-2 border-dashed border-navy/60" />
            <span className="text-xs text-slate-500">Aportado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 border-t-2 border-dashed border-emerald-500" />
            <span className="text-xs text-slate-500">Meta FIRE</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={snapshots} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B8973E" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#B8973E" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `${v}a`} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={formatAxis} width={80} />
          <Tooltip content={<CustomTooltip />} />

          {/* Linha horizontal da meta FIRE */}
          <ReferenceLine y={fireNumber} stroke="#059669" strokeDasharray="6 4" strokeWidth={2} />

          {/* Linha vertical no ano da independência */}
          {ageAtFire && (
            <ReferenceLine
              x={ageAtFire}
              stroke="#059669"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: '🏁', position: 'top', fontSize: 14 }}
            />
          )}

          <Area type="monotone" dataKey="patrimony" name="Patrimônio" stroke="#B8973E" strokeWidth={2.5} fill="url(#goldGrad)" dot={false} activeDot={{ r: 5, fill: '#B8973E', strokeWidth: 0 }} />
          <Line type="monotone" dataKey="contributed" name="Aportado" stroke="#1B3A5C" strokeWidth={1.5} strokeDasharray="6 4" dot={false} activeDot={{ r: 4, fill: '#1B3A5C', strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
