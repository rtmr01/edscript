import csv
# import pandas as pd # Para ser utilizado futuramente caso o CSV seja complexo

class FBrefProcessor:
    """
    Processador de datasets estatísticos de jogadores do FBref (formato CSV).
    """

    def __init__(self, csv_filepath: str):
        self.filepath = csv_filepath

    def process(self):
        """
        Lê as linhas do arquivo CSV do FBref e converte para dados estruturados internos.
        """
        processed_stats = []
        
        with open(self.filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # TODO: Implementar mapeamento das colunas do CSV para os atributos dos jogadores
                # Exemplo de chaves: row['Player'], row['Squad'], row['Age']
                processed_stats.append(row)
                
        return processed_stats
