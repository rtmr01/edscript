import { Trophy, TrendingUp, Cpu } from 'lucide-react';

interface MatchScenarioCardProps {
  mainInsight: string;
  confidence: number;
  reasoning: string;
}

export function MatchScenarioCard({ mainInsight, confidence, reasoning }: MatchScenarioCardProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 75) return 'text-[#00D26A]';
    if (conf >= 60) return 'text-emerald-400';
    if (conf >= 45) return 'text-white/80';
    return 'text-white/40';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 75) return 'Altíssima';
    if (conf >= 60) return 'Alta';
    if (conf >= 45) return 'Moderada';
    return 'Baixa';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;
  const strokeColor = confidence >= 60 ? '#00D26A' : '#4b5563';

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#141745]/60 border border-white/5 p-8 backdrop-blur-md transition-shadow duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00D26A]/60" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
            <div className="bg-black/20 p-2 rounded-lg border border-white/5">
               <Cpu className="w-5 h-5 text-[#00D26A]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00D26A]/80">Cenário Preditivo Primário</span>
          </div>

          <h2 className="text-3xl md:text-4xl mb-5 font-black text-white leading-[1.15] tracking-tight">
            {mainInsight}
          </h2>

          <p className="text-sm text-white/50 leading-relaxed font-medium bg-[#0b0d30]/60 p-4 rounded-xl border border-white/5 shadow-inner">
            <strong className="text-white/80">Motivador Detectado:</strong> {reasoning}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 md:min-w-[140px] shrink-0">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" className="text-white/5" />
              <circle
                cx="50" cy="50" r="45" stroke={strokeColor} strokeWidth="6" fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                className="transition-all duration-1500 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black tracking-tighter ${getConfidenceColor(confidence)}`}>
                {confidence}<span className="text-lg opacity-40 ml-0.5">%</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/20 border border-white/5">
            <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D26A] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D26A]"></span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00D26A]/60">{getConfidenceLabel(confidence)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
