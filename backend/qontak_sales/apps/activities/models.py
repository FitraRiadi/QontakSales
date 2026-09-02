from django.db import models
from django.conf import settings


class ActivityLog(models.Model):
    TYPE_CHOICES = [
        ("CALL", "Call"),
        ("EMAIL", "Email"),
        ("MEETING", "Meeting"),
        ("NOTE", "Note"),
        ("FOLLOW_UP", "Follow Up"),
    ]

    lead = models.ForeignKey(
        "leads.Lead", on_delete=models.CASCADE, related_name="logs"
    )
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="activity_logs"
    )
    activity_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="NOTE")
    notes = models.TextField()
    scheduled_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.activity_type} for {self.lead.name} by {self.agent.get_full_name() if self.agent else 'Unknown'}"
