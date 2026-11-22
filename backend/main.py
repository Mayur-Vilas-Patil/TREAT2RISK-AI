import asyncio
import random
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import db
from backend.models import SecurityEvent, Incident, SimulationRequest, CopilotQuery
from backend.correlation_engine import correlation_engine
from backend.risk_engine import risk_engine
from backend.copilot_engine import copilot_engine
from backend.simulator_engine import simulator_engine
from backend.report_generator import report_generator

app = FastAPI(
    title="Threat2Risk AI Backend",
    description="Enterprise SOC Investigation & Risk Intelligence API",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connected WebSocket clients for real-time live event streaming
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Background generator state
generator_state = {
    "is_running": True,
    "speed_seconds": 4.0
}

# --- HEALTH & SYSTEM ---
@app.get("/api/health")
def get_health():
    return {
        "status": "operational",
        "service": "Threat2Risk AI",
        "version": "2.4.0",
        "events_count": len(db.get_events()),
        "incidents_count": len(db.get_incidents()),
        "uptime": "99.98%",
        "ingestion_rate_eps": 14.2
    }

# --- EVENTS ENDPOINTS ---
@app.get("/api/events")
def list_events(
    severity: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100
):
    events = db.get_events()
    filtered = events

    if severity and severity.lower() != "all":
        filtered = [e for e in filtered if e.get("severity", "").lower() == severity.lower()]

    if category and category.lower() != "all":
        filtered = [e for e in filtered if e.get("event_category", "").lower() == category.lower()]

    if search:
        s = search.lower()
        filtered = [
            e for e in filtered
            if s in e.get("id", "").lower()
            or s in e.get("source_ip", "").lower()
            or s in e.get("dest_ip", "").lower()
            or s in e.get("username", "").lower()
            or s in e.get("hostname", "").lower()
            or s in e.get("description", "").lower()
            or s in e.get("process_name", "").lower()
        ]

    return {
        "total": len(filtered),
        "events": filtered[:limit]
    }

@app.post("/api/events")
async def create_event(event: Dict[str, Any]):
    if not event.get("id"):
        event["id"] = f"EVT-{random.randint(5000, 9999)}"
    if not event.get("timestamp"):
        event["timestamp"] = datetime.now(timezone.utc).isoformat()
    event["is_simulated"] = True

    new_evt = db.add_event(event)
    await manager.broadcast({"type": "NEW_EVENT", "event": new_evt})
    return new_evt

# --- INCIDENTS ENDPOINTS ---
@app.get("/api/incidents")
def list_incidents(status: Optional[str] = None, severity: Optional[str] = None):
    incidents = db.get_incidents()
    filtered = incidents

    if status and status.lower() != "all":
        filtered = [i for i in filtered if i.get("status", "").lower() == status.lower()]

    if severity and severity.lower() != "all":
        filtered = [i for i in filtered if i.get("severity", "").lower() == severity.lower()]

    return {
        "total": len(filtered),
        "incidents": filtered
    }

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    inc = db.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    # attach related event objects for convenience
    all_events = db.get_events()
    related = [e for e in all_events if e["id"] in inc.get("related_event_ids", [])]
    risk_info = risk_engine.calculate_risk(inc)

    return {
        "incident": inc,
        "related_events": related,
        "risk_breakdown": risk_info
    }

@app.patch("/api/incidents/{incident_id}")
async def update_incident(incident_id: str, updates: Dict[str, Any]):
    inc = db.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    updated = db.update_incident(incident_id, updates)
    await manager.broadcast({"type": "INCIDENT_UPDATED", "incident": updated})
    return updated

@app.post("/api/incidents/{incident_id}/notes")
async def add_incident_note(incident_id: str, note_data: Dict[str, str] = Body(...)):
    inc = db.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    new_note = {
        "id": f"NOTE-{random.randint(100, 999)}",
        "author": note_data.get("author", "Alex Vance (Tier 3 SOC Lead)"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "text": note_data.get("text", "")
    }
    notes = inc.get("notes", [])
    notes.append(new_note)
    db.update_incident(incident_id, {"notes": notes})
    await manager.broadcast({"type": "INCIDENT_UPDATED", "incident": inc})
    return new_note

@app.post("/api/incidents/{incident_id}/toggle-evidence")
def toggle_evidence(incident_id: str, event_id: str = Body(..., embed=True)):
    inc = db.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    reviewed = list(inc.get("evidence_reviewed", []))
    if event_id in reviewed:
        reviewed.remove(event_id)
    else:
        reviewed.append(event_id)

    db.update_incident(incident_id, {"evidence_reviewed": reviewed})
    return {"evidence_reviewed": reviewed}

# --- CORRELATION ENGINE ---
@app.get("/api/correlation/rules")
def get_correlation_rules():
    return correlation_engine.get_rules()

@app.post("/api/correlation/run")
def run_correlation():
    events = db.get_events()
    results = correlation_engine.correlate_events(events)
    return {
        "status": "completed",
        "detected_clusters_count": len(results),
        "clusters": results
    }

# --- RISK INTELLIGENCE ---
@app.get("/api/risk/{incident_id}")
def get_risk_intelligence(incident_id: str):
    inc = db.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return risk_engine.calculate_risk(inc)

@app.post("/api/risk/{incident_id}/recalculate")
def recalculate_risk(incident_id: str, weights: Dict[str, float] = Body(...)):
    inc = db.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return risk_engine.calculate_risk(inc, custom_weights=weights)

# --- AI COPILOT ---
@app.get("/api/copilot/status")
def get_copilot_status():
    return copilot_engine.get_status()

@app.post("/api/copilot/config")
def config_copilot(config: Dict[str, str] = Body(...)):
    provider = config.get("provider", "local")
    key = config.get("api_key", "")
    copilot_engine.set_api_key(provider, key)
    return {"status": "updated", "provider": provider, "has_key": bool(key)}

@app.post("/api/copilot/query")
def query_copilot(payload: CopilotQuery):
    response = copilot_engine.answer_query(payload.query, payload.incident_id)
    return response

# --- RESPONSE SIMULATOR ---
@app.post("/api/simulator/simulate")
def simulate_response(payload: SimulationRequest):
    result = simulator_engine.simulate_response(
        incident_id=payload.incident_id,
        action_type=payload.action_type,
        target_entity=payload.target_entity
    )
    return result

# --- THREAT REPORTS ---
@app.get("/api/reports/{incident_id}")
def get_report(incident_id: str):
    return report_generator.generate_report(incident_id)

# --- DEMO DATA MANAGEMENT ---
@app.post("/api/demo/reset")
async def reset_demo_data():
    db.reset()
    await manager.broadcast({"type": "DEMO_RESET"})
    return {"status": "success", "message": "Demo data successfully reset to initial pristine state."}

@app.post("/api/demo/generate-event")
async def generate_simulated_event():
    sample_templates = [
        {
            "category": "Authentication",
            "severity": "medium",
            "desc": "Kerberos pre-auth failed for svc_sql from internal subnet",
            "user": "svc_sql",
            "host": "DB-PROD-SQL-01",
            "src": "10.0.1.75",
            "dst": "10.0.1.10",
            "proc": "lsass.exe"
        },
        {
            "category": "Endpoint",
            "severity": "low",
            "desc": "Periodic software inventory scan completed by Microsoft SCCM",
            "user": "SYSTEM",
            "host": "WS-DEV-009",
            "src": "10.0.2.9",
            "dst": "10.0.1.20",
            "proc": "CcmExec.exe"
        },
        {
            "category": "Network",
            "severity": "medium",
            "desc": "TLS session established to non-standard high port 8443",
            "user": "anonymous",
            "host": "GATEWAY-01",
            "src": "10.0.3.42",
            "dst": "193.142.146.88",
            "proc": "svchost.exe"
        },
        {
            "category": "Process",
            "severity": "high",
            "desc": "PowerShell invoked with encoded command line parameters by non-admin user",
            "user": "j.adams",
            "host": "WS-SALES-012",
            "src": "10.0.3.12",
            "dst": "10.0.3.12",
            "proc": "powershell.exe"
        },
        {
            "category": "Firewall",
            "severity": "low",
            "desc": "Outbound HTTP GET request permitted to akamai-cdn.net",
            "user": "k.sharma",
            "host": "WS-DEV-014",
            "src": "10.0.2.14",
            "dst": "23.212.18.9",
            "proc": "chrome.exe"
        }
    ]

    t = random.choice(sample_templates)
    evt = {
        "id": f"EVT-{random.randint(6000, 9999)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_ip": t["src"],
        "dest_ip": t["dst"],
        "username": t["user"],
        "hostname": t["host"],
        "process_name": t["proc"],
        "event_category": t["category"],
        "severity": t["severity"],
        "description": t["desc"],
        "raw_payload": {"Simulated": True, "Sensor": "Zeek / EDR Agent v4.1"},
        "is_simulated": True
    }
    db.add_event(evt)
    await manager.broadcast({"type": "NEW_EVENT", "event": evt})
    return evt

# --- WEBSOCKET EVENT STREAM ---
@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # wait for messages from client (e.g. ping or commands)
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

