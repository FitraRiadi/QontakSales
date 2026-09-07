from django.db import models
from django.conf import settings


class BusinessAccount(models.Model):
    INDUSTRY_CHOICES = [
        ("TECH", "Technology"),
        ("FINANCE", "Finance"),
        ("HEALTH", "Healthcare"),
        ("EDUCATION", "Education"),
        ("RETAIL", "Retail"),
        ("MANUFACTURING", "Manufacturing"),
        ("REAL_ESTATE", "Real Estate"),
        ("CONSULTING", "Consulting"),
        ("OTHER", "Other"),
    ]

    SIZE_CHOICES = [
        ("1-10", "1-10 employees"),
        ("11-50", "11-50 employees"),
        ("51-200", "51-200 employees"),
        ("201-500", "201-500 employees"),
        ("500+", "500+ employees"),
    ]

    TYPE_CHOICES = [
        ("PROSPECT", "Prospect"),
        ("CUSTOMER", "Customer"),
        ("PARTNER", "Partner"),
        ("VENDOR", "Vendor"),
    ]

    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="business_accounts"
    )
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=20, choices=INDUSTRY_CHOICES, blank=True, default="")
    size = models.CharField(max_length=20, choices=SIZE_CHOICES, blank=True, default="")
    account_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="PROSPECT")
    website = models.URLField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    address = models.TextField(blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="Indonesia")
    postal_code = models.CharField(max_length=10, blank=True, default="")
    annual_revenue = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="owned_accounts"
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Business Accounts"

    def __str__(self):
        return self.name

    @property
    def contacts_count(self):
        return self.contacts.count()

    @property
    def deals_count(self):
        return self.deals.count()

    @property
    def total_deal_value(self):
        return self.deals.aggregate(total=models.Sum("amount"))["total"] or 0


class Contact(models.Model):
    ROLE_CHOICES = [
        ("DECISION_MAKER", "Decision Maker"),
        ("CHAMPION", "Champion"),
        ("TECH_EVALUATOR", "Technical Evaluator"),
        ("INFLUENCER", "Influencer"),
        ("BLOCKER", "Blocker"),
        ("USER", "End User"),
        ("OTHER", "Other"),
    ]

    account = models.ForeignKey(
        BusinessAccount, on_delete=models.CASCADE, related_name="contacts"
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    job_title = models.CharField(max_length=100, blank=True, default="")
    department = models.CharField(max_length=100, blank=True, default="")
    role_in_deal = models.CharField(max_length=20, choices=ROLE_CHOICES, default="OTHER")
    linkedin_url = models.URLField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="owned_contacts"
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
