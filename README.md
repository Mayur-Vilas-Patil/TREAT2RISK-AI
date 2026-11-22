# Threat2Risk AI — Autonomous SOC Investigation & Risk Intelligence Platform
> *"From Alert Noise to an Explainable Attack Story."*  
> **Smart India Hackathon 2026 Project Submission**

---

## 1. Product Overview

Modern Security Operations Centers (SOCs) are overwhelmed by thousands of fragmented alerts daily. Analysts waste critical response time pivoting between disparate SIEM dashboards, EDR consoles, and threat intel feeds to piece together what actually happened.

**Threat2Risk AI** is an enterprise-grade AI-powered SOC investigation and risk intelligence platform that transforms raw security alerts into an **explainable attack story**. 

Instead of showing isolated alerts, Threat2Risk AI:
1. **Ingests & Monitors** real-time multi-source security events across network, identity, endpoint, and firewall sensors.
2. **Deterministically Correlates** events across shared entities (IPs, users, hosts, parent processes) within temporal sliding windows.
3. **Reconstructs Chronological Timelines** distinguishing confirmed sensor events from inferred attack progression stages.
4. **Maps Tradecraft to MITRE ATT&CK** with distinct confidence tags (Confirmed vs Potential mapping).
5. **Calculates Contextual Risk Scores (0–100)** with transparent, explainable formulas—answering *"Why this risk score?"*.
6. **Empowers Analysts with an Evidence-Grounded AI Copilot** that cites exact event IDs and timestamps with zero hallucination.
7. **Simulates Containment Responses (What-If Sandbox)** before taking operational action.
8. **Generates CISO-Ready Threat Investigation Reports** with single-click PDF export.
9. **Delivers an Immersive SOC Experience** with Web Audio API-synthesized ambient command-center telemetry and alert tones.

---

## 2. Key Modules & Capabilities

| Module | Features & Description |
|---|---|
| **1. Overview Dashboard** | Command Center with 6 KPI cards, Events Over Time chart, Threat Severity Donut, Top Threat Ingress Sources table, and prominent Hero Threat Activity alert. |
| **2. Live Security Monitor** | Real-time streaming log feed with Start/Pause controls, simulation speed controls (1x, 2x, 4x), multi-criteria filters, and raw payload inspection. |
| **3. Security Events Repository** | Searchable audit repository with CSV export, deep entity filtering, and on-demand Event Correlation Engine triggers. |
| **4. Incident Investigation** | 6 dedicated investigation tabs: Overview narrative, Kill-chain Timeline, Evidence verification checklist, MITRE mapping, Risk Analysis, and NIST-aligned Remediation Roadmap. |
| **5. Interactive Attack Graph** | Topological graph reconstruction of User, IP, Host, Process, and Event nodes with directional flow and clickable node inspection. |
| **6. MITRE ATT&CK Matrix** | Full Enterprise matrix heatmap highlighting confirmed detections (cyan) vs potential mappings (amber). |
| **7. Risk Intelligence** | Explainable contextual risk scoring with live slider sensitivity testing, blast radius exposure table, and "Why this risk score?" modal. |
| **8. AI Investigation Copilot** | Conversational assistant with quick-prompt chips, real-time response generation, evidence citations, and autonomous local grounded mode. |
| **9. Response Simulator** | What-if response sandbox testing host isolation, account suspension, IP firewall block, and credential revocation without touching live systems. |
| **10. Threat Reports** | Enterprise investigation report generator with clean `@media print` styling for PDF downloads and Markdown exports. |
| **11. System Settings** | AI provider switcher (Local Grounded Engine vs Gemini/OpenAI), Web Audio synthesizer volume controls, correlation parameters, and Demo Data Reset. |

---

## 3. Pre-Seeded Attack Scenarios

The platform includes 3 deep, realistic multi-stage enterprise attack scenarios plus benign background noise:

- **Incident A: Credential Access & Privileged Account Abuse (`INC-2026-001`)**
  - External Kerberos password spray burst from Seychelles IP `185.220.101.5`
  - Anomalous TGT grant for Domain Admin account `s.patel`
  - Obfuscated PowerShell token impersonation and AMSI bypass on `DC-CORP-01`
  - Active Directory database (`ntds.dit`) snapshot creation via `ntdsutil.exe`
  - Encrypted outbound exfiltration channel established to `185.220.101.5:443`
  - *Risk Score*: **94/100 (Critical)**

