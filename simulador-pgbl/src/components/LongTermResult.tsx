import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { PGBLResult } from '../utils/calc'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`
  return fmt(v)
}

interface Props {
  result: PGBLResult
  years: number
  annualReturn: number
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: number
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-semibold text-slate-700 mb-2">Ano {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-semibold text-slate-800">{fmt(p.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between gap-4">
          <span className="text-slate-500">Vantagem PGBL</span>
          <span className="font-semibold text-amber-600">{fmt(payload[0].value - payload[1].value)}</span>
        </div>
      )}
    </div>
  )
}

export default function LongTermResult({ result, years, annualReturn }: Props) {
  const { longTerm, final, pgblContribAnual, annualTaxSaving } = result

  const chartData = longTerm.map(p => ({
    year: p.year,
    'Com PGBL': Math.round(p.comPGBL),
    'Sem PGBL': Math.round(p.semPGBL),
  }))

  const diff = final.comPGBL.totalNet - final.semPGBL.net
  const diffPct = final.semPGBL.net > 0 ? (diff / final.semPGBL.net) * 100 : 0

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-navy">Projeção de Longo Prazo — {years} anos</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aportes de {fmt(pgblContribAnual)}/ano · Rentabilidade {annualReturn}% a.a.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Economia de IR reinvestida</p>
            <p className="text-sm font-semibold text-navy">{fmt(annualTaxSaving)}/ano</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={v => `${v}a`}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={fmtShort}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value) => <span className="text-slate-600">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="Com PGBL"
              stroke="#B8973E"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Sem PGBL"
              stroke="#1B3A5C"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 3"
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resumo final */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Com PGBL */}
        <div className="bg-amber-50 border border-gold/40 rounded-xl p-5">
          <p className="text-xs font-semibold text-navy uppercase tracking-wide mb-3">Com PGBL — após {years} anos</p>
          <div className="space-y-2 text-sm">
            <FinalRow label="Patrimônio PGBL (bruto)" value={fmt(final.comPGBL.pgblGross)} />
            <FinalRow
              label={`IR na saída (alíq. efetiva ${(final.comPGBL.effectiveRate * 100).toFixed(1)}%)`}
              value={`– ${fmt(final.comPGBL.pgblTax)}`}
              red
            />
            <FinalRow label="Líquido PGBL" value={fmt(final.comPGBL.pgblNet)} />
            {annualTaxSaving > 0 && (
              <>
                <div className="border-t border-amber-200 my-1" />
                <FinalRow label="Economia de IR acumulada (bruto)" value={fmt(final.comPGBL.savingsGross)} muted />
                <FinalRow label="Líquido economias (IR 15% ganhos)" value={fmt(final.comPGBL.savingsNet)} muted />
              </>
            )}
            <div className="border-t border-amber-200 pt-2 mt-2">
              <FinalRow label="Patrimônio líquido total" value={fmt(final.comPGBL.totalNet)} bold />
            </div>
          </div>
        </div>

        {/* Sem PGBL */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Sem PGBL — após {years} anos</p>
          <div className="space-y-2 text-sm">
            <FinalRow label="Patrimônio bruto" value={fmt(final.semPGBL.gross)} />
            <FinalRow label="IR sobre ganhos (15%)" value={`– ${fmt(final.semPGBL.tax)}`} red />
            <div className="border-t border-slate-200 pt-2 mt-1">
              <FinalRow label="Patrimônio líquido" value={fmt(final.semPGBL.net)} bold />
            </div>
          </div>

          {diff > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Vantagem do PGBL</p>
              <p className="text-xl font-bold text-gold">{fmt(diff)}</p>
              <p className="text-xs text-slate-400">+{diffPct.toFixed(1)}% a mais no bolso</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FinalRow({ label, value, bold, red, muted }: {
  label: string
  value: string
  bold?: boolean
  red?: boolean
  muted?: boolean
}) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? 'font-semibold' : ''}`}>
      <span className={muted ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
      <span className={red ? 'text-red-500' : bold ? 'text-navy' : 'text-slate-800'}>{value}</span>
    </div>
  )
}
