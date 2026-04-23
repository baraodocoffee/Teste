import { ComparatorResult, ComparatorInput } from '../utils/calc'

interface Props {
  result: ComparatorResult
  input: ComparatorInput
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const pct = (v: number) =>
  v.toFixed(2).replace('.', ',') + '%'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  )
}

interface CardProps {
  title: string
  subtitle: string
  badge: string
  badgeColor: string
  iconBg: string
  iconLetter: string
  grossReturn: number
  irLabel: string
  irValue: string
  netReturn: number
  netAmount: number
  effectiveNetRate: number
  isWinner: boolean
}

function AssetCard({ title, subtitle, badge, badgeColor, iconBg, iconLetter, grossReturn, irLabel, irValue, netReturn, netAmount, effectiveNetRate, isWinner }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm p-6 relative transition-all duration-200 ${
      isWinner ? 'border-gold shadow-md' : 'border-slate-200'
    }`}>
      {isWinner && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
          ★ Mais rentável
        </span>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold text-sm">{iconLetter}</span>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-base">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>
      </div>

      <div>
        <Row label="Rendimento bruto" value={brl(grossReturn)} />
        <Row label={irLabel} value={irValue} />
      </div>

      <div className="mt-3 pt-3 border-t-2 border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-700">Rendimento líquido</span>
          <span className="text-xl font-bold text-navy">{brl(netReturn)}</span>
        </div>
        <Row label="Montante final" value={brl(netAmount)} />
        <Row label="Rentabilidade líquida a.a." value={pct(effectiveNetRate)} />
      </div>
    </div>
  )
}

export default function ResultCards({ result, input }: Props) {
  const { cdb, lciLca, winner, difference, irAliquota, irFaixaLabel, cdbEquivPctCdi, lciLcaEquivPctCdi } = result
  const label = input.lciLcaLabel

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
        <AssetCard
          title="CDB"
          subtitle={input.cdbRateType === 'cdi' ? `${input.cdbRate}% do CDI` : `${input.cdbRate}% a.a. prefixado`}
          badge={`IR ${pct(irAliquota)}`}
          badgeColor="bg-blue-100 text-blue-700"
          iconBg="bg-blue-600"
          iconLetter="C"
          grossReturn={cdb.grossReturn}
          irLabel={`IR (${pct(irAliquota)})`}
          irValue={`− ${brl(cdb.irAmount)}`}
          netReturn={cdb.netReturn}
          netAmount={cdb.netAmount}
          effectiveNetRate={cdb.effectiveNetRate}
          isWinner={winner === 'cdb'}
        />
        <AssetCard
          title={label}
          subtitle={input.lciLcaRateType === 'cdi' ? `${input.lciLcaRate}% do CDI` : `${input.lciLcaRate}% a.a. prefixado`}
          badge="Isento IR"
          badgeColor="bg-emerald-100 text-emerald-700"
          iconBg="bg-emerald-600"
          iconLetter="L"
          grossReturn={lciLca.grossReturn}
          irLabel="IR"
          irValue="Isento"
          netReturn={lciLca.netReturn}
          netAmount={lciLca.netAmount}
          effectiveNetRate={lciLca.effectiveNetRate}
          isWinner={winner === 'lciLca'}
        />
      </div>

      {/* Resumo e taxas equivalentes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="text-center">
          {winner !== 'tie' ? (
            <p className="text-sm font-semibold text-slate-700">
              {winner === 'cdb' ? 'O CDB' : `A ${label}`} rende{' '}
              <span className="text-gold font-bold">{brl(difference)} a mais</span> no período
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-600">Rendimento idêntico no período</p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxas equivalentes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 leading-snug">Para empatar a {label}, o CDB precisa pagar</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{pct(cdbEquivPctCdi)} CDI</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-600 leading-snug">Para empatar o CDB, a {label} precisa pagar</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{pct(lciLcaEquivPctCdi)} CDI</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">
            {input.days} dias corridos · Faixa IR: {irFaixaLabel}
          </p>
        </div>
      </div>
    </div>
  )
}
