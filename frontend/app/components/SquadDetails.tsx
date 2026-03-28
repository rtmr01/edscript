interface SquadPlayer {
  name: string;
  position?: string;
}

interface TeamSquad {
  formation?: string;
  players: SquadPlayer[];
  source?: string;
}

interface SquadDetailsProps {
  homeTeamName: string;
  awayTeamName: string;
  homeSquad: TeamSquad;
  awaySquad: TeamSquad;
}

function SquadColumn({ title, squad }: { title: string; squad: TeamSquad }) {
  return (
    <div className="bg-white/70 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-slate-900 text-sm font-semibold uppercase tracking-wide">{title}</h4>
        <span className="text-[11px] text-slate-500">Formacao: {squad.formation || "N/A"}</span>
      </div>

      <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
        {squad.players.length > 0 ? (
          squad.players.map((player, index) => (
            <div key={`${player.name}-${index}`} className="flex items-center justify-between text-sm border-b border-slate-100 pb-1">
              <span className="text-slate-700">{player.name}</span>
              <span className="text-slate-500 text-xs">{player.position || "N/A"}</span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-white/40 rounded-lg border border-slate-200 border-dashed">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1">Escalação Pendente</p>
            <p className="text-slate-400 text-[10px]">Aguardando dados oficiais pré-jogo.</p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 mt-3">Fonte: {squad.source || "desconhecida"}</p>
    </div>
  );
}

export function SquadDetails({ homeTeamName, awayTeamName, homeSquad, awaySquad }: SquadDetailsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Elencos e Jogadores</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SquadColumn title={homeTeamName} squad={homeSquad} />
        <SquadColumn title={awayTeamName} squad={awaySquad} />
      </div>
    </section>
  );
}
