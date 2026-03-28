import joblib
import pandas as pd
import hashlib
import os
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

_models = {}

SPORT_ALIASES = {
    "futebol": "football",
    "football": "football",
    "soccer": "football",
    "nba": "basketball",
    "basquete": "basketball",
    "basketball": "basketball",
    "esports": "esports",
    "e-sports": "esports",
    "tenis": "tennis",
    "tênis": "tennis",
    "tennis": "tennis",
}


def _normalize_sport_key(sport_key: str | None) -> str:
    if not sport_key:
        return "football"
    return SPORT_ALIASES.get(sport_key.strip().lower(), "football")


def get_model(name: str, sport_key: str | None = None):
    normalized_sport = _normalize_sport_key(sport_key)
    cache_key = f"{normalized_sport}:{name}"
    if cache_key in _models:
        return _models[cache_key]

    candidate_paths = [
        os.path.join(BASE_DIR, f"model_{normalized_sport}_{name}.pkl"),
        os.path.join(BASE_DIR, f"model_{name}.pkl"),
    ]

    for model_path in candidate_paths:
        if os.path.exists(model_path):
            _models[cache_key] = joblib.load(model_path)
            return _models[cache_key]

    return None

# Carrega o dicionário de força real (Premier League 25/26) para evitar mocks se possível
epl_power_path = os.path.join(BASE_DIR, 'epl_team_power.csv')
team_power_db = {}
if os.path.exists(epl_power_path):
    try:
        df_pw = pd.read_csv(epl_power_path)
        # Mapeamos o squad_power (0.08 - 0.23) para a escala do modelo (40 - 90)
        # 0.08 -> 40, 0.23 -> 90
        for _, row in df_pw.iterrows():
            scaled_pw = 40 + (float(row['squad_power']) - 0.08) / (0.23 - 0.08) * 50
            team_power_db[row['Squad'].lower()] = min(95, max(30, int(scaled_pw)))
    except Exception as e:
        print(f"Erro ao carregar epl_team_power.csv: {e}")

sport_power_db = {}
for _sport_name in ("basketball", "esports", "tennis"):
    _path = os.path.join(BASE_DIR, f"team_power_{_sport_name}.csv")
    if not os.path.exists(_path):
        continue
    try:
        _df = pd.read_csv(_path)
        _map = {}
        for _, row in _df.iterrows():
            team = str(row.get("team", "")).strip().lower()
            power = float(row.get("power", 0))
            if team:
                _map[team] = int(max(20, min(95, round(power))))
        sport_power_db[_sport_name] = _map
    except Exception as e:
        print(f"Erro ao carregar team_power_{_sport_name}.csv: {e}")

def get_team_power(team_name, sport_key: str | None = None):
    normalized_sport = _normalize_sport_key(sport_key)

    if normalized_sport == "football":
        power_map = team_power_db
    else:
        power_map = sport_power_db.get(normalized_sport, {})

    # Tenta buscar no banco de dados real primeiro
    name_low = team_name.lower()
    if name_low in power_map:
        return power_map[name_low]
    
    # Fallback fuzzy para nomes parciais
    for k, v in power_map.items():
        if name_low in k or k in name_low:
            return v

    # Se realmente não existir, usa uma semente baseada no nome para consistência, 
    # mas o ideal seria alimentar o CSV com mais ligas.
    seed = f"{normalized_sport}:{team_name}".encode()
    val = int(hashlib.md5(seed).hexdigest(), 16)
    return 48 + (val % 36)


def get_team_box_fouls_profile(team_name, sport_key: str | None = None):
    # Baseado na força do time ao invés de puro hash aleatório
    power = get_team_power(team_name, sport_key)
    # Times mais fortes costumam sofrer mais faltas na área por pressão (heurística tática real)
    base_fouls = 1 + (power - 40) // 10
    return max(1, min(6, base_fouls))


def _safe_positive_class_probability(classifier, X) -> float:
    probs = classifier.predict_proba(X)[0]
    classes = list(classifier.classes_)
    if len(classes) == 1:
        return 1.0 if classes[0] == 1 else 0.0
    if 1 in classes:
        return float(probs[classes.index(1)])
    return float(max(probs))

