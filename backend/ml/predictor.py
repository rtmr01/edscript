import joblib
import pandas as pd
import hashlib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

_models = {}

def get_model(name):
    if name not in _models:
        model_path = os.path.join(BASE_DIR, f"model_{name}.pkl")
        if os.path.exists(model_path):
            _models[name] = joblib.load(model_path)
        else:
            return None
    return _models[name]

def get_team_power(team_name):
    val = int(hashlib.md5(team_name.encode()).hexdigest(), 16)
    return 40 + (val % 50)


def get_team_box_fouls_profile(team_name):
    # Perfil histórico sintético de faltas sofridas na área por jogo.
    val = int(hashlib.md5(f"box-{team_name}".encode()).hexdigest(), 16)
    return 1 + (val % 6)

def predict_match(home_team, away_team):
    home_power = get_team_power(home_team)
    away_power = get_team_power(away_team)
    
    X = pd.DataFrame([{"home_power": home_power, "away_power": away_power}])
    
    clf_winner = get_model("winner")
    reg_hg = get_model("home_goals")
    reg_ag = get_model("away_goals")
    reg_hc = get_model("home_cards")
    reg_ac = get_model("away_cards")
    clf_hp = get_model("home_penalty")
    clf_ap = get_model("away_penalty")
    
    if not all([clf_winner, reg_hg, reg_ag, reg_hc, reg_ac, clf_hp, clf_ap]):
        raise Exception("Models not found. They need to be trained first.")
    
    classes = clf_winner.classes_
    probs = clf_winner.predict_proba(X)[0]
    
    win_probs = {c: p * 100 for c, p in zip(classes, probs)}
    
    home_goals_pred = reg_hg.predict(X)[0]
    away_goals_pred = reg_ag.predict(X)[0]
    
    home_cards_pred = reg_hc.predict(X)[0]
    away_cards_pred = reg_ac.predict(X)[0]

    home_box_fouls = get_team_box_fouls_profile(home_team)
    away_box_fouls = get_team_box_fouls_profile(away_team)

    X_penalty = pd.DataFrame([{
        "home_power": home_power,
        "away_power": away_power,
        "home_box_fouls_won": home_box_fouls,
        "away_box_fouls_won": away_box_fouls,
    }])

    home_penalty_prob = clf_hp.predict_proba(X_penalty)[0][1]
    away_penalty_prob = clf_ap.predict_proba(X_penalty)[0][1]
    
    # Soften probabilities: Capping between 5% and 90% and re-normalizing
    win_probs_list = [win_probs.get('H', 33.3), win_probs.get('D', 33.3), win_probs.get('A', 33.3)]
    soft_probs = [min(90, max(5, p)) for p in win_probs_list]
    total = sum(soft_probs)
    soft_probs = [int((p / total) * 100) for p in soft_probs]
    
    # Ajuste fino para garantir que a soma seja exatamente 100
    diff = 100 - sum(soft_probs)
    soft_probs[0] += diff
    
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
