from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class SecurityEvent(BaseModel):
    id: str
    timestamp: str
    source_ip: str
    dest_ip: str
    username: str
    hostname: str
    process_name: str
    event_category: str  # Authentication, Endpoint, Network, Firewall, Process
    severity: str        # critical, high, medium, low
    description: str
    raw_payload: Dict[str, Any] = Field(default_factory=dict)
    is_simulated: bool = True
    mitre_technique_id: Optional[str] = None
    mitre_technique_name: Optional[str] = None
    mitre_tactic: Optional[str] = None

class IncidentNote(BaseModel):
    id: str
    author: str
    timestamp: str
    text: str

class MitreMapping(BaseModel):
    technique_id: str
    technique_name: str
    tactic: str
    confidence: str # confirmed, potential
    evidence_events: List[str]
    description: str

class TimelineStage(BaseModel):
    id: str
    stage_name: str
    timestamp: str
    title: str
    description: str
    related_event_ids: List[str]
    severity: str
    entity: str
    is_inferred: bool = False

class Incident(BaseModel):
    id: str
    title: str
    summary: str
    risk_score: int
    severity: str  # critical, high, medium, low
    status: str    # Open, Under Investigation, Contained, Closed
    assigned_to: str
    first_detected: str
    last_activity: str
    affected_users: List[str]
    affected_hosts: List[str]
    source_ips: List[str]
    dest_ips: List[str]
    related_event_ids: List[str]
    mitre_techniques: List[MitreMapping]
    timeline_stages: List[TimelineStage]
    notes: List[IncidentNote] = Field(default_factory=list)
    evidence_reviewed: List[str] = Field(default_factory=list)
    created_at: str

class RiskFactorItem(BaseModel):
    name: str
    score: float       # 0 - 100
    weight: float      # e.g. 0.20
    contribution: float # score * weight
    rationale: str

class RiskBreakdown(BaseModel):
    incident_id: str
    overall_score: int
    severity: str
    factors: List[RiskFactorItem]
    formula: str
    explanation: str
    blast_radius_assets: List[Dict[str, Any]]
    risk_trend: List[Dict[str, Any]]

class SimulationRequest(BaseModel):
    incident_id: str
    action_type: str   # isolate_host, disable_account, block_ip, reset_credentials, increase_monitoring
    target_entity: str # e.g. DC-CORP-01, s.patel, 185.220.101.5

class SimulationResult(BaseModel):
    incident_id: str
    action_type: str
    target_entity: str
    before_risk_score: int
    after_risk_score: int
    score_delta: int
    severed_vectors: List[str]
    residual_risks: List[str]
    expected_impact: str
    is_simulation_only: bool = True

class CopilotQuery(BaseModel):
    incident_id: Optional[str] = None
    query: str
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list)

class CopilotResponse(BaseModel):
    response: str
    supporting_event_ids: List[str]
    related_entities: List[str]
    confidence: str
    recommended_actions: List[str]
    citations: List[Dict[str, Any]]
