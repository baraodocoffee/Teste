export interface PGBLInput {
  monthlyGross: number
  pgblPct: number
  dependents: number
  healthAnnual: number
  educationAnnual: number
  years: number
  annualReturn: number
}

const DEPENDENT_DEDUCTION = 2275.08
const EDUCATION_LIMIT = 3561.50

function calcOtherDeductions(dependents: number, healthAnnual: number, educationAnnual: number): number {
  const educationCap = (1 + dependents) * EDUCATION_LIMIT
  return dependents * DEPENDENT_DEDUCTION + healthAnnual + Math.min(educationAnnual, educationCap)
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

// IR mensal 2026 — tabela progressiva (base após INSS)
function irMensalProgressivo(base: number): number {
  if (base <= 2428.80) return 0
  if (base <= 2826.65) return base * 0.075 - 182.16
  if (base <= 3751.05) return base * 0.15 - 394.16
  if (base <= 4664.68) return base * 0.225 - 675.49
  return base * 0.275 - 908.73
}

// Desconto mensal 2026 — isenção/redução sobre renda bruta mensal
function descontoMensal(gross: number): number {
  if (gross <= 5000) return 312.89
  if (gross <= 7350) return Math.max(0, 978.62 - 0.133145 * gross)
  return 0
}

// IR mensal final 2026 (progressivo − desconto)
function calcIRMensal(base: number, gross: number): number {
  if (gross <= 5000) return 0
  return Math.max(0, irMensalProgressivo(base) - descontoMensal(gross))
}

// IR anual 2026 — tabela progressiva (base após deduções)
function irAnualProgressivo(base: number): number {
  if (base <= 28467.20) return 0
  if (base <= 33919.80) return base * 0.075 - 2135.04
  if (base <= 45012.60) return base * 0.15 - 4679.02
  if (base <= 55976.16) return base * 0.225 - 8054.97
  return base * 0.275 - 10853.78
}

// Desconto anual 2026 — equivalente anual do desconto mensal (grossAnnual = gross × 12)
function descontoAnual(grossAnnual: number): number {
  if (grossAnnual <= 60000) return 3754.68          // 312.89 × 12
  if (grossAnnual <= 88200) return Math.max(0, 11743.44 - 0.133145 * grossAnnual)
  return 0
}

// IR anual final 2026 (progressivo − desconto)
function calcIRAnual(base: number, grossAnnual: number): number {
  if (grossAnnual <= 60000) return 0
  return Math.max(0, irAnualProgressivo(base) - descontoAnual(grossAnnual))
}

// Tabela regressiva PGBL — alíquota por prazo do aporte individual
function pgblAliquota(holdingYears: number): number {
  if (holdingYears < 2) return 0.35
  if (holdingYears < 4) return 0.30
  if (holdingYears < 6) return 0.25
  if (holdingYears < 8) return 0.20
  if (holdingYears < 10) return 0.15
  return 0.10
}

// Patrimônio PGBL líquido em t anos: cada aporte y tem seu prazo e alíquota próprios
function pgblNetAtYear(pgblContribAnual: number, r: number, t: number): number {
  let net = 0
  for (let y = 1; y <= t; y++) {
    const accumulated = pgblContribAnual * Math.pow(1 + r, t - y + 1)
    const aliq = pgblAliquota(t - y)   // aporte do ano y tem (t-y) anos de prazo
    net += accumulated * (1 - aliq)
  }
  return net
}

// Total acumulado bruto no PGBL em t anos (sem imposto)
function pgblGrossAtYear(pgblContribAnual: number, r: number, t: number): number {
  if (r === 0) return pgblContribAnual * t
  return pgblContribAnual * (1 + r) * (Math.pow(1 + r, t) - 1) / r
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
    comPGBL: {
      pgblGross: number; pgblTax: number; pgblNet: number
      savingsGross: number; savingsNet: number; totalNet: number
      effectiveRate: number
    }
    semPGBL: { gross: number; tax: number; net: number }
  }
}

