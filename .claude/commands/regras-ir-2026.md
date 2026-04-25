# Regras de Imposto de Renda e Previdência — Brasil 2026

Use este contexto sempre que trabalhar em ferramentas de planejamento financeiro relacionadas a IR, PGBL, VGBL, INSS ou declaração de ajuste anual.

---

## INSS 2026 — Tabela Progressiva Mensal

Contribuição calculada de forma progressiva sobre o salário bruto:

| Faixa salarial | Alíquota |
|---|---|
| Até R$ 1.518,00 | 7,5% |
| R$ 1.518,01 a R$ 2.793,88 | 9,0% |
| R$ 2.793,89 a R$ 4.190,83 | 12,0% |
| R$ 4.190,84 a R$ 8.475,55 | 14,0% |

- **Teto do salário de contribuição:** R$ 8.475,55/mês
- **Contribuição máxima (teto):** R$ 988,09/mês
- Acima do teto: contribuição é sempre R$ 988,09 (não cresce mais)
- Aplica-se a empregados CLT, domésticos e contribuintes individuais (com variações)

**Exemplo — salário R$ 12.000:**
INSS = 113,85 + 114,83 + 167,63 + 599,86 = 996,17 → **cap em R$ 988,09** (teto)

---

## IR 2026 — Tabela Progressiva Mensal (IRRF na fonte)

Base de cálculo = salário bruto − INSS − outras deduções mensais

| Base de cálculo | Alíquota | Parcela a deduzir |
|---|---|---|
| Até R$ 2.428,80 | 0% | — |
| R$ 2.428,81 a R$ 2.826,65 | 7,5% | R$ 182,16 |
| R$ 2.826,66 a R$ 3.751,05 | 15,0% | R$ 394,16 |
| R$ 3.751,06 a R$ 4.664,68 | 22,5% | R$ 675,49 |
| Acima de R$ 4.664,68 | 27,5% | R$ 908,73 |

**Fórmula:** IR = base × alíquota − parcela a deduzir

**Exemplo — salário R$ 12.000:**
- INSS: R$ 988,09 → base IR = R$ 11.011,91
- IR = 11.011,91 × 27,5% − 908,73 = 3.028,27 − 908,73 = **R$ 2.119,54/mês**

---

## IR 2026 — Novo Desconto por Faixa de Renda (Reforma 2026)

Aplicado **sobre o IR calculado**, baseado na **renda bruta mensal**:

| Renda bruta mensal | Desconto | Efeito |
|---|---|---|
| Até R$ 5.000 | R$ 312,89 | IR zerado |
| R$ 5.000,01 a R$ 7.350 | R$ 978,62 − (0,133145 × renda) | Redução decrescente |
| Acima de R$ 7.350 | Sem desconto | Tabela normal |

- Para renda ≤ R$ 5.000: IR final = 0 (isento)
- Para R$ 5.000,01 a R$ 7.350: IR final = max(0, IR_tabela − desconto)
- O coeficiente 0,133145 zera o desconto exatamente em R$ 7.350

**Equivalente anual** (renda bruta anual = mensal × 12):

| Renda bruta anual | Desconto anual |
|---|---|
| Até R$ 60.000 | R$ 3.754,68 → IR zerado |
| R$ 60.001 a R$ 88.200 | R$ 11.743,44 − (0,133145 × renda anual) |
| Acima de R$ 88.200 | Sem desconto |

---

## IR 2026 — Tabela Progressiva Anual (Declaração de Ajuste)

Base de cálculo = renda bruta anual − deduções totais (INSS + PGBL + saúde + dependentes + educação)

| Base de cálculo | Alíquota | Parcela a deduzir |
|---|---|---|
| Até R$ 28.467,20 | 0% | — |
| R$ 28.467,21 a R$ 33.919,80 | 7,5% | R$ 2.135,04 |
| R$ 33.919,81 a R$ 45.012,60 | 15,0% | R$ 4.679,02 |
| R$ 45.012,61 a R$ 55.976,16 | 22,5% | R$ 8.054,97 |
| Acima de R$ 55.976,16 | 27,5% | R$ 10.853,78 |

Após calcular o IR pela tabela, aplicar o desconto anual da reforma 2026 (tabela acima).

---

## Declaração de Ajuste Anual — Simplificada vs. Completa

### Modelo Simplificado
- **Desconto padrão:** 20% da renda bruta tributável
- **Limite:** R$ 17.640/ano (independente da renda)
- Não permite deduzir INSS, dependentes, saúde, educação ou PGBL individualmente
- Vantajoso para quem tem poucas deduções reais

### Modelo Completo
Permite deduzir:
1. **INSS pago** (sem limite)
2. **PGBL** — até 12% da renda bruta tributável (ver seção PGBL)
3. **Dependentes** — R$ 2.275,08/dependente/ano
4. **Saúde** — sem limite (médico, dentista, hospital, plano de saúde)
5. **Educação** — até R$ 3.561,50/pessoa/ano (titular + cada dependente)
6. **Pensão alimentícia** — valor integral se homologada judicialmente
7. **Previdência oficial** — INSS e regimes próprios (já incluso no item 1)

**Quando usar o Completo:** quando a soma das deduções reais supera R$ 17.640/ano (ou o equivalente a 20% da renda, o que for menor).

