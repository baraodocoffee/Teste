export interface PGBLInput {
  monthlyGross: number
  pgblPct: number
  otherDeductionsAnnual: number
  years: number
  annualReturn: number
}

// INSS 2026 — tabela progressiva mensal (teto R$ 8.475,55; max R$ 988,09)
function calcINSS(monthly: number): number {
  const bands = [
    { limit: 1518.00, rate: 0.075 },
    { limit: 2793.88, rate: 0.09 },
    { limit: 4190.83, rate: 0.12 },
    { limit: 8475.55, rate: 0.14 },
  ]
  let inss = 0
  let prev = 0
  for (const { limit, rate } of bands) {
    if (monthly <= prev) break
    inss += (Math.min(monthly, limit) - prev) * rate
    prev = limit
  }
  return Math.min(inss, 988.09)
}

// IR mensal 2026 — tabela progressiva (parcelas a deduzir acumuladas)
function calcIRMensal(base: number): number {
  if (base <= 2428.80) return 0
  if (base <= 2826.65) return base * 0.075 - 182.16
  if (base <= 3751.05) return base * 0.15 - 394.16
  if (base <= 4664.68) return base * 0.225 - 675.49
  return Math.max(0, base * 0.275 - 908.73)
}

// IR anual 2026 — tabela progressiva
function calcIRAnual(base: number): number {
  if (base <= 28467.20) return 0
  if (base <= 33919.80) return base * 0.075 - 2135.04
  if (base <= 45012.60) return base * 0.15 - 4679.02
  if (base <= 55976.16) return base * 0.225 - 8054.97
  return Math.max(0, base * 0.275 - 10853.78)
}

// Tabela regressiva PGBL por prazo de acumulação
function pgblAliquota(years: number): number {
  if (years < 2) return 0.35
  if (years < 4) return 0.30
  if (years < 6) return 0.25
  if (years < 8) return 0.20
  if (years < 10) return 0.15
  return 0.10
}

export interface MonthlyBreakdown {
  inss: number
  irBase: number
  irWithheld: number
  netSalary: number
}

export interface AnnualScenario {
  grossAnnual: number
  deductInss: number
  deductPgbl: number
  deductOthers: number
  deductSimp: number
  totalDeductions: number
  irBase: number
  irDue: number
  irWithheld: number
  difference: number
}

export interface LongTermPoint {
  year: number
  comPGBL: number
  semPGBL: number
}

export interface PGBLResult {
  monthly: MonthlyBreakdown
  simplificado: AnnualScenario
  completo: AnnualScenario
  completoComPGBL: AnnualScenario
  annualTaxSaving: number
  pgblContribAnual: number
  longTerm: LongTermPoint[]
  final: {
    comPGBL: { pgblGross: number; pgblTax: number; pgblNet: number; savingsGross: number; savingsNet: number; totalNet: number }
    semPGBL: { gross: number; tax: number; net: number }
  }
}

