import { SavingsResult, SavingsInput } from '../utils/calc'

interface Props {
  result: SavingsResult
  input: SavingsInput
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const pct = (v: number) =>
  v.toFixed(2).replace('.', ',') + '%'

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-emerald-600' : 'text-slate-700'}`}>{value}</span>
    </div>
  )
}

interface AssetCardProps {
  label: string
  subtitle: string
  iconBg: string
  iconLetter: string
  borderColor: string
  badgeText: string
  badgeBg: string
  result: SavingsResult['poupanca']
  isBest: boolean
  isWorst: boolean
  opportunityCost?: number
}

function AssetCard({
  label, subtitle, iconBg, iconLetter, borderColor, badgeText, badgeBg,
  result, isBest, isWorst, opportunityCost,
}: AssetCardProps) {
  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm p-6 relative ${borderColor} ${isBest ? 'shadow-md' : ''}`}>
      {isBest && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
          ★ Melhor retorno
        </span>
      )}
      {isWorst && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
          ✕ Menor retorno
        </span>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold text-sm">{iconLetter}</span>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-base">{label}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${badgeBg}`}>{badgeText}</span>
      </div>

      <Row label="IR pago no resgate" value={result.irAmount > 0 ? `− ${brl(result.irAmount)}` : 'Isento'} />
      <Row label="Total aportado" value={brl(result.totalContributed)} />

      <div className="mt-3 pt-3 border-t-2 border-slate-200 space-y-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-700">Saldo líquido final</span>
          <span className="text-xl font-bold text-navy">{brl(result.netBalance)}</span>
        </div>
        <Row label="Rendimento líquido" value={brl(result.netGain)} highlight={result.netGain > 0} />
        <Row label="Poder de compra hoje" value={brl(result.realNetBalance)} />
      </div>

      {isWorst && opportunityCost !== undefined && opportunityCost > 0 && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-xs text-red-600 font-medium">
            Custo de oportunidade vs CDB:{' '}
            <span className="font-bold text-red-700">{brl(opportunityCost)}</span>
          </p>
          <p className="text-xs text-red-500 mt-0.5">
            Valor que ficou na mesa no período.
          </p>
        </div>
      )}
    </div>
  )
}

export default function ResultPanel({ result, input }: Props) {
  const { poupanca, tesouroSelic, cdb, opportunityCostCDB } = result

  const netBalances = [poupanca.netBalance, tesouroSelic.netBalance, cdb.netBalance]
  const best = Math.max(...netBalances)
  const worst = Math.min(...netBalances)

  return (
    <div className="space-y-4">
      {/* Banner custo de oportunidade */}
      {opportunityCostCDB > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">
                Custo de manter o dinheiro na Poupança por {input.years} {input.years === 1 ? 'ano' : 'anos'}
              </p>
              <p className="text-xs text-red-600 mt-1 leading-relaxed">
                Comparando com o CDB 100% CDI — um investimento de risco equivalente, com liquidez diária e cobertura do FGC.
              </p>
            </div>
            <div className="text-center sm:text-right flex-shrink-0">
              <p className="text-3xl font-extrabold text-red-700">{brl(opportunityCostCDB)}</p>
              <p className="text-xs text-red-500 mt-0.5">deixados na mesa</p>
            </div>
          </div>
        </div>
      )}

      {/* Cards dos ativos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-1">
        <AssetCard
          label="Poupança"
          subtitle={result.isSelicCapped ? '0,5% a.m. · Isento IR' : `${pct(result.poupancaAnnualRate)} a.a. · Isento`}
          iconBg="bg-red-500"
          iconLetter="P"
          borderColor={poupanca.netBalance === worst ? 'border-red-300' : 'border-slate-200'}
          badgeText="Isento IR"
          badgeBg="bg-green-100 text-green-700"
          result={poupanca}
          isBest={poupanca.netBalance === best}
          isWorst={poupanca.netBalance === worst}
          opportunityCost={opportunityCostCDB}
        />
        <AssetCard
          label="Tesouro Selic"
          subtitle={`${pct(result.tesouroSelicGrossRate)} a.a. bruto · IR 15%`}
          iconBg="bg-emerald-600"
          iconLetter="T"
          borderColor={tesouroSelic.netBalance === best ? 'border-emerald-400' : 'border-slate-200'}
          badgeText="IR 15%"
          badgeBg="bg-blue-100 text-blue-700"
          result={tesouroSelic}
          isBest={tesouroSelic.netBalance === best}
          isWorst={tesouroSelic.netBalance === worst}
        />
        <AssetCard
          label="CDB 100% CDI"
          subtitle={`${pct(result.cdiRate)} a.a. bruto · IR 15%`}
          iconBg="bg-blue-600"
          iconLetter="C"
          borderColor={cdb.netBalance === best ? 'border-blue-400' : 'border-slate-200'}
          badgeText="IR 15%"
          badgeBg="bg-blue-100 text-blue-700"
          result={cdb}
          isBest={cdb.netBalance === best}
          isWorst={cdb.netBalance === worst}
        />
      </div>

      {/* Nota metodológica */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
        <p className="text-xs text-slate-400 leading-relaxed text-center">
          Poupança: 0,5% a.m. + TR quando Selic &gt; 8,5% (TR ≈ 0 simplificada) ·{' '}
          Tesouro Selic: Selic − 0,20% taxa custódia B3 · CDB: CDI ≈ Selic − 0,10% ·{' '}
          IR 15% sobre ganhos (alíquota LP acima de 720 dias) · Poder de compra deflacionado pelo IPCA de {pct(input.ipca)} a.a. ·{' '}
          Simulação educacional — não constitui recomendação de investimento.
        </p>
      </div>
    </div>
  )
}
