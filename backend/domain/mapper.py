from backend.domain.models import Player

class PlayerMapper:
    """
    Serviço encarregado de mapear e cruzar referências de jogadores oriundos de diferentes
    bases (FBref, StatsBomb, BetsAPI) de modo a garantir que sejam identificados como
    o mesmo jogador internamente.
    """

    def __init__(self):
        # Dicionário de busca/cache em memória por nome e time para tentar parear jogadores
        self._players_db = {} 

    def standardize_name(self, name: str) -> str:
        """
        Função utilitária para normalizar nomes removendo acentos e deixando em lowercase.
        """
        # TODO: Implementar normalização robusta (e.g., unicode, unidecode)
        return name.lower().strip()

    def resolve_player(self, source: str, source_id: str, name: str, team: str = None) -> Player:
        """
        Tenta encontrar um jogador previamente mapeado, e caso não encontre, 
        cadastra como novo jogador gerando um ID interno.
        """
        norm_name = self.standardize_name(name)
        
        # Algoritmo muito simples, idealmente buscaríamos no banco pelo `source_id` e em 
        # seguida usaríamos algoritmos de similaridade de strings (fuzzy matching) no nome.
        if norm_name in self._players_db:
            player = self._players_db[norm_name]
            player.external_ids[source] = source_id
            return player
            
        # Cadastra novo jogador
        new_id = f"int_{len(self._players_db) + 1}"
        new_player = Player(
            id=new_id,
            name=name,
            team=team,
            external_ids={source: source_id}
        )
        self._players_db[norm_name] = new_player
        return new_player
