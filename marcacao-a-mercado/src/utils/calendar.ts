// Algoritmo de Meeus/Jones/Butcher para calcular a Páscoa
function easterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function shift(d: Date, days: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildHolidaySet(year: number): Set<string> {
  const s = new Set<string>()
  const add = (d: Date) => s.add(dateKey(d))

  // Feriados nacionais fixos
  add(new Date(year, 0, 1))   // Confraternização Universal
  add(new Date(year, 3, 21))  // Tiradentes
  add(new Date(year, 4, 1))   // Dia do Trabalho
  add(new Date(year, 8, 7))   // Independência
  add(new Date(year, 9, 12))  // Nossa Senhora Aparecida
  add(new Date(year, 10, 2))  // Finados
  add(new Date(year, 10, 15)) // Proclamação da República
  add(new Date(year, 10, 20)) // Consciência Negra (Lei 14.759/2023)
  add(new Date(year, 11, 25)) // Natal
  add(new Date(year, 11, 31)) // 31/dez — convenção ANBIMA

  // Feriados móveis calculados a partir da Páscoa
  const easter = easterDate(year)
  add(shift(easter, -48)) // Segunda-feira de Carnaval
  add(shift(easter, -47)) // Terça-feira de Carnaval
  add(shift(easter, -2))  // Sexta-feira Santa
  add(shift(easter, 60))  // Corpus Christi

  return s
}

const _cache = new Map<number, Set<string>>()

function holidaysOf(year: number): Set<string> {
  if (!_cache.has(year)) _cache.set(year, buildHolidaySet(year))
  return _cache.get(year)!
}

export function isBusinessDay(d: Date): boolean {
  const dow = d.getDay()
  if (dow === 0 || dow === 6) return false
  return !holidaysOf(d.getFullYear()).has(dateKey(d))
}

// Conta dias úteis de `from` (exclusive) até `to` (inclusive) — convenção BM&F/ANBIMA
export function countDU(from: Date, to: Date): number {
  if (from >= to) return 0
  let count = 0
  const cur = new Date(from)
  while (cur < to) {
    cur.setDate(cur.getDate() + 1)
    if (isBusinessDay(cur)) count++
  }
  return count
}

export function countCalendarDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}
