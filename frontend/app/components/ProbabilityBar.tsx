import { LucideIcon, BarChart3, Brain, Settings } from 'lucide-react';
import { useState } from 'react';

export type MethodType = 'statistical' | 'ml' | 'heuristic';

interface ProbabilityBarProps {
  icon: LucideIcon;
  label: string;
  homeTeam: string;
  awayTeam: string;
  homeProbability: number;
  awayProbability: number;
  drawProbability?: number;
  color: 'goal' | 'card' | 'penalty' | 'winner';
  reasoning: string;
  source: string;
  methodType?: MethodType;
}

export function ProbabilityBar({
  icon: Icon,
  label,
  homeTeam,
  awayTeam,
  homeProbability,
  awayProbability,
  drawProbability,
  color,
  reasoning,
  source,
  methodType = 'statistical'
}: ProbabilityBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getMethodBadge = (type: MethodType) => {
    const badges = {
      statistical: {
        icon: BarChart3,
        label: 'Estatístico',
        color: 'bg-blue-100 text-blue-700 border-blue-200'
      },
      ml: {
        icon: Brain,
        label: 'Machine Learning',
        color: 'bg-purple-100 text-purple-700 border-purple-200'
      },
      heuristic: {
        icon: Settings,
        label: 'Heurístico',
        color: 'bg-slate-100 text-slate-700 border-slate-200'
      }
    };
    return badges[type];
  };

  const methodBadge = getMethodBadge(methodType);
  const MethodIcon = methodBadge.icon;

  const getColorClasses = (type: typeof color, isHome: boolean) => {
    const colorMap = {
      goal: isHome ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600',
      card: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      penalty: 'bg-gradient-to-r from-red-500 to-rose-600',
      winner: isHome ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600'
    };
    return colorMap[type];
  };

  const total = homeProbability + awayProbability + (drawProbability || 0);
  const homeWidth = (homeProbability / total) * 100;
  const drawWidth = drawProbability ? (drawProbability / total) * 100 : 0;
  const awayWidth = (awayProbability / total) * 100;

  return (
    <div className="relative group">
      <div
        className="bg-white rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Icon className="w-5 h-5 text-slate-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-slate-900">{label}</h3>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${methodBadge.color}`}>
                <MethodIcon className="w-3 h-3" />
                <span>{methodBadge.label}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">{source}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{homeTeam}</span>
            <span className="text-slate-900">{homeProbability}%</span>
          </div>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className={`${getColorClasses(color, true)} transition-all duration-500 ease-out`}
              style={{ width: `${homeWidth}%` }}
            />
            {drawProbability && drawProbability > 0 && (
              <div
                className="bg-gradient-to-r from-slate-300 to-slate-400 transition-all duration-500 ease-out"
                style={{ width: `${drawWidth}%` }}
              />
            )}
            <div
              className={`${getColorClasses(color, false)} transition-all duration-500 ease-out`}
              style={{ width: `${awayWidth}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{awayTeam}</span>
            <span className="text-slate-900">{awayProbability}%</span>
          </div>

          {drawProbability && drawProbability > 0 && (
            <div className="flex items-center justify-center text-xs text-slate-500 pt-1 border-t border-slate-100">
              Empate: {drawProbability}%
            </div>
          )}
        </div>
      </div>

      {showTooltip && (
        <div className="absolute z-50 left-0 right-0 -bottom-2 translate-y-full">
          <div className="bg-slate-900 text-white text-sm rounded-lg p-3 shadow-xl max-w-sm mx-auto">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
              <p className="leading-relaxed">{reasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
