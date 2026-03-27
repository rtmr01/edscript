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
        return <div className="w-6 h-6 rounded-md bg-[#00D26A] flex items-center justify-center text-[#121547] text-xs font-black shadow-[0_0_10px_rgba(0,210,106,0.3)]">W</div>;
      case 'D':
        return <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white text-xs font-bold border border-white/10">D</div>;
      case 'L':
        return <div className="w-6 h-6 rounded-md bg-red-500/80 flex items-center justify-center text-white text-xs font-bold border border-red-500/20">L</div>;
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
      <svg width={width} height={height} className="inline-block overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        />
        {data.map((value, idx) => {
          const x = idx * pointWidth;
          const y = height - ((value - min) / range) * height;
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="2.5"
              fill={color}
              className="drop-shadow-[0_0_3px_currentColor]"
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
      <div className="bg-[#0b0d30]/60 rounded-xl border border-white/5 p-4 hover:border-[#00D26A]/20 transition-colors">
        <h4 className="text-white font-bold mb-3 tracking-wide">{team.name}</h4>

        {/* Recent form */}
        <div className="mb-5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#00D26A]/70 mb-2">Últimos 5 Jogos</p>
          <div className="flex gap-1.5">
            {team.recentForm.map((match, idx) => (
              <div key={idx} className="group relative">
                {getResultIcon(match.result)}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-[#121547] text-[#00D26A] border border-[#00D26A]/30 text-xs font-black rounded px-2 py-1 whitespace-nowrap shadow-xl">
                    {match.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offensive trend */}
        <div className="mb-4 bg-[#141745]/50 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-white/50 uppercase">Poder Ofensivo</p>
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-md">
              {trend ? (
                <TrendingUp className="w-3 h-3 text-[#00D26A]" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className="text-[10px] font-bold text-white">{avgOffensive}/j</span>
            </div>
          </div>
          <div className="px-1"><Sparkline data={team.offensiveTrend} color="#00D26A" /></div>
        </div>

        {/* Defensive trend */}
        <div className="bg-[#141745]/50 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-white/50 uppercase">Gols Sofridos</p>
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-md">
              <span className="text-[10px] font-bold text-white">{avgDefensive}/j</span>
            </div>
          </div>
          <div className="px-1"><Sparkline data={team.defensiveTrend} color="#f87171" /></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#141745]/60 backdrop-blur-xl rounded-[1.5rem] border border-white/5 p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#00D26A]/10 p-2 rounded-lg border border-[#00D26A]/20">
           <Trophy className="w-4 h-4 text-[#00D26A]" />
        </div>
        <h3 className="text-white font-black uppercase tracking-[0.15em] text-sm">Histórico de Performance</h3>
      </div>

      <div className="flex flex-col gap-4">
        <TeamFormCard team={homeTeam} />
        <TeamFormCard team={awayTeam} />
      </div>

      {/* Head to head */}
      <div className="mt-6 bg-[#0b0d30] rounded-xl border border-[#00D26A]/20 p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00D26A]" />
        <p className="text-[10px] font-black tracking-[0.2em] text-[#00D26A] mb-4 uppercase text-center">Head-to-Head (Últimos 10)</p>
        <div className="flex items-center gap-2 justify-between px-2">
          <div className="flex-1 text-center bg-black/20 rounded-lg py-2 border border-white/5">
            <div className="text-2xl font-black text-[#00D26A]">{headToHead.homeWins}</div>
            <div className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Vit Casa</div>
          </div>
          <Minus className="w-4 h-4 text-white/20 shrink-0" />
          <div className="flex-1 text-center bg-black/20 rounded-lg py-2 border border-white/5">
            <div className="text-2xl font-black text-white/70">{headToHead.draws}</div>
            <div className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Empates</div>
          </div>
          <Minus className="w-4 h-4 text-white/20 shrink-0" />
          <div className="flex-1 text-center bg-black/20 rounded-lg py-2 border border-white/5">
            <div className="text-2xl font-black text-[#00D26A]/70">{headToHead.awayWins}</div>
            <div className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Vit Fora</div>
          </div>
        </div>
      </div>
    </div>
  );
}
