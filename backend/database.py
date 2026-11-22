import copy
from typing import List, Dict, Any, Optional
from backend.seed_data import get_seed_events, get_seed_incidents
from backend.models import SecurityEvent, Incident

class DataStore:
    def __init__(self):
        self.events: List[Dict[str, Any]] = []
        self.incidents: List[Dict[str, Any]] = []
        self.reset()

    def reset(self):
        self.events = copy.deepcopy(get_seed_events())
        self.incidents = copy.deepcopy(get_seed_incidents())

    def get_events(self) -> List[Dict[str, Any]]:
        return self.events

    def add_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        self.events.insert(0, event_data)
        return event_data

    def get_incidents(self) -> List[Dict[str, Any]]:
        return self.incidents

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        for inc in self.incidents:
            if inc["id"] == incident_id:
                return inc
        return None

    def update_incident(self, incident_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for i, inc in enumerate(self.incidents):
            if inc["id"] == incident_id:
                self.incidents[i].update(updates)
                return self.incidents[i]
        return None

    def add_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        self.incidents.insert(0, incident_data)
        return incident_data

db = DataStore()
