from django.db import models
from django.conf import settings


class ActivityLog(models.Model):
    lead = models.ForeignKey(
        "leads.Lead", on_delete=models.CASCADE, related_name="logs"
    )
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activity_logs"
    )
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Log for {self.lead.name} by {self.agent.get_full_name()}"
