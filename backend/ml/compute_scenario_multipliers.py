"""
Calcula multiplicadores reais para os cenários de Pressão e Controle de Jogo
a partir dos dados reais da temporada EPL 25/26.

Lógica:
- Pressão   → proxy dos top N times (mais dominantes), maior volume ofensivo
- Controle  → proxy dos times medianos (jogo equilibrado), menor exposição

Salva: ml/scenario_multipliers.json
"""
import os
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_CSV = os.path.join(BASE_DIR, '..', 'data', 'raw', 'players_data-2025_2026.csv')
TEAM_POWER_CSV = os.path.join(BASE_DIR, 'epl_team_power.csv')
OUT_PATH = os.path.join(BASE_DIR, 'scenario_multipliers.json')

N_TOP = 5       # Times mais dominantes (pressão)
N_MID_LOW = 6   # Início do grupo mediano
N_MID_HIGH = 15 # Fim do grupo mediano (controle)


def main():
    # --- 1. Carregar e filtrar EPL ---
    df = pd.read_csv(RAW_CSV)
    epl = df[df['Comp'].str.contains('Premier', case=False, na=False)].copy()
    print(f"Jogadores EPL carregados: {len(epl)}")

    for col in ['Gls', 'Sh', 'SoT', 'CrdY', '90s']:
        epl[col] = pd.to_numeric(epl[col], errors='coerce').fillna(0.0)

    # --- 2. Agregar estatísticas por time ---
    team_stats = epl.groupby('Squad')[['Gls', 'Sh', 'SoT', 'CrdY', '90s']].sum().reset_index()
    team_stats['nineties'] = team_stats['90s'].clip(lower=1.0)
    team_stats['goals_p90']  = team_stats['Gls'] / team_stats['nineties']
    team_stats['shots_p90']  = team_stats['Sh']  / team_stats['nineties']
    team_stats['sot_p90']    = team_stats['SoT'] / team_stats['nineties']
    team_stats['cards_p90']  = team_stats['CrdY'] / team_stats['nineties']

    # --- 3. Carregar squad_power e ordenar times por força real ---
    df_power = pd.read_csv(TEAM_POWER_CSV)
    # Merge fuzzy: tentar casar pelo nome
    def find_power(squad_name):
        p = df_power[df_power['Squad'].str.lower() == squad_name.lower()]
        if not p.empty:
            return float(p.iloc[0]['squad_power'])
        for _, row in df_power.iterrows():
            a, b = squad_name.lower(), row['Squad'].lower()
            if a in b or b in a:
                return float(row['squad_power'])
        return 0.15

    team_stats['squad_power'] = team_stats['Squad'].apply(find_power)
    team_stats = team_stats.sort_values('squad_power', ascending=False).reset_index(drop=True)
    team_stats['rank'] = team_stats.index + 1  # 1 = mais forte

    print("\nRanking de times por squad_power:")
    print(team_stats[['rank', 'Squad', 'squad_power', 'goals_p90', 'sot_p90', 'cards_p90']].to_string(index=False))

    # --- 4. Grupos ---
    top_teams = team_stats[team_stats['rank'] <= N_TOP]
    mid_teams = team_stats[(team_stats['rank'] >= N_MID_LOW) & (team_stats['rank'] <= N_MID_HIGH)]
    all_teams = team_stats

    league_avg = {
        'goals_p90': all_teams['goals_p90'].mean(),
        'sot_p90':   all_teams['sot_p90'].mean(),
        'cards_p90': all_teams['cards_p90'].mean(),
    }
    pressure_avg = {
        'goals_p90': top_teams['goals_p90'].mean(),
        'sot_p90':   top_teams['sot_p90'].mean(),
        'cards_p90': top_teams['cards_p90'].mean(),
    }
    control_avg = {
        'goals_p90': mid_teams['goals_p90'].mean(),
        'sot_p90':   mid_teams['sot_p90'].mean(),
        'cards_p90': mid_teams['cards_p90'].mean(),
    }

    print(f"\nMédia geral (liga):  {league_avg}")
    print(f"Média pressão (top{N_TOP}): {pressure_avg}")
    print(f"Média controle (pos {N_MID_LOW}-{N_MID_HIGH}): {control_avg}")

    # --- 5. Calcular multipliers ---
    def ratio(num, den):
        return round(num / den, 4) if den > 0 else 1.0

    # Penalty: times dominantes criam mais situações de grande área
    # Usamos SOT como proxy (mais finalizações certas = mais chances de pênalti)
    pressure_penalty_mult = ratio(pressure_avg['sot_p90'], league_avg['sot_p90'])
    control_penalty_mult  = ratio(control_avg['sot_p90'],  league_avg['sot_p90'])

    multipliers = {
        "pressure": {
            "goals":   ratio(pressure_avg['goals_p90'], league_avg['goals_p90']),
            "shots":   ratio(pressure_avg['sot_p90'],   league_avg['sot_p90']),
            "cards":   ratio(pressure_avg['cards_p90'], league_avg['cards_p90']),
            "penalty": round(min(1.4, pressure_penalty_mult * 1.05), 4),  # leve boost extra
        },
        "control": {
            "goals":   ratio(control_avg['goals_p90'], league_avg['goals_p90']),
            "shots":   ratio(control_avg['sot_p90'],   league_avg['sot_p90']),
            "cards":   ratio(control_avg['cards_p90'], league_avg['cards_p90']),
            "penalty": round(max(0.6, control_penalty_mult * 0.95), 4),  # leve redução
        },
        "metadata": {
            "source": "players_data-2025_2026.csv (EPL)",
            "n_teams_total": int(len(all_teams)),
            "pressure_teams": top_teams['Squad'].tolist(),
            "control_teams":  mid_teams['Squad'].tolist(),
            "league_avg_goals_p90": round(league_avg['goals_p90'], 4),
        }
    }

    print(f"\n✅ Multiplicadores calculados:")
    print(f"  Pressão:  {multipliers['pressure']}")
    print(f"  Controle: {multipliers['control']}")

    with open(OUT_PATH, 'w') as f:
        json.dump(multipliers, f, indent=2, ensure_ascii=False)
    print(f"\nSalvo em: {OUT_PATH}")


if __name__ == "__main__":
    main()
