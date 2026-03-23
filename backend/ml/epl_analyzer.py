import os
import joblib
import pandas as pd
import numpy as np

class EPLAnalyzer:
    def __init__(self):
        base_path = os.path.dirname(__file__)
        self.model = joblib.load(os.path.join(base_path, 'epl_winner_model.pkl'))
        self.le = joblib.load(os.path.join(base_path, 'epl_label_encoder.pkl'))
        self.team_power = pd.read_csv(os.path.join(base_path, 'epl_team_power.csv'))
        self.power_dict = dict(zip(self.team_power['Squad'], self.team_power['squad_power']))

    def get_p(self, team):
        p = self.power_dict.get(team)
        if p: return p
        for k, v in self.power_dict.items():
            if team in k or k in team: return v
        return 0.1

    def _soften_probabilities(self, probs):
        # Garante que nenhuma probabilidade seja exatamente 0 ou 100
        # Capping entre 2% e 94%
        probs = np.clip(probs, 0.02, 0.94)
        # Re-normaliza para somar 1.0
        return probs / probs.sum()

    def predict_winner(self, home_team, away_team):
        hp = self.get_p(home_team)
        ap = self.get_p(away_team)
        diff = hp - ap
        
        X = pd.DataFrame([[hp, ap, diff]], columns=['home_power', 'away_power', 'power_diff'])
        probs = self.model.predict_proba(X)[0]
        probs = self._soften_probabilities(probs)
        
        # Mapear classes do label encoder
        # self.le.classes_ costuma ser ['A', 'D', 'H']
        res = {}
        for i, label in enumerate(self.le.classes_):
            res[label] = round(probs[i] * 100, 1)
        return res

    def get_match_insights(self, home_team, away_team, live_data=None):
        probs = self.predict_winner(home_team, away_team)
        hp = self.get_p(home_team)
        ap = self.get_p(away_team)
        
        insights = []
        
        # Insight de Força do Elenco (Season 25/26)
        if hp > ap * 1.2:
            insights.append(f"Superioridade técnica: {home_team} possui um elenco com 20% mais potencial ofensivo nesta temporada.")
        elif ap > hp * 1.2:
            insights.append(f"Desafio tático: {away_team} entra com vantagem individual baseada nos dados da temporada 25/26.")
            
        # Insight de Probabilidade
        favorite = max(probs, key=probs.get)
        if probs[favorite] > 50:
            fav_name = home_team if favorite == 'H' else (away_team if favorite == 'A' else "Empate")
            insights.append(f"O modelo de IA focado na Premier League aponta {fav_name} como favorito claro ({probs[favorite]}%).")

        # Live Analysis (se houver dados ao vivo)
        if live_data:
            # Exemplo de live_data: {'home_possession': 60, 'away_possession': 40, 'home_shots': 5, ...}
            pos = live_data.get('home_possession', 50)
            if pos > 60 and favorite != 'H':
                insights.append(f"Anomalia detectada: {home_team} domina a posse ({pos}%), mas o modelo histórico previa dificuldades. Pressão crescente.")
            
        return {
            "probabilities": probs,
            "insights": insights
        }

if __name__ == "__main__":
    # Teste simples
    analyzer = EPLAnalyzer()
    print(analyzer.get_match_insights("Arsenal", "Chelsea"))
