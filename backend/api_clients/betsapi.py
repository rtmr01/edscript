import os
import requests

class BetsAPIClient:
    """
    Client wrapper para a API de Eventos da BetsAPI.
    Link da doc: https://betsapi.com/docs/events/
    """
    
    BASE_URL = "https://api.betsapi.com/v1"

    def __init__(self, token: str = None):
        # Tenta pegar o token das variáveis de ambiente se não for passado diretamente.
        self.token = token or os.getenv("BETSAPI_TOKEN")

    def _get(self, endpoint: str, params: dict = None) -> dict:
        if not self.token:
            raise ValueError("Token da BetsAPI não foi fornecido. Configure a variável de ambiente BETSAPI_TOKEN.")
        
        if params is None:
            params = {}
            
        params['token'] = self.token
        url = f"{self.BASE_URL}/{endpoint}"
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()

    def get_inplay_events(self, sport_id: int = 1, league_id: int = None) -> dict:
        """
        Retorna eventos que estão acontecendo no momento (ao vivo).
        """
        params = {"sport_id": sport_id}
        if league_id:
            params["league_id"] = league_id
        return self._get("events/inplay", params=params)

    def get_upcoming_events(self, sport_id: int = 1, day: str = None, league_id: int = None) -> dict:
        """
        Retorna eventos futuros. Permite filtrar por liga (ex: Brasileirão).
        """
        params = {"sport_id": sport_id}
        
        if day:
            params["day"] = day
            
        if league_id:
            params["league_id"] = league_id
            
        return self._get("events/upcoming", params=params)

    def get_event_view(self, event_id: str) -> dict:
        """
        Retorna detalhes específicos e estatísticas sobre um evento pelo seu ID.
        """
        return self._get("event/view", params={"event_id": event_id})

    def get_ended_events(self, sport_id: int = 1, skip: int = 0, day: str = None, league_id: int = None) -> dict:
        """
        Retorna eventos encerrados recentemente. Útil para minerar dados históricos de treino.
        """
        params = {"sport_id": sport_id, "skip": skip}
        if day:
            params["day"] = day
        if league_id:
            params["league_id"] = league_id
        return self._get("events/ended", params=params)

    def get_event_lineup(self, event_id: str) -> dict:
        """
        Retorna a escalação detalhada e possivelmente estatísticas individuais (se disponíveis).
        """
        return self._get("event/lineup", params={"event_id": event_id})

