import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { MatchScenarioCard } from './components/MatchScenarioCard';
import { ProbabilityBar } from './components/ProbabilityBar';
import { ProbabilityCarousel } from './components/ProbabilityCarousel';
import { EventTimeline } from './components/EventTimeline';
import { AutoComments } from './components/AutoComments';
import { MatchHistory } from './components/MatchHistory';
import { ScenarioSelector, ScenarioType } from './components/ScenarioSelector';
import { SquadDetails } from './components/SquadDetails';
import { Goal, AlertTriangle, Flag, Trophy } from 'lucide-react';

const SPORT_IDS: Record<string, number> = {
  futebol: 1,
  basquete: 18,
  esports: 151,
  tenis: 13,
};

interface MatchItem {
  id: string | number;
  homeTeam: string;
  awayTeam: string;
}

export default function App() {
  const { sport, id } = useParams<{ sport: string; id: string }>();
  const location = useLocation();
  const routeState = location.state as { match?: MatchItem } | null;

  const [activeScenario, setActiveScenario] = useState<ScenarioType>('standard');
  const [apiData, setApiData] = useState<any>(null);

  const [upcomingMatches, setUpcomingMatches] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  const [homeTeamInput, setHomeTeamInput] = useState('');
  const [awayTeamInput, setAwayTeamInput] = useState('');
  const [triggerFetch, setTriggerFetch] = useState(0);

  // Inicialmente busca as partidas da API BetsAPI para o esporte da rota.
  useEffect(() => {
    const sportKey = (sport || 'futebol').toLowerCase();
    const sportId = SPORT_IDS[sportKey] || 1;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/upcoming-matches?sport_id=${sportId}`)
      .then(res => res.json())
      .then(data => {
        const matches = Array.isArray(data.matches) ? data.matches : [];
        setUpcomingMatches(matches);

        const routedMatch = routeState?.match;
        const matchFromId = matches.find((m: MatchItem) => String(m.id) === String(id));
        const preferredMatch = routedMatch || matchFromId || matches[0];

        if (preferredMatch) {
          setSelectedMatchId(String(preferredMatch.id));
          setHomeTeamInput(preferredMatch.homeTeam);
          setAwayTeamInput(preferredMatch.awayTeam);
          setTriggerFetch(prev => prev + 1);
        }

        setIsLoadingMatches(false);
      })
      .catch(err => {
        console.error("Erro puxando proximas partidas:", err);
        setIsLoadingMatches(false);
      });
  }, [sport, id, routeState]);

  // Busca os insights da partida específica selecionada.
  useEffect(() => {
    if (!homeTeamInput || !awayTeamInput) return;

    setApiData(null);
    const params = new URLSearchParams({
      homeTeam: homeTeamInput,
      awayTeam: awayTeamInput,
    });
    if (selectedMatchId) {
      params.set('matchId', selectedMatchId);
    }

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/match-scenario?${params.toString()}`)
      .then(res => res.json())
      .then(data => setApiData(data))
      .catch(err => console.error("Erro ao puxar dados da API:", err));
  }, [triggerFetch, homeTeamInput, awayTeamInput, selectedMatchId]);

  const handleMatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const matchId = e.target.value;
    const match = upcomingMatches.find(m => String(m.id) === String(matchId));
    if (match) {
      setSelectedMatchId(String(match.id));
      setHomeTeamInput(match.homeTeam);
      setAwayTeamInput(match.awayTeam);
      setTriggerFetch(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-slate-900 text-3xl font-bold">Assistente de Partida (Com Apostas Ao Vivo)</h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/60 p-4 rounded-xl shadow-sm border border-slate-200 w-fit mx-auto backdrop-blur-sm">
            {isLoadingMatches ? (
              <div className="px-4 py-2 text-slate-500 animate-pulse font-medium">Extraindo jogos da BetsAPI...</div>
            ) : (
              <select
                value={selectedMatchId}
                onChange={handleMatchSelect}
                className="px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-[450px] bg-white cursor-pointer font-medium text-slate-800 shadow-sm"
              >
                {upcomingMatches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.homeTeam} vs {match.awayTeam}
                  </option>
                ))}
              </select>
            )}
          </div>

          {apiData && (
            <p className="text-sm text-slate-500 mt-2">Partidas vindas da BetsAPI • Insights Preditivos</p>
          )}
        </div>

        {!apiData ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 animate-pulse">Analisando dados da partida e calculando probabilidades...</p>
          </div>
        ) : (
          <>
            {/* Main Scenario Card */}
            <MatchScenarioCard
              mainInsight={apiData.scenarioData[activeScenario].mainScenario.insight}
              confidence={apiData.scenarioData[activeScenario].mainScenario.confidence}
              reasoning={apiData.scenarioData[activeScenario].mainScenario.reasoning}
            />

            {/* EPL Premium Insight */}
            {apiData.isEPL && apiData.eplAnalysis && (
              <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500 p-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <Trophy className="text-emerald-950 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-emerald-400 font-black uppercase tracking-widest text-xs">Análise Premium EPL</h2>
                    <p className="text-emerald-100/60 text-[10px] font-medium">Dataset 2025/26 + Histórico desde 2020</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {apiData.eplAnalysis.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/10">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <p className="text-emerald-50 text-sm leading-relaxed font-medium">{insight}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {Object.entries(apiData.eplAnalysis.probabilities).map(([key, val]: any) => (
                    <div key={key} className="bg-black/20 p-3 rounded-xl border border-emerald-500/5 text-center">
                      <p className="text-[10px] text-emerald-400/60 font-bold uppercase">{key === 'H' ? 'Casa' : key === 'A' ? 'Fora' : 'Empate'}</p>
                      <p className="text-xl font-black text-emerald-50">{val}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scenario Selector */}
            <ScenarioSelector
              activeScenario={activeScenario}
              onScenarioChange={setActiveScenario}
            />

            {/* Probabilities Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Probabilidades Contextuais</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              </div>

              <ProbabilityCarousel>
                <ProbabilityBar
                  icon={Trophy}
                  label="Vencedor da Partida"
                  homeTeam={apiData.homeTeam}
                  awayTeam={apiData.awayTeam}
                  homeProbability={apiData.scenarioData[activeScenario].probabilities.winner.home}
                  awayProbability={apiData.scenarioData[activeScenario].probabilities.winner.away}
                  drawProbability={apiData.scenarioData[activeScenario].probabilities.winner.draw}
                  color="winner"
                  reasoning={apiData.metadata.winner.reasoning}
                  source={apiData.metadata.winner.source}
                  methodType={apiData.scenarioData[activeScenario].probabilities.winner.method}
                />

                <ProbabilityBar
                  icon={Goal}
                  label="Chance de Gol"
                  homeTeam={apiData.homeTeam}
                  awayTeam={apiData.awayTeam}
                  homeProbability={apiData.scenarioData[activeScenario].probabilities.goals.home}
                  awayProbability={apiData.scenarioData[activeScenario].probabilities.goals.away}
                  color="goal"
                  reasoning={apiData.metadata.goals.reasoning}
                  source={apiData.metadata.goals.source}
                  methodType={apiData.scenarioData[activeScenario].probabilities.goals.method}
                />

                <ProbabilityBar
                  icon={AlertTriangle}
                  label="Risco de Cartão Amarelo"
                  homeTeam={apiData.homeTeam}
                  awayTeam={apiData.awayTeam}
                  homeProbability={apiData.scenarioData[activeScenario].probabilities.cards.home}
                  awayProbability={apiData.scenarioData[activeScenario].probabilities.cards.away}
                  color="card"
                  reasoning={apiData.metadata.cards.reasoning}
                  source={apiData.metadata.cards.source}
                  methodType={apiData.scenarioData[activeScenario].probabilities.cards.method}
                />

                <ProbabilityBar
                  icon={Flag}
                  label="Chance de Pênalti"
                  homeTeam={apiData.homeTeam}
                  awayTeam={apiData.awayTeam}
                  homeProbability={apiData.scenarioData[activeScenario].probabilities.penalty.home}
                  awayProbability={apiData.scenarioData[activeScenario].probabilities.penalty.away}
                  color="penalty"
                  reasoning={apiData.metadata.penalty.reasoning}
                  source={apiData.metadata.penalty.source}
                  methodType={apiData.scenarioData[activeScenario].probabilities.penalty.method}
                />
              </ProbabilityCarousel>
            </div>

            {/* Event Timeline */}
            <EventTimeline events={apiData.timelineEvents} />

            {/* Auto Comments */}
            <AutoComments comments={apiData.autoComments} />

            {/* Match History */}
            <MatchHistory
              homeTeam={apiData.matchHistory.homeTeam}
              awayTeam={apiData.matchHistory.awayTeam}
              headToHead={apiData.matchHistory.headToHead}
            />

            {/* Squad Details */}
            <SquadDetails
              homeTeamName={apiData.homeTeam}
              awayTeamName={apiData.awayTeam}
              homeSquad={apiData.squads.home}
              awaySquad={apiData.squads.away}
            />

            {/* Help Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
              <h3 className="text-slate-900 mb-3 font-semibold">Como Interpretar</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>• Este relatório agora é puxado com jogos reais advindos do BetsAPI</p>
                <p>• A confiança é calculada com base na consistência dos dados históricos</p>
                <p>• Cada previsão mostra o tipo de modelo usado (Estatístico, ML ou Heurístico)</p>
                <p>• Use o seletor de cenários para explorar como as probabilidades mudam em diferentes situações</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}