import { CalcInput, CalcResult, formatBRL, formatPct } from '../utils/calc'

interface Props {
  input: CalcInput
  result: CalcResult
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? 'text-navy' : 'text-slate-700'}`}>{value}</span>
    </div>
  )
}

interface CardProps {
  title: string
  subtitle: string
  gross: number
  net: number
  principal: number
  irAliquot: number
  isExempt?: boolean
  winner: boolean
}

function InstrumentCard({ title, subtitle, gross, net, principal, irAliquot, isExempt, winner }: CardProps) {
  const grossGain = gross - principal
  const irAmount = grossGain * irAliquot
  const netReturn = ((net / principal) - 1) * 100

  return (
    <div className={`rounded-2xl border-2 p-5 ${
      winner
        ? 'border-navy bg-navy/5'
        : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isExempt && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              ISENTO IR
            </span>
          )}
          {winner && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy text-white">
              VENCEDOR
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-500">Saldo líquido final</p>
        <p className={`text-2xl font-bold mt-0.5 ${winner ? 'text-navy' : 'text-slate-700'}`}>
          {formatBRL(net)}
        </p>
      </div>

      <div className="space-y-0">
        <Row label="Saldo bruto" value={formatBRL(gross)} />
        {isExempt
          ? <Row label="IR" value="Isento de IR (PF)" />
          : <Row label={`IR (${formatPct(irAliquot * 100, 1)})`} value={`- ${formatBRL(irAmount)}`} />
        }
        <Row label="Rentab. líquida" value={formatPct(netReturn)} highlight />
      </div>
    </div>
  )
}

export default function ResultCards({ input, result }: Props) {
  const { principal, prefixedRate, months, instrumentType } = input
  const {
    finalPrefixedGross, finalPrefixedNet,
    finalPosGross, finalPosNet,
    irAliquot, prefixedIR, advantage,
  } = result

  const isLCA = instrumentType === 'lca'
  const prefixadoVence = advantage > 0
  const prefixedTitle = isLCA
    ? `LCA Prefixada ${formatPct(prefixedRate)} a.a.`
    : `CDB / LTN ${formatPct(prefixedRate)} a.a.`

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <InstrumentCard
          title={prefixedTitle}
          subtitle={`Prefixado · ${months} meses`}
          gross={finalPrefixedGross}
          net={finalPrefixedNet}
          principal={principal}
          irAliquot={prefixedIR}
          isExempt={isLCA}
          winner={prefixadoVence}
        />
        <InstrumentCard
          title={`CDB ${input.cdiPct}% CDI`}
          subtitle={`Pós-fixado · ${months} meses`}
          gross={finalPosGross}
          net={finalPosNet}
          principal={principal}
          irAliquot={irAliquot}
          winner={!prefixadoVence}
        />
      </div>

      <div className={`rounded-xl px-5 py-3 flex items-center justify-between ${
        prefixadoVence ? 'bg-navy text-white' : 'bg-green-600 text-white'
      }`}>
        <span className="text-sm font-medium">
          {prefixadoVence
            ? 'O prefixado entrega mais'
            : 'O pós-fixado entrega mais'}
        </span>
        <span className="text-base font-bold">{formatBRL(Math.abs(advantage))} a mais</span>
      </div>
    </div>
  )
}