export function calculate(input: PGBLInput): PGBLResult {
  const { monthlyGross, pgblPct, otherDeductionsAnnual, years, annualReturn } = input
  const r = annualReturn / 100

  const inssMonthly = calcINSS(monthlyGross)
  const irBase = Math.max(0, monthlyGross - inssMonthly)
  const irWithheld = calcIRMensal(irBase)
  const netSalary = monthlyGross - inssMonthly - irWithheld

  const grossAnnual = monthlyGross * 12
  const inssAnnual = inssMonthly * 12
  const irWithheldAnnual = irWithheld * 12
  const pgblContribAnual = grossAnnual * (pgblPct / 100)

  // Simplificado: 20% da renda bruta, limitado a R$ 17.640/ano
  const simpDeducao = Math.min(grossAnnual * 0.20, 17640)
  const simpBase = Math.max(0, grossAnnual - simpDeducao)
  const simpIRDue = calcIRAnual(simpBase)

  // Completo sem PGBL
  const complDeducoes = inssAnnual + otherDeductionsAnnual
  const complBase = Math.max(0, grossAnnual - complDeducoes)
  const complIRDue = calcIRAnual(complBase)

  // Completo com PGBL
  const pgblDeducoes = inssAnnual + pgblContribAnual + otherDeductionsAnnual
  const pgblBase = Math.max(0, grossAnnual - pgblDeducoes)
  const pgblIRDue = calcIRAnual(pgblBase)

  // Economia de IR anual com PGBL (vs. melhor alternativa sem PGBL)
  const bestWithoutPGBL = Math.min(simpIRDue, complIRDue)
  const annualTaxSaving = Math.max(0, bestWithoutPGBL - pgblIRDue)

  // Projeção de longo prazo — acúmulo anual
  const longTerm: LongTermPoint[] = []
  let pgblBalance = 0
  let savingsBalance = 0
  let semPGBLBalance = 0

  for (let y = 1; y <= years; y++) {
    pgblBalance = (pgblBalance + pgblContribAnual) * (1 + r)
    savingsBalance = (savingsBalance + annualTaxSaving) * (1 + r)
    semPGBLBalance = (semPGBLBalance + pgblContribAnual) * (1 + r)

    const aliq = pgblAliquota(y)
    const pgblNet = pgblBalance * (1 - aliq)
    const savingsGains = Math.max(0, savingsBalance - annualTaxSaving * y)
    const savingsNet = savingsBalance - savingsGains * 0.15
    const comPGBLNet = pgblNet + savingsNet

    const semGains = Math.max(0, semPGBLBalance - pgblContribAnual * y)
    const semPGBLNet = semPGBLBalance - semGains * 0.15

    longTerm.push({ year: y, comPGBL: comPGBLNet, semPGBL: semPGBLNet })
  }

  const finalAliq = pgblAliquota(years)
  const finalSavingsGains = Math.max(0, savingsBalance - annualTaxSaving * years)
  const finalSemGains = Math.max(0, semPGBLBalance - pgblContribAnual * years)

  return {
    monthly: { inss: inssMonthly, irBase, irWithheld, netSalary },
    simplificado: {
      grossAnnual,
      deductInss: 0, deductPgbl: 0, deductOthers: 0, deductSimp: simpDeducao,
      totalDeductions: simpDeducao,
      irBase: simpBase, irDue: simpIRDue,
      irWithheld: irWithheldAnnual, difference: irWithheldAnnual - simpIRDue,
    },
    completo: {
      grossAnnual,
      deductInss: inssAnnual, deductPgbl: 0, deductOthers: otherDeductionsAnnual, deductSimp: 0,
      totalDeductions: complDeducoes,
      irBase: complBase, irDue: complIRDue,
      irWithheld: irWithheldAnnual, difference: irWithheldAnnual - complIRDue,
    },
    completoComPGBL: {
      grossAnnual,
      deductInss: inssAnnual, deductPgbl: pgblContribAnual, deductOthers: otherDeductionsAnnual, deductSimp: 0,
      totalDeductions: pgblDeducoes,
      irBase: pgblBase, irDue: pgblIRDue,
      irWithheld: irWithheldAnnual, difference: irWithheldAnnual - pgblIRDue,
    },
    annualTaxSaving,
    pgblContribAnual,
    longTerm,
    final: {
      comPGBL: {
        pgblGross: pgblBalance,
        pgblTax: pgblBalance * finalAliq,
        pgblNet: pgblBalance * (1 - finalAliq),
        savingsGross: savingsBalance,
        savingsNet: savingsBalance - finalSavingsGains * 0.15,
        totalNet: pgblBalance * (1 - finalAliq) + (savingsBalance - finalSavingsGains * 0.15),
      },
      semPGBL: {
        gross: semPGBLBalance,
        tax: finalSemGains * 0.15,
        net: semPGBLBalance - finalSemGains * 0.15,
      },
    },
  }
}
