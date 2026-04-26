import { Scenario } from '../utils/calc'

interface ScenarioDef {
  id: Scenario
  label: string
  badge?: string
  desc: string
  endRate: string
  color: string
  activeColor: string
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'suave',
    label: 'Queda Suave',
    desc: 'Ciclo de cortes gradual — Selic encerra 2029 em 11,0%',
    endRate: '11,0%',
    color: 'border-amber-200 hover:border-amber-300',
    activeColor: 'border-amber-400 bg-amber-50',
  },
  {
    id: 'moderado',
    label: 'Queda Moderada',
    badge: 'Focus',
    desc: 'Projeção do Relatório Focus de abril/2026 — Selic a 9,88% em 2029',
    endRate: '9,88%',
    color: 'border-blue-200 hover:border-blue-300',
    activeColor: 'border-blue-500 bg-blue-50',
  },
  {
    id: 'acentuado',
    label: 'Queda Acentuada',
    desc: 'Cortes mais intensos que o esperado — Selic a 7,5% em 2029',
    endRate: '7,5%',
    color: 'border-red-200 hover:border-red-300',
    activeColor: 'border-red-400 bg-red-50',
  },
]

interface Props {
  selected: Scenario
  onChange: (s: Scenario) => void
}

export default function ScenarioTabs({ selected, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-3">Cenário de trajetória da Selic</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SCENARIOS.map(s => {
          const active = selected === s.id
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                active ? s.activeColor : `bg-white ${s.color}`
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${active ? 'text-slate-800' : 'text-slate-600'}`}>
                  {s.label}
                </span>
                {s.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white tracking-wide">
                    {s.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              <p className={`text-xs font-semibold mt-2 ${active ? 'text-slate-700' : 'text-slate-400'}`}>
                Selic 2029: {s.endRate}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
