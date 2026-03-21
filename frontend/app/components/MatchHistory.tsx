import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MatchResult {
  result: 'W' | 'D' | 'L';
  score: string;
}

interface TeamStats {
  name: string;
  recentForm: MatchResult[];
  offensiveTrend: number[]; // Goals scored per match
  defensiveTrend: number[]; // Goals conceded per match
}

interface MatchHistoryProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  headToHead: {
    homeWins: number;
    draws: number;
    awayWins: number;
  };
}

export function MatchHistory({ homeTeam, awayTeam, headToHead }: MatchHistoryProps) {
  const getResultIcon = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W':
        return <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">W</div>;
      case 'D':
        return <div className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold">E</div>;
      case 'L':
        return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">D</div>;
    }
  };

  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const pointWidth = width / (data.length - 1);

    const points = data
      .map((value, idx) => {
        const x = idx * pointWidth;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((value, idx) => {
          const x = idx * pointWidth;
          const y = height - ((value - min) / range) * height;
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          );
        })}
      </svg>
    );
  };

  const TeamFormCard = ({ team }: { team: TeamStats }) => {
    const avgOffensive = (team.offensiveTrend.reduce((a, b) => a + b, 0) / team.offensiveTrend.length).toFixed(1);
    const avgDefensive = (team.defensiveTrend.reduce((a, b) => a + b, 0) / team.defensiveTrend.length).toFixed(1);
    const trend = team.offensiveTrend[team.offensiveTrend.length - 1] > team.offensiveTrend[0];

    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h4 className="text-slate-900 mb-3">{team.name}</h4>

        {/* Recent form */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Últimos 5 Jogos</p>
          <div className="flex gap-1">
            {team.recentForm.map((match, idx) => (
              <div key={idx} className="group relative">
                {getResultIcon(match.result)}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {match.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offensive trend */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500">Gols Marcados</p>
            <div className="flex items-center gap-1">
              {trend ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className="text-xs font-medium text-slate-700">{avgOffensive}/jogo</span>
            </div>
          </div>
          <Sparkline data={team.offensiveTrend} color="#3b82f6" />
        </div>

        {/* Defensive trend */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500">Gols Sofridos</p>
            <span className="text-xs font-medium text-slate-700">{avgDefensive}/jogo</span>
          </div>
          <Sparkline data={team.defensiveTrend} color="#ef4444" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Trophy className="w-4 h-4 text-indigo-600" />
        <h3 className="text-slate-900">Forma Recente</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamFormCard team={homeTeam} />
        <TeamFormCard team={awayTeam} />
      </div>

      {/* Head to head */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 p-4">
        <p className="text-xs text-slate-500 mb-3">Confrontos Diretos (Últimos 10)</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-emerald-600">{headToHead.homeWins}</div>
            <div className="text-xs text-slate-500">Vitórias Casa</div>
          </div>
          <Minus className="w-4 h-4 text-slate-400" />
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-slate-600">{headToHead.draws}</div>
            <div className="text-xs text-slate-500">Empates</div>
          </div>
          <Minus className="w-4 h-4 text-slate-400" />
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-cyan-600">{headToHead.awayWins}</div>
            <div className="text-xs text-slate-500">Vitórias Fora</div>
          </div>
        </div>
      </div>
    </div>
  );
}
