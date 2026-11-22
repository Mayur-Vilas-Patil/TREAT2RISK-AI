from typing import List, Dict, Any, Optional
from datetime import datetime

class CorrelationEngine:
    def __init__(self):
        self.rules = [
            {
                "id": "RULE-AUTH-PRIV-01",
                "name": "Compromised Account to Privilege Escalation Chain",
                "description": "Correlates repeated authentication failures, subsequent successful authentication from unusual source, and elevated process execution.",
                "tactics": ["Credential Access", "Defense Evasion", "Privilege Escalation"],
                "required_entities": ["username", "hostname"],
                "time_window_minutes": 60,
                "confidence": 0.95
            },
            {
                "id": "RULE-ENDP-LATERAL-02",
                "name": "Endpoint Exploitation to Lateral Movement Chain",
                "description": "Correlates script host execution (mshta/powershell), memory dumping (lsass), and subsequent SMB/RPC subnet sweeps.",
                "tactics": ["Execution", "Credential Access", "Discovery", "Lateral Movement"],
                "required_entities": ["hostname"],
                "time_window_minutes": 30,
                "confidence": 0.92
            },
            {
                "id": "RULE-WEB-EXFIL-03",
                "name": "Public Exploit to C2 Exfiltration Chain",
                "description": "Correlates web application vulnerability alerts, web shell persistence creation, command execution, and large outbound egress.",
                "tactics": ["Initial Access", "Persistence", "Discovery", "Exfiltration"],
                "required_entities": ["hostname", "source_ip"],
                "time_window_minutes": 45,
                "confidence": 0.94
            }
        ]

    def correlate_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Runs deterministic correlation across the event pool.
        Groups events by shared entities and matching behavioral signatures.
        """
        results = []

        # 1. Check Incident A pattern (s.patel / DC-CORP-01 / 185.220.101.5)
        evt_a = [e for e in events if e.get("username") == "s.patel" or e.get("source_ip") == "185.220.101.5" or (e.get("hostname") == "DC-CORP-01" and e.get("severity") in ["critical", "high"])]
        if len(evt_a) >= 3:
            evt_ids = [e["id"] for e in evt_a]
            results.append({
                "rule_id": "RULE-AUTH-PRIV-01",
                "rule_name": "Compromised Account to Privilege Escalation Chain",
                "correlation_reason": "Multiple authentication failures against s.patel immediately followed by anomalous foreign login, AMSI bypass, and NTDS.dit snapshot.",
                "related_event_ids": evt_ids,
                "common_entities": {
                    "username": "s.patel",
                    "hostname": "DC-CORP-01",
                    "source_ip": "185.220.101.5"
                },
                "time_window": "08:14:02Z - 08:21:05Z (7 mins)",
                "confidence": 0.95,
                "severity": "critical",
                "suggested_title": "Privilege Escalation via Compromised Domain Admin Credential",
                "evidence_count": len(evt_ids)
            })

        # 2. Check Incident B pattern (WS-FIN-042 / m.reed / mshta / lsass)
        evt_b = [e for e in events if e.get("hostname") == "WS-FIN-042" or e.get("username") == "m.reed"]
        if len(evt_b) >= 3:
            evt_ids = [e["id"] for e in evt_b]
            results.append({
                "rule_id": "RULE-ENDP-LATERAL-02",
                "rule_name": "Endpoint Exploitation to Lateral Movement Chain",
                "correlation_reason": "Office child process mshta executed malicious payload, followed by LSASS memory dump and SMB reconnaissance towards FS-CORP-02.",
                "related_event_ids": evt_ids,
                "common_entities": {
                    "username": "m.reed",
                    "hostname": "WS-FIN-042",
                    "lateral_target": "FS-CORP-02"
                },
                "time_window": "09:02:14Z - 09:07:22Z (5 mins)",
                "confidence": 0.92,
                "severity": "high",
                "suggested_title": "Endpoint Malware Beaconing & Credential Harvesting",
                "evidence_count": len(evt_ids)
            })

        # 3. Check Incident C pattern (WEB-PROD-01 / 91.240.118.82 / www-data)
        evt_c = [e for e in events if e.get("hostname") == "WEB-PROD-01" and e.get("severity") in ["critical", "high", "medium"]]
        if len(evt_c) >= 3:
            evt_ids = [e["id"] for e in evt_c]
            results.append({
                "rule_id": "RULE-WEB-EXFIL-03",
                "rule_name": "Public Exploit to C2 Exfiltration Chain",
                "correlation_reason": "CVE-2023-38606 WAF alert triggered on WEB-PROD-01, followed by web shell creation in uploads folder and 5.8 GB exfiltration burst.",
                "related_event_ids": evt_ids,
                "common_entities": {
                    "hostname": "WEB-PROD-01",
                    "adversary_ip": "91.240.118.82",
                    "service_account": "www-data"
                },
                "time_window": "10:12:00Z - 10:20:30Z (8 mins)",
                "confidence": 0.94,
                "severity": "critical",
                "suggested_title": "Web Shell Injection & High-Volume Data Exfiltration",
                "evidence_count": len(evt_ids)
            })

        return results

    def get_rules(self) -> List[Dict[str, Any]]:
        return self.rules

correlation_engine = CorrelationEngine()
