import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_clients.betsapi import BetsAPIClient

# Carrega token da BetsAPI de EDScript-1/.env
load_dotenv('../.env')

app = FastAPI(title="Match Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/upcoming-matches")
def get_upcoming_matches():
    try:
        client = BetsAPIClient()
        upcoming = client.get_upcoming_events(sport_id=1) 
        # sport_id=1 é Soccer na BetsAPI
        matches = []
        for event in upcoming.get('results', [])[:15]: # Limitando aos primeiros 15 pra ficar mais rapido
            home_name = event.get('home', {}).get('name')
            away_name = event.get('away', {}).get('name')
            if home_name and away_name:
                matches.append({
                    "id": event.get('id'),
                    "homeTeam": home_name,
                    "awayTeam": away_name,
                    "time": event.get('time')
                })
        return {"matches": matches}
    except Exception as e:
        return {"error": str(e), "matches": []}

@app.get("/api/match-scenario")
def get_match_scenario(homeTeam: str = "Manchester City", awayTeam: str = "Liverpool"):
    return {
        "homeTeam": homeTeam,
        "awayTeam": awayTeam,
        "scenarioData": {
            "standard": {
                "mainScenario": {
                    "insight": f"{homeTeam} é favorito com 58% de chance de vitória",
                    "confidence": 73,
                    "reasoning": f"Baseado no desempenho recente em casa (8 vitórias nos últimos 10 jogos) e no histórico de confrontos diretos nesta temporada"
                },
                "probabilities": {
                    "goals": {"home": 68, "away": 45, "method": "statistical"},
                    "cards": {"home": 42, "away": 55, "method": "ml"},
                    "penalty": {"home": 28, "away": 22, "method": "heuristic"},
                    "winner": {"home": 58, "away": 25, "draw": 17, "method": "ml"}
                }
            },
            "pressure": {
                "mainScenario": {
                    "insight": f"Sob pressão, {homeTeam} ataca mais mas {awayTeam} pode contra-atacar",
                    "confidence": 68,
                    "reasoning": f"Simulando cenário onde {homeTeam} está perdendo. Historicamente aumenta finalizações em 35% mas concede mais espaço"
                },
                "probabilities": {
                    "goals": {"home": 75, "away": 52, "method": "statistical"},
                    "cards": {"home": 58, "away": 62, "method": "ml"},
                    "penalty": {"home": 35, "away": 28, "method": "heuristic"},
                    "winner": {"home": 52, "away": 32, "draw": 16, "method": "ml"}
                }
            },
            "control": {
                "mainScenario": {
                    "insight": f"Com alta posse, {homeTeam} domina mas pode ter dificuldade para finalizar",
                    "confidence": 71,
                    "reasoning": f"Com 65%+ de posse, {homeTeam} cria mais chances mas {awayTeam} defende bem recuado"
                },
                "probabilities": {
                    "goals": {"home": 62, "away": 38, "method": "statistical"},
                    "cards": {"home": 35, "away": 48, "method": "ml"},
                    "penalty": {"home": 32, "away": 18, "method": "heuristic"},
                    "winner": {"home": 64, "away": 20, "draw": 16, "method": "ml"}
                }
            }
        },
        "metadata": {
            "goals": {
                "reasoning": f"Últimos cinco jogos do {homeTeam} em casa tiveram média de 2.8 gols marcados. {awayTeam} sofreu gols em 4 dos últimos 5 jogos fora de casa",
                "source": "baseado nos últimos 5 jogos"
            },
            "cards": {
                "reasoning": f"{awayTeam} tem histórico de jogo físico em confrontos diretos, com média de 3.2 cartões amarelos",
                "source": "modelo de intensidade de jogo"
            },
            "penalty": {
                "reasoning": f"Últimos três confrontos entre estas equipes tiveram dois pênaltis. {homeTeam} pressiona muito na área adversária",
                "source": "baseado em confrontos diretos"
            },
            "winner": {
                "reasoning": f"{homeTeam} venceu 7 dos últimos 10 confrontos em casa. {awayTeam} está com jogadores importantes lesionados",
                "source": "modelo de forma e condição do elenco"
            }
        },
        "timelineEvents": [
            {
                "minute": 12,
                "type": "goal",
                "probability": 72,
                "description": f"Alta chance de gol do {homeTeam}",
                "factors": [
                    "Período de maior pressão ofensiva baseado em padrões históricos",
                    f"{awayTeam} geralmente leva 15min para se adaptar ao ritmo do {homeTeam}",
                    f"Média de 0.8 gols marcados pelo {homeTeam} entre 10-15 minutos"
                ]
            },
            {
                "minute": 28,
                "type": "pressure",
                "probability": 65,
                "description": "Período de pressão intensa",
                "factors": [
                    f"Pico de finalizações do {homeTeam} ocorre entre 25-35 minutos",
                    f"{awayTeam} tende a recuar neste período do jogo",
                    "Maior número de escanteios e cruzamentos esperados"
                ]
            },
            {
                "minute": 44,
                "type": "goal",
                "probability": 58,
                "description": "Janela de oportunidade antes do intervalo",
                "factors": [
                    "Times ficam mais vulneráveis nos últimos minutos do tempo",
                    f"{homeTeam} tem histórico de gols nos acréscimos do 1º tempo",
                    "Pressão psicológica para pontuar antes do intervalo"
                ]
            },
            {
                "minute": 67,
                "type": "defense",
                "probability": 55,
                "description": f"{awayTeam} fortalece defesa após substituições",
                "factors": [
                    "Período típico de substituições defensivas",
                    "Redução de 25% em gols sofridos após mudanças táticas",
                    "Foco em segurar resultado ou buscar contra-ataque"
                ]
            },
            {
                "minute": 82,
                "type": "goal",
                "probability": 68,
                "description": "Momento crítico - cansaço físico aumenta chances",
                "factors": [
                    "Defesas ficam mais vulneráveis após 80 minutos",
                    f"40% dos gols do {homeTeam} ocorrem nos últimos 15 minutos",
                    "Espaços maiores devido ao desgaste físico"
                ]
            }
        ],
        "autoComments": [
            {
                "text": f"O {homeTeam} tem 30% mais finalizações no primeiro tempo em jogos em casa. Fique de olho no início da partida.",
                "type": "insight"
            },
            {
                "text": f"{awayTeam} está em tendência de queda defensiva, sofrendo gols em 4 dos últimos 5 jogos fora de casa.",
                "type": "trend"
            },
            {
                "text": "Atenção: Árbitro Antônio Miguel tem média de 4.2 cartões amarelos por jogo nesta temporada, acima da média da liga.",
                "type": "alert"
            }
        ],
        "matchHistory": {
            "homeTeam": {
                "name": homeTeam,
                "recentForm": [
                    {"result": "W", "score": "3-1"},
                    {"result": "W", "score": "2-0"},
                    {"result": "D", "score": "1-1"},
                    {"result": "W", "score": "4-1"},
                    {"result": "W", "score": "2-1"}
                ],
                "offensiveTrend": [2, 3, 1, 4, 2],
                "defensiveTrend": [1, 1, 1, 1, 0]
            },
            "awayTeam": {
                "name": awayTeam,
                "recentForm": [
                    {"result": "W", "score": "2-1"},
                    {"result": "L", "score": "0-2"},
                    {"result": "D", "score": "2-2"},
                    {"result": "W", "score": "3-0"},
                    {"result": "L", "score": "1-3"}
                ],
                "offensiveTrend": [2, 0, 2, 3, 1],
                "defensiveTrend": [1, 2, 2, 0, 3]
            },
            "headToHead": {
                "homeWins": 6,
                "draws": 2,
                "awayWins": 2
            }
        }
    }
