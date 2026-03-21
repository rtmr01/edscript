import { Trophy, TrendingUp } from 'lucide-react';

interface MatchScenarioCardProps {
  mainInsight: string;
  confidence: number;
  reasoning: string;
}

export function MatchScenarioCard({ mainInsight, confidence, reasoning }: MatchScenarioCardProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 75) return 'from-emerald-500 to-green-600';
    if (conf >= 60) return 'from-blue-500 to-cyan-600';
    if (conf >= 45) return 'from-amber-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 75) return 'Altíssima';
    if (conf >= 60) return 'Alta';
    if (conf >= 45) return 'Moderada';
    return 'Baixa';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-6 shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -z-0" />

      <div className="relative z-10 flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xs uppercase tracking-wider text-slate-500">Cenário Principal</span>
          </div>

          <h2 className="text-3xl mb-4 text-slate-900 leading-tight">
            {mainInsight}
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            {reasoning}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`text-${confidence >= 75 ? 'emerald' : confidence >= 60 ? 'blue' : confidence >= 45 ? 'amber' : 'gray'}-500`} stopColor="currentColor" />
                  <stop offset="100%" className={`text-${confidence >= 75 ? 'green' : confidence >= 60 ? 'cyan' : confidence >= 45 ? 'orange' : 'gray'}-600`} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl text-slate-900">{confidence}%</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getConfidenceColor(confidence)}`} />
            <span className="text-xs text-slate-700">{getConfidenceLabel(confidence)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
