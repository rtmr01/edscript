import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, ArrowLeft, Clock, ChevronRight, Trophy, Activity, Gamepad2, Target } from 'lucide-react';

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
        { id: 43782, label: "COPA Rio U20" },
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

    // 3. Busca de Dados - LOGICA CORRIGIDA
    useEffect(() => {
        const fetchMatches = async () => {
            setIsLoading(true);
            const sportId = SPORT_IDS[currentSport] || 1;

            // Construímos os params de forma limpa
            const params = new URLSearchParams();
            params.append('sport_id', sportId.toString());

            // Liga e busca podem ser usados em conjunto.
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
        const color = "text-[#00D26A] w-12 h-12 mb-2";
        if (currentSport === 'basquete') return <Activity className={color} />;
        if (currentSport === 'esports') return <Gamepad2 className={color} />;
        if (currentSport === 'tenis') return <Target className={color} />;
        return <Trophy className={color} />;
    };

    return (
        <div className="min-h-screen bg-[#1C1F5A] text-white p-4 md:p-8 relative overflow-x-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-[#00D26A]/5 blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#00D26A] transition-colors font-bold uppercase text-[10px] tracking-[0.2em]"
                >
                    <ArrowLeft size={14} /> Voltar ao Início
                </button>

                <header className="text-center flex flex-col items-center">
                    {getSportIcon()}
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                        PRO <span className="text-[#00D26A]">{currentSport}</span>
                    </h1>
                    <p className="text-slate-400 mt-4 font-light tracking-widest uppercase text-sm">Próximos Confrontos Disponíveis</p>
                </header>

                {/* Busca */}
                <div className="max-w-2xl mx-auto relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#00D26A] transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                        placeholder={`Pesquisar em ${currentSport}...`}
                        className="w-full py-5 px-16 rounded-2xl bg-[#15183d] border border-[#2a2e6e] text-white focus:outline-none focus:border-[#00D26A] transition-all shadow-2xl"
                    />
                </div>

                {/* Filtro de Ligas */}
                <div className="flex flex-wrap justify-center gap-3">
                    {availableLeagues.map((league) => (
                        <button
                            key={league.label}
                            onClick={() => {
                                setSelectedLeague(league.id);
                                if (league.id !== null) setSearchTerm(''); // Limpa busca se escolher liga
                            }}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedLeague === league.id
                                ? "bg-[#00D26A] border-[#00D26A] text-[#1C1F5A] shadow-[0_0_20px_rgba(0,210,106,0.3)]"
                                : "bg-[#15183d] border-[#2a2e6e] text-slate-400 hover:border-slate-500"
                                }`}
                        >
                            {league.label}
                        </button>
                    ))}
                </div>

                {/* Tabela */}
                <div className="bg-[#15183d]/50 backdrop-blur-sm border border-[#2a2e6e] rounded-[2.5rem] overflow-hidden shadow-3xl">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-[#2a2e6e]">
                            {isLoading ? (
                                <tr>
                                    <td className="px-8 py-32 text-center text-[#00D26A] animate-pulse font-black uppercase tracking-widest">
                                        Sincronizando Dados...
                                    </td>
                                </tr>
                            ) : matches.length > 0 ? (
                                matches.map((match) => (
                                    <tr
                                        key={match.id}
                                        className="hover:bg-[#00D26A]/5 transition-all group cursor-pointer"
                                        onClick={() => navigate(`/analise/${currentSport}/${match.id}`, { state: { match } })}
                                    >
                                        <td className="px-8 py-10 w-44">
                                            <div className="flex items-center gap-3">
                                                <Clock size={16} className="text-[#00D26A]" />
                                                <span className="font-black text-xl tabular-nums">
                                                    {match.time ? new Date(match.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-10">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-4 font-black uppercase text-2xl md:text-3xl tracking-tighter">
                                                    <span>{match.homeTeam}</span>
                                                    <span className="text-[#00D26A] opacity-30 italic text-sm">VS</span>
                                                    <span>{match.awayTeam}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 group-hover:text-slate-300">
                                                    {match.league || 'Liga Independente'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-10 text-right">
                                            <div className="bg-[#2a2e6e] group-hover:bg-[#00D26A] text-[#00D26A] group-hover:text-[#1C1F5A] p-4 rounded-2xl transition-all inline-block">
                                                <ChevronRight size={24} strokeWidth={3} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-8 py-32 text-center text-slate-500 font-black uppercase tracking-widest">
                                        Nenhum evento encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};