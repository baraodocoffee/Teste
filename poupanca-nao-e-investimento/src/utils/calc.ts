export interface SavingsInput {
  principal: number       // valor inicial (R$)
  monthlyContrib: number  // aporte mensal (R$)
  years: number           // prazo em anos (1–30)
  selic: number           // Selic % a.a. (ex: 14.75)
  ipca: number            // IPCA esperado % a.a. (ex: 5.0)
}

export interface YearlySnapshot {
  year: number
  poupanca: number
  tesouroSelic: number
  cdb: number
  contributed: number
}

export interface AssetResult {
  netBalance: number
  totalContributed: number
  netGain: number
  irAmount: number
  effectiveGrossRate: number  // % a.a. bruta
  effectiveNetRate: number    // % a.a. líquida (TIR simplificada)
  realNetBalance: number      // poder de compra hoje (deflacionado pelo IPCA)
  totalReturn: number         // % sobre o capital total investido
}

export interface SavingsResult {
  poupanca: AssetResult
  tesouroSelic: AssetResult
  cdb: AssetResult
  snapshots: YearlySnapshot[]
  poupancaAnnualRate: number     // % a.a. da poupança
  tesouroSelicGrossRate: number  // % a.a. bruta do Tesouro Selic
  cdiRate: number                // % a.a. do CDI
  opportunityCostTesouro: number // R$ deixados na mesa vs Tesouro Selic
  opportunityCostCDB: number     // R$ deixados na mesa vs CDB
  isSelicCapped: boolean         // true quando SELIC > 8.5% (regra cap 0.5% a.m.)
}

// Converte taxa anual nominal para taxa mensal equivalente (juros compostos)
function annualToMonthly(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1
}

function simulateAsset(
  principal: number,
  monthlyContrib: number,
  monthlyRate: number,
  years: number,
  irRate: number,
): { netBalance: number; grossBalance: number; contributed: number; yearlyNetBalances: number[] } {
  let balance = principal
  let contributed = principal
  const yearlyNetBalances: number[] = []

  for (let m = 1; m <= years * 12; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContrib
    contributed += monthlyContrib

    if (m % 12 === 0) {
      const gains = balance - contributed
      const netAtYear = gains > 0 ? contributed + gains * (1 - irRate) : balance
      yearlyNetBalances.push(netAtYear)
    }
  }

  const totalGains = balance - contributed
  const netBalance = totalGains > 0 ? contributed + totalGains * (1 - irRate) : balance

  return { netBalance, grossBalance: balance, contributed, yearlyNetBalances }
}

function buildAssetResult(
  netBalance: number,
  totalContributed: number,
  grossAnnualRate: number,
  years: number,
  ipca: number,
  irRate: number,
  grossBalance: number,
): AssetResult {
  const totalGains = grossBalance - totalContributed
  const irAmount = totalGains > 0 ? totalGains * irRate : 0
  const netGain = netBalance - totalContributed

  // TIR simplificada: taxa que faz o capital total crescer até o saldo líquido
  const effectiveNetRate = (Math.pow(netBalance / totalContributed, 1 / years) - 1) * 100

  // Poder de compra deflacionado pelo IPCA acumulado
  const ipcaAccumulated = Math.pow(1 + ipca / 100, years)
  const realNetBalance = netBalance / ipcaAccumulated

  const totalReturn = totalContributed > 0 ? (netGain / totalContributed) * 100 : 0

  return {
    netBalance,
    totalContributed,
    netGain,
    irAmount,
    effectiveGrossRate: grossAnnualRate,
    effectiveNetRate,
    realNetBalance,
    totalReturn,
  }
}

export function calculate(input: SavingsInput): SavingsResult {
  const { principal, monthlyContrib, years, selic, ipca } = input

  // — Poupança —
  // Regra: SELIC > 8.5% → 0.5% a.m. fixo; SELIC ≤ 8.5% → 70% da SELIC
  const isSelicCapped = selic > 8.5
  const poupancaMonthly = isSelicCapped
    ? 0.005
    : annualToMonthly(selic * 0.70)
  const poupancaAnnualRate = (Math.pow(1 + poupancaMonthly, 12) - 1) * 100

  // — Tesouro Selic —
  // Taxa bruta: Selic - 0.20% (taxa de custódia B3)
  const tesouroSelicGrossRate = Math.max(selic - 0.20, 0)
  const tesouroSelicMonthly = annualToMonthly(tesouroSelicGrossRate)

  // — CDB 100% CDI —
  // CDI ≈ Selic - 0.10%
  const cdiRate = Math.max(selic - 0.10, 0)
  const cdbMonthly = annualToMonthly(cdiRate)

  const IR_LONG = 0.15  // alíquota LP (> 720 dias)

  const poupSim = simulateAsset(principal, monthlyContrib, poupancaMonthly, years, 0)
  const tesouroSim = simulateAsset(principal, monthlyContrib, tesouroSelicMonthly, years, IR_LONG)
  const cdbSim = simulateAsset(principal, monthlyContrib, cdbMonthly, years, IR_LONG)

  // Snapshots anuais para o gráfico
  const snapshots: YearlySnapshot[] = poupSim.yearlyNetBalances.map((poupVal, i) => ({
    year: i + 1,
    poupanca: poupVal,
    tesouroSelic: tesouroSim.yearlyNetBalances[i],
    cdb: cdbSim.yearlyNetBalances[i],
    contributed: principal + monthlyContrib * 12 * (i + 1),
  }))

  const totalContributed = principal + monthlyContrib * 12 * years

  const poupancaResult = buildAssetResult(
    poupSim.netBalance, totalContributed, poupancaAnnualRate, years, ipca, 0, poupSim.grossBalance,
  )
  const tesouroResult = buildAssetResult(
    tesouroSim.netBalance, totalContributed, tesouroSelicGrossRate, years, ipca, IR_LONG, tesouroSim.grossBalance,
  )
  const cdbResult = buildAssetResult(
    cdbSim.netBalance, totalContributed, cdiRate, years, ipca, IR_LONG, cdbSim.grossBalance,
  )

  return {
    poupanca: poupancaResult,
    tesouroSelic: tesouroResult,
    cdb: cdbResult,
    snapshots,
    poupancaAnnualRate,
    tesouroSelicGrossRate,
    cdiRate,
    opportunityCostTesouro: tesouroSim.netBalance - poupSim.netBalance,
    opportunityCostCDB: cdbSim.netBalance - poupSim.netBalance,
    isSelicCapped,
  }
}
