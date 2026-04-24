export default function Disclaimers() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-xs text-slate-500 space-y-1 leading-relaxed">
      <p className="font-medium text-slate-600">Notas metodológicas</p>
      <p>
        Tabelas INSS e IR 2026. Renda anual calculada sobre 12 salários (13º salário não incluso).
        INSS progressivo com teto de R$ 8.475,55 (máx. R$ 988,09/mês).
        IR 2026 com isenção/redução para renda bruta até R$ 7.350/mês (R$ 88.200/ano).
      </p>
      <p>
        Simplificado: desconto de 20% da renda bruta, limitado a R$ 17.640/ano.
        PGBL: deduz até 12% da renda bruta tributável; tributação na saída pela tabela regressiva
        aplicada por aporte individual — cada contribuição tem sua própria alíquota conforme o tempo investido
        (10% acima de 10 anos, 35% abaixo de 2 anos).
      </p>
      <p>
        Projeção de longo prazo: aportes anuais com rentabilidade nominal constante.
        Economia de IR reinvestida em produto com IR de 15% apenas sobre ganhos.
        Simulação educacional — não constitui recomendação de investimento.
      </p>
    </div>
  )
}
