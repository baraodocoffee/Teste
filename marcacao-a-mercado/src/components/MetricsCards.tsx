import { CalcResult, formatBRL, formatPU, formatPct } from '../utils/calc'

interface Props {
  result: CalcResult
  purchaseRate: number
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="text-right">
        <span className="text-xs font-semibold text-slate-800">{value}</span>
        {sub && <span className="block text-[10px] text-slate-400">{sub}</span>}
      </div>
    </div>
  )
}

function Badge({ label, positive }: { label: string; positive: boolean }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
      positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
    }`}>
      {label}
    </span>
  )
}

export default function MetricsCards({ result, purchaseRate }: Props) {
  const {
    ltn, duTotal, duRemaining, calDaysElapsed,
    puPurchase, puToday,
    numTitles, valueAtPurchase, valueToday,
    grossGainToday, irRateToday, irAmountToday, netValueToday, annualizedReturnToday,
    grossGainMaturity, irRateMaturity, irAmountMaturity, netValueMaturity,
  } = result

  const gaining = grossGainToday >= 0
  const duElapsed = duTotal - duRemaining

  return (
    <div className="space-y-4">
      {/* PU e posição */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Preço Unitário (PU)</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mb-1">Na compra</p>
            <p className="text-lg font-bold text-slate-600">R$ {formatPU(puPurchase)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{duTotal} du até venc.</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mb-1">Hoje (mercado)</p>
            <p className={`text-lg font-bold ${gaining ? 'text-emerald-600' : 'text-red-500'}`}>
              R$ {formatPU(puToday)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{duRemaining} du restantes</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mb-1">No vencimento</p>
            <p className="text-lg font-bold text-navy">R$ 1.000,00</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{ltn.label}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Quantidade de títulos: <span className="font-semibold text-slate-700">{numTitles.toFixed(4)}</span>
          </span>
          <span className="text-xs text-slate-500">
            Decorridos: <span className="font-semibold text-slate-700">{calDaysElapsed} dias corridos · {duElapsed} du</span>
          </span>
        </div>
      </div>

      {/* Dois cenários lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vender hoje */}
        <div className={`rounded-2xl border-2 p-5 ${
          gaining ? 'border-emerald-300 bg-emerald-50/50' : 'border-red-200 bg-red-50/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-800">Vender hoje</p>
            <Badge label={gaining ? 'GANHO' : 'PERDA'} positive={gaining} />
          </div>

          <div className="mb-3">
            <p className="text-xs text-slate-500">Valor líquido recebido</p>
            <p className={`text-2xl font-bold mt-0.5 ${gaining ? 'text-emerald-700' : 'text-red-600'}`}>
              {formatBRL(netValueToday)}
            </p>
          </div>

          <Row label="Valor bruto" value={formatBRL(valueToday)} />
          <Row
            label={`Ganho bruto`}
            value={(gaining ? '+' : '') + formatBRL(grossGainToday)}
          />
          <Row
            label={`IR (${formatPct(irRateToday * 100, 1)})`}
            value={`- ${formatBRL(irAmountToday)}`}
            sub={`${calDaysElapsed} dias corridos`}
          />

          <div className="mt-3 pt-3 border-t border-current/10">
            <p className="text-xs text-slate-500">Rentabilidade anualizada</p>
            <p className={`text-base font-bold mt-0.5 ${gaining ? 'text-emerald-700' : 'text-red-600'}`}>
              {annualizedReturnToday !== null ? formatPct(annualizedReturnToday) + ' a.a.' : '—'}
            </p>
            <p className="text-[10px] text-slate-400">
              vs {formatPct(purchaseRate)} a.a. contratados
            </p>
          </div>
        </div>

        {/* Segurar até o vencimento */}
        <div className="rounded-2xl border-2 border-navy/20 bg-navy/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-800">Segurar até {ltn.label.replace('LTN ', '')}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy text-white">CONTRATADO</span>
          </div>

          <div className="mb-3">
            <p className="text-xs text-slate-500">Valor líquido recebido</p>
            <p className="text-2xl font-bold text-navy mt-0.5">{formatBRL(netValueMaturity)}</p>
          </div>

          <Row label="Valor bruto (face)" value={formatBRL(result.valueAtMaturity)} />
          <Row label="Ganho bruto" value={`+ ${formatBRL(grossGainMaturity)}`} />
          <Row
            label={`IR (${formatPct(irRateMaturity * 100, 1)})`}
            value={`- ${formatBRL(irAmountMaturity)}`}
            sub={`${result.calDaysTotal} dias corridos`}
          />

          <div className="mt-3 pt-3 border-t border-navy/10">
            <p className="text-xs text-slate-500">Rentabilidade contratada</p>
            <p className="text-base font-bold text-navy mt-0.5">{formatPct(purchaseRate)} a.a.</p>
            <p className="text-[10px] text-slate-400">garantida independente do mercado</p>
          </div>
        </div>
      </div>

      {/* Resumo do ganho de MaM */}
      <div className={`rounded-xl px-5 py-3 flex items-center justify-between ${
        gaining ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
      }`}>
        <span className="text-sm font-medium">
          {gaining
            ? 'A queda de juros gerou ganho de capital de:'
            : 'A alta de juros gerou perda de capital de:'}
        </span>
        <span className="text-base font-bold">
          {formatBRL(Math.abs(netValueToday - valueAtPurchase))} ({gaining ? '+' : '-'}{formatPct(Math.abs((netValueToday / valueAtPurchase - 1) * 100))})
        </span>
      </div>
    </div>
  )
}
