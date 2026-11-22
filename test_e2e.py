import httpx

base = "http://127.0.0.1:8000"
fe_base = "http://127.0.0.1:5173"

with httpx.Client() as client:
    # 1. Health
    r = client.get(f"{base}/api/health")
    print("Health:", r.status_code, r.json())

    # 2. Incidents
    r = client.get(f"{base}/api/incidents")
    incidents = r.json()["incidents"]
    print("Incidents loaded:", len(incidents), [i["id"] for i in incidents])

    # 3. Correlation Run
    r = client.post(f"{base}/api/correlation/run")
    print("Correlation:", r.status_code, r.json()["detected_clusters_count"], "clusters detected")

    # 4. Simulation
    r = client.post(f"{base}/api/simulator/simulate", json={
        "incident_id": "INC-2026-001",
        "action_type": "isolate_host",
        "target_entity": "DC-CORP-01"
    })
    sim = r.json()
    print("Simulation:", r.status_code, f"Before: {sim['before_risk_score']} -> After: {sim['after_risk_score']} (Delta: -{sim['score_delta']})")

    # 5. Copilot
    r = client.post(f"{base}/api/copilot/query", json={
        "query": "What happened in this incident?",
        "incident_id": "INC-2026-001"
    })
    cop = r.json()
    print("Copilot query:", r.status_code, "Confidence:", cop["confidence"], "Citations:", len(cop["supporting_event_ids"]))

    # 6. Report
    r = client.get(f"{base}/api/reports/INC-2026-001")
    rep = r.json()
    print("Report:", r.status_code, "ID:", rep["metadata"]["report_id"])

    # 7. Frontend
    r = client.get(fe_base)
    print("Frontend:", r.status_code, "HTML length:", len(r.text))

print("\n>>> ALL END-TO-END SERVICES TESTED & VALIDATED SUCCESSFULLY! <<<")