---

## Deduções Detalhadas — Modelo Completo 2026

### Dependentes
- **R$ 2.275,08/ano por dependente**
- Cônjuge, filhos até 21 anos (ou 24 se em universidade), pais, avós (se sem renda própria)

### Saúde
- **Sem limite de valor**
- Médicos, dentistas, psicólogos, fonoaudiólogos, fisioterapeutas
- Internações, cirurgias, próteses
- Plano de saúde (titular e dependentes)
- Exige comprovação (notas fiscais / recibos)

### Educação
- **Limite: R$ 3.561,50/pessoa/ano** (titular + cada dependente)
- Educação infantil, fundamental, médio, superior
- Pós-graduação, mestrado, doutorado
- Educação profissionalizante (técnico)
- **Não inclui:** cursos livres, idiomas, material didático

---

## PGBL — Plano Gerador de Benefício Livre

### Como funciona
- Contribuições deduzem a **base de cálculo do IR** na declaração completa
- Limite de dedução: **até 12% da renda bruta tributável anual**
- Na saída (resgate ou benefício): IR incide sobre o **saldo total** (principal + ganhos)
- Vantajoso apenas para quem:
  - Paga IR na declaração completa
  - Usa o modelo completo (não simplificado)
  - Contribui ao INSS ou regime próprio

### Quando NÃO faz sentido
- Renda bruta ≤ R$ 5.000/mês (isento — PGBL criaria passivo sem benefício)
- Renda R$ 5.001–7.350/mês (IR muito baixo — custo na saída pode superar o ganho)
- Quem usa declaração simplificada (PGBL não é dedutível no simplificado)
- Quem não contribui ao INSS ou regime próprio

### Tabela Regressiva PGBL — por prazo de CADA APORTE
A alíquota se aplica ao **saldo total resgatado** e é determinada pelo prazo individual de cada contribuição:

| Prazo do aporte até o resgate | Alíquota |
|---|---|
| Até 2 anos | 35% |
| 2 a 4 anos | 30% |
| 4 a 6 anos | 25% |
| 6 a 8 anos | 20% |
| 8 a 10 anos | 15% |
| Acima de 10 anos | 10% |

⚠️ **Atenção:** a alíquota de 10% aplica-se a cada aporte individualmente — não ao saldo total. Num plano com 10 anos de acumulação, o último aporte (feito no ano 10) tem 0 anos de prazo e paga 35%. Somente os aportes feitos há mais de 10 anos pagam 10%.

**Alíquota efetiva real** (exemplo — horizonte 20 anos, aportes anuais):
- Aportes dos anos 1–10: ≥10 anos → 10%
- Aportes dos anos 11–12: 8–9 anos → 15%
- Aportes dos anos 13–14: 6–7 anos → 20%
- Aportes dos anos 15–16: 4–5 anos → 25%
- Aportes dos anos 17–18: 2–3 anos → 30%
- Aportes dos anos 19–20: 0–1 ano → 35%
- **Alíquota efetiva resultante: ~15–18%** (não 10%)

---

## VGBL — Vida Gerador de Benefício Livre

- **Não deduz** da base de cálculo do IR (não há benefício fiscal na entrada)
- Na saída: IR incide **apenas sobre os ganhos** (não sobre o principal)
- Mesma tabela regressiva do PGBL (10% a 35% por prazo de aporte)
- Indicado para:
  - Quem declara pelo modelo simplificado
  - Quem já atingiu o limite de 12% do PGBL e quer investir mais
  - Quem está isento de IR (renda ≤ R$ 5.000)
  - Quem quer previdência sem foco no benefício fiscal de curto prazo

### PGBL vs VGBL — comparação direta

| | PGBL | VGBL |
|---|---|---|
| Deduz IR na entrada | Sim (até 12% da renda) | Não |
| IR na saída | Sobre saldo total | Só sobre ganhos |
| Para quem | Declaração completa, paga IR | Qualquer perfil |
| Benefício fiscal | Diferimento do imposto | Nenhum na entrada |

---

## Tabela Regressiva de IR — Investimentos (CDB, Tesouro, Fundos)

Aplica-se por **dias corridos** a partir da data de cada aplicação:

| Prazo | Alíquota sobre ganhos |
|---|---|
| Até 180 dias | 22,5% |
| 181 a 360 dias | 20,0% |
| 361 a 720 dias | 17,5% |
| Acima de 720 dias | 15,0% |

- LCI e LCA: **isentas de IR** para pessoa física (qualquer prazo)
- Poupança: isenta de IR para PF

---

## Regras Gerais Importantes

- **13º salário:** tem tributação própria (base separada, não entra na tabela anual diretamente)
- **PLR:** tributação exclusiva na fonte (tabela própria, não acumula com salário)
- **Renda de aluguel:** tributação via carnê-leão mensal (mesma tabela progressiva mensal)
- **Ganho de capital (ações):** 15% para operações normais, 20% day-trade
- **Dividendos (2026):** isentos para PF (possível mudança em discussão no Congresso)
- A declaração de ajuste anual compara o IR devido (tabela anual) com o IRRF já retido na fonte. Diferença positiva = restituição; negativa = imposto a pagar (DARF).
