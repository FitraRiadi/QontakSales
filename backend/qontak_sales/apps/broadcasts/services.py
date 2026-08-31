import requests
import time
import re
from django.conf import settings


class BroadcastService:
    SENDFAST_URL = "http://127.0.0.1:8001/api/send"

    def clean_phone(self, phone: str) -> str:
        cleaned = re.sub(r"[^0-9]", "", phone)
        if cleaned.startswith("0"):
            cleaned = "62" + cleaned[1:]
        return cleaned

    def send_batch(self, phone_numbers: list[str], message: str) -> dict:
        cleaned = [self.clean_phone(p) for p in phone_numbers]
        try:
            response = requests.post(
                self.SENDFAST_URL,
                json={"to": cleaned, "message": message},
                timeout=60,
            )
            data = response.json()
            if "results" in data:
                return data
            if "errors" in data:
                return {"results": [{"to": p, "status": "error", "error": str(data["errors"])} for p in cleaned]}
            return {"results": [{"to": p, "status": "error", "error": "Unknown response"} for p in cleaned]}
        except requests.exceptions.RequestException as e:
            return {"results": [{"to": p, "status": "error", "error": str(e)} for p in cleaned]}

    def send_to_leads(self, leads: list, message: str) -> list[dict]:
        results = []
        for lead in leads:
            result = self.send_batch([lead.phone_number], message)
            results.append({
                "lead_id": lead.id,
                "phone_number": lead.phone_number,
                "status": result["results"][0]["status"],
                "error": result["results"][0].get("error", ""),
            })
            time.sleep(1)
        return results
