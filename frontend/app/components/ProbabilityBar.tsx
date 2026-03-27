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
        label: 'Análise Quant.',
        color: 'bg-white/5 text-white/50 border-white/10'
      },
      ml: {
        icon: Brain,
        label: 'A.I. Engine',
        color: 'bg-[#00D26A]/10 text-[#00D26A] border-[#00D26A]/30'
      },
      heuristic: {
        icon: Settings,
        label: 'Heurística Ativa',
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      }
    };
    return badges[type];
  };

  const methodBadge = getMethodBadge(methodType);
  const MethodIcon = methodBadge.icon;

  const getColorClasses = (type: typeof color, isHome: boolean) => {
    // Para dark mode tático, queremos cores mais controladas. Vitória verde, Cartões amarelo forte...
    const colorMap = {
      goal: isHome ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-gradient-to-r from-blue-900 to-blue-600',
      card: 'bg-gradient-to-r from-amber-500 to-orange-400',
      penalty: 'bg-gradient-to-r from-red-600 to-rose-500',
      winner: isHome ? 'bg-gradient-to-r from-[#00D26A] to-emerald-400' : 'bg-gradient-to-r from-[#0b0d30] to-[#121547]'
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
        className="bg-[#141745]/60 backdrop-blur-md rounded-2xl border border-white/5 p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,210,106,0.1)] hover:border-[#00D26A]/30 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
              <Icon className="w-4 h-4 text-[#00D26A]" />
            </div>
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-widest">{label}</h3>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#00D26A]/60 mt-0.5">{source}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[9px] uppercase tracking-wider font-bold ${methodBadge.color}`}>
             <MethodIcon className="w-3 h-3" />
             <span>{methodBadge.label}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold px-1 uppercase tracking-widest">
            <span className="text-white shrink-0 truncate max-w-[40%] text-left">{homeTeam}</span>
            <span className="text-[#00D26A]">{homeProbability}%</span>
            {drawProbability && drawProbability > 0 && (
               <span className="text-white/30 hidden sm:inline-block">EMP {drawProbability}%</span>
            )}
            <span className="text-white shrink-0 truncate max-w-[40%] text-right">{awayTeam}</span>
          </div>

          <div className="h-3 bg-black/30 rounded-full overflow-hidden flex ring-1 ring-white/5">
            <div
              className={`${getColorClasses(color, true)} transition-all duration-1000 ease-out`}
              style={{ width: `${homeWidth}%` }}
            />
            {drawProbability && drawProbability > 0 && (
              <div
                className="bg-white/10 transition-all duration-1000 ease-out"
                style={{ width: `${drawWidth}%` }}
              />
            )}
            <div
              className={`${getColorClasses(color, false)} transition-all duration-1000 ease-out relative`}
              style={{ width: `${awayWidth}%` }}
            >
               <div className="absolute inset-0 bg-white/20" />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs font-bold px-1 uppercase tracking-widest">
            <span className="text-white/50">{homeProbability}%</span>
            <span className="text-white/50">{awayProbability}%</span>
          </div>
        </div>
      </div>

      {showTooltip && (
        <div className="absolute z-50 left-0 right-0 -bottom-3 translate-y-full px-4">
          <div className="bg-[#0b0d30]/95 backdrop-blur-xl border border-[#00D26A]/30 text-white text-xs rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] max-w-sm mx-auto">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-[#00D26A]/20 shrink-0 mt-0.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse" />
              </div>
              <p className="leading-relaxed font-medium text-white/80">{reasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
