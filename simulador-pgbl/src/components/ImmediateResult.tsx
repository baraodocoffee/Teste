import { PGBLResult, AnnualScenario } from '../utils/calc'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Props {
  result: PGBLResult
  pgblPct: number
  monthlyGross: number
}

function DiffBadge({ value }: { value: number }) {
  if (Math.abs(value) < 0.01) {
    return <span className="text-slate-400 font-medium">Sem diferença</span>
  }
  return value > 0 ? (
    <span className="text-emerald-600 font-semibold">Restituição {fmt(value)}</span>
  ) : (
    <span className="text-red-500 font-semibold">Complemento {fmt(Math.abs(value))}</span>
  )
}

interface ScenarioCardProps {
  title: string
  subtitle: string
  scenario: AnnualScenario
  best: boolean
  notRecommended?: boolean
  highlight?: boolean
  pgblPct?: number
}

function ScenarioCard({ title, subtitle, scenario: s, best, notRecommended, highlight, pgblPct }: ScenarioCardProps) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 transition ${
      notRecommended
        ? 'border-red-200 bg-red-50'
        : best
          ? 'border-gold bg-amber-50 shadow-sm'
          : 'border-slate-200 bg-white'
    }`}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-sm font-semibold ${notRecommended ? 'text-red-700' : best ? 'text-navy' : 'text-slate-700'}`}>{title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
          {notRecommended && (
            <span className="shrink-0 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
              Não recomendado
            </span>
          )}
          {best && !notRecommended && (
            <span className="shrink-0 text-xs font-semibold bg-gold text-navy px-2 py-0.5 rounded-full">
              Melhor opção
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <Row label="Renda bruta anual" value={fmt(s.grossAnnual)} />
        {s.deductSimp > 0 && (
          <Row label="Desconto simplificado (20%)" value={`– ${fmt(s.deductSimp)}`} highlight />
        )}
        {s.deductInss > 0 && (
          <Row label="INSS anual" value={`– ${fmt(s.deductInss)}`} highlight />
        )}
        {highlight && s.deductPgbl > 0 && (
          <Row label={`PGBL (${pgblPct?.toFixed(1)}%)`} value={`– ${fmt(s.deductPgbl)}`} highlight accent />
        )}
        {s.deductOthers > 0 && (
          <Row label="Outros dedutíveis" value={`– ${fmt(s.deductOthers)}`} highlight />
        )}
        <div className="border-t border-slate-200 pt-1">
          <Row label="Base de cálculo IR" value={fmt(s.irBase)} bold />
        </div>
        <Row label="IR Devido" value={fmt(s.irDue)} />
        <Row label="IRRF retido (12×)" value={fmt(s.irWithheld)} />
      </div>

      <div className={`rounded-lg px-3 py-2 text-sm text-center font-medium ${
        best ? 'bg-white border border-gold/40' : 'bg-slate-50 border border-slate-200'
      }`}>
        <DiffBadge value={s.difference} />
      </div>
    </div>
  )
}

function Row({ label, value, highlight, accent, bold }: {
  label: string
  value: string
  highlight?: boolean
  accent?: boolean
  bold?: boolean
}) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? 'font-semibold text-slate-800' : ''}`}>
      <span className={accent ? 'text-amber-700 font-medium' : highlight ? 'text-slate-600' : 'text-slate-500'}>
        {label}
      </span>
      <span className={accent ? 'text-amber-700 font-semibold' : 'text-slate-800'}>{value}</span>
    </div>
  )
}

export default function ImmediateResult({ result, pgblPct, monthlyGross }: Props) {
  const { monthly, simplificado, completo, completoComPGBL, annualTaxSaving } = result

  const pgblNotRecommended = monthlyGross <= 7350

  // Quando PGBL não é recomendado, só disputa entre simplificado e completo
  const bestDiff = pgblNotRecommended
    ? Math.max(simplificado.difference, completo.difference)
    : Math.max(simplificado.difference, completo.difference, completoComPGBL.difference)
  const simpIsBest = simplificado.difference === bestDiff
  const complIsBest = !simpIsBest && completo.difference === bestDiff
  const pgblIsBest = !pgblNotRecommended && completoComPGBL.difference === bestDiff

  return (
    <div className="space-y-5">
      {/* Apuração mensal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-navy mb-4">Apuração Mensal (IRRF na Fonte)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Tile label="Renda bruta" value={fmt(monthly.irBase + monthly.inss)} sub="mensal" />
          <Tile label="INSS" value={fmt(monthly.inss)} sub={monthly.inss >= 988.09 - 0.01 ? 'teto' : 'progressivo'} />
          <Tile label="Base IR" value={fmt(monthly.irBase)} sub="após INSS" />
          <Tile label="IRRF Mensal" value={fmt(monthly.irWithheld)} sub={`× 12 = ${fmt(monthly.irWithheld * 12)}`} accent />
        </div>
      </div>

      {/* Comparação anual */}
      <div>
        <h3 className="text-sm font-semibold text-navy mb-3">Comparativo Anual — Declaração IR</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScenarioCard
            title="Simplificado"
            subtitle="20% da renda, máx. R$ 17.640"
            scenario={simplificado}
            best={simpIsBest}
          />
          <ScenarioCard
            title="Completo (s/ PGBL)"
            subtitle="INSS + outros dedutíveis"
            scenario={completo}
            best={complIsBest}
          />
          <ScenarioCard
            title="Completo (c/ PGBL)"
            subtitle={`INSS + PGBL ${pgblPct.toFixed(1)}% + outros`}
            scenario={completoComPGBL}
            best={pgblIsBest}
            notRecommended={pgblNotRecommended}
            highlight
            pgblPct={pgblPct}
          />
        </div>
      </div>

      {/* Benefício resumido — só exibe quando PGBL é recomendado */}
      {annualTaxSaving > 0 && !pgblNotRecommended && (
        <div className="bg-amber-50 border border-gold/40 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-navy">Benefício anual do PGBL</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Economia de IR vs. melhor alternativa sem PGBL
            </p>
          </div>
          <p className="text-2xl font-bold text-gold">{fmt(annualTaxSaving)}</p>
        </div>
      )}
    </div>
  )
}

function Tile({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${accent ? 'bg-navy text-white' : 'bg-slate-50'}`}>
      <p className={`text-xs ${accent ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-base font-bold mt-0.5 ${accent ? 'text-white' : 'text-navy'}`}>{value}</p>
      <p className={`text-[10px] mt-0.5 ${accent ? 'text-slate-400' : 'text-slate-400'}`}>{sub}</p>
    </div>
  )
}