- **Incident B: Endpoint Malware & Lateral Movement (`INC-2026-002`)**
  - Spearphishing invoice attachment executed by user `m.reed` spawning `mshta.exe` on `WS-FIN-042`
  - Encoded PowerShell script injecting Cobalt Strike beacon
  - LSASS process memory dump intercepted by EDR
  - Network sweep and unauthorized SMB `ADMIN$` share probe targeting file server `FS-CORP-02`
  - *Risk Score*: **84/100 (High)**

- **Incident C: Web Shell Injection & Data Exfiltration (`INC-2026-003`)**
  - Apache Struts OGNL remote code execution exploit against public web server `WEB-PROD-01`
  - Web shell backdoor dropped in `/uploads/sysinfo.php`
  - Interactive shell commands enumerating customer database backups
  - High-speed encrypted transfer of 5.8 GB database dump to bulletproof VPS `91.240.118.82`
  - *Risk Score*: **88/100 (Critical)**

---

## 4. Technical Architecture

```
Threat2Risk AI Platform
│
├── backend/
│   ├── main.py                 # FastAPI application, REST endpoints & WebSocket streamer
│   ├── models.py               # Pydantic data schemas
│   ├── database.py             # DataStore management & state tracking
│   ├── seed_data.py            # Comprehensive multi-stage synthetic cybersecurity dataset
│   ├── correlation_engine.py   # Multi-entity deterministic correlation engine
│   ├── risk_engine.py          # Contextual explainable risk scoring algorithm
│   ├── copilot_engine.py       # Grounded RAG-style AI assistant with zero hallucination
│   ├── simulator_engine.py     # What-if containment response simulator
│   └── report_generator.py     # CISO incident report compiler
│
├── frontend/
│   ├── src/
│   │   ├── components/layout/  # Navbar, Sidebar, SearchModal
│   │   ├── pages/              # 11 Modular SOC Workspaces
│   │   ├── services/           # API client (api.ts) & Web Audio Synthesizer (sound.ts)
│   │   ├── App.tsx             # Root application orchestrator
│   │   └── index.css           # Dark cyber styling & print rules
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── start.bat                   # One-click Windows startup script
├── test_backend.py             # Backend unit test suite
├── test_e2e.py                 # Live end-to-end integration test suite
└── README.md
```

---

## 5. Quick Start & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Quick Launch (Windows)
Double-click `start.bat` or run:
```cmd
start.bat
```

### Manual Launch

#### 1. Start the Backend:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

#### 2. Start the Frontend:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend UI will be live at `http://127.0.0.1:5173`.

---

## 6. Verification & Automated Testing

Run the included end-to-end verification test suite:
```bash
python test_e2e.py
```

Expected output:
```
Health: 200 {'status': 'operational', 'service': 'Threat2Risk AI', 'events_count': 23, 'incidents_count': 3}
Incidents loaded: 3 ['INC-2026-001', 'INC-2026-002', 'INC-2026-003']
Correlation: 200 3 clusters detected
Simulation: 200 Before: 92 -> After: 50 (Delta: -42)
Copilot query: 200 Confidence: High (96% Deterministic Log Grounding) Citations: 7
Report: 200 ID: REP-INC-2026-001-V1
Frontend: 200 HTML length: 1231

>>> ALL END-TO-END SERVICES TESTED & VALIDATED SUCCESSFULLY! <<<
```

---

## 7. SIH 2026 Judging Highlights

- **Explainability First**: Unlike black-box machine learning dashboards, every risk score shows its exact mathematical calculation formula and factor weights.
- **Evidence-Grounded AI**: The AI Copilot explicitly cites supporting log event IDs and timestamps with zero fabricated evidence.
- **Web Audio Telemetry**: Original synthesized sound effects generated in-browser via the Web Audio API without any external copyrighted audio files.
- **Full Interactivity**: Every button, status switcher, analyst note editor, what-if simulator, search filter, and report exporter is fully functional.
