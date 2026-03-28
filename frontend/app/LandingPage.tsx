import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Trophy,
    Dribbble,
    Gamepad2,
    Target,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    TrendingUp,
    ChevronRight,
    Activity,
    Focus,
    Combine
} from 'lucide-react';

const sports = [
    {
        id: 'futebol',
        label: 'Futebol',
        icon: Trophy,
        path: '/lobby/futebol',
        description: 'Mercados de partida com leitura tática em tempo real.',
        highlight: true,
    },
    {
        id: 'basquete',
        label: 'Basquete',
        icon: Dribbble,
        path: '/lobby/basquete',
        description: 'Ritmo, posse e pressão para decisões mais precisas.',
        highlight: false,
    },
    {
        id: 'esports',
        label: 'Esports',
        icon: Gamepad2,
        path: '/lobby/esports',
        description: 'Leitura de rounds, momentum e cenários de virada.',
        highlight: false,
    },
    {
        id: 'tenis',
        label: 'Tênis',
        icon: Target,
        path: '/lobby/tenis',
        description: 'Games decisivos, estabilidade e pressão por set.',
        highlight: false,
    },
];

const sportsOptions = [
    { id: 'futebol', label: 'FUT' },
    { id: 'basquete', label: 'BAS' },
    { id: 'esports', label: 'ESP' },
    { id: 'tenis', label: 'TEN' },
];

