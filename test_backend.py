from backend.main import app
from backend.database import db
from backend.correlation_engine import correlation_engine
from backend.risk_engine import risk_engine
from backend.copilot_engine import copilot_engine

print("Events loaded:", len(db.get_events()))
print("Incidents loaded:", len(db.get_incidents()))
clusters = correlation_engine.correlate_events(db.get_events())
print("Correlated clusters detected:", len(clusters))
for c in clusters:
    print(f" - {c['rule_name']} (Confidence: {c['confidence']}, Events: {c['evidence_count']})")

first_inc = db.get_incidents()[0]
risk = risk_engine.calculate_risk(first_inc)
print(f"Risk evaluation for {first_inc['id']}: Score={risk['overall_score']}, Formula={risk['formula']}")

copilot_res = copilot_engine.answer_query("What happened in this incident?", first_inc['id'])
print(f"Copilot query test: Confidence={copilot_res['confidence']}, Citations={len(copilot_res['citations'])}")
print("ALL BACKEND MODULES OPERATIONAL!")
