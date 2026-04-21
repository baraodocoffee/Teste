export type InvestorProfile = 'conservador' | 'moderado' | 'arrojado'

export interface CalcInput {
  currentAge: number
  currentPatrimony: number
  monthlyContribution: number
  desiredMonthlyIncome: number
  profile: InvestorProfile
}

export interface YearlySnapshot {
  age: number
  patrimony: number
  contributed: number
  fireNumber: number
}

export interface CalcResult {
  fireNumber: number
  currentProgress: number
  yearsToFire: number | null
  ageAtFire: number | null
  currentPassiveIncome: number
  snapshots: YearlySnapshot[]
  alreadyFree: boolean
  reachable: boolean
  annualRealReturn: number
  totalContributed: number
  totalReturns: number
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

// Regra dos 4% (Trinity Study): sustenta o patrimônio indefinidamente
const WITHDRAWAL_RATE = 0.04
const MAX_YEARS = 50

export function calculate(input: CalcInput): CalcResult {
  const { currentAge, currentPatrimony, monthlyContribution, desiredMonthlyIncome, profile } = input

  const annualRealReturn = PROFILE_CONFIG[profile].annualReturn
  const monthlyRate = Math.pow(1 + annualRealReturn, 1 / 12) - 1
  const fireNumber = Math.round((desiredMonthlyIncome * 12) / WITHDRAWAL_RATE)
  const currentPassiveIncome = Math.round((currentPatrimony * WITHDRAWAL_RATE) / 12)
  const currentProgress = Math.min(Math.round((currentPatrimony / fireNumber) * 100), 100)
  const alreadyFree = currentPatrimony >= fireNumber

  if (alreadyFree) {
    return {
      fireNumber,
      currentProgress: 100,
      yearsToFire: 0,
      ageAtFire: currentAge,
      currentPassiveIncome,
      snapshots: [{ age: currentAge, patrimony: Math.round(currentPatrimony), contributed: Math.round(currentPatrimony), fireNumber }],
      alreadyFree: true,
      reachable: true,
      annualRealReturn,
      totalContributed: Math.round(currentPatrimony),
      totalReturns: 0,
    }
  }

  const snapshots: YearlySnapshot[] = [
    { age: currentAge, patrimony: Math.round(currentPatrimony), contributed: Math.round(currentPatrimony), fireNumber },
  ]

  let patrimony = currentPatrimony
  let totalContributed = currentPatrimony
  let fireMonth: number | null = null

  for (let month = 1; month <= MAX_YEARS * 12; month++) {
    patrimony = patrimony * (1 + monthlyRate) + monthlyContribution
    totalContributed += monthlyContribution

    if (fireMonth === null && patrimony >= fireNumber) {
      fireMonth = month
    }

    if (month % 12 === 0) {
      snapshots.push({
        age: currentAge + month / 12,
        patrimony: Math.round(patrimony),
        contributed: Math.round(totalContributed),
        fireNumber,
      })
    }
  }

  const yearsToFire = fireMonth !== null ? Math.ceil(fireMonth / 12) : null
  const ageAtFire = yearsToFire !== null ? currentAge + yearsToFire : null

  return {
    fireNumber,
    currentProgress,
    yearsToFire,
    ageAtFire,
    currentPassiveIncome,
    snapshots,
    alreadyFree: false,
    reachable: fireMonth !== null,
    annualRealReturn,
    totalContributed: Math.round(totalContributed),
    totalReturns: Math.round(Math.max(patrimony - totalContributed, 0)),
  }
}
