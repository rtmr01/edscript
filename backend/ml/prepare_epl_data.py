import os
import sys
import pandas as pd
import time
from datetime import datetime
from dotenv import load_dotenv

# Adiciona o diretório backend ao path para conseguir importar do api_clients
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api_clients.betsapi import BetsAPIClient

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

EPL_LEAGUE_ID = 94
SPORT_ID = 1

def fetch_epl_history(pages=60):
    client = BetsAPIClient()
    print(f"Iniciando extração do histórico da Premier League (League ID: {EPL_LEAGUE_ID})...")
    
    all_matches = []
    
    for page in range(pages):
        print(f"Buscando página {page+1} de {pages}...")
        try:
            # v1/events/ended?sport_id=1&league_id=94&skip=page
            # O BetsAPI as vezes usa 'page' ou 'skip'. No nosso cliente implementamos como 'skip'.
            res = client.get_ended_events(sport_id=SPORT_ID, league_id=EPL_LEAGUE_ID, skip=page)
            events = res.get('results', [])
            
            if not events:
                print("Fim dos resultados encontrados.")
                break
                
            for ev in events:
                match_id = ev.get('id')
                home = ev.get('home', {})
                away = ev.get('away', {})
                score = ev.get('ss')
                time_str = ev.get('time')
                
                if score and '-' in score:
                    s = score.split('-')
                    try:
                        h_goals = int(s[0])
                        a_goals = int(s[1])
                        
                        all_matches.append({
                            'id': match_id,
                            'time': datetime.fromtimestamp(int(time_str)) if time_str else None,
                            'home_team': home.get('name'),
                            'home_id': home.get('id'),
                            'away_team': away.get('name'),
                            'away_id': away.get('id'),
                            'home_goals': h_goals,
                            'away_goals': a_goals,
                            'result': 'H' if h_goals > a_goals else ('A' if a_goals > h_goals else 'D')
                        })
                    except (ValueError, IndexError):
                        continue
            
            # Respeitar limite de rate
            time.sleep(1)
            
        except Exception as e:
            print(f"Erro na página {page+1}: {e}")
            break
            
    if all_matches:
        df = pd.DataFrame(all_matches)
        output_path = os.path.join(os.path.dirname(__file__), 'epl_historic_matches.csv')
        df.sort_values('time', ascending=False, inplace=True)
        df.to_csv(output_path, index=False)
        print(f"Sucesso! {len(df)} partidas da EPL salvas em {output_path}")
        return df
    else:
        print("Nenhuma partida encontrada.")
        return None

def merge_player_stats():
    # Carrega dados dos jogadores
    players_csv = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw', 'players_data-2025_2026.csv')
    if not os.path.exists(players_csv):
        print("Arquivo de jogadores não encontrado.")
        return
        
    df_players = pd.read_csv(players_csv)
    # Filtra apenas Premier League
    epl_players = df_players[df_players['Comp'].str.contains('Premier League', na=False, case=False)]
    
    # Agrega por time para ter uma "força do elenco"
    # Vamos usar Gls (Gols), Ast (Assistências) e Save% (Goleiros) como métricas
    team_stats = epl_players.groupby('Squad').agg({
        'Gls': 'sum',
        'Ast': 'sum',
        'MP': 'sum', # Matches Played
        'Age': 'mean'
    }).reset_index()
    
    # Normaliza um "Power Score" (exemplo simples)
    team_stats['squad_power'] = (team_stats['Gls'] + team_stats['Ast']) / team_stats['MP']
    
    output_path = os.path.join(os.path.dirname(__file__), 'epl_team_power.csv')
    team_stats.to_csv(output_path, index=False)
    print(f"Estatísticas de elenco salvas em {output_path}")

if __name__ == "__main__":
    fetch_epl_history()
    merge_player_stats()