export function calculate(input: PGBLInput): PGBLResult {
  const { monthlyGross, pgblPct, dependents, healthAnnual, educationAnnual, years, annualReturn } = input
  const r = annualReturn / 100

  const inssMonthly = calcINSS(monthlyGross)
  const irBase = Math.max(0, monthlyGross - inssMonthly)
  const irWithheld = calcIRMensal(irBase, monthlyGross)
  const netSalary = monthlyGross - inssMonthly - irWithheld

  const grossAnnual = monthlyGross * 12
  const inssAnnual = inssMonthly * 12
  const irWithheldAnnual = irWithheld * 12
  const pgblContribAnual = grossAnnual * (pgblPct / 100)
  const otherDeductionsAnnual = calcOtherDeductions(dependents, healthAnnual, educationAnnual)

  // Simplificado: 20% da renda bruta, limitado a R$ 17.640/ano
  const simpDeducao = Math.min(grossAnnual * 0.20, 17640)
  const simpBase = Math.max(0, grossAnnual - simpDeducao)
  const simpIRDue = calcIRAnual(simpBase, grossAnnual)

  // Completo sem PGBL
  const complDeducoes = inssAnnual + otherDeductionsAnnual
  const complBase = Math.max(0, grossAnnual - complDeducoes)
  const complIRDue = calcIRAnual(complBase, grossAnnual)

  // Completo com PGBL
  const pgblDeducoes = inssAnnual + pgblContribAnual + otherDeductionsAnnual
  const pgblBase = Math.max(0, grossAnnual - pgblDeducoes)
  const pgblIRDue = calcIRAnual(pgblBase, grossAnnual)

  const bestWithoutPGBL = Math.min(simpIRDue, complIRDue)
  const annualTaxSaving = Math.max(0, bestWithoutPGBL - pgblIRDue)

  // Projeção de longo prazo
  const longTerm: LongTermPoint[] = []
  let savingsBalance = 0
  let semPGBLBalance = 0

  for (let t = 1; t <= years; t++) {
    savingsBalance = (savingsBalance + annualTaxSaving) * (1 + r)
    semPGBLBalance = (semPGBLBalance + pgblContribAnual) * (1 + r)

    // PGBL: cada aporte com sua própria alíquota regressiva
    const pgblNetT = pgblNetAtYear(pgblContribAnual, r, t)
    const savingsGains = Math.max(0, savingsBalance - annualTaxSaving * t)
    const savingsNet = savingsBalance - savingsGains * 0.15
    const comPGBLNet = pgblNetT + savingsNet

    // Sem PGBL: IR 15% sobre ganhos
    const semGains = Math.max(0, semPGBLBalance - pgblContribAnual * t)
    const semPGBLNet = semPGBLBalance - semGains * 0.15

    longTerm.push({ year: t, comPGBL: comPGBLNet, semPGBL: semPGBLNet })
  }

  // Valores finais detalhados
  const pgblGross = pgblGrossAtYear(pgblContribAnual, r, years)
  const pgblNet = pgblNetAtYear(pgblContribAnual, r, years)
  const pgblTax = pgblGross - pgblNet
  const effectiveRate = pgblGross > 0 ? pgblTax / pgblGross : 0

  const finalSavingsGains = Math.max(0, savingsBalance - annualTaxSaving * years)
  const finalSavingsNet = savingsBalance - finalSavingsGains * 0.15

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
        pgblGross, pgblTax, pgblNet,
        savingsGross: savingsBalance,
        savingsNet: finalSavingsNet,
        totalNet: pgblNet + finalSavingsNet,
        effectiveRate,
      },
      semPGBL: {
        gross: semPGBLBalance,
        tax: finalSemGains * 0.15,
        net: semPGBLBalance - finalSemGains * 0.15,
      },
    },
  }
}
