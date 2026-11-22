const getApiBase = (): string => {
  const env = import.meta.env.VITE_API_URL;
  if (env) {
    const clean = env.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return "http://127.0.0.1:8000/api";
};

const getWsBase = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const env = import.meta.env.VITE_API_URL;
  if (env) {
    const clean = env.replace(/\/+$/, '').replace(/\/api$/, '');
    const wsProto = clean.startsWith('https') ? 'wss' : 'ws';
    const host = clean.replace(/^https?:\/\//, '');
    return `${wsProto}://${host}/ws/events`;
  }
  return "ws://127.0.0.1:8000/ws/events";
};

const API_BASE = getApiBase();
const WS_BASE = getWsBase();

export interface SecurityEvent {
  id: string;
  timestamp: string;
  source_ip: string;
  dest_ip: string;
  username: string;
  hostname: string;
  process_name: string;
  event_category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  raw_payload?: Record<string, any>;
  is_simulated: boolean;
  mitre_technique_id?: string;
  mitre_technique_name?: string;
  mitre_tactic?: string;
}

export interface MitreMapping {
  technique_id: string;
  technique_name: string;
  tactic: string;
  confidence: 'confirmed' | 'potential';
  evidence_events: string[];
  description: string;
}

export interface TimelineStage {
  id: string;
  stage_name: string;
  timestamp: string;
  title: string;
  description: string;
  related_event_ids: string[];
  severity: string;
  entity: string;
  is_inferred: boolean;
}

export interface IncidentNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface Incident {
  id: string;
  title: string;
  summary: string;
  risk_score: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'Open' | 'Under Investigation' | 'Contained' | 'Closed';
  assigned_to: string;
  first_detected: string;
  last_activity: string;
  affected_users: string[];
  affected_hosts: string[];
  source_ips: string[];
  dest_ips: string[];
  related_event_ids: string[];
  mitre_techniques: MitreMapping[];
  timeline_stages: TimelineStage[];
  notes: IncidentNote[];
  evidence_reviewed: string[];
  created_at: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  rationale: string;
}

export interface RiskBreakdown {
  incident_id: string;
  overall_score: number;
  severity: string;
  factors: RiskFactor[];
  formula: string;
  weights: Record<string, number>;
  explanation: string;
  blast_radius_assets: Array<{
    name: string;
    criticality: string;
    status: string;
    risk: string;
  }>;
  risk_trend: Array<{ time: string; score: number }>;
}

export interface SimulationResult {
  incident_id: string;
  incident_title: string;
  action_type: string;
  target_entity: string;
  before_risk_score: number;
  after_risk_score: number;
  score_delta: number;
  severed_vectors: string[];
  residual_risks: string[];
  expected_impact: string;
  is_simulation_only: boolean;
  simulation_notice: string;
}

export interface CopilotResponse {
  response: string;
  supporting_event_ids: string[];
  related_entities: string[];
  confidence: string;
  recommended_actions: string[];
  citations: Array<{ event_id: string; desc: string; time: string }>;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getEvents(params: { severity?: string; category?: string; search?: string; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.severity) query.set('severity', params.severity);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());
    const res = await fetch(`${API_BASE}/events?${query.toString()}`);
    return res.json();
  },

  async createEvent(event: Partial<SecurityEvent>) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.json();
  },

  async getIncidents(params: { status?: string; severity?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.severity) query.set('severity', params.severity);
    const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
    return res.json();
  },

  async getIncident(id: string) {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error('Incident not found');
    return res.json();
  },

  async updateIncident(id: string, updates: Partial<Incident>) {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async addIncidentNote(id: string, text: string, author: string = 'Alex Vance (Tier 3 SOC Lead)') {
    const res = await fetch(`${API_BASE}/incidents/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author }),
    });
    return res.json();
  },

  async toggleEvidence(id: string, eventId: string) {
    const res = await fetch(`${API_BASE}/incidents/${id}/toggle-evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });
    return res.json();
  },

  async getCorrelationRules() {
    const res = await fetch(`${API_BASE}/correlation/rules`);
    return res.json();
  },

  async runCorrelation() {
    const res = await fetch(`${API_BASE}/correlation/run`, { method: 'POST' });
    return res.json();
  },

  async getRisk(id: string): Promise<RiskBreakdown> {
    const res = await fetch(`${API_BASE}/risk/${id}`);
    return res.json();
  },

  async recalculateRisk(id: string, weights: Record<string, number>): Promise<RiskBreakdown> {
    const res = await fetch(`${API_BASE}/risk/${id}/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    return res.json();
  },

  async getCopilotStatus() {
    const res = await fetch(`${API_BASE}/copilot/status`);
    return res.json();
  },

  async configCopilot(provider: string, apiKey: string) {
    const res = await fetch(`${API_BASE}/copilot/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, api_key: apiKey }),
    });
    return res.json();
  },

  async queryCopilot(query: string, incidentId?: string): Promise<CopilotResponse> {
    const res = await fetch(`${API_BASE}/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, incident_id: incidentId }),
    });
    return res.json();
  },

  async simulateResponse(incidentId: string, actionType: string, targetEntity: string): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulator/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incident_id: incidentId,
        action_type: actionType,
        target_entity: targetEntity,
      }),
    });
    return res.json();
  },

  async getReport(incidentId: string) {
    const res = await fetch(`${API_BASE}/reports/${incidentId}`);
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    return res.json();
  },

  async generateSimulatedEvent() {
    const res = await fetch(`${API_BASE}/demo/generate-event`, { method: 'POST' });
    return res.json();
  },

  connectWebSocket(onMessage: (data: any) => void): () => void {
    let ws: WebSocket | null = null;
    let isClosed = false;

    const connect = () => {
      if (isClosed) return;
      try {
        ws = new WebSocket(WS_BASE);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch {
            // non-json message like pong
          }
        };
        ws.onclose = () => {
          if (!isClosed) {
            setTimeout(connect, 3000); // reconnect on close
          }
        };
        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        // connect error retry
        if (!isClosed) {
          setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isClosed = true;
      if (ws) {
        ws.close();
      }
    };
  }
};
