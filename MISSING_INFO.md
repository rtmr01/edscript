# Pendências e Informações Faltantes para Continuação

Para conseguir avançar nas próximas etapas do backend e criar processadores efetivos de dados, as seguintes informações/acessos serão necessários:

## 1. Amostras de Arquivos Estáticos (Datasets)
- **FBref (CSV):** Preciso de 1 ou 2 arquivos `.csv` de exemplo do FBref que detalham as estatísticas de jogadores, para que eu saiba com quais colunas (features) e formatos de nomes e times precisamos lidar (e.g. `Possession`, `Shooting`, etc).
- **StatsBomb (JSON):** Preciso ter acesso a uma amostra ou ao padrão de `schema` JSON granular dos eventos do Statsbomb. (Ex: O arquivo de algum evento/partida específico).
- *Nota:* Sem a estrutura exata desses dados, apenas "mockei" o processamento nos arquivos `fbref_processor.py` e `statsbomb_processor.py`.

## 2. Token da BetsAPI e Schema da Resposta
- **Token:** Como você mencionou, ele será liberado futuramente. A infraestrutura (no arquivo `api_clients/betsapi.py`) já está pronta para lê-lo a partir de um arquivo `.env` (Variável `BETSAPI_TOKEN`). 
- **Dados Reais da API:** Precisarei do formato real JSON retornado pelo endpoint `/events/inplay` e `/event/view` da BetsAPI. Posso consultar a documentação oficial, mas frequentemente os dados variam. É preferível validar o retorno exato assim que possuirmos o token.

## 3. Banco de Dados e Tipo de Armazenamento
- Onde esses dados tratados vão viver? Vamos usar PostgreSQL (relacional via SQLAlchemy/Django) ou MongoDB (NoSQL) para os dados granulares de eventos do Statsbomb?
- Com base na sua resposta, iremos modelar a persistência do `domain/models.py`.

## 4. Requisitos do Frontend
- Foi criada uma pasta separada para o `frontend`. Qual tecnologia de Frontend iremos utilizar nesse projeto? (React.js, Next.js, Vue.js, ou JS Vanilla HTML?).

## 5. Regras de Negócio do Mapeamento (Fuzzy Matching)
- **Padronização:** Um ponto complexo é ligar "Neymar Jr" (StatsBomb) a "Neymar" (FBref) a "N. Silva Santos Junior" (BetsAPI), por exemplo. Precisaremos alinhar como vai se desenrolar este algoritmo (e.g. usar bibliotecas como *FuzzyWuzzy/TheFuzz*, comparar time, número de camisa, idade etc.). 

Assim que providenciado, me envie os exemplos e direcionamentos para podermos codificar a lógica real de Ingestão de Dados!
