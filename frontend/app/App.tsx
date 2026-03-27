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
import { PlayerStats } from './components/PlayerStats';
import { Goal, AlertTriangle, Flag, Trophy, Timer, Swords, Zap, Activity, Layers, Users } from 'lucide-react';

const SPORT_IDS: Record<string, number> = {
  futebol: 1,
  football: 1,
  basquete: 18,
  basketball: 18,
  nba: 18,
  esports: 151,
  tenis: 13,
  tennis: 13,
  'tênis': 13,
};

const SPORT_KEYS: Record<string, 'futebol' | 'basquete' | 'esports' | 'tenis'> = {
  futebol: 'futebol',
  football: 'futebol',
  soccer: 'futebol',
  basquete: 'basquete',
  basketball: 'basquete',
  nba: 'basquete',
  esports: 'esports',
  'e-sports': 'esports',
  tenis: 'tenis',
  tennis: 'tenis',
  'tênis': 'tenis',
};

const SPORT_METRICS = {
  futebol: [
    { key: 'goals', label: 'Chance de Gol', icon: Goal, color: 'goal' as const },
    { key: 'cards', label: 'Risco de Cartão Amarelo', icon: AlertTriangle, color: 'card' as const },
    { key: 'penalty', label: 'Chance de Pênalti', icon: Flag, color: 'penalty' as const },
  ],
  basquete: [
    { key: 'goals', label: 'Projeção de Pontos', icon: Goal, color: 'goal' as const },
    { key: 'cards', label: 'Intensidade de Faltas', icon: AlertTriangle, color: 'card' as const },
    { key: 'penalty', label: 'Lance Livre Decisivo', icon: Flag, color: 'penalty' as const },
  ],
  tenis: [
    { key: 'goals', label: 'Projeção de Games', icon: Timer, color: 'goal' as const },
    { key: 'cards', label: 'Pressão dos Rallies', icon: Swords, color: 'card' as const },
    { key: 'penalty', label: 'Quebra Decisiva', icon: Zap, color: 'penalty' as const },
  ],
  esports: [
    { key: 'goals', label: 'Projeção de Rounds', icon: Timer, color: 'goal' as const },
    { key: 'cards', label: 'Intensidade da Partida', icon: Swords, color: 'card' as const },
    { key: 'penalty', label: 'Chance de Virada', icon: Zap, color: 'penalty' as const },
  ],
};

interface MatchItem {
  id: string | number;
  homeTeam: string;
  awayTeam: string;
}

