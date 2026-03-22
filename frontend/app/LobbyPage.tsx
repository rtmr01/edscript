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
        const color = "text-[#00D26A]";
        if (s === 'basquete') return <Activity className={`${color} w-10 h-10`} />;
        if (s === 'esports') return <Gamepad2 className={`${color} w-10 h-10`} />;
        if (s === 'tenis') return <Target className={`${color} w-10 h-10`} />;
        return <Trophy className={`${color} w-10 h-10`} />;
    };

    useEffect(() => {
        setIsLoading(true);
        const id = sportIds[sport?.toLowerCase() || 'futebol'] || 1;
        
        fetch(`http://localhost:8000/api/upcoming-matches?sport_id=${id}`)
            .then(res => res.json())
            .then(data => {
                setMatches(Array.isArray(data.matches) ? data.matches : []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Erro na busca:", err);
                setMatches([]);
                setIsLoading(false);
            });
    }, [sport]);

    const filteredMatches = (matches || []).filter(m => {
        const home = m?.homeTeam?.toLowerCase() || "";
        const away = m?.awayTeam?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return home.includes(search) || away.includes(search);
    });

    useEffect(() => {
        document.title = `Pro Stats | ${sport?.toUpperCase()}`;
    }, [sport]);

    return (
        <div className="min-h-screen bg-[#1C1F5A] text-white p-4 md:p-8 relative">
            
            {/* Glow verde */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-[#00D26A]/10 blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">
                
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#00D26A] transition-colors font-bold uppercase text-[10px] tracking-widest"
                >
                    <ArrowLeft size={14} /> Voltar ao Início
                </button>

                <header className="text-center flex flex-col items-center gap-4">
                    {getSportIcon()}
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                        PRO <span className="text-[#00D26A]">{sport || 'Esporte'}</span>
                    </h1>
                </header>

                <div className="max-w-2xl mx-auto relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#00D26A]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar confronto..."
                        className="w-full py-5 px-14 rounded-2xl bg-[#15183d] border border-[#2a2e6e] text-white focus:outline-none focus:border-[#00D26A] shadow-xl"
                    />
                </div>

                <div className="bg-[#15183d] border border-[#2a2e6e] rounded-[2rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-[#2a2e6e]">
                            
                            {isLoading ? (
                                <tr>
                                    <td className="px-8 py-24 text-center text-slate-400 uppercase font-black tracking-widest animate-pulse">
                                        Sincronizando...
                                    </td>
                                </tr>
                            ) : filteredMatches.length > 0 ? (
                                filteredMatches.map((match) => (
                                    <tr 
                                        key={match.id} 
                                        className="hover:bg-[#00D26A]/10 transition-all group cursor-pointer"
                                        onClick={() => navigate(`/analise/${sport}/${match.id}`)}
                                    >
                                        <td className="px-8 py-8 w-40">
                                            <div className="flex items-center gap-3">
                                                <Clock size={16} className="text-[#00D26A]" />
                                                <span className="font-black text-lg">
                                                    {match.time ? new Date(match.time * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-6 font-black uppercase text-xl md:text-2xl">
                                                <span>{match.homeTeam}</span>
                                                <span className="text-[#00D26A] bg-[#00D26A]/10 px-2 py-1 rounded text-xs italic">VS</span>
                                                <span>{match.awayTeam}</span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-8 text-right">
                                            <button className="bg-[#2a2e6e] group-hover:bg-[#00D26A] text-[#00D26A] group-hover:text-[#1C1F5A] p-3 rounded-xl transition-all">
                                                <ChevronRight size={20} strokeWidth={4} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
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