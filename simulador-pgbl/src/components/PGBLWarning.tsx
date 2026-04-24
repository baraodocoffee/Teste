interface Props {
  monthlyGross: number
}

export default function PGBLWarning({ monthlyGross }: Props) {
  if (monthlyGross > 7350) return null

  const isExempt = monthlyGross <= 5000

  return (
    <div className={`rounded-xl border p-5 flex gap-4 ${
      isExempt
        ? 'bg-red-50 border-red-200'
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="shrink-0 mt-0.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isExempt ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {isExempt ? '!' : 'i'}
        </div>
      </div>
      <div className="space-y-2">
        <p className={`text-sm font-semibold ${isExempt ? 'text-red-700' : 'text-amber-700'}`}>
          {isExempt
            ? 'Isento de IR — PGBL não gera benefício fiscal nesta faixa'
            : 'Faixa de IR subsidiado — benefício do PGBL muito reduzido'
          }
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          {isExempt
            ? <>
                Com renda bruta até <strong>R$ 5.000/mês</strong>, você não paga Imposto de Renda em 2026.
                O PGBL só faz sentido para quem paga IR na declaração completa e recolhe INSS.
                Ao contribuir para um PGBL, você criaria um passivo tributário que não existe hoje:{' '}
                <strong>na saída, o IR incide sobre o saldo total</strong> (principal + ganhos),
                enquanto numa aplicação comum o IR incide apenas sobre os ganhos.
              </>
            : <>
                Sua renda está na faixa em que o governo já subsidia o IR em 2026{' '}
                (<strong>R$ 5.000 a R$ 7.350/mês</strong>). O imposto é muito baixo,
                o que reduz drasticamente o benefício marginal do PGBL. O custo de tributar
                o <strong>principal</strong> na saída pode superar o ganho fiscal na entrada.
              </>
          }
        </p>
        <div className={`rounded-lg px-3 py-2.5 text-xs leading-relaxed ${
          isExempt ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
        }`}>
          <span className="font-semibold">Alternativa:</span> o <strong>VGBL</strong> costuma ser
          mais adequado nessa faixa — não deduz na entrada, mas tributa <em>apenas os ganhos</em>{' '}
          na saída pela tabela regressiva, sem criar passivo sobre o principal.
        </div>
      </div>
    </div>
  )
}