export default function App() {
  const { sport, id } = useParams<{ sport: string; id: string }>();
  const sportInput = (sport || 'futebol').toLowerCase();
  const normalizedSport = SPORT_KEYS[sportInput] || 'futebol';
  const location = useLocation();
  const routeState = location.state as { match?: MatchItem } | null;

  const [activeScenario, setActiveScenario] = useState<ScenarioType>('standard');
  const [activeTab, setActiveTab] = useState<'overview' | 'h2h' | 'squads'>('overview');
  const [apiData, setApiData] = useState<any>(null);

  const [upcomingMatches, setUpcomingMatches] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  const [homeTeamInput, setHomeTeamInput] = useState('');
  const [awayTeamInput, setAwayTeamInput] = useState('');
  const [triggerFetch, setTriggerFetch] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  // Inicialmente busca as partidas da API BetsAPI para o esporte da rota.
  useEffect(() => {
    const sportId = SPORT_IDS[sportInput] || SPORT_IDS[normalizedSport] || 1;
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
        setApiError('Nao foi possivel carregar as partidas deste esporte no momento.');
        setIsLoadingMatches(false);
      });
  }, [sportInput, normalizedSport, id, routeState]);

  // Busca os insights da partida específica selecionada.
  useEffect(() => {
    if (!homeTeamInput || !awayTeamInput) return;

    setApiError(null);
    setApiData(null);
    const params = new URLSearchParams({
      sport: normalizedSport,
      homeTeam: homeTeamInput,
      awayTeam: awayTeamInput,
    });
    if (selectedMatchId) {
      params.set('matchId', selectedMatchId);
    }

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/match-scenario?${params.toString()}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok || data?.error || !data?.scenarioData) {
          const msg = data?.detail?.[0]?.msg || data?.error || 'Nao foi possivel carregar esta analise.';
          throw new Error(msg);
        }
        setApiData(data);
      })
      .catch(err => {
        console.error("Erro ao puxar dados da API:", err);
        setApiError(err?.message || 'Nao foi possivel carregar esta analise.');
      });
  }, [triggerFetch, homeTeamInput, awayTeamInput, selectedMatchId, normalizedSport]);

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

  const accuracyCards = apiData?.accuracy
    ? [
        { key: 'player', label: 'Acurácia Jogador', value: apiData.accuracy.player },
        { key: 'standard', label: 'Acurácia Padrão', value: apiData.accuracy.standard },
        { key: 'pressure', label: 'Acurácia Pressão', value: apiData.accuracy.pressure },
        { key: 'control', label: 'Acurácia Controle', value: apiData.accuracy.control },
      ]
    : [];
  const metricsForSport = SPORT_METRICS[normalizedSport] || SPORT_METRICS.futebol;

  return (
    <div className="min-h-screen bg-[#1C1F5A] text-white font-sans relative overflow-x-hidden selection:bg-[#00D26A]/30 selection:text-white pb-24">
      
      {/* TACTICAL PITCH BACKGROUND - Otimizado para não poluir */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] mix-blend-screen scale-150 sm:scale-100 origin-bottom sm:origin-center transition-transform duration-1000">
          <svg className="w-full max-w-[1200px] h-auto text-white" viewBox="0 0 800 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="50" y="50" width="700" height="1100" rx="4" stroke="currentColor" strokeWidth="3" />
              <line x1="50" y1="600" x2="750" y2="600" stroke="currentColor" strokeWidth="3" />
              <circle cx="400" cy="600" r="90" stroke="currentColor" strokeWidth="3" />
              <circle cx="400" cy="600" r="5" fill="currentColor" />
              <rect x="225" y="50" width="350" height="165" stroke="currentColor" strokeWidth="3" />
              <rect x="300" y="50" width="200" height="55" stroke="currentColor" strokeWidth="3" />
              <path d="M 330 215 A 90 90 0 0 0 470 215" stroke="currentColor" strokeWidth="3" />
              <circle cx="400" cy="160" r="4" fill="currentColor" />
              <rect x="225" y="985" width="350" height="165" stroke="currentColor" strokeWidth="3" />
              <rect x="300" y="1095" width="200" height="55" stroke="currentColor" strokeWidth="3" />
              <path d="M 330 985 A 90 90 0 0 1 470 985" stroke="currentColor" strokeWidth="3" />
              <circle cx="400" cy="1040" r="4" fill="currentColor" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1F5A]/20 via-[#1C1F5A]/90 to-[#1C1F5A]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 md:px-8 space-y-10">
        
        {/* COCKPIT HEADER - Clean Layout */}
        <div className="flex flex-col items-center justify-center gap-6 mb-12 border-b border-white/5 pb-10">
          <div className="text-center w-full max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D26A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D26A]"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Engine Preditiva</span>
            </div>

            <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
              {apiData ? apiData.homeTeam : 'Assistente'} <span className="text-white/30 px-2 lg:px-4">x</span> {apiData ? apiData.awayTeam : 'Preditivo'}
            </h1>

            {apiData && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D26A] mt-6 bg-[#00D26A]/10 inline-block px-3 py-1 rounded-full border border-[#00D26A]/20">Tracker de Partida Ao Vivo • BetsAPI Integradora</p>
            )}
          </div>

          {accuracyCards.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 w-full mt-6">
              {accuracyCards.map(card => (
                <div
                  key={card.key}
                  className="rounded-xl border border-white/5 bg-[#141745]/60 backdrop-blur-xl px-5 py-3 text-center transition-colors"
                >
                  <p className="text-[9px] uppercase tracking-[0.1em] text-white/60 font-medium mb-1">{card.label}</p>
                  <p className="text-lg font-black text-white">
                    <span className="text-[#00D26A]">{card.value}</span><span className="text-[10px] opacity-40 ml-0.5">%</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {!apiData ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-t-2 border-r-2 border-[#00D26A] animate-spin"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D26A]/70 animate-pulse">{apiError || 'Processando varredura tática...'}</p>
          </div>
        ) : (
          <div className="w-full">
            
            {/* TABS NAVIGATION */}
            <div className="flex justify-center mb-10 w-full overflow-x-auto pb-2">
               <div className="bg-[#0b0d30]/60 backdrop-blur-lg p-1.5 rounded-[1.5rem] inline-flex gap-1.5 border border-white/5 shadow-2xl">
                 <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'overview' ? 'bg-[#141745] text-[#00D26A] shadow-md border border-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                 >
                   <Activity className="w-4 h-4" />
                   <span className="text-xs font-black uppercase tracking-widest">Painel Preditivo</span>
                 </button>
                 <button 
                  onClick={() => setActiveTab('h2h')}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'h2h' ? 'bg-[#141745] text-[#00D26A] shadow-md border border-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                 >
                   <Layers className="w-4 h-4" />
                   <span className="text-xs font-black uppercase tracking-widest">Contexto & H2H</span>
                 </button>
                 <button 
                  onClick={() => setActiveTab('squads')}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'squads' ? 'bg-[#141745] text-[#00D26A] shadow-md border border-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                 >
                   <Users className="w-4 h-4" />
                   <span className="text-xs font-black uppercase tracking-widest">Elencos & Tracking</span>
                 </button>
               </div>
            </div>

            {/* TAB CONTENT: OVERVIEW (Painel Central) */}
            {activeTab === 'overview' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
                
                <ScenarioSelector
                  activeScenario={activeScenario}
                  onScenarioChange={setActiveScenario}
                />

                <MatchScenarioCard
                  mainInsight={apiData.scenarioData[activeScenario].mainScenario.insight}
                  confidence={apiData.scenarioData[activeScenario].mainScenario.confidence}
                  reasoning={apiData.scenarioData[activeScenario].mainScenario.reasoning}
                />

                {apiData.isEPL && apiData.eplAnalysis && (
                  <div className="bg-[#141745]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 mt-6">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-[#00D26A]/10 p-3 rounded-xl border border-[#00D26A]/20">
                        <Trophy className="text-[#00D26A] w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-white font-black uppercase tracking-widest text-sm">Modelo Premium EPL</h2>
                        <p className="text-[#00D26A]/70 text-[10px] uppercase font-bold tracking-widest mt-1.5">Dataset de Elite Calibrado</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {apiData.eplAnalysis.insights.map((insight: string, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start bg-[#0b0d30]/60 p-4 rounded-xl border border-white/5">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00D26A] shrink-0" />
                          <p className="text-white/80 text-xs leading-relaxed font-medium">{insight}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-4">
                      {Object.entries(apiData.eplAnalysis.probabilities).map(([key, val]: any) => (
                        <div key={key} className="bg-black/20 p-4 rounded-xl border border-white/5 text-center transition-colors hover:bg-white/5">
                          <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">{key === 'H' ? 'Casa' : key === 'A' ? 'Fora' : 'Empate'}</p>
                          <p className="text-2xl font-black text-white mt-1.5">{val}<span className="text-xs opacity-40 ml-0.5">%</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-8 pt-6">
                  <div className="flex items-center gap-4 px-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Fluxo de Probabilidades</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  </div>

                  <ProbabilityCarousel>
                    <ProbabilityBar
                      icon={Trophy}
                      label="Vencedor Diretriz"
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

                    {metricsForSport.map(metric => {
                      const prob = apiData.scenarioData[activeScenario].probabilities[metric.key];
                      const meta = apiData.metadata[metric.key];
                      if (!prob || !meta) return null;

                      return (
                        <ProbabilityBar
                          key={metric.key}
                          icon={metric.icon}
                          label={metric.label}
                          homeTeam={apiData.homeTeam}
                          awayTeam={apiData.awayTeam}
                          homeProbability={prob.home}
                          awayProbability={prob.away}
                          color={metric.color}
                          reasoning={meta.reasoning}
                          source={meta.source}
                          methodType={prob.method}
                        />
                      );
                    })}
                  </ProbabilityCarousel>
                </div>

                <div className="pt-8">
                   <EventTimeline events={apiData.timelineEvents} />
                </div>
              </div>
            )}

            {/* TAB CONTENT: H2H e História */}
            {activeTab === 'h2h' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl mx-auto">
                <MatchHistory
                  homeTeam={apiData.matchHistory.homeTeam}
                  awayTeam={apiData.matchHistory.awayTeam}
                  headToHead={apiData.matchHistory.headToHead}
                />
                <AutoComments comments={apiData.autoComments} />
              </div>
            )}

            {/* TAB CONTENT: Elencos e Tracker */}
            {activeTab === 'squads' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl mx-auto">
                <SquadDetails
                  homeTeamName={apiData.homeTeam}
                  awayTeamName={apiData.awayTeam}
                  homeSquad={apiData.squads.home}
                  awaySquad={apiData.squads.away}
                />
                <PlayerStats
                  homeTeam={apiData.homeTeam}
                  awayTeam={apiData.awayTeam}
                  matchId={selectedMatchId}
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}