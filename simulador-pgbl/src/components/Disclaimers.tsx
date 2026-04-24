export default function Disclaimers() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-xs text-slate-500 space-y-1 leading-relaxed">
      <p className="font-medium text-slate-600">Notas metodológicas</p>
      <p>
        Tabelas INSS e IR 2026. Renda anual calculada sobre 12 salários (13º salário não incluso).
        INSS progressivo com teto de R$ 8.475,55 (contribuição máxima R$ 988,09/mês).
      </p>
      <p>
        Simplificado: desconto de 20% da renda bruta, limitado a R$ 17.640/ano.
        PGBL: deduz até 12% da renda bruta tributável, com tributação na saída pela tabela regressiva
        (mínimo 10% para resgates após 10 anos) sobre o valor total resgatado.
      </p>
      <p>
        Projeção de longo prazo: aportes anuais com rentabilidade nominal constante.
        Economia de IR reinvestida em produto com tributação de 15% apenas sobre ganhos.
        Simulação educacional — não constitui recomendação de investimento.
      </p>
    </div>
  )
}
