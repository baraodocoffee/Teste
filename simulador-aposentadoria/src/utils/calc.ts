export type InvestorProfile = 'conservador' | 'moderado' | 'arrojado'

export interface SimulationInput {
  currentAge: number
  retirementAge: number
  currentPatrimony: number
  monthlyContribution: number
  profile: InvestorProfile
}

export interface YearlySnapshot {
  age: number
  patrimony: number
  contributed: number
  returns: number
}

export interface SimulationResult {
  finalPatrimony: number
  monthlyPassiveIncome: number
  totalContributed: number
  totalReturns: number
  snapshots: YearlySnapshot[]
  annualRealReturn: number
  yearsToRetirement: number
}

export const PROFILE_CONFIG = {
  conservador: {
    annualReturn: 0.04,
    label: 'Conservador',
    sublabel: 'Renda fixa predominante',
    returnLabel: '4% a.a. real',
  },
  moderado: {
    annualReturn: 0.06,
    label: 'Moderado',
    sublabel: 'Mix balanceado',
    returnLabel: '6% a.a. real',
  },
  arrojado: {
    annualReturn: 0.08,
    label: 'Arrojado',
    sublabel: 'Maior exposição em renda variável',
    returnLabel: '8% a.a. real',
  },
} as const

// 4% withdrawal rule: sustains portfolio indefinitely with high probability
const ANNUAL_WITHDRAWAL_RATE = 0.04

export function simulate(input: SimulationInput): SimulationResult {
  const { currentAge, retirementAge, currentPatrimony, monthlyContribution, profile } = input

  const yearsToRetirement = Math.max(retirementAge - currentAge, 1)
  const annualRealReturn = PROFILE_CONFIG[profile].annualReturn
  const monthlyRate = Math.pow(1 + annualRealReturn, 1 / 12) - 1
  const totalMonths = yearsToRetirement * 12

  const snapshots: YearlySnapshot[] = [
    {
      age: currentAge,
      patrimony: Math.round(currentPatrimony),
      contributed: Math.round(currentPatrimony),
      returns: 0,
    },
  ]

  let patrimony = currentPatrimony
  let totalContributed = currentPatrimony

  for (let month = 1; month <= totalMonths; month++) {
    patrimony = patrimony * (1 + monthlyRate) + monthlyContribution
    totalContributed += monthlyContribution

    if (month % 12 === 0) {
      const returns = patrimony - totalContributed
      snapshots.push({
        age: currentAge + month / 12,
        patrimony: Math.round(patrimony),
        contributed: Math.round(totalContributed),
        returns: Math.round(Math.max(returns, 0)),
      })
    }
  }

  const finalPatrimony = Math.round(patrimony)
  const totalReturns = Math.round(Math.max(patrimony - totalContributed, 0))

  return {
    finalPatrimony,
    monthlyPassiveIncome: Math.round((finalPatrimony * ANNUAL_WITHDRAWAL_RATE) / 12),
    totalContributed: Math.round(totalContributed),
    totalReturns,
    snapshots,
    annualRealReturn,
    yearsToRetirement,
  }
}
