from typing import Dict, Any, List
from backend.database import db
from backend.risk_engine import risk_engine

class ReportGenerator:
    def __init__(self):
        pass

    def generate_report(self, incident_id: str) -> Dict[str, Any]:
        incident = db.get_incident(incident_id)
        if not incident:
            incidents = db.get_incidents()
            incident = incidents[0] if incidents else {}

        all_events = db.get_events()
        related_events = [e for e in all_events if e["id"] in incident.get("related_event_ids", [])]
        risk_data = risk_engine.calculate_risk(incident)

        return {
            "metadata": {
                "report_id": f"REP-{incident.get('id', 'N/A')}-V1",
                "generated_at": "2026-11-22T20:00:00Z",
                "classification": "CONFIDENTIAL // TLP:AMBER // SOC INTERNAL",
                "lead_investigator": incident.get("assigned_to", "Alex Vance (Tier 3 SOC Lead)"),
                "organization": "Threat2Risk Cyber Command Centre",
                "platform_version": "Threat2Risk AI Enterprise v2.4"
            },
            "incident": incident,
            "risk_assessment": risk_data,
            "related_events": related_events,
            "limitations_and_confidence": {
                "confidence_score": "High (96%)",
                "telemetry_coverage": "EDR Process Tracing, Kerberos KDC Auditing, Perimeter Firewall Logs",
                "caveats": "External attacker origin IP indicates probable VPN/Tor anonymization node. Identity attribution remains cluster-level (UNC2970) pending legal ISP subpoena."
            },
            "remediation_roadmap": [
                {"phase": "Containment", "step": "Network quarantine of affected host", "status": "Recommended", "priority": "P0"},
                {"phase": "Containment", "step": "Credential revocation & Kerberos TGT purge", "status": "In Progress", "priority": "P0"},
                {"phase": "Eradication", "step": "Perimeter ingress IP block on border firewalls", "status": "Completed", "priority": "P1"},
                {"phase": "Remediation", "step": "Active Directory Golden Ticket mitigation (KRBTGT password rotation)", "status": "Scheduled", "priority": "P1"},
                {"phase": "Hardening", "step": "Enforce hardware token MFA on all Tier 0 admin logins", "status": "Planned", "priority": "P2"}
            ]
        }

report_generator = ReportGenerator()
