// Months elapsed since April/2026 (month 0)
// Dec/2026 = 8, Dec/2027 = 20, Dec/2028 = 32, Dec/2029 = 44
const MONTH_ANCHORS = [0, 8, 20, 32, 44]

const SELIC_PATHS: Record<Scenario, number[]> = {
  suave:     [14.50, 13.50, 12.50, 11.50, 11.00],
  moderado:  [14.50, 13.00, 11.00, 10.00,  9.88],
  acentuado: [14.50, 12.00,  9.50,  8.00,  7.50],
}

// CDI historically tracks ~0.10 p.p. below Selic meta
const CDI_SPREAD = 0.10

export type Scenario = 'suave' | 'moderado' | 'acentuado'
export type InstrumentType = 'cdb' | 'lca'

export interface CalcInput {
  principal: number
  months: number
  prefixedRate: number
  scenario: Scenario
  instrumentType: InstrumentType
}

export interface MonthlyPoint {
  month: number
  label: string
  prefixedNet: number
  posFixadoNet: number
  selic: number
}

export interface CalcResult {
  points: MonthlyPoint[]
  finalPrefixedGross: number
  finalPrefixedNet: number
  finalPosGross: number
  finalPosNet: number
  irAliquot: number
  prefixedIR: number
  breakevenCDI: number
  avgProjectedCDI: number
  advantage: number
}

function irAliquot(months: number): number {
  if (months <= 6) return 0.225   // até 180 dias
  if (months < 12) return 0.20    // 181 a 360 dias
  if (months < 24) return 0.175   // 361 a 720 dias (12 meses ≈ 365 dias)
  return 0.15                      // acima de 720 dias (24 meses ≈ 730 dias)
}

function selicAtMonth(m: number, scenario: Scenario): number {
  const anchors = MONTH_ANCHORS
  const vals = SELIC_PATHS[scenario]

  if (m <= 0) return vals[0]
  if (m >= anchors[anchors.length - 1]) return vals[vals.length - 1]

  for (let i = 0; i < anchors.length - 1; i++) {
    if (m >= anchors[i] && m <= anchors[i + 1]) {
      const t = (m - anchors[i]) / (anchors[i + 1] - anchors[i])
      return vals[i] + t * (vals[i + 1] - vals[i])
    }
  }
  return vals[vals.length - 1]
}

function monthLabel(m: number): string {
  const start = new Date(2026, 3, 1) // April 2026
  start.setMonth(start.getMonth() + m)
  return start.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

export function calculate(input: CalcInput): CalcResult {
  const { principal, months, prefixedRate, scenario, instrumentType } = input
  const isLCA = instrumentType === 'lca'
  // Capitalização diária base 252 du; 1 mês = 21 du → (1+r)^(21/252) = (1+r)^(1/12)
  const prefixedMonthly = Math.pow(1 + prefixedRate / 100, 1 / 12) - 1

  let prefixedBalance = principal
  let posBalance = principal

  const points: MonthlyPoint[] = []
  const cdiMonthlyRates: number[] = []

  for (let m = 1; m <= months; m++) {
    prefixedBalance *= 1 + prefixedMonthly

    const selic = selicAtMonth(m - 1, scenario)
    const cdi = Math.max(selic - CDI_SPREAD, 0)
    const cdiMonthly = Math.pow(1 + cdi / 100, 1 / 12) - 1 // base 252 du
    cdiMonthlyRates.push(cdiMonthly)
    posBalance *= 1 + cdiMonthly

    const ir = irAliquot(m)
    // LCA prefixada é isenta de IR para PF
    const prefixedNet = isLCA
      ? prefixedBalance
      : principal + (prefixedBalance - principal) * (1 - ir)
    const posNet = principal + (posBalance - principal) * (1 - ir)

    points.push({
      month: m,
      label: monthLabel(m),
      prefixedNet,
      posFixadoNet: posNet,
      selic,
    })
  }

  const finalIR = irAliquot(months)
  const finalPrefixedGross = prefixedBalance
  const finalPosGross = posBalance
  const finalPrefixedNet = isLCA
    ? prefixedBalance
    : principal + (finalPrefixedGross - principal) * (1 - finalIR)
  const finalPosNet = principal + (finalPosGross - principal) * (1 - finalIR)

  // Geometric mean of CDI monthly rates → annualized
  const cdiProduct = cdiMonthlyRates.reduce((acc, r) => acc * (1 + r), 1)
  const avgCDIMonthly = Math.pow(cdiProduct, 1 / months) - 1
  const avgProjectedCDI = (Math.pow(1 + avgCDIMonthly, 12) - 1) * 100

  // Breakeven: qual CDI médio igualaria o pós-fixado (tributado) ao prefixado
  // CDB/LTN: mesma alíquota → breakeven CDI = taxa prefixada
  // LCA isenta: CDI precisa compensar o IR que o pós-fixado paga
  //   principal + (be_balance - principal) * (1-IR) = prefixedBalance
  //   be_balance = principal + (prefixedBalance - principal) / (1-IR)
  let breakevenCDI: number
  if (isLCA) {
    const beBalance = principal + (prefixedBalance - principal) / (1 - finalIR)
    const beMonthly = Math.pow(beBalance / principal, 1 / months) - 1
    breakevenCDI = (Math.pow(1 + beMonthly, 12) - 1) * 100
  } else {
    breakevenCDI = prefixedRate
  }

  return {
    points,
    finalPrefixedGross,
    finalPrefixedNet,
    finalPosGross,
    finalPosNet,
    irAliquot: finalIR,
    prefixedIR: isLCA ? 0 : finalIR,
    breakevenCDI,
    avgProjectedCDI,
    advantage: finalPrefixedNet - finalPosNet,
  }
}

export function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}

export function formatPct(v: number, decimals = 2): string {
  return v.toFixed(decimals).replace('.', ',') + '%'
}
