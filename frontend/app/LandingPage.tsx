// frontend/app/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Corrigido: Nomes oficiais dos ícones Lucide
import { Search, Trophy, Dribbble, Gamepad2, Target } from 'lucide-react';


const sports = [
    { id: 'futebol', label: 'Futebol', icon: Trophy, color: 'text-green-400', bgColor: 'bg-green-400', path: '/lobby/futebol' },
    { id: 'basquete', label: 'Basquete', icon: Dribbble, color: 'text-orange-500', bgColor: 'bg-orange-500', path: '/lobby/basquete' },
    { id: 'esports', label: 'Esports', icon: Gamepad2, color: 'text-purple-500', bgColor: 'bg-purple-500', path: '/lobby/esports' },
    { id: 'tenis', label: 'Tênis', icon: Target, color: 'text-yellow-400', bgColor: 'bg-yellow-400', path: '/lobby/tenis' },
];


export const LandingPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        navigate(`/lobby/futebol?search=${encodeURIComponent(searchTerm)}`);
    }
};

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden relative">

            {/* Background Decorativo */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-500 rounded-full blur-[150px]"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-[150px]"></div>
            </div>

            <div className="w-full max-w-6xl z-10 flex flex-col items-center space-y-12">

                {/* BIG LOGO CENTRALIZADA */}
                <header className="text-center space-y-2">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none">
                        PRO <span className="text-blue-600">STATS</span>
                    </h1>
                    <p className="text-slate-400 text-xl md:text-2xl font-light tracking-wide">
                        Análises Esportivas Avançadas e Insights em Tempo Real
                    </p>
                </header>

                {/* BARRA DE BUSCA CENTRAL */}
                <form onSubmit={handleSearch} className="w-full max-w-3xl relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-green-400 transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Busque por Times, Ligas ou Jogadores..."
                        className="w-full py-6 px-16 rounded-full bg-slate-800/60 border border-slate-700 text-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all shadow-2xl backdrop-blur-sm"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-400 text-slate-950 font-bold px-8 py-3 rounded-full transition-colors text-lg">
                        Analisar
                    </button>
                </form>

                {/* GRADE DE ESPORTES */}
                <main className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
                    {sports.map((sport) => {
                        const Icon = sport.icon;
                        return (
                            <button
                                key={sport.id}
                                onClick={() => navigate(sport.path)}
                                className="group relative flex flex-col items-center justify-center space-y-6 p-10 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
                            >
                                {/* Efeito de brilho corrigido */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-3xl z-0 ${sport.bgColor}`}></div>

                                <Icon className={`w-16 h-16 ${sport.color} z-10 relative group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
                                <h2 className="text-3xl font-bold tracking-tight text-white z-10 relative">
                                    {sport.label}
                                </h2>
                                <span className="text-slate-400 group-hover:text-green-400 font-medium z-10 relative flex items-center gap-2">
                                    Acessar Painel <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </button>
                        );
                    })}
                </main>

                <footer className="pt-20 text-slate-600 text-sm">
                    © 2026 Pro Stats Technologies. Dados providos por BetsAPI.
                </footer>
            </div>
        </div>
    );
};