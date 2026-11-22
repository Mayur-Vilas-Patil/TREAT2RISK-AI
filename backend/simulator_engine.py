from typing import Dict, Any, List
from backend.database import db

class SimulatorEngine:
    def __init__(self):
        pass

    def simulate_response(self, incident_id: str, action_type: str, target_entity: str) -> Dict[str, Any]:
        incident = db.get_incident(incident_id)
        if not incident:
            # Fallback mock incident
            before_score = 90
            incident_title = "Active Security Incident"
        else:
            before_score = incident["risk_score"]
            incident_title = incident["title"]

        severed_vectors = []
        residual_risks = []
        score_reduction = 0
        expected_impact = ""

        if action_type == "isolate_host":
            score_reduction = 42
            severed_vectors = [
                f"Severed outbound C2 network communications on host {target_entity}",
                f"Blocked internal SMB/RPC lateral movement spread to adjacent subnets",
                f"Quarantined active network adapters while maintaining local forensic state"
            ]
            residual_risks = [
                f"Malicious processes (e.g. in-memory beacons) may remain active in local RAM on {target_entity}",
                "Physical console access or out-of-band management interface remains accessible",
                "Potential business disruption for legitimate services hosted on this machine"
            ]
            expected_impact = f"Host {target_entity} is virtually contained. Adversary cannot receive telemetry or issue new remote commands."

        elif action_type == "disable_account":
            score_reduction = 30
            severed_vectors = [
                f"Invalidated active domain logon tokens and sessions for {target_entity}",
                f"Blocked access to administrative shares and Active Directory objects",
                f"Prevented single-sign-on (SSO) pivoting into SaaS services"
            ]
            residual_risks = [
                "Previously harvested offline hashes (e.g. NTDS.dit snapshot) remain crackable offline",
                "Any secondary backdoor service accounts created during the intrusion may persist",
                "User work is completely blocked until re-provisioned"
            ]
            expected_impact = f"Identity vector disabled. Prevents further privileged credential operations using {target_entity}."

        elif action_type == "block_ip":
            score_reduction = 24
            severed_vectors = [
                f"Dropped all perimeter ingress and egress traffic matching IP {target_entity}",
                f"Terminated established TLS/TCP sessions to adversary C2 server",
                f"Defended perimeter against repeated automated spray scripts from this source"
            ]
            residual_risks = [
                "Adversary may rapidly switch to a backup proxy node or residential VPN IP",
                "Internal compromised hosts remain weaponized until remediated internally",
                "Firewall rule must be synchronized across multi-region firewalls"
            ]
            expected_impact = f"Adversary external endpoint {target_entity} blocked at perimeter boundary."

        elif action_type == "reset_credentials":
            score_reduction = 26
            severed_vectors = [
                f"Forced password change and invalidated Kerberos TGT / NTLM cache for {target_entity}",
                f"Terminated OAuth refresh tokens and active web sessions",
                f"Neutralized pass-the-hash attacks leveraging current password hash"
            ]
            residual_risks = [
                "If Kerberos ticket was used to mint Golden/Silver tickets, KRBTGT account must also be rotated",
                "Requires user identity re-verification to distribute new temporary credential securely"
            ]
            expected_impact = f"Credential validity revoked. Prevents reuse of intercepted tokens for {target_entity}."

        elif action_type == "increase_monitoring":
            score_reduction = 14
            severed_vectors = [
                f"Increased Sysmon & EDR telemetry sampling on target to high-fidelity Verbose mode",
                f"Enabled real-time memory integrity and process injection tracing",
                f"Configured targeted packet capture on connected switch port"
            ]
            residual_risks = [
                "Does not actively prevent adversary operations, only records forensic telemetry",
                "Increased storage and network consumption for logging pipeline"
            ]
            expected_impact = f"High-fidelity telemetry active for {target_entity}. Reduces forensic uncertainty."

        else:
            score_reduction = 10
            severed_vectors = ["General mitigation rule applied"]
            residual_risks = ["Monitor environment for recurrence"]
            expected_impact = "General baseline containment."

        after_score = max(12, before_score - score_reduction)

        return {
            "incident_id": incident_id,
            "incident_title": incident_title,
            "action_type": action_type,
            "target_entity": target_entity,
            "before_risk_score": before_score,
            "after_risk_score": after_score,
            "score_delta": score_reduction,
            "severed_vectors": severed_vectors,
            "residual_risks": residual_risks,
            "expected_impact": expected_impact,
            "is_simulation_only": True,
            "simulation_notice": "SIMULATION ONLY: Safe sandbox projection. No real firewall, AD, or endpoint changes were executed."
        }

simulator_engine = SimulatorEngine()