export const LandingPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSport, setSelectedSport] = useState('futebol');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/lobby/${selectedSport}?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate(`/lobby/${selectedSport}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#1C1F5A] text-white font-sans relative overflow-x-hidden selection:bg-[#00D26A]/30 selection:text-white">
            
            {/* TACTICAL PITCH BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.15] mix-blend-screen scale-150 sm:scale-100 origin-bottom sm:origin-center transition-transform duration-1000">
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
                    <g className="animate-pulse" style={{ animationDuration: '4s' }}>
                        <circle cx="280" cy="720" r="10" fill="currentColor" fillOpacity="0.8" />
                        <circle cx="400" cy="850" r="10" fill="currentColor" fillOpacity="0.8" />
                        <circle cx="580" cy="680" r="10" fill="currentColor" fillOpacity="0.8" />
                        <circle cx="520" cy="400" r="10" fill="currentColor" fillOpacity="0.8" />
                        <path d="M 290 720 Q 340 780 390 840" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                        <path d="M 410 850 Q 500 750 570 690" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                        <path d="M 575 670 Q 550 500 525 410" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                    </g>
                </svg>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,210,106,0.08),transparent_40%),radial-gradient(circle_at_85%_35%,rgba(0,210,106,0.08),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(28,31,90,1),transparent_70%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1C1F5A]/40 to-[#1C1F5A]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
                {/* HEADER */}
                <header className="mb-14 flex items-center justify-between rounded-2xl border border-white/5 bg-[#121547]/60 px-5 py-4 backdrop-blur-xl shadow-lg ring-1 ring-[#00D26A]/10">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D26A] to-[#009b4d] shadow-[0_0_15px_rgba(0,210,106,0.4)]">
                            <Activity className="h-6 w-6 text-[#1C1F5A]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00D26A]">Pro Stats</p>
                            <p className="text-sm font-semibold text-white/90">Football Intelligence Platform</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/lobby/futebol')}
                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#00D26A]/10 px-5 py-2.5 text-sm font-bold text-[#00D26A] transition-all hover:bg-[#00D26A] hover:text-[#1C1F5A] focus:outline-none focus:ring-2 focus:ring-[#00D26A]/50 focus:ring-offset-2 focus:ring-offset-[#1C1F5A]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Painel Tático
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 -z-10 translate-y-[100%] bg-[#00D26A] transition-transform duration-300 group-hover:translate-y-0" />
                    </button>
                </header>

                <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                    {/* HERO LEFT - AJUSTE: Removido overflow-hidden para não cortar o dropdown */}
                    <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#121547]/95 to-[#0b0d30]/95 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)] md:p-12 lg:min-h-[500px] flex flex-col justify-center backdrop-blur-sm">
                        <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-[#00D26A]/5 blur-[100px]" />
                        
                        <div className="relative z-10">
                            <div className="mb-6 animate-fade-in-down inline-flex items-center gap-2.5 rounded-full border border-[#00D26A]/30 bg-[#00D26A]/5 px-4 py-2 opacity-90 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D26A] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D26A]"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00D26A]">
                                    Leitura de Campo Ativa
                                </span>
                            </div>

                            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-[4rem]">
                                Decisão esportiva com
                                <span className="col block text-transparent bg-clip-text bg-gradient-to-r from-[#00D26A] to-[#66ffb3] mt-2 pb-1">visão tática avançada</span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/70 md:text-lg">
                                Centralize partidas, Heatmaps e probabilidade de marcação usando uma interface profissional. Arquitetura desenhada para analistas e operadores de alta performance.
                            </p>

                            <form onSubmit={handleSearch} className="mt-10 max-w-xl relative">
                                <div className="group relative flex items-center rounded-2xl bg-[#0f1238] p-2 ring-1 ring-white/10 transition-all focus-within:bg-[#121547] focus-within:ring-[#00D26A]/50">
                                <div className="relative flex items-center h-full border-r border-white/5 mr-3 pr-3 pl-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 rounded-lg bg-[#00D26A]/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#00D26A] transition-colors hover:bg-[#00D26A]/20 ring-1 ring-[#00D26A]/30 focus:outline-none"
                                    >
                                        {sportsOptions.find(s => s.id === selectedSport)?.label}
                                        <svg className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </button>

                                    {isDropdownOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-[90]" 
                                                onClick={() => setIsDropdownOpen(false)} 
                                            />
                                            
                                            <div className="absolute top-[calc(100%+12px)] left-0 min-w-[120px] rounded-xl bg-[#141745] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden z-[100] p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                                {sportsOptions.map(option => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedSport(option.id);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
                                                            selectedSport === option.id 
                                                                ? 'bg-[#00D26A] text-[#1C1F5A]' 
                                                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                    <div className="text-white/40 group-focus-within:text-[#00D26A] transition-colors mr-2">
                                        <Search className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar por time, evento..."
                                        className="h-12 w-full bg-transparent px-2 text-base text-white placeholder:text-white/30 focus:outline-none font-medium"
                                    />
                                    <button
                                        type="submit"
                                        className="ml-2 inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00D26A] px-6 text-sm font-bold text-[#1C1F5A] shadow-[0_0_20px_rgba(0,210,106,0.3)] transition-all hover:bg-[#00f079] hover:shadow-[0_0_30px_rgba(0,210,106,0.5)] active:scale-95"
                                    >
                                        Mapear
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 flex items-center gap-5 text-sm font-medium text-white/50">
                                <div className="flex items-center gap-2">
                                    <Focus className="h-4 w-4 text-[#00D26A]/70" />
                                    <span>Radar Analítico Real-time</span>
                                </div>
                                <span className="h-1 w-1 rounded-full bg-white/20"></span>
                                <div className="flex items-center gap-2">
                                    <Combine className="h-4 w-4 text-[#00D26A]/70" />
                                    <span>Múltiplos Mercados</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HERO RIGHT (Stats Widget) */}
                    <aside className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#141745]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:p-8 backdrop-blur-md flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D26A]/50 to-transparent" />
                        
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-white">
                                Cockpit do Analista
                            </h2>
                            <div className="rounded-lg bg-white/5 p-2 ring-1 ring-white/10">
                                <Sparkles className="h-4 w-4 text-white/50" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:bg-white/10">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#00D26A]">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Predictive Edge</span>
                                    </div>
                                    <span className="text-xs font-semibold text-white/40">CALIBRADO</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-white/70">
                                    Modelos de Momentum ajustados constantemente baseados em contexto e pressão ofensiva da equipe atacante.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#121547] to-[#0f1238] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-white/80">
                                        <TrendingUp className="h-5 w-5" />
                                        <span className="text-sm font-bold">Pressão Territorial</span>
                                    </div>
                                    <span className="text-2xl font-black text-white">89<span className="text-sm text-white/40 ml-1">%</span></span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                                    <div className="h-full rounded-full bg-gradient-to-r from-[#00D26A]/40 to-[#00D26A] w-[89%] shadow-[0_0_10px_rgba(0,210,106,0.6)]" />
                                </div>
                                <div className="mt-3 flex justify-between text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                                    <span>Defensivo</span>
                                    <span>Atacando</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border-l-2 border-[#00D26A] bg-[#00D26A]/5 p-4 pl-5">
                            <p className="text-xs font-medium leading-relaxed text-white/80">
                                <span className="font-bold text-[#00D26A]">Status da Rede:</span> O algoritmo processa fluxos contínuos de scouts para atualizar tendências e viradas de partida ao vivo.
                            </p>
                        </div>
                    </aside>
                </section>

                <main className="mt-12">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-bold tracking-tight text-white/90">
                            Selecionar Modalidade
                        </h3>
                        <div className="h-px flex-1 ml-6 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {sports.map((sport) => {
                            const Icon = sport.icon;
                            const isHighlighted = sport.highlight;

                            return (
                                <button
                                    key={sport.id}
                                    onClick={() => navigate(sport.path)}
                                    className={`group relative overflow-hidden rounded-[1.5rem] border text-left transition-all duration-300 hover:-translate-y-1 ${
                                        isHighlighted 
                                            ? 'border-[#00D26A]/40 bg-gradient-to-br from-[#121547] to-[#0b0d30] shadow-[0_10px_40px_rgba(0,210,106,0.15)] ring-1 ring-[#00D26A]/20' 
                                            : 'border-white/5 bg-[#141745]/60 hover:border-white/20 hover:bg-[#1f2366]/60 shadow-lg'
                                    } p-6`}
                                >
                                    {isHighlighted && (
                                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#00D26A]/10 blur-[40px] transition-opacity group-hover:opacity-100" />
                                    )}

                                    <div className="relative z-10 flex h-full flex-col">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${
                                                isHighlighted 
                                                    ? 'border-[#00D26A]/30 bg-[#00D26A]/10 text-[#00D26A]' 
                                                    : 'border-white/10 bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white'
                                            } transition-colors`}>
                                                <Icon className="h-6 w-6" strokeWidth={isHighlighted ? 2 : 1.5} />
                                            </div>
                                            {isHighlighted && (
                                                <span className="rounded-full bg-[#00D26A]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#00D26A]">Primary</span>
                                            )}
                                        </div>

                                        <h3 className={`text-xl font-bold tracking-tight ${isHighlighted ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                                            {sport.label}
                                        </h3>
                                        <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-white/50 group-hover:text-white/70 transition-colors">
                                            {sport.description}
                                        </p>

                                        <span className={`mt-6 inline-flex items-center gap-2 text-sm font-bold ${
                                            isHighlighted ? 'text-[#00D26A]' : 'text-white/40 group-hover:text-white/80'
                                        }`}>
                                            Entrar Hub
                                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </main>

                <footer className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 pb-4 sm:flex-row text-xs font-medium">
                    <p className="text-white/40">© {new Date().getFullYear()} Pro Stats Analytics Engine</p>
                    <div className="flex items-center gap-6">
                        <p className="tracking-widest uppercase text-white/30">Dados operacionais: BetsAPI</p>
                        <div className="h-1 w-1 rounded-full bg-[#00D26A] shadow-[0_0_10px_rgba(0,210,106,1)]" />
                    </div>
                </footer>
            </div>
        </div>
    );
};