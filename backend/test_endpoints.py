import requests
import json

BASE = "http://localhost:8000/api"

print("=" * 60)
print("TESTING QONTAKSALES API ENDPOINTS")
print("=" * 60)

# 1. Test Token Obtain (Login)
print("\n[1] POST /api/token/ (Login)")
try:
    r = requests.post(f"{BASE}/token/", json={"username": "admin", "password": "admin123"})
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        tokens = r.json()
        print(f"    access: {tokens['access'][:50]}...")
        print(f"    refresh: {tokens['refresh'][:50]}...")
        headers = {"Authorization": f"Bearer {tokens['access']}"}
    else:
        print(f"    Response: {r.text}")
        headers = {}
except Exception as e:
    print(f"    ERROR: {e}")
    headers = {}

# 2. Test Profile
print("\n[2] GET /api/auth/profile/")
try:
    r = requests.get(f"{BASE}/auth/profile/", headers=headers)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"    User: {data.get('username')} | Role: {data.get('role')} | Company: {data.get('company_name')}")
    else:
        print(f"    Response: {r.text[:200]}")
except Exception as e:
    print(f"    ERROR: {e}")

# 3. Test Leads List
print("\n[3] GET /api/leads/")
try:
    r = requests.get(f"{BASE}/leads/", headers=headers)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"    Count: {data.get('count', len(data))}")
    else:
        print(f"    Response: {r.text[:200]}")
except Exception as e:
    print(f"    ERROR: {e}")

# 4. Test Create Lead
print("\n[4] POST /api/leads/ (Create Lead)")
lead_data = {
    "name": "PT Test Company",
    "contact_name": "Test Contact",
    "phone_number": "+62 812-9999-0000",
    "email": "test@test.com",
    "company_source": "PT Test",
    "potential_value": "50000000",
    "tag": "HOT",
}
try:
    r = requests.post(f"{BASE}/leads/", json=lead_data, headers=headers)
    print(f"    Status: {r.status_code}")
    if r.status_code in [200, 201]:
        data = r.json()
        print(f"    Created Lead: {data.get('name')} (ID: {data.get('id')})")
        lead_id = data.get("id")
    else:
        print(f"    Response: {r.text[:300]}")
        lead_id = None
except Exception as e:
    print(f"    ERROR: {e}")
    lead_id = None

# 5. Test Create Activity Log
if lead_id:
    print(f"\n[5] POST /api/activities/ (Log for Lead #{lead_id})")
    log_data = {"lead": lead_id, "notes": "Test activity log from API test"}
    try:
        r = requests.post(f"{BASE}/activities/", json=log_data, headers=headers)
        print(f"    Status: {r.status_code}")
        if r.status_code in [200, 201]:
            data = r.json()
            print(f"    Created Log ID: {data.get('id')} | Agent: {data.get('agent_name')}")
        else:
            print(f"    Response: {r.text[:300]}")
    except Exception as e:
        print(f"    ERROR: {e}")

# 6. Test Activities List
print("\n[6] GET /api/activities/")
try:
    r = requests.get(f"{BASE}/activities/", headers=headers)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"    Count: {data.get('count', len(data))}")
    else:
        print(f"    Response: {r.text[:200]}")
except Exception as e:
    print(f"    ERROR: {e}")

# 7. Test Agents List
print("\n[7] GET /api/auth/agents/")
try:
    r = requests.get(f"{BASE}/auth/agents/", headers=headers)
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"    Agents: {len(data)}")
    else:
        print(f"    Response: {r.text[:200]}")
except Exception as e:
    print(f"    ERROR: {e}")

# 8. Test Register
print("\n[8] POST /api/auth/register/")
reg_data = {"name": "New User", "email": "new@test.com", "password": "testpass123", "company_name": "New Company"}
try:
    r = requests.post(f"{BASE}/auth/register/", json=reg_data)
    print(f"    Status: {r.status_code}")
    if r.status_code in [200, 201]:
        print(f"    Response: {r.json()}")
    else:
        print(f"    Response: {r.text[:300]}")
except Exception as e:
    print(f"    ERROR: {e}")

# 9. Test Token Refresh
print("\n[9] POST /api/token/refresh/")
try:
    r = requests.post(f"{BASE}/token/refresh/", json={"refresh": tokens.get("refresh", "")})
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        print(f"    New access token obtained")
    else:
        print(f"    Response: {r.text[:200]}")
except Exception as e:
    print(f"    ERROR: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
