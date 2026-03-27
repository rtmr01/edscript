import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, ArrowLeft, Clock, ChevronRight, Trophy, Activity, Gamepad2, Target, SlidersHorizontal, CalendarDays } from 'lucide-react';

const SPORT_IDS: Record<string, number> = {
    futebol: 1,
    basquete: 18,
    esports: 151,
    tenis: 13
};

const LEAGUES_CONFIG: Record<string, { id: number | null; label: string }[]> = {
    futebol: [
        { id: null, label: "Todas as Ligas" },
        { id: 94, label: "Premier League" },
        { id: 43719, label: "Campeonato Paranaense U20" },
    ],
    basquete: [
        { id: null, label: "Todos os Eventos" },
        { id: 42445, label: "França Ligue A" },
        { id: 42352, label: "EuroBasket Qual." },
    ],
    tenis: [
        { id: null, label: "Todos os Torneios" },
        { id: 43966, label: "Challenger Bucaramanga" },
        { id: 43754, label: "Challenger Fujairah" },
        { id: 43960, label: "WTA Dubrovnik" },
    ],
    esports: [
        { id: null, label: "Geral Esports" },
    ]
};

export const LobbyPage: React.FC = () => {
    const { sport } = useParams<{ sport: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedLeague, setSelectedLeague] = useState<number | null>(null);

    const currentSport = sport?.toLowerCase() || 'futebol';
    const availableLeagues = LEAGUES_CONFIG[currentSport] || [];

    // 1. Sincroniza busca da URL apenas no carregamento inicial
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchFromUrl = queryParams.get('search');
        setSearchTerm(searchFromUrl || '');
    }, [location.search]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Reset de liga ao trocar de esporte
    useEffect(() => {
        setSelectedLeague(null);
        document.title = `Pro Stats | ${currentSport.toUpperCase()}`;
    }, [sport, currentSport]);

    // 3. Busca de Dados
    useEffect(() => {
        const fetchMatches = async () => {
            setIsLoading(true);
            const sportId = SPORT_IDS[currentSport] || 1;

            const params = new URLSearchParams();
            params.append('sport_id', sportId.toString());

            if (selectedLeague !== null) {
                params.append('league_id', selectedLeague.toString());
            }
            if (debouncedSearch !== '') {
                params.append('search', debouncedSearch);
            }

            const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/upcoming-matches?${params.toString()}`;

            try {
                const res = await fetch(url);
                const data = await res.json();
                setMatches(Array.isArray(data.matches) ? data.matches : []);
            } catch (err) {
                console.error("Erro no fetch:", err);
                setMatches([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatches();
    }, [currentSport, selectedLeague, debouncedSearch]);

    const getSportIcon = () => {
        const props = { className: "w-8 h-8 text-[#00D26A]", strokeWidth: 2 };
        if (currentSport === 'basquete') return <Activity {...props} />;
        if (currentSport === 'esports') return <Gamepad2 {...props} />;
        if (currentSport === 'tenis') return <Target {...props} />;
        return <Trophy {...props} />;
    };

    return (
        <div className="min-h-screen bg-[#1C1F5A] text-white font-sans relative overflow-x-hidden selection:bg-[#00D26A]/30 selection:text-white pb-24">
            
            {/* TACTICAL PITCH BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.10] mix-blend-screen scale-150 sm:scale-100 origin-bottom sm:origin-center transition-transform duration-1000">
                <svg
                    className="w-full max-w-[1200px] h-auto text-[#00D26A]"
                    viewBox="0 0 800 1200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
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

                    <g className="animate-pulse" style={{ animationDuration: '5s' }}>
                        <circle cx="310" cy="800" r="10" fill="currentColor" fillOpacity="0.6" />
                        <circle cx="490" cy="800" r="10" fill="currentColor" fillOpacity="0.6" />
                        <circle cx="400" cy="900" r="10" fill="currentColor" fillOpacity="0.6" />
                        <path d="M 320 800 Q 400 850 480 800" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" opacity="0.5"/>
                    </g>
                </svg>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,210,106,0.05),transparent_40%),radial-gradient(circle_at_85%_35%,rgba(0,210,106,0.05),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(28,31,90,1),transparent_70%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1C1F5A]/50 to-[#1C1F5A]/95" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-5 pt-8 md:px-8">
                
                {/* HEADER ROW */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex w-max items-center gap-2 rounded-xl border border-white/5 bg-[#121547]/60 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white/50 backdrop-blur-md transition-all hover:border-[#00D26A]/30 hover:bg-[#00D26A]/10 hover:text-[#00D26A] focus:outline-none focus:ring-2 focus:ring-[#00D26A]/50"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Retornar ao Dashboard
                    </button>

                    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-gradient-to-r from-[#121547]/80 to-[#0f1238]/80 px-6 py-3 backdrop-blur-md shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D26A]/10 shadow-[0_0_15px_rgba(0,210,106,0.15)] ring-1 ring-[#00D26A]/30">
                            {getSportIcon()}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                                {currentSport} <span className="text-[#00D26A]">Room</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D26A] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00D26A]"></span>
                                </span>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D26A]/70">Radar de Eventos Ativo</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTROLS (Search & Filters) */}
                <div className="mb-10 grid grid-cols-1 md:grid-cols-[auto_1fr] items-start gap-6 rounded-[2rem] border border-white/5 bg-[#141745]/60 p-6 backdrop-blur-xl shadow-2xl">
                    
                    <div className="relative w-full md:w-80 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[#00D26A] transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Localizar em ${currentSport}...`}
                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#0b0d30] border border-transparent text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#00D26A]/50 transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                            <SlidersHorizontal size={14} /> Filtros de Competição
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {availableLeagues.map((league) => {
                                const isSelected = selectedLeague === league.id;
                                return (
                                    <button
                                        key={league.label}
                                        onClick={() => {
                                            setSelectedLeague(league.id);
                                            if (league.id !== null) setSearchTerm('');
                                        }}
                                        className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                                            isSelected
                                                ? "bg-[#00D26A] border-[#00D26A] text-[#1C1F5A] shadow-[0_4px_20px_rgba(0,210,106,0.3)]"
                                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white"
                                        }`}
                                    >
                                        {league.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* MATCHES LIST */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white/80">Cronograma de Eventos</h3>
                    <div className="flex items-center gap-2 text-[#00D26A]/70 text-[10px] font-bold uppercase tracking-widest">
                        <CalendarDays size={14} /> Atualização Constante
                    </div>
                </div>

                <div className="w-full">
                    {isLoading ? (
                        <div className="bg-[#141745]/60 backdrop-blur-md border border-white/5 rounded-[2rem] flex flex-col items-center justify-center py-24 space-y-4">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-t-2 border-[#00D26A] animate-spin"></div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00D26A] animate-pulse">Sincronizando Partidas...</span>
                        </div>
                    ) : matches.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {matches.map((match) => (
                                <div
                                    key={match.id}
                                    onClick={() => navigate(`/analise/${currentSport}/${match.id}`, { state: { match } })}
                                    className="group relative flex flex-col md:flex-row items-center gap-6 px-4 md:px-6 py-4 rounded-[1.5rem] bg-[#141745]/60 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-[#1f2366]/80 hover:border-[#00D26A]/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
                                >
                                    {/* Vertical Hover Indicator */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 rounded-r-lg bg-[#00D26A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                    {/* Time Box */}
                                    <div className="flex shrink-0 items-center justify-center rounded-xl border border-white/5 bg-[#0b0d30]/60 p-3 min-w-[90px] transition-colors duration-300 group-hover:bg-[#00D26A]/10 group-hover:border-[#00D26A]/20">
                                        <div className="flex flex-col items-center">
                                            <Clock size={14} className="text-[#00D26A] mb-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <span className="font-black text-base tabular-nums tracking-wider text-white group-hover:text-[#00D26A] transition-colors">
                                                {match.time ? new Date(match.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </span>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#00D26A]/60 mt-0.5">
                                                {match.time ? new Date(match.time * 1000).toLocaleDateString([], { day: '2-digit', month: '2-digit' }) : '--/--'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Match Info */}
                                    <div className="flex-1 flex flex-col items-center md:items-start w-full">
                                        <div className="mb-2">
                                            <span className="inline-block rounded px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#00D26A] bg-[#00D26A]/10 border border-[#00D26A]/20">
                                                {match.league || 'Liga Independente'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-6 font-black text-lg md:text-xl uppercase w-full tracking-tight">
                                            <span className="text-white/90 truncate max-w-[200px] text-center md:text-right group-hover:text-white transition-colors">{match.homeTeam}</span>
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-black/30 border border-white/5 text-[9px] text-white/40">
                                                VS
                                            </div>
                                            <span className="text-white/60 truncate max-w-[200px] text-center md:text-left group-hover:text-white/90 transition-colors">{match.awayTeam}</span>
                                        </div>
                                    </div>

                                    {/* Action Arrow */}
                                    <div className="hidden md:flex shrink-0 items-center justify-center h-10 w-10 rounded-full bg-black/20 border border-white/5 text-white/30 transition-all duration-300 group-hover:bg-[#00D26A] group-hover:border-[#00D26A] group-hover:text-[#1C1F5A] group-hover:scale-110 shadow-inner">
                                        <ChevronRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#141745]/60 backdrop-blur-md border border-white/5 rounded-[2rem] flex flex-col items-center justify-center py-24 opacity-80">
                            <Search size={32} className="text-[#00D26A]/30 mb-4" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Nenhum evento mapeado no momento.</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};