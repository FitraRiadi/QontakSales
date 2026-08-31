import requests

BASE = "http://localhost:8000/api"
r = requests.post(f"{BASE}/token/", json={"username": "admin", "password": "admin123"})
t = r.json()
h = {"Authorization": f"Bearer {t['access']}"}

r = requests.get(f"{BASE}/leads/", headers=h)
leads = r.json() if isinstance(r.json(), list) else r.json().get("results", [])
print(f"Leads: {len(leads)}")

if leads:
    lid = leads[0]["id"]
    stage = leads[0]["stage"]
    print(f"Lead {lid} current stage: {stage}")

    r = requests.post(f"{BASE}/leads/{lid}/move_stage/", json={"stage": "CONTACTED"}, headers=h)
    print(f"Move to CONTACTED: {r.status_code} stage={r.json().get('stage')}")

    r = requests.post(f"{BASE}/leads/{lid}/move_stage/", json={"stage": "WON"}, headers=h)
    print(f"Move to WON: {r.status_code} stage={r.json().get('stage')}")

    r = requests.post(f"{BASE}/leads/{lid}/move_stage/", json={"stage": "NEW"}, headers=h)
    print(f"Move back to NEW: {r.status_code} stage={r.json().get('stage')}")

    r = requests.post(f"{BASE}/leads/{lid}/move_stage/", json={"stage": "INVALID"}, headers=h)
    print(f"Invalid stage: {r.status_code} {r.json()}")

print("DONE")
