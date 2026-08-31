import requests

BASE = "http://localhost:8000/api"
r = requests.post(f"{BASE}/token/", json={"email": "admin@qontak.com", "password": "admin123"})
t = r.json()
h = {"Authorization": f"Bearer {t['access']}"}
print("[1] Login OK")

# Create Agent
print("[2] POST /api/agents/ (Create Agent)")
r = requests.post(f"{BASE}/agents/", data={
    "username": "agent1",
    "email": "agent1@test.com",
    "password": "pass1234",
    "first_name": "Agent",
    "last_name": "One",
    "phone": "08123456789",
}, headers=h)
print(f"    Status: {r.status_code} | {r.json().get('username')}")
agent_id = r.json().get("id")

# List Agents
print("[3] GET /api/agents/")
r = requests.get(f"{BASE}/agents/", headers=h)
print(f"    Status: {r.status_code} | Count: {len(r.json())}")

# Update Agent
print(f"[4] PUT /api/agents/{agent_id}/")
r = requests.put(f"{BASE}/agents/{agent_id}/", data={
    "first_name": "Updated",
    "last_name": "Agent",
    "phone": "09999999",
}, headers=h)
print(f"    Status: {r.status_code} | Name: {r.json().get('first_name')} {r.json().get('last_name')}")

# Switch Account
print(f"[5] POST /api/auth/switch-account/")
r = requests.post(f"{BASE}/auth/switch-account/", json={"user_id": agent_id}, headers=h)
print(f"    Status: {r.status_code}")
if r.status_code == 200:
    print(f"    Switched to: {r.json().get('user', {}).get('username')}")

# Switch back
r2 = requests.post(f"{BASE}/token/", json={"email": "admin@qontak.com", "password": "admin123"})
h2 = {"Authorization": f"Bearer {r2.json()['access']}"}

# Delete Agent
print(f"[6] DELETE /api/agents/{agent_id}/")
r = requests.delete(f"{BASE}/agents/{agent_id}/", headers=h2)
print(f"    Status: {r.status_code}")

print("\nALL DONE")
