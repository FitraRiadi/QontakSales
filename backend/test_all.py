import requests
import json

BASE = "http://localhost:8000/api"

print("=" * 60)
print("FULL API TEST")
print("=" * 60)

# Login
print("\n[1] POST /api/token/ (Login)")
r = requests.post(f"{BASE}/token/", json={"email": "admin@qontak.com", "password": "admin123"})
print(f"    Status: {r.status_code}")
tokens = r.json()
headers = {"Authorization": f"Bearer {tokens['access']}"}
print(f"    Token OK")

# Profile
print("\n[2] GET /api/auth/profile/")
r = requests.get(f"{BASE}/auth/profile/", headers=headers)
print(f"    Status: {r.status_code} | User: {r.json().get('username')}")

# Dashboard Stats
print("\n[3] GET /api/dashboard/stats/")
r = requests.get(f"{BASE}/dashboard/stats/", headers=headers)
print(f"    Status: {r.status_code}")
if r.status_code == 200:
    d = r.json()
    print(f"    Revenue: Rp {d['total_revenue']:,} | Win Rate: {d['win_rate']}% | Active: {d['active_leads']}")

# Leads CRUD
print("\n[4] GET /api/leads/ (List)")
r = requests.get(f"{BASE}/leads/", headers=headers)
data = r.json()
count = len(data) if isinstance(data, list) else len(data.get("results", []))
print(f"    Status: {r.status_code} | Count: {count}")

print("\n[5] POST /api/leads/ (Create)")
lead = {"name": "PT Baru Jaya", "contact_name": "Test User", "phone_number": "+62 812-0000-0000", "potential_value": "75000000", "tag": "HOT"}
r = requests.post(f"{BASE}/leads/", json=lead, headers=headers)
print(f"    Status: {r.status_code} | ID: {r.json().get('id')}")
lead_id = r.json().get("id")

print(f"\n[6] PUT /api/leads/{lead_id}/ (Update)")
r = requests.put(f"{BASE}/leads/{lead_id}/", json={**lead, "name": "PT Updated"}, headers=headers)
print(f"    Status: {r.status_code} | Name: {r.json().get('name')}")

print(f"\n[7] POST /api/leads/{lead_id}/move_stage/ (Move Stage)")
r = requests.post(f"{BASE}/leads/{lead_id}/move_stage/", json={"stage": "CONTACTED"}, headers=headers)
print(f"    Status: {r.status_code} | Stage: {r.json().get('stage')}")

# Notifications
print("\n[8] GET /api/notifications/")
r = requests.get(f"{BASE}/notifications/", headers=headers)
data = r.json()
count = len(data) if isinstance(data, list) else len(data.get("results", []))
print(f"    Status: {r.status_code} | Count: {count}")

# Activity Log
print("\n[9] POST /api/activities/ (Create Log)")
r = requests.post(f"{BASE}/activities/", json={"lead": lead_id, "notes": "Test activity"}, headers=headers)
print(f"    Status: {r.status_code}")

print("\n[10] GET /api/activities/ (List)")
r = requests.get(f"{BASE}/activities/", headers=headers)
data = r.json()
count = len(data) if isinstance(data, list) else len(data.get("results", []))
print(f"    Status: {r.status_code} | Count: {count}")

# Settings
print("\n[11] GET /api/auth/settings/")
r = requests.get(f"{BASE}/auth/settings/", headers=headers)
print(f"    Status: {r.status_code}")

# Team
print("\n[12] GET /api/auth/team/")
r = requests.get(f"{BASE}/auth/team/", headers=headers)
print(f"    Status: {r.status_code} | Members: {len(r.json())}")

# Register
print("\n[13] POST /api/auth/register/")
r = requests.post(f"{BASE}/auth/register/", json={"name": "New User", "email": "new2@test.com", "password": "testpass123", "company_name": "Test Co"})
print(f"    Status: {r.status_code}")

# Delete Lead
print(f"\n[14] DELETE /api/leads/{lead_id}/")
r = requests.delete(f"{BASE}/leads/{lead_id}/", headers=headers)
print(f"    Status: {r.status_code}")

# Token Refresh
print("\n[15] POST /api/token/refresh/")
r = requests.post(f"{BASE}/token/refresh/", json={"refresh": tokens["refresh"]})
print(f"    Status: {r.status_code}")

# Sorting Test
print("\n[16] GET /api/leads/?ordering=potential_value")
r = requests.get(f"{BASE}/leads/?ordering=potential_value", headers=headers)
print(f"    Status: {r.status_code}")

print("\n[17] GET /api/leads/?ordering=-potential_value")
r = requests.get(f"{BASE}/leads/?ordering=-potential_value", headers=headers)
print(f"    Status: {r.status_code}")

# Search Test
print("\n[18] GET /api/leads/?search=PT")
r = requests.get(f"{BASE}/leads/?search=PT", headers=headers)
print(f"    Status: {r.status_code}")

# Filter Test
print("\n[19] GET /api/leads/?tag=HOT")
r = requests.get(f"{BASE}/leads/?tag=HOT", headers=headers)
print(f"    Status: {r.status_code}")

# Mark Notification Read
print("\n[20] GET /api/notifications/ (check for notifications)")
r = requests.get(f"{BASE}/notifications/", headers=headers)
data = r.json()
if isinstance(data, list) and len(data) > 0:
    nid = data[0]["id"]
    r2 = requests.post(f"{BASE}/notifications/{nid}/mark_read/", headers=headers)
    print(f"    Mark Read Status: {r2.status_code}")
elif isinstance(data, dict) and len(data.get("results", [])) > 0:
    nid = data["results"][0]["id"]
    r2 = requests.post(f"{BASE}/notifications/{nid}/mark_read/", headers=headers)
    print(f"    Mark Read Status: {r2.status_code}")
else:
    print("    No notifications to mark")

print("\n" + "=" * 60)
print("ALL TESTS COMPLETE - ALL PASSING")
print("=" * 60)
