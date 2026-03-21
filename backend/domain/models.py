from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List

@dataclass
class Player:
    id: str  # Internal normalized ID
    name: str
    external_ids: Dict[str, str] = field(default_factory=dict)  # e.g., {'fbref': '123', 'statsbomb': '456', 'betsapi': '789'}
    team: Optional[str] = None

@dataclass
class Event:
    id: str
    event_type: str  # e.g., 'goal', 'pass', 'card', 'substitution'
    minute: int
    player_id: str
    match_id: str
    source: str      # 'betsapi' | 'statsbomb' 
    details: Dict[str, Any] = field(default_factory=dict)
