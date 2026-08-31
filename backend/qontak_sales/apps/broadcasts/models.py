from django.db import models
from django.conf import settings


class Broadcast(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("SENDING", "Sending"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    message = models.TextField()
    total_recipients = models.IntegerField(default=0)
    total_sent = models.IntegerField(default=0)
    total_failed = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="DRAFT")
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="broadcasts",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Broadcast #{self.id} - {self.status}"


class BroadcastLog(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SENT", "Sent"),
        ("FAILED", "Failed"),
    ]

    broadcast = models.ForeignKey(
        Broadcast, on_delete=models.CASCADE, related_name="logs"
    )
    lead = models.ForeignKey(
        "leads.Lead", on_delete=models.CASCADE, related_name="broadcast_logs"
    )
    phone_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    error_message = models.TextField(blank=True, null=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Log #{self.id} - {self.phone_number} - {self.status}"
