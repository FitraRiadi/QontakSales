import requests

BASE = "http://localhost:8000/api"

# Login as manager
print("=== TEST AGENT PERMISSIONS ===\n")
r = requests.post(f"{BASE}/token/", json={"email": "admin@qontak.com", "password": "admin123"})
manager_token = r.json()["access"]
mh = {"Authorization": f"Bearer {manager_token}"}
print("[1] Manager login OK")

# Create an agent first
r = requests.post(f"{BASE}/agents/", data={
    "username": "testagent",
    "email": "testagent@test.com",
    "password": "pass1234",
    "first_name": "Test",
    "last_name": "Agent",
}, headers=mh)
print(f"[2] Create test agent: {r.status_code}")
agent_id = r.json().get("id")

# Login as agent
r = requests.post(f"{BASE}/token/", json={"email": "testagent@test.com", "password": "pass1234"})
agent_token = r.json()["access"]
ah = {"Authorization": f"Bearer {agent_token}"}
print("[3] Agent login OK")

# Agent tries to access agents endpoint - should be 403
print("\n[4] Agent GET /api/agents/ (should be 403)")
r = requests.get(f"{BASE}/agents/", headers=ah)
print(f"    Status: {r.status_code} {'PASS' if r.status_code == 403 else 'FAIL'}")

# Agent tries to create agent - should be 403
print("\n[5] Agent POST /api/agents/ (should be 403)")
r = requests.post(f"{BASE}/agents/", data={"username": "hacker", "email": "h@h.com", "password": "pass1234"}, headers=ah)
print(f"    Status: {r.status_code} {'PASS' if r.status_code == 403 else 'FAIL'}")

# Agent tries to access own leads - should work
print("\n[6] Agent GET /api/leads/ (should be 200)")
r = requests.get(f"{BASE}/leads/", headers=ah)
data = r.json()
count = len(data) if isinstance(data, list) else len(data.get("results", []))
print(f"    Status: {r.status_code} | Count: {count} {'PASS' if r.status_code == 200 else 'FAIL'}")

# Agent creates a lead - should work (auto-assigned)
print("\n[7] Agent POST /api/leads/ (should be 201)")
r = requests.post(f"{BASE}/leads/", json={"name": "Agent Lead", "contact_name": "AC", "phone_number": "08123", "potential_value": "50000000"}, headers=ah)
print(f"    Status: {r.status_code} | ID: {r.json().get('id')} {'PASS' if r.status_code == 201 else 'FAIL'}")
new_lead_id = r.json().get("id")

# Agent tries to delete lead - should be 403
print(f"\n[8] Agent DELETE /api/leads/{new_lead_id}/ (should be 403)")
r = requests.delete(f"{BASE}/leads/{new_lead_id}/", headers=ah)
print(f"    Status: {r.status_code} {'PASS' if r.status_code == 403 else 'FAIL'}")

# Agent tries dashboard stats - should only see own leads
print("\n[9] Agent GET /api/dashboard/stats/ (should be 200)")
r = requests.get(f"{BASE}/dashboard/stats/", headers=ah)
print(f"    Status: {r.status_code} | Total Leads: {r.json().get('total_leads')} {'PASS' if r.status_code == 200 else 'FAIL'}")

# Cleanup - manager deletes test lead and agent
print("\n[10] Cleanup")
requests.delete(f"{BASE}/leads/{new_lead_id}/", headers=mh)
requests.delete(f"{BASE}/agents/{agent_id}/", headers=mh)
print("    Cleanup done")

print("\n=== ALL TESTS COMPLETE ===")