def predict_match(home_team, away_team, sport_key: str | None = None):
    normalized_sport = _normalize_sport_key(sport_key)
    home_power = get_team_power(home_team, normalized_sport)
    away_power = get_team_power(away_team, normalized_sport)
    
    X = pd.DataFrame([{"home_power": home_power, "away_power": away_power}])
    
    clf_winner = get_model("winner", normalized_sport)
    reg_hg = get_model("home_goals", normalized_sport)
    reg_ag = get_model("away_goals", normalized_sport)
    reg_hc = get_model("home_cards", normalized_sport)
    reg_ac = get_model("away_cards", normalized_sport)
    clf_hp = get_model("home_penalty", normalized_sport)
    clf_ap = get_model("away_penalty", normalized_sport)
    
    if not all([clf_winner, reg_hg, reg_ag, reg_hc, reg_ac, clf_hp, clf_ap]):
        raise Exception("Models not found. They need to be trained first.")
    
    classes = clf_winner.classes_
    probs = clf_winner.predict_proba(X)[0]
    
    win_probs = {c: p * 100 for c, p in zip(classes, probs)}
    
    home_goals_pred = reg_hg.predict(X)[0]
    away_goals_pred = reg_ag.predict(X)[0]
    
    home_cards_pred = reg_hc.predict(X)[0]
    away_cards_pred = reg_ac.predict(X)[0]

    home_box_fouls = get_team_box_fouls_profile(home_team, normalized_sport)
    away_box_fouls = get_team_box_fouls_profile(away_team, normalized_sport)

    X_penalty = pd.DataFrame([{
        "home_power": home_power,
        "away_power": away_power,
        "home_box_fouls_won": home_box_fouls,
        "away_box_fouls_won": away_box_fouls,
    }])

    home_penalty_prob = _safe_positive_class_probability(clf_hp, X_penalty)
    away_penalty_prob = _safe_positive_class_probability(clf_ap, X_penalty)
    
    home_raw = float(win_probs.get('H', 0.0))
    draw_raw = float(win_probs.get('D', 0.0))
    away_raw = float(win_probs.get('A', 0.0))

    # Alguns esportes não têm empate na prática: não injeta 33/33/33 artificialmente.
    if normalized_sport != "football":
        draw_raw = 0.0

    model_total = home_raw + draw_raw + away_raw
    class_count = len(classes)

    # Fallback/Blend por força relativa para evitar percentuais idênticos quando o modelo colapsa.
    power_gap = float(home_power - away_power)
    away_rating = 1.0 / (1.0 + math.exp(power_gap / 12.0))
    home_rating = 1.0 - away_rating
    if normalized_sport == "football":
        draw_rating = max(0.08, min(0.28, 0.24 - (abs(power_gap) / 300.0)))
    else:
        draw_rating = max(0.02, min(0.08, 0.07 - (abs(power_gap) / 500.0)))
    rating_scale = max(0.0, 1.0 - draw_rating)
    home_rating *= rating_scale
    away_rating *= rating_scale

    model_collapsed = class_count < 2 or model_total <= 0.0
    if not model_collapsed and model_total > 0:
        home_model = home_raw / model_total
        draw_model = draw_raw / model_total
        away_model = away_raw / model_total
    else:
        home_model = draw_model = away_model = 0.0

    if model_collapsed:
        home_final = home_rating
        draw_final = draw_rating
        away_final = away_rating
    else:
        # Aumentamos o peso do modelo (que agora é treinado com um dataset melhorado)
        blend_model = 0.85 if normalized_sport == "football" else 0.65
        blend_rating = 1.0 - blend_model
        home_final = (home_model * blend_model) + (home_rating * blend_rating)
        draw_final = (draw_model * blend_model) + (draw_rating * blend_rating)
        away_final = (away_model * blend_model) + (away_rating * blend_rating)

    win_probs_list = [home_final * 100.0, draw_final * 100.0, away_final * 100.0]
    if normalized_sport == "football":
        soft_probs = [min(90, max(5, p)) for p in win_probs_list]
    else:
        soft_probs = [min(96, max(2, p)) for p in win_probs_list]

    total = sum(soft_probs) if sum(soft_probs) > 0 else 1.0
    soft_probs = [int(round((p / total) * 100)) for p in soft_probs]
    
    # Ajuste fino para garantir que a soma seja exatamente 100
    diff = 100 - sum(soft_probs)
    soft_probs[max(range(3), key=lambda i: soft_probs[i])] += diff
    
    return {
        "winner": {
            "home": soft_probs[0],
            "draw": soft_probs[1],
            "away": soft_probs[2]
        },
        "goals": {
            "home_expected": max(0.0, round(home_goals_pred, 1)),
            "away_expected": max(0.0, round(away_goals_pred, 1))
        },
        "cards": {
            "home_expected": max(0.0, round(home_cards_pred, 1)),
            "away_expected": max(0.0, round(away_cards_pred, 1))
        },
        "penalty": {
            "home": min(95, max(5, int(home_penalty_prob * 100))),
            "away": min(95, max(5, int(away_penalty_prob * 100)))
        }
    }
