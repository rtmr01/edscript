import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Clock, ChevronRight, Trophy, Activity, Gamepad2, Target } from 'lucide-react';

export const LobbyPage: React.FC = () => {
    const { sport } = useParams<{ sport: string }>();
    const navigate = useNavigate();
    
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const sportIds: Record<string, number> = {
        futebol: 1,
        basquete: 18,
        esports: 151,
        tenis: 13
    };

    const getSportIcon = () => {
        const s = sport?.toLowerCase() || '';
        if (s === 'basquete') return <Activity className="text-[#bcff00] w-10 h-10" />;
        if (s === 'esports') return <Gamepad2 className="text-[#bcff00] w-10 h-10" />;
        if (s === 'tenis') return <Target className="text-[#bcff00] w-10 h-10" />;
        return <Trophy className="text-[#bcff00] w-10 h-10" />;
    };

    useEffect(() => {
        setIsLoading(true);
        // Fallback para 1 (soccer) se o esporte for inválido
        const id = sportIds[sport?.toLowerCase() || 'futebol'] || 1;
        
        fetch(`http://localhost:8000/api/upcoming-matches?sport_id=${id}`)
            .then(res => res.json())
            .then(data => {
                // Garante que matches seja sempre um array, mesmo se a API falhar
                setMatches(Array.isArray(data.matches) ? data.matches : []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Erro na busca:", err);
                setMatches([]);
                setIsLoading(false);
            });
    }, [sport]);

    // Filtro ultra-seguro contra valores null/undefined
    const filteredMatches = (matches || []).filter(m => {
        const home = m?.homeTeam?.toLowerCase() || "";
        const away = m?.awayTeam?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return home.includes(search) || away.includes(search);
    });

    return (
        <div className="min-h-screen bg-[#0a101f] text-white p-4 md:p-8 relative">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-[#bcff00]/5 blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#bcff00] transition-colors font-bold uppercase text-[10px] tracking-widest"
                >
                    <ArrowLeft size={14} /> Voltar ao Início
                </button>

                <header className="text-center flex flex-col items-center gap-4">
                    {getSportIcon()}
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                        PRO <span className="text-[#bcff00]">{sport || 'Esporte'}</span>
                    </h1>
                </header>

                <div className="max-w-2xl mx-auto relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#bcff00]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar confronto..."
                        className="w-full py-5 px-14 rounded-2xl bg-[#11192b] border border-[#1e2a4a] text-white focus:outline-none focus:border-[#bcff00] shadow-xl"
                    />
                </div>

                <div className="bg-[#11192b] border border-[#1e2a4a] rounded-[2rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-[#1e2a4a]">
                            {isLoading ? (
                                <tr>
                                    <td className="px-8 py-24 text-center text-slate-500 uppercase font-black tracking-widest animate-pulse">
                                        Sincronizando...
                                    </td>
                                </tr>
                            ) : filteredMatches.length > 0 ? (
                                filteredMatches.map((match) => (
                                    <tr 
                                        key={match.id} 
                                        className="hover:bg-[#bcff00]/5 transition-all group cursor-pointer"
                                        onClick={() => navigate(`/analise/${sport}/${match.id}`)}
                                    >
                                        <td className="px-8 py-8 w-40">
                                            <div className="flex items-center gap-3">
                                                <Clock size={16} className="text-[#bcff00]" />
                                                <span className="font-black text-lg">
                                                    {match.time ? new Date(match.time * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-6 font-black uppercase text-xl md:text-2xl">
                                                <span>{match.homeTeam}</span>
                                                <span className="text-[#bcff00] bg-[#bcff00]/10 px-2 py-1 rounded text-xs italic">VS</span>
                                                <span>{match.awayTeam}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <button className="bg-[#1e2a4a] group-hover:bg-[#bcff00] text-[#bcff00] group-hover:text-[#0a101f] p-3 rounded-xl transition-all">
                                                <ChevronRight size={20} strokeWidth={4} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-8 py-20 text-center text-slate-600 font-bold uppercase tracking-widest">
                                        Nenhum evento para {sport}.
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