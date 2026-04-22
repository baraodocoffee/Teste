export type RateType = 'cdi' | 'prefixado'
export type LciLcaLabel = 'LCI' | 'LCA'

export interface ComparatorInput {
  principal: number
  days: number
  cdiRate: number       // % a.a., ex: 10.75
  cdbRateType: RateType
  cdbRate: number       // % CDI (ex: 100) ou % a.a. prefixado (ex: 12)
  lciLcaRateType: RateType
  lciLcaRate: number
  lciLcaLabel: LciLcaLabel
}

export interface AssetResult {
  grossReturn: number
  irAmount: number
  netReturn: number
  netAmount: number
  effectiveNetRate: number  // % a.a. líquida
}

export interface ComparatorResult {
  cdb: AssetResult
  lciLca: AssetResult
  winner: 'cdb' | 'lciLca' | 'tie'
  difference: number
  irAliquota: number        // % aplicada ao CDB (ex: 20)
  irFaixaLabel: string
  cdbEquivPctCdi: number    // % CDI bruto que o CDB precisaria para igualar a LCI/LCA
  lciLcaEquivPctCdi: number // % CDI que a LCI/LCA precisaria para igualar o CDB líquido
}

function getIRRate(days: number): number {
  if (days <= 180) return 0.225
  if (days <= 360) return 0.20
  if (days <= 720) return 0.175
  return 0.15
}

function getIRFaixaLabel(days: number): string {
  if (days <= 180) return 'até 180 dias (22,5%)'
  if (days <= 360) return '181–360 dias (20%)'
  if (days <= 720) return '361–720 dias (17,5%)'
  return 'acima de 720 dias (15%)'
}

function periodReturn(principal: number, annualRate: number, days: number): number {
  return principal * (Math.pow(1 + annualRate, days / 365) - 1)
}

function effectiveNetAnnual(netReturn: number, principal: number, days: number): number {
  return (Math.pow(1 + netReturn / principal, 365 / days) - 1) * 100
}

export function calculate(input: ComparatorInput): ComparatorResult {
  const { principal, days, cdiRate, cdbRateType, cdbRate, lciLcaRateType, lciLcaRate } = input
  const cdiDecimal = cdiRate / 100

  const cdbAnnual = cdbRateType === 'cdi'
    ? cdiDecimal * (cdbRate / 100)
    : cdbRate / 100

  const lciLcaAnnual = lciLcaRateType === 'cdi'
    ? cdiDecimal * (lciLcaRate / 100)
    : lciLcaRate / 100

  const ir = getIRRate(days)

  // CDB
  const cdbGross = periodReturn(principal, cdbAnnual, days)
  const cdbIr = cdbGross * ir
  const cdbNet = cdbGross - cdbIr

  // LCI/LCA — isento de IR
  const lciLcaGross = periodReturn(principal, lciLcaAnnual, days)
  const lciLcaNet = lciLcaGross

  const winner: 'cdb' | 'lciLca' | 'tie' =
    cdbNet > lciLcaNet + 0.001 ? 'cdb'
    : lciLcaNet > cdbNet + 0.001 ? 'lciLca'
    : 'tie'

  // % CDI bruto que o CDB precisaria pagar para empatar com a LCI/LCA
  // gross_needed * (1 - ir) = lciLcaNet → gross_needed = lciLcaNet / (1 - ir)
  const cdbGrossNeeded = lciLcaNet / (1 - ir)
  const cdbAnnualNeeded = Math.pow(1 + cdbGrossNeeded / principal, 365 / days) - 1
  const cdbEquivPctCdi = cdiDecimal > 0 ? (cdbAnnualNeeded / cdiDecimal) * 100 : 0

  // % CDI que a LCI/LCA precisaria pagar para empatar com o CDB líquido
  const lciLcaAnnualNeeded = Math.pow(1 + cdbNet / principal, 365 / days) - 1
  const lciLcaEquivPctCdi = cdiDecimal > 0 ? (lciLcaAnnualNeeded / cdiDecimal) * 100 : 0

  return {
    cdb: {
      grossReturn: cdbGross,
      irAmount: cdbIr,
      netReturn: cdbNet,
      netAmount: principal + cdbNet,
      effectiveNetRate: effectiveNetAnnual(cdbNet, principal, days),
    },
    lciLca: {
      grossReturn: lciLcaGross,
      irAmount: 0,
      netReturn: lciLcaNet,
      netAmount: principal + lciLcaNet,
      effectiveNetRate: effectiveNetAnnual(lciLcaNet, principal, days),
    },
    winner,
    difference: Math.abs(cdbNet - lciLcaNet),
    irAliquota: ir * 100,
    irFaixaLabel: getIRFaixaLabel(days),
    cdbEquivPctCdi,
    lciLcaEquivPctCdi,
  }
}
