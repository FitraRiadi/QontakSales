from django.db import models
from django.conf import settings


class Lead(models.Model):
    STAGE_CHOICES = [
        ("NEW", "Prospek Baru"),
        ("CONTACTED", "Hubungi"),
        ("NEGOTIATION", "Presentasi/Negosiasi"),
        ("WON", "Won"),
        ("LOST", "Lost"),
    ]

    TAG_CHOICES = [
        ("HOT", "Hot"),
        ("COLD", "Cold"),
    ]

    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="leads"
    )
    name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    company_source = models.CharField(max_length=255, blank=True)
    potential_value = models.DecimalField(max_digits=12, decimal_places=2)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default="NEW")
    tag = models.CharField(max_length=10, choices=TAG_CHOICES, default="COLD")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_leads",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.contact_name}"
