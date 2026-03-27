import { Layers, Zap, Shield } from 'lucide-react';

export type ScenarioType = 'standard' | 'pressure' | 'control';

interface ScenarioSelectorProps {
  activeScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
}

export function ScenarioSelector({ activeScenario, onScenarioChange }: ScenarioSelectorProps) {
  const scenarios = [
    {
      id: 'standard' as ScenarioType,
      label: 'Cenário Base',
      description: 'Condições de início Padrão',
      icon: Layers
    },
    {
      id: 'pressure' as ScenarioType,
      label: 'Momentum+',
      description: 'Pressão Alta do Mandante',
      icon: Zap
    },
    {
      id: 'control' as ScenarioType,
      label: 'Posse e Controle',
      description: 'Focado em Construção',
      icon: Shield
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="bg-[#00D26A]/10 p-2 rounded-lg border border-[#00D26A]/20">
           <Layers className="w-4 h-4 text-[#00D26A]" />
        </div>
        <h3 className="text-white font-black uppercase tracking-[0.15em] text-sm">Simulador de Cenários</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          const Icon = scenario.icon;

          return (
            <button
              key={scenario.id}
              onClick={() => onScenarioChange(scenario.id)}
              className={`text-left rounded-xl p-4 transition-all duration-300 relative overflow-hidden group border ${
                isActive 
                  ? 'bg-[#0b0d30] border-[#00D26A] shadow-[0_0_20px_rgba(0,210,106,0.2)]' 
                  : 'bg-[#141745]/60 backdrop-blur-md border-white/5 hover:border-[#00D26A]/40'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                  isActive ? 'bg-[#00D26A]/20 ring-1 ring-[#00D26A]/50' : 'bg-black/20 group-hover:bg-[#00D26A]/10'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D26A]' : 'text-white/50 group-hover:text-[#00D26A]/70'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-widest mb-0.5 ${isActive ? 'text-[#00D26A]' : 'text-white/70 group-hover:text-white'}`}>
                    {scenario.label}
                  </h4>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-white/50' : 'text-white/30'}`}>
                    {scenario.description}
                  </p>
                </div>
              </div>

              {isActive && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse shadow-[0_0_8px_rgba(0,210,106,1)]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
