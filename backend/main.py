import os
import hashlib
import json
from typing import Annotated, Any
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from api_clients.betsapi import BetsAPIClient
from ml.predictor import predict_match
from ml.epl_analyzer import EPLAnalyzer

# Carrega token da BetsAPI de .env (Caminho relativo corrigido para buscar na raiz se não estiver no backend)
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(current_dir), '.env')

load_dotenv(env_path)
print(f"DEBUG: Carregando .env de {env_path}")

app = FastAPI(title="Match Assistant API")
epl_analyzer = EPLAnalyzer()

# Carrega multiplicadores de cenário derivados de dados reais da EPL 25/26
_scenario_mult_path = os.path.join(current_dir, 'ml', 'scenario_multipliers.json')
_scenario_mult = {"pressure": {"goals": 1.34, "shots": 1.22, "cards": 0.91, "penalty": 1.28}, "control": {"goals": 0.98, "shots": 0.98, "cards": 1.04, "penalty": 0.93}}
if os.path.exists(_scenario_mult_path):
    with open(_scenario_mult_path) as _f:
        _loaded = json.load(_f)
        _scenario_mult = {"pressure": _loaded["pressure"], "control": _loaded["control"]}
    print(f"Multiplicadores de cenário carregados: {_scenario_mult}")
else:
    print("AVISO: scenario_multipliers.json não encontrado, usando fallback. Rode compute_scenario_multipliers.py")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UpcomingMatchesQuery(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    sport_id: int = Field(default=1, ge=1, le=500)
    league_id: int | None = Field(default=None, ge=1)
    search: str | None = Field(default=None, min_length=2, max_length=80)

    @field_validator("search")
    @classmethod
    def validate_search(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not all(ch.isalnum() or ch in " -_.'" for ch in value):
            raise ValueError("search contém caracteres inválidos")
        return value


class MatchScenarioQuery(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    homeTeam: str = Field(default="Manchester City", min_length=2, max_length=80)
    awayTeam: str = Field(default="Liverpool", min_length=2, max_length=80)
    matchId: str | None = Field(default=None, min_length=1, max_length=32)

    @field_validator("homeTeam", "awayTeam")
    @classmethod
    def validate_team_name(cls, value: str) -> str:
        if not all(ch.isalnum() or ch in " -_.'" for ch in value):
            raise ValueError("Nome de time contém caracteres inválidos")
        return value

    @field_validator("awayTeam")
    @classmethod
    def validate_different_teams(cls, away_team: str, info) -> str:
        home_team = info.data.get("homeTeam")
        if home_team and away_team.lower() == home_team.lower():
            raise ValueError("homeTeam e awayTeam não podem ser iguais")
        return away_team

    @field_validator("matchId")
    @classmethod
    def validate_match_id(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not value.isdigit():
            raise ValueError("matchId precisa ser numérico")
        return value



def _empty_squad(team_name: str) -> dict[str, Any]:
    # Retorna uma estrutura vazia se não houver dados reais (sem jogadores mock)
    return {"formation": "N/A", "players": [], "source": "no_data"}


def _extract_players(value: Any) -> list[dict[str, str]]:
    players: list[dict[str, str]] = []
    if isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                name = item.get("name") or item.get("player_name") or item.get("player")
                if name:
                    players.append({
                        "name": str(name),
                        "position": str(item.get("position") or item.get("pos") or "N/A"),
                    })
    elif isinstance(value, dict):
        for key in ("lineup", "lineups", "players", "squad"):
            players.extend(_extract_players(value.get(key)))
    return players


def _extract_squads_from_event_view(view: dict[str, Any], home_team: str, away_team: str) -> dict[str, Any]:
    result = (view.get("results") or [{}])[0]

    home_players = (
        _extract_players(result.get("home"))
        + _extract_players(result.get("home_lineup"))
        + _extract_players(result.get("home_players"))
    )
    away_players = (
        _extract_players(result.get("away"))
        + _extract_players(result.get("away_lineup"))
        + _extract_players(result.get("away_players"))
    )

    home_unique = list({p["name"]: p for p in home_players}.values())[:18]
    away_unique = list({p["name"]: p for p in away_players}.values())[:18]

    home_formation = result.get("home_formation") or "N/A"
    away_formation = result.get("away_formation") or "N/A"

    return {
        "home": {
            "formation": home_formation,
            "players": home_unique,
            "source": "betsapi" if home_unique else "no_data",
        },
        "away": {
            "formation": away_formation,
            "players": away_unique,
            "source": "betsapi" if away_unique else "no_data",
        },
    }


def _build_squads(match_id: str | None, home_team: str, away_team: str) -> dict[str, Any]:
    if not match_id:
        return {
            "home": _empty_squad(home_team),
            "away": _empty_squad(away_team),
        }
    try:
        view = BetsAPIClient().get_event_view(match_id)
        return _extract_squads_from_event_view(view, home_team, away_team)
    except Exception:
        return {
            "home": _empty_squad(home_team),
            "away": _empty_squad(away_team),
        }


def _fetch_team_recent_results(team_name: str, league_id: int | None = None, count: int = 5) -> list[dict[str, str]]:
    """
    Busca os últimos resultados reais de um time usando o endpoint de eventos encerrados da BetsAPI.
    """
    try:
        client = BetsAPIClient()
        # Buscamos partidas encerradas da liga (ou geral se league_id for None)
        res = client.get_ended_events(sport_id=1, league_id=league_id)
        events = res.get('results', [])
        
        team_results = []
        for ev in events:
            home = ev.get('home', {}).get('name', '')
            away = ev.get('away', {}).get('name', '')
            ss = ev.get('ss') # score string "2-1"
            
            # Filtro por nome (case insensitive)
            if team_name.lower() in home.lower() or team_name.lower() in away.lower():
                if ss and '-' in ss:
                    try:
                        scores = ss.split('-')
                        h_score = int(scores[0])
                        a_score = int(scores[1])
                        
                        is_home = team_name.lower() in home.lower()
                        if h_score == a_score:
                            r = "D"
                        elif (is_home and h_score > a_score) or (not is_home and a_score > h_score):
                            r = "W"
                        else:
                            r = "L"
                        
                        team_results.append({
                            "result": r, 
                            "score": ss,
                            "scored": h_score if is_home else a_score,
                            "conceded": a_score if is_home else h_score
                        })
                    except (ValueError, IndexError):
                        continue
            
            if len(team_results) >= count:
                break
        
        return team_results
    except Exception as e:
        print(f"Erro ao buscar histórico para {team_name}: {e}")
        return []


@app.get("/api/upcoming-matches")
def get_upcoming_matches(
    params: Annotated[UpcomingMatchesQuery, Depends()]
):
    try:
        client = BetsAPIClient()
        # Buscamos os eventos. Se league_id for enviado, o cliente tratará o filtro na origem
        upcoming = client.get_upcoming_events(sport_id=params.sport_id, league_id=params.league_id)
        
        matches = []
        results = upcoming.get('results', [])
        
        for event in results:
            league_name = event.get('league', {}).get('name', '')
            home_name = event.get('home', {}).get('name', '')
            away_name = event.get('away', {}).get('name', '')

            # 1. BLOQUEIO DE ESOCCER E LIXO (Essencial para o sport_id 1)
            blacklist = ["esoccer", "electronic", "mins play", "friendly", "cyber", "fifa", "simulated"]
            if params.sport_id == 1 and any(term in league_name.lower() for term in blacklist):
                continue

            # 2. FILTRO DE BUSCA (Se houver termo de pesquisa)
            if params.search:
                s = params.search.lower()
                if s not in home_name.lower() and s not in away_name.lower() and s not in league_name.lower():
                    continue

            matches.append({
                "id": event.get('id'),
                "homeTeam": home_name,
                "awayTeam": away_name,
                "time": event.get('time'),
                "league": league_name
            })
            
            if len(matches) >= 20: break
                
        return {"matches": matches}
    except Exception as e:
        print(f"Erro no Backend: {e}")
        return {"error": str(e), "matches": []}

@app.get("/api/match-scenario")
def get_match_scenario(params: Annotated[MatchScenarioQuery, Depends()]):
    homeTeam = params.homeTeam
    awayTeam = params.awayTeam
    matchId = params.matchId

    # ML Prediction Call
    ml_preds = predict_match(homeTeam, awayTeam)
    
    # Extract prediction numbers
    home_win_prob = ml_preds["winner"]["home"]
    draw_prob = ml_preds["winner"]["draw"]
    away_win_prob = ml_preds["winner"]["away"]
    
    home_goals_exp = ml_preds["goals"]["home_expected"]
    away_goals_exp = ml_preds["goals"]["away_expected"]
    
    # Converte os gols esperados em probabilidades lineares para o frontend (0 a 100) baseando no max estimado de 3.0 gols
    home_goals_prob = min(95, max(5, int((home_goals_exp / 3.0) * 100)))
    away_goals_prob = min(95, max(5, int((away_goals_exp / 3.0) * 100)))
    
    home_cards_exp = ml_preds["cards"]["home_expected"]
    away_cards_exp = ml_preds["cards"]["away_expected"]
    
    # Cartões idem para o frontend (assumindo máximo ~3 cartões como 100% gravidade)
    home_cards_prob = min(95, max(5, int((home_cards_exp / 3.0) * 100)))
    away_cards_prob = min(95, max(5, int((away_cards_exp / 3.0) * 100)))

    home_penalty_base = ml_preds["penalty"]["home"]
    away_penalty_base = ml_preds["penalty"]["away"]
    
    # Confiança padrão e desfecho (serão atualizados pelo modelo se EPL)
    main_confidence = int(max(home_win_prob, away_win_prob, draw_prob))
    main_outcome_text = f"vitória do {homeTeam}"
    main_outcome_pct = home_win_prob
    if draw_prob > home_win_prob and draw_prob > away_win_prob:
        main_outcome_text = "um empate"
        main_outcome_pct = draw_prob
    elif away_win_prob > home_win_prob and away_win_prob > draw_prob:
        main_outcome_text = f"vitória do {awayTeam}"
        main_outcome_pct = away_win_prob

    if main_confidence < 40: main_confidence = 40
    if main_confidence > 98: main_confidence = 98

    # Adição: EPL Specialized Analysis
    epl_data = None
    is_epl = False
    
    # 4. Dados Históricos Reais vs Sintéticos
    league_id = None
    event_view = None
    league_name = ""
    home_name_real = ""
    away_name_real = ""
    
    if matchId:
        try:
            event_view = BetsAPIClient().get_event_view(matchId)
            results = event_view.get("results", [{}])
            if results:
                res0 = results[0]
                league_id = res0.get("league", {}).get("id")
                league_name = res0.get("league", {}).get("name", "")
                home_name_real = res0.get("home", {}).get("name")
                away_name_real = res0.get("away", {}).get("name")
        except Exception:
            pass

    # Refinamento is_epl (Premier League Detection Real)
    epl_keywords = ["premier league", "イングランド・プレミアリーグ", "잉글랜드 프리미어리그"]
    if league_id == 1 or any(k in league_name.lower() for k in epl_keywords):
        is_epl = True

    # Squads (Reaproveitando view se disponível)
    if event_view:
        squads = _extract_squads_from_event_view(event_view, homeTeam, awayTeam)
    else:
        squads = _build_squads(matchId, homeTeam, awayTeam)

    # Histórico Local (Real se possível)
    real_history_home = _fetch_team_recent_results(homeTeam, league_id)
    real_history_away = _fetch_team_recent_results(awayTeam, league_id)

    def get_trends_from_history(history):
        if not history:
            return [], [] # Sem fallback mockado
        off = [m["scored"] for m in history]
        deff = [m["conceded"] for m in history]
        return off[:5], deff[:5]

    off_home, def_home = get_trends_from_history(real_history_home)
    off_away, def_away = get_trends_from_history(real_history_away)

    # Live stats para EPL Analysis
    live_stats = None
    if event_view:
        try:
            res = event_view.get("results", [{}])[0]
            stats = res.get("stats", {})
            if stats:
                live_stats = {
                    'home_possession': int(stats.get('possession_rt', [50])[0]),
                    'home_shots': int(stats.get('shottotal', [0])[0]),
                    'away_possession': 100 - int(stats.get('possession_rt', [50])[0])
                }
        except: pass

    if is_epl:
        try:
            epl_data = epl_analyzer.get_match_insights(homeTeam, awayTeam, live_stats)
            if epl_data and "probabilities" in epl_data:
                # PRIORIZAÇÃO: Sobrescreve probabilidades do modelo genérico pelas do modelo Premium EPL
                probs = epl_data["probabilities"]
                home_win_prob = probs.get('H', home_win_prob)
                draw_prob = probs.get('D', draw_prob)
                away_win_prob = probs.get('A', away_win_prob)
                
                # Recalcula confiança baseada no modelo premium
                main_confidence = int(max(home_win_prob, draw_prob, away_win_prob))
                if main_confidence < 40: main_confidence = 40
                if main_confidence > 98: main_confidence = 98

                # Define qual é o desfecho principal para o texto do insight
                if home_win_prob >= draw_prob and home_win_prob >= away_win_prob:
                    main_outcome_text = f"vitória do {homeTeam}"
                    main_outcome_pct = home_win_prob
                elif draw_prob >= home_win_prob and draw_prob >= away_win_prob:
                    main_outcome_text = "um empate"
                    main_outcome_pct = draw_prob
                else:
                    main_outcome_text = f"vitória do {awayTeam}"
                    main_outcome_pct = away_win_prob
        except Exception as e:
            print(f"Erro EPL Analysis: {e}")

    matchHistory = {
        "homeTeam": {
            "name": home_name_real or homeTeam,
            "recentForm": real_history_home,
            "offensiveTrend": off_home,
            "defensiveTrend": def_home
        },
        "awayTeam": {
            "name": away_name_real or awayTeam,
            "recentForm": real_history_away,
            "offensiveTrend": off_away,
            "defensiveTrend": def_away
        },
        "headToHead": {
            "homeWins": 0,
            "draws": 0,
            "awayWins": 0
        }
    }

    return {
        "homeTeam": homeTeam,
        "awayTeam": awayTeam,
        "isEPL": is_epl,
        "eplAnalysis": epl_data,
        "squads": squads,
        "scenarioData": {
            "standard": {
                "mainScenario": {
                    "insight": f"Análise Premium: {main_outcome_pct}% para {main_outcome_text}" if is_epl else f"{home_win_prob}% de chance de vitória predita pelo modelo Random Forest.",
                    "confidence": main_confidence,
                    "reasoning": f"O modelo especializado da Premier League aponta {main_outcome_text} como o cenário mais provável ({main_outcome_pct}%)." if is_epl else f"O modelo AI analisou as estatísticas históricas dos times projetando uma probabilidade de {home_goals_exp} xG para o {homeTeam}."
                },
                "probabilities": {
                    "goals": {"home": home_goals_prob, "away": away_goals_prob, "method": "ml"},
                    "cards": {"home": home_cards_prob, "away": away_cards_prob, "method": "ml"},
                    "penalty": {"home": home_penalty_base, "away": away_penalty_base, "method": "ml"},
                    "winner": {"home": home_win_prob, "away": away_win_prob, "draw": draw_prob, "method": "ml"}
                }
            },
            "pressure": {
                "mainScenario": {
                    "insight": f"Cenário de pressão alta: {homeTeam} eleva o volume ofensivo, baseado no padrão dos top 5 times da EPL ({_scenario_mult['pressure']['goals']:.2f}x gols, {_scenario_mult['pressure']['shots']:.2f}x finalizações).",
                    "confidence": max(30, main_confidence - 10),
                    "reasoning": f"Multiplicadores derivados dos dados reais da temporada 25/26: os times mais dominantes da Premier League produzem {_scenario_mult['pressure']['goals']:.2f}x mais gols e {_scenario_mult['pressure']['shots']:.2f}x mais finalizações que a média da liga."
                },
                "probabilities": {
                    "goals": {"home": min(95, int(home_goals_prob * _scenario_mult['pressure']['goals'])), "away": max(5, int(away_goals_prob * _scenario_mult['pressure']['goals'] * 0.80)), "method": "ml"},
                    "cards": {"home": min(90, int(home_cards_prob * _scenario_mult['pressure']['cards'])), "away": min(90, int(away_cards_prob * (_scenario_mult['pressure']['cards'] + 0.15))), "method": "ml"},
                    "penalty": {"home": min(95, int(home_penalty_base * _scenario_mult['pressure']['penalty'])), "away": min(95, int(away_penalty_base * _scenario_mult['pressure']['penalty'])), "method": "ml"},
                    "winner": {"home": min(85, int(home_win_prob * 1.12)), "away": max(5, int(away_win_prob * 0.92)), "draw": max(5, int(draw_prob * 0.95)), "method": "ml"}
                }
            },
            "control": {
                "mainScenario": {
                    "insight": f"Cenário de controle tático: jogo equilibrado com menor exposição, baseado no padrão dos times medianos da EPL ({_scenario_mult['control']['goals']:.2f}x gols, {_scenario_mult['control']['cards']:.2f}x cartões).",
                    "confidence": min(99, main_confidence + 5),
                    "reasoning": f"Multiplicadores derivados dos dados reais: em jogos entre times medianos (posições 6-15) da Premier League, o volume ofensivo cai para {_scenario_mult['control']['goals']:.2f}x da média, com {_scenario_mult['control']['cards']:.2f}x de cartões (jogo mais tenso e disputado)."
                },
                "probabilities": {
                    "goals": {"home": max(10, int(home_goals_prob * _scenario_mult['control']['goals'])), "away": max(8, int(away_goals_prob * _scenario_mult['control']['goals'])), "method": "ml"},
                    "cards": {"home": max(10, int(home_cards_prob * _scenario_mult['control']['cards'])), "away": max(10, int(away_cards_prob * _scenario_mult['control']['cards'])), "method": "ml"},
                    "penalty": {"home": max(5, int(home_penalty_base * _scenario_mult['control']['penalty'])), "away": max(5, int(away_penalty_base * _scenario_mult['control']['penalty'])), "method": "ml"},
                    "winner": {"home": min(90, int(home_win_prob * 1.06)), "away": max(5, int(away_win_prob * 0.96)), "draw": min(60, int(draw_prob * 1.08)), "method": "ml"}
                }
            }
        },
        "metadata": {
            "goals": {
                "reasoning": f"A IA (Regressão não-linear) projetou {home_goals_exp} gols para {homeTeam} e {away_goals_exp} para {awayTeam}.",
                "source": "RandomForestRegressor"
            },
            "cards": {
                "reasoning": f"O modelo ML prevê um jogo com cerca de {home_cards_exp + away_cards_exp} cartões distribuídos para o confronto.",
                "source": "RandomForestRegressor"
            },
            "penalty": {
                "reasoning": f"Classificador treinado com histórico de faltas na área e força relativa estima {home_penalty_base}% para {homeTeam} e {away_penalty_base}% para {awayTeam}.",
                "source": "RandomForestClassifier"
            },
            "winner": {
                "reasoning": f"O classificador ensemble calculou {home_win_prob}% de favoritismo para {homeTeam} contra {away_win_prob}% para {awayTeam}.",
                "source": "RandomForestClassifier"
            }
        },
        "timelineEvents": [], # Removido dados mockados
        "autoComments": [
            {
                "text": f"Machine Learning ressalta: {homeTeam} apresenta um número esperado de cartões de {home_cards_exp}.",
                "type": "insight"
            },
            {
                "text": f"As probabilidades mostram que chances de vitória visitante ({away_win_prob}%) superam o empate ({draw_prob}%) neste duelo?" if away_win_prob > draw_prob else f"Alerta Preditor: Análise sugere alto potencial de empate ({draw_prob}%).",
                "type": "alert"
            },
            {
                "text": f"O modelo previu {home_goals_exp} gols para o {homeTeam}, um cenário de intensidade ajustada pelo algoritmo.",
                "type": "trend"
            }
        ],
        "matchHistory": matchHistory,
        "squads": squads
    }


@app.get("/api/epl/analysis")
def get_epl_match_analysis(homeTeam: str, awayTeam: str, matchId: str | None = None):
    """
    Endpoint especializado para Premier League usando o modelo treinado com histórico desde 2020
    e dados do elenco da temporada 25/26.
    """
    try:
        # 1. Pegar dados ao vivo se o matchId existir
        live_data = None
        if matchId:
            try:
                client = BetsAPIClient()
                view = client.get_event_view(match_id=matchId)
                # Extração simplificada de dados ao vivo (exemplo)
                # O BetsAPI retorna estatísticas em results[0]['stats']
                res = view.get('results', [{}])[0]
                stats = res.get('stats', {})
                if stats:
                    live_data = {
                        'home_possession': int(stats.get('possession_rt', [50])[0]),
                        'home_shots': int(stats.get('shottotal', [0])[0]),
                        'away_possession': 100 - int(stats.get('possession_rt', [50])[0])
                    }
            except Exception:
                pass

        # 2. Executar análise
        analysis = epl_analyzer.get_match_insights(homeTeam, awayTeam, live_data)
        
        return {
            "status": "success",
            "match": f"{homeTeam} vs {awayTeam}",
            "analysis": analysis,
            "source": "Premier League Dedicated ML Model (v2026)"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/player-stats")
def get_player_stats(homeTeam: str, awayTeam: str, matchId: str | None = None):
    """
    Retorna predições de estatísticas individuais para os jogadores das equipes informadas.
    Usa os modelos treinados com dados reais da Premier League.
    """
    import joblib
    import pandas as pd

    ml_dir = os.path.join(current_dir, "ml")

    # 1. Verificar se os modelos existem
    model_files = ["model_player_shots_on.pkl", "model_player_goals.pkl", "model_player_cards.pkl", "player_history_avgs.pkl"]
    for f in model_files:
        if not os.path.exists(os.path.join(ml_dir, f)):
            return {"error": f"Modelo {f} não encontrado. Execute train_player_model.py primeiro.", "players": []}

    # 2. Carregar modelos e histórico
    try:
        model_shots = joblib.load(os.path.join(ml_dir, "model_player_shots_on.pkl"))
        model_goals = joblib.load(os.path.join(ml_dir, "model_player_goals.pkl"))
        model_cards = joblib.load(os.path.join(ml_dir, "model_player_cards.pkl"))
        player_history = joblib.load(os.path.join(ml_dir, "player_history_avgs.pkl"))
        df_teams = pd.read_csv(os.path.join(ml_dir, "epl_team_power.csv"))
        power_dict = dict(zip(df_teams['Squad'], df_teams['squad_power']))
    except Exception as e:
        return {"error": f"Erro ao carregar modelos: {str(e)}", "players": []}

    # 3. Obter lineup real da API (se matchId disponível)
    lineup_players: list[dict] = []
    if matchId:
        try:
            client = BetsAPIClient()
            lineup_res = client.get_event_lineup(matchId)
            l_res = lineup_res.get("results", {})
            for side in ["home", "away"]:
                team_name = homeTeam if side == "home" else awayTeam
                for group in ["startinglineup", "substitutes"]:
                    for entry in l_res.get(side, {}).get(group, []):
                        p = entry.get("player", {})
                        if p.get("name"):
                            lineup_players.append({"name": p["name"], "team": team_name, "side": side})
        except Exception as e:
            print(f"Erro ao buscar lineup: {e}")

    # 4. Fallback: usar jogadores do histórico que sejam desses times
    if not lineup_players:
        df_players = None
        players_csv = os.path.join(ml_dir, "players_dataset.csv")
        if os.path.exists(players_csv):
            df_players = pd.read_csv(players_csv)
            df_home = df_players[df_players['team'].str.lower() == homeTeam.lower()]
            df_away = df_players[df_players['team'].str.lower() == awayTeam.lower()]
            for _, row in df_home.drop_duplicates('player_name').iterrows():
                lineup_players.append({"name": row['player_name'], "team": homeTeam, "side": "home"})
            for _, row in df_away.drop_duplicates('player_name').iterrows():
                lineup_players.append({"name": row['player_name'], "team": awayTeam, "side": "away"})

    if not lineup_players:
        return {"error": "Nenhum jogador encontrado. Use um matchId válido ou garanta que os times estejam no dataset.", "players": []}

    # 5. Gerar predições para cada jogador
    results = []
    for p in lineup_players:
        p_name = p["name"]
        p_side = p["side"]
        p_team = p["team"]
        opponent = awayTeam if p_side == "home" else homeTeam
        opp_power = float(power_dict.get(opponent, 0.15)) * 100

        # Buscar histórico do jogador
        hist = player_history[player_history['player_name'] == p_name]
        if hist.empty:
            avg_shots_on, avg_shots_off, avg_goals = 0.0, 0.0, 0.0
            games = 0
        else:
            row = hist.iloc[0]
            avg_shots_on = float(row['avg_shots_on'])
            avg_shots_off = float(row['avg_shots_off'])
            avg_goals = float(row['avg_goals'])
            games = int(hist.shape[0])

        X = pd.DataFrame([[avg_shots_on, avg_shots_off, opp_power]],
                         columns=['avg_shots_on', 'avg_shots_off', 'opponent_power'])

        try:
            pred_shots = float(model_shots.predict(X)[0])
            pred_goals = float(model_goals.predict(X)[0])
            pred_cards = float(model_cards.predict(X)[0])
        except Exception:
            pred_shots, pred_goals, pred_cards = 0.0, 0.0, 0.0

        results.append({
            "player_name": p_name,
            "team": p_team,
            "side": p_side,
            "prediction": {
                "shots_on": round(max(0, pred_shots), 3),
                "goals": round(max(0, pred_goals), 3),
                "cards": round(max(0, pred_cards), 3),
            },
            "history": {
                "avg_shots_on": round(avg_shots_on, 3),
                "avg_shots_off": round(avg_shots_off, 3),
                "avg_goals": round(avg_goals, 3),
                "games_in_dataset": games,
            }
        })

    # Ordenar: jogadores com mais chutes preditos primeiro
    results.sort(key=lambda x: x["prediction"]["shots_on"], reverse=True)

    return {"players": results, "total": len(results)}


if __name__ == "__main__":
    import uvicorn
    # Usa a porta 8001 como solicitado pelo usuário (definido no env VITE_API_URL)
    uvicorn.run(app, host="0.0.0.0", port=8001)
