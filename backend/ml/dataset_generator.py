import pandas as pd
import numpy as np
import random
import hashlib
import os


def _sigmoid(x):
    return 1 / (1 + np.exp(-x))

def get_team_power(team_name):
    val = int(hashlib.md5(team_name.encode()).hexdigest(), 16)
    return 40 + (val % 50) 

def generate_dataset(num_samples=5000):
    teams = [f"Team_{i}" for i in range(1, 100)] + ["Manchester City", "Liverpool", "Real Madrid", "Barcelona", "Pennarossa", "SS Murata"]
    
    data = []
    for _ in range(num_samples):
        home = random.choice(teams)
        away = random.choice([t for t in teams if t != home])
        
        home_power = get_team_power(home)
        away_power = get_team_power(away)
        
        power_diff = home_power - away_power + 5 # Home advantage
        
        # Média contínua de gols (Mandante tem leve vantagem natural)
        base_hg = 1.35 + (power_diff * 0.035) + ((home_power - 50) * 0.015)
        base_ag = 1.10 - (power_diff * 0.035) + ((away_power - 50) * 0.015)
        
        home_goals = np.random.poisson(max(0.1, base_hg))
        away_goals = np.random.poisson(max(0.1, base_ag))
            
        # Cartões: Mais altos em partidas disputadas (tightness)
        tightness = 1.0 / (abs(power_diff) + 2.0)
        base_hc = 1.6 + (tightness * 3.0) - ((home_power - 50) * 0.01)
        base_ac = 1.9 + (tightness * 3.0) - ((away_power - 50) * 0.01)
        
        home_cards = np.random.poisson(max(0.5, base_hc))
        away_cards = np.random.poisson(max(0.5, base_ac))

        # Variáveis históricas/sintéticas de faltas sofridas na grande área.
        home_box_touches = max(1, int(np.random.normal(8 + max(power_diff, 0) * 0.12, 2)))
        away_box_touches = max(1, int(np.random.normal(8 + max(-power_diff, 0) * 0.12, 2)))

        home_box_fouls_won = np.random.binomial(home_box_touches, min(0.55, max(0.10, 0.17 + power_diff * 0.003)))
        away_box_fouls_won = np.random.binomial(away_box_touches, min(0.55, max(0.10, 0.17 - power_diff * 0.003)))

        home_penalty_prob = float(_sigmoid(-2.2 + 0.30 * home_box_fouls_won + 0.02 * home_power - 0.01 * away_power))
        away_penalty_prob = float(_sigmoid(-2.2 + 0.30 * away_box_fouls_won + 0.02 * away_power - 0.01 * home_power))

        home_penalty_awarded = np.random.binomial(1, min(0.95, max(0.02, home_penalty_prob)))
        away_penalty_awarded = np.random.binomial(1, min(0.95, max(0.02, away_penalty_prob)))
        
        result = "H" if home_goals > away_goals else ("A" if away_goals > home_goals else "D")
        
        data.append({
            "home_team": home,
            "away_team": away,
            "home_power": home_power,
            "away_power": away_power,
            "home_goals": home_goals,
            "away_goals": away_goals,
            "home_cards": home_cards,
            "away_cards": away_cards,
            "home_box_fouls_won": home_box_fouls_won,
            "away_box_fouls_won": away_box_fouls_won,
            "home_penalty_awarded": home_penalty_awarded,
            "away_penalty_awarded": away_penalty_awarded,
            "result": result
        })
        
    df = pd.DataFrame(data)
    csv_path = os.path.join(os.path.dirname(__file__), "matches_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Dataset generated at {csv_path}")

if __name__ == "__main__":
    generate_dataset(5000)
