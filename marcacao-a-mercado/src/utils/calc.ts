import { countDU, countCalendarDays } from './calendar'

export interface LTNDef {
  id: string
  label: string
  maturity: Date
}

// Vencimentos em 1º de janeiro e 1º de julho — convenção do Tesouro Nacional
export const LTN_LIST: LTNDef[] = [
  { id: 'jul26', label: 'LTN Jul/2026', maturity: new Date(2026, 6, 1) },
  { id: 'jan27', label: 'LTN Jan/2027', maturity: new Date(2027, 0, 1) },
  { id: 'jul27', label: 'LTN Jul/2027', maturity: new Date(2027, 6, 1) },
  { id: 'jan28', label: 'LTN Jan/2028', maturity: new Date(2028, 0, 1) },
  { id: 'jul28', label: 'LTN Jul/2028', maturity: new Date(2028, 6, 1) },
  { id: 'jan29', label: 'LTN Jan/2029', maturity: new Date(2029, 0, 1) },
  { id: 'jan31', label: 'LTN Jan/2031', maturity: new Date(2031, 0, 1) },
]

// PU = 1.000 / (1 + taxa)^(du/252) — convenção de dias úteis brasileira
function calcPU(rate: number, du: number): number {
  if (du <= 0) return 1000
  return 1000 / Math.pow(1 + rate / 100, du / 252)
}

function irAliquot(calDays: number): number {
  if (calDays <= 180) return 0.225
  if (calDays <= 360) return 0.20
  if (calDays <= 720) return 0.175
  return 0.15
}

export interface CalcInput {
  ltnId: string
  purchaseDate: Date
  purchaseRate: number
  marketRate: number
  capital: number
}

export interface SensitivityPoint {
  rate: number
  value: number
}

export interface ConvergencePoint {
  label: string
  puNatural: number
  puMarket: number
  isToday: boolean
}

export interface CalcResult {
  ltn: LTNDef
  duTotal: number
  duRemaining: number
  calDaysElapsed: number
  calDaysTotal: number
  puPurchase: number
  puToday: number
  numTitles: number
  valueAtPurchase: number
  valueToday: number
  valueAtMaturity: number
  grossGainToday: number
  irRateToday: number
  irAmountToday: number
  netValueToday: number
  annualizedReturnToday: number | null
  grossGainMaturity: number
  irRateMaturity: number
  irAmountMaturity: number
  netValueMaturity: number
  sensitivityPoints: SensitivityPoint[]
  convergencePath: ConvergencePoint[]
}

export function calculate(input: CalcInput): CalcResult | null {
  const { ltnId, purchaseDate, purchaseRate, marketRate, capital } = input
  const ltn = LTN_LIST.find(l => l.id === ltnId)
  if (!ltn) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { maturity } = ltn

  if (purchaseDate >= maturity || today >= maturity) return null

  const duTotal = countDU(purchaseDate, maturity)
  const duRemaining = countDU(today, maturity)
  const calDaysTotal = countCalendarDays(purchaseDate, maturity)
  const calDaysElapsed = countCalendarDays(purchaseDate, today)

  const puPurchase = calcPU(purchaseRate, duTotal)
  const puToday = calcPU(marketRate, duRemaining)
  const numTitles = capital / puPurchase

  const valueAtPurchase = capital
  const valueToday = numTitles * puToday
  const valueAtMaturity = numTitles * 1000

  // Vender hoje
  const grossGainToday = valueToday - valueAtPurchase
  const irRateToday = irAliquot(calDaysElapsed)
  const irAmountToday = Math.max(grossGainToday, 0) * irRateToday
  const netValueToday = valueAtPurchase + grossGainToday - irAmountToday

  const duElapsed = duTotal - duRemaining
  const annualizedReturnToday =
    duElapsed > 5
      ? (Math.pow(valueToday / valueAtPurchase, 252 / duElapsed) - 1) * 100
      : null

  // Segurar até o vencimento
  const grossGainMaturity = valueAtMaturity - valueAtPurchase
  const irRateMaturity = irAliquot(calDaysTotal)
  const irAmountMaturity = grossGainMaturity * irRateMaturity
  const netValueMaturity = valueAtPurchase + grossGainMaturity - irAmountMaturity

  // Curva de sensibilidade: ±6 p.p. em torno da taxa de compra, passo 0,25
  const sensitivityPoints: SensitivityPoint[] = []
  const rMin = Math.max(0.25, purchaseRate - 6)
  const rMax = purchaseRate + 6
  for (let r = rMin; r <= rMax + 0.001; r += 0.25) {
    const rr = parseFloat(r.toFixed(2))
    sensitivityPoints.push({ rate: rr, value: numTitles * calcPU(rr, duRemaining) })
  }

  // Convergência: snapshots mensais de purchaseDate até maturity
  const convergencePath: ConvergencePoint[] = []
  const iter = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 1)
  if (iter < purchaseDate) iter.setMonth(iter.getMonth() + 1)

  while (iter <= maturity) {
    const du = countDU(iter, maturity)
    const puN = calcPU(purchaseRate, du)
    const puM = calcPU(marketRate, du)
    const isToday =
      iter.getFullYear() === today.getFullYear() &&
      iter.getMonth() === today.getMonth()
    convergencePath.push({
      label: iter.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      puNatural: parseFloat(puN.toFixed(4)),
      puMarket: parseFloat(puM.toFixed(4)),
      isToday,
    })
    iter.setMonth(iter.getMonth() + 1)
  }

  return {
    ltn,
    duTotal,
    duRemaining,
    calDaysElapsed,
    calDaysTotal,
    puPurchase,
    puToday,
    numTitles,
    valueAtPurchase,
    valueToday,
    valueAtMaturity,
    grossGainToday,
    irRateToday,
    irAmountToday,
    netValueToday,
    annualizedReturnToday,
    grossGainMaturity,
    irRateMaturity,
    irAmountMaturity,
    netValueMaturity,
    sensitivityPoints,
    convergencePath,
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

export function formatPU(v: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(v)
}

export function formatPct(v: number, d = 2): string {
  return v.toFixed(d).replace('.', ',') + '%'
}
