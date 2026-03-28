import { useState, useEffect } from 'react';
import { User, Target, Star, AlertTriangle, ChevronDown, ChevronUp, Loader2, Users } from 'lucide-react';

interface PlayerStatData {
  player_name: string;
  team: string;
  side: 'home' | 'away';
  confidence: number;
  prediction: {
    shots_on: number;
    goals: number;
    cards: number;
  };
  history: {
    avg_shots_on: number;
    avg_shots_off: number;
    avg_goals: number;
    games_in_dataset: number;
  };
}

interface PlayerStatsProps {
  homeTeam: string;
  awayTeam: string;
  matchId?: string;
}

function StatBadge({ value, label, icon: Icon, color }: { value: number; label: string; icon: any; color: string }) {
  return (
    <div className={`flex flex-col items-center p-3 rounded-xl bg-gradient-to-b ${color} border border-white/10`}>
      <Icon className="w-4 h-4 mb-1 opacity-70" />
      <span className="text-lg font-black tabular-nums">{value.toFixed(2)}</span>
      <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold mt-0.5">{label}</span>
    </div>
  );
}

function RiskBar({ value, max = 1 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  let color = 'bg-emerald-400';
  if (pct > 60) color = 'bg-amber-400';
  if (pct > 80) color = 'bg-rose-500';
  return (
    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function PlayerCard({ player }: { player: PlayerStatData }) {
  const [expanded, setExpanded] = useState(false);
  const isHighlight = player.prediction.goals >= 0.3 || player.prediction.shots_on >= 1.5;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 cursor-pointer ${
        isHighlight
          ? 'border-[#00D26A]/40 bg-gradient-to-br from-[#0f1f35] to-[#0a1628] shadow-[0_0_20px_rgba(0,210,106,0.07)]'
          : 'border-[#2a2e6e] bg-[#15183d]/60'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isHighlight ? 'bg-[#00D26A]/20' : 'bg-[#2a2e6e]'}`}>
          <User className={`w-4 h-4 ${isHighlight ? 'text-[#00D26A]' : 'text-slate-400'}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isHighlight && (
              <Star className="w-3 h-3 text-[#00D26A] shrink-0" fill="currentColor" />
            )}
            <p className="text-sm font-bold text-white truncate">{player.player_name}</p>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{player.team}</p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center hidden sm:block">
            <p className="text-xs font-black text-[#00D26A] tabular-nums">{player.confidence}%</p>
            <p className="text-[9px] text-slate-600 uppercase">Conf.</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-xs font-black text-[#00D26A] tabular-nums">{player.prediction.shots_on.toFixed(1)}</p>
            <p className="text-[9px] text-slate-600 uppercase">Chutes</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-xs font-black text-amber-400 tabular-nums">{player.prediction.goals.toFixed(2)}</p>
            <p className="text-[9px] text-slate-600 uppercase">xGol</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-xs font-black text-rose-400 tabular-nums">{player.prediction.cards.toFixed(2)}</p>
            <p className="text-[9px] text-slate-600 uppercase">Cartão</p>
          </div>
          <div className="text-slate-600">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Prediction cards */}
          <div className="grid grid-cols-3 gap-2">
            <StatBadge
              value={player.prediction.shots_on}
              label="Chutes no Alvo"
              icon={Target}
              color="from-[#00D26A]/10 to-[#00D26A]/5"
            />
            <StatBadge
              value={player.prediction.goals}
              label="Prob. de Gol"
              icon={Star}
              color="from-amber-500/10 to-amber-500/5"
            />
            <StatBadge
              value={player.prediction.cards}
              label="Risco Cart."
              icon={AlertTriangle}
              color="from-rose-500/10 to-rose-500/5"
            />
          </div>

          {/* Historical context */}
          <div className="bg-white/[0.03] rounded-xl p-3 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Histórico no Dataset</p>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Média de Chutes/Jogo</span>
              <span className="font-bold text-white tabular-nums">{player.history.avg_shots_on.toFixed(2)}</span>
            </div>
            <RiskBar value={player.history.avg_shots_on} max={3} />

            <div className="flex justify-between text-xs text-slate-400 mb-1 mt-2">
              <span>Média de Gols/Jogo</span>
              <span className="font-bold text-white tabular-nums">{player.history.avg_goals.toFixed(2)}</span>
            </div>
            <RiskBar value={player.history.avg_goals} max={1} />

            <p className="text-[9px] text-slate-600 mt-2">{player.history.games_in_dataset} partida(s) analisada(s) no dataset de treino</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamSection({ teamName, players, side }: { teamName: string; players: PlayerStatData[]; side: 'home' | 'away' }) {
  const sorted = [...players].sort((a, b) => b.prediction.shots_on - a.prediction.shots_on);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-5 rounded-full ${side === 'home' ? 'bg-[#00D26A]' : 'bg-blue-400'}`} />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">{teamName}</h3>
        <span className="text-[10px] text-slate-600 font-bold">{players.length} jogadores</span>
      </div>
      <div className="space-y-2">
        {sorted.map(p => <PlayerCard key={p.player_name} player={p} />)}
      </div>
    </div>
  );
}

export function PlayerStats({ homeTeam, awayTeam, matchId }: PlayerStatsProps) {
  const [players, setPlayers] = useState<PlayerStatData[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'home' | 'away'>('all');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ homeTeam, awayTeam });
    if (matchId) params.set('matchId', matchId);

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/player-stats?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setPlayers(data.players || []);
        setModelAccuracy(data.accuracy || 0);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, homeTeam, awayTeam, matchId]);

  const homePlayers = players.filter(p => p.side === 'home');
  const awayPlayers = players.filter(p => p.side === 'away');

  const visibleHome = filter === 'away' ? [] : homePlayers;
  const visibleAway = filter === 'home' ? [] : awayPlayers;

  return (
    <section className="space-y-3">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-3 group"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2e6e] to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#2a2e6e] bg-[#15183d]/80 group-hover:border-[#00D26A]/50 group-hover:text-[#00D26A] transition-all">
          <Users className="w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest font-black">Estatísticas de Jogadores</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2e6e] to-transparent" />
      </button>

      {isOpen && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Info Banner */}
          <div className="bg-[#00D26A]/5 border border-[#00D26A]/20 rounded-2xl p-4">
            <p className="text-[11px] text-[#00D26A]/80 font-medium leading-relaxed">
              ⚡ Predições baseadas no histórico real da Premier League.
              Acurácia atual das estimativas de jogadores: <span className="font-black">{modelAccuracy}%</span>. Jogadores com ⭐ têm maior expectativa de impacto.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'home', 'away'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filter === f
                    ? 'bg-[#00D26A] border-[#00D26A] text-[#1C1F5A]'
                    : 'bg-[#15183d] border-[#2a2e6e] text-slate-400 hover:border-slate-500'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'home' ? homeTeam.split(' ')[0] : awayTeam.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-[#00D26A] animate-spin" />
              <p className="text-slate-500 text-sm animate-pulse">Calculando predições individuais...</p>
            </div>
          ) : error && error !== "Escalação ainda não divulgada" ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center">
              <p className="text-rose-400 text-sm font-medium">Erro ao carregar tracking.</p>
              <p className="text-slate-600 text-xs mt-2">{error}</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-16 text-slate-600 bg-[#15183d]/40 rounded-2xl border border-dashed border-[#2a2e6e]">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#00D26A]" />
              <p className="font-black text-sm text-white/70 uppercase tracking-widest">Escalação Titular Pendente</p>
              <p className="text-xs mt-2 px-4 text-white/40 max-w-sm mx-auto">
                A AI gerará as previsões e tracking individuais assim que a súmula oficial e as escalações forem liberadas (aprox. 1h antes do apito inicial).
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {visibleHome.length > 0 && (
                <TeamSection teamName={homeTeam} players={visibleHome} side="home" />
              )}
              {visibleAway.length > 0 && (
                <TeamSection teamName={awayTeam} players={visibleAway} side="away" />
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
