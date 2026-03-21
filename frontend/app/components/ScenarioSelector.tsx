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
      label: 'Cenário Padrão',
      description: 'Previsão base do modelo',
      icon: Layers,
      color: 'blue'
    },
    {
      id: 'pressure' as ScenarioType,
      label: 'Sob Pressão',
      description: 'Time perdendo cedo',
      icon: Zap,
      color: 'amber'
    },
    {
      id: 'control' as ScenarioType,
      label: 'Controle de Jogo',
      description: 'Alta posse de bola',
      icon: Shield,
      color: 'emerald'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        bg: isActive ? 'bg-blue-500' : 'bg-white hover:bg-blue-50',
        text: isActive ? 'text-white' : 'text-blue-600',
        border: isActive ? 'border-blue-500' : 'border-blue-200 hover:border-blue-300',
        iconBg: isActive ? 'bg-blue-400' : 'bg-blue-100'
      },
      amber: {
        bg: isActive ? 'bg-amber-500' : 'bg-white hover:bg-amber-50',
        text: isActive ? 'text-white' : 'text-amber-600',
        border: isActive ? 'border-amber-500' : 'border-amber-200 hover:border-amber-300',
        iconBg: isActive ? 'bg-amber-400' : 'bg-amber-100'
      },
      emerald: {
        bg: isActive ? 'bg-emerald-500' : 'bg-white hover:bg-emerald-50',
        text: isActive ? 'text-white' : 'text-emerald-600',
        border: isActive ? 'border-emerald-500' : 'border-emerald-200 hover:border-emerald-300',
        iconBg: isActive ? 'bg-emerald-400' : 'bg-emerald-100'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Layers className="w-4 h-4 text-indigo-600" />
        <h3 className="text-slate-900">Explorar Cenários</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          const Icon = scenario.icon;
          const colors = getColorClasses(scenario.color, isActive);

          return (
            <button
              key={scenario.id}
              onClick={() => onScenarioChange(scenario.id)}
              className={`${colors.bg} ${colors.border} border rounded-xl p-4 transition-all duration-200 ${
                isActive ? 'shadow-lg scale-105' : 'shadow-sm hover:shadow-md'
              } text-left`}
            >
              <div className="flex items-start gap-3">
                <div className={`${colors.iconBg} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium mb-1 ${colors.text}`}>{scenario.label}</h4>
                  <p className={`text-xs ${isActive ? 'text-white/90' : 'text-slate-600'}`}>
                    {scenario.description}
                  </p>
                </div>
              </div>

              {isActive && (
                <div className="mt-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-xs text-white/90">Ativo</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 leading-relaxed">
          💡 Alterne entre cenários para ver como as probabilidades mudam em diferentes situações de jogo
        </p>
      </div>
    </div>
  );
}
