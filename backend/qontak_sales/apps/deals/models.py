from django.db import models
from django.conf import settings


class Deal(models.Model):
    STAGE_CHOICES = [
        ("QUALIFICATION", "Qualification"),
        ("DISCOVERY", "Discovery & Demo"),
        ("PROPOSAL", "Proposal Sent"),
        ("NEGOTIATION", "Negotiation"),
        ("CLOSING", "Closing"),
        ("WON", "Won"),
        ("LOST", "Lost"),
    ]

    LOST_REASON_CHOICES = [
        ("PRICE", "Price"),
        ("COMPETITOR", "Competitor"),
        ("TIMING", "Timing"),
        ("BUDGET", "Budget"),
        ("NO_DECISION", "No Decision"),
        ("WRONG_FIT", "Wrong Fit"),
        ("OTHER", "Other"),
    ]

    company = models.ForeignKey(
        "companies.BusinessAccount", on_delete=models.CASCADE, related_name="deals"
    )
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default="QUALIFICATION")
    probability = models.IntegerField(default=10)
    expected_close_date = models.DateField(null=True, blank=True)
    actual_close_date = models.DateField(null=True, blank=True)
    lost_reason = models.CharField(max_length=20, choices=LOST_REASON_CHOICES, blank=True, default="")
    lost_notes = models.TextField(blank=True, default="")
    competitors = models.TextField(blank=True, default="")
    description = models.TextField(blank=True, default="")
    source = models.CharField(max_length=50, blank=True, default="")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="owned_deals"
    )
    contacts = models.ManyToManyField("companies.Contact", through="ContactDeal", blank=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def contacts_count(self):
        return self.contact_deals.count()

    @property
    def total_line_value(self):
        return self.line_items.aggregate(total=models.Sum("total_price"))["total"] or 0


class ContactDeal(models.Model):
    contact = models.ForeignKey(
        "companies.Contact", on_delete=models.CASCADE, related_name="contact_deals"
    )
    deal = models.ForeignKey(
        "Deal", on_delete=models.CASCADE, related_name="contact_deals"
    )
    role = models.CharField(max_length=50, blank=True, default="")
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["contact", "deal"]

    def __str__(self):
        return f"{self.contact} -> {self.deal}"


class Product(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    ]

    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="products"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, default="")
    description = models.TextField(blank=True, default="")
    base_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    category = models.CharField(max_length=100, blank=True, default="")
    unit = models.CharField(max_length=50, blank=True, default="pcs")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class LineItem(models.Model):
    deal = models.ForeignKey(
        "Deal", on_delete=models.CASCADE, related_name="line_items"
    )
    product = models.ForeignKey(
        "Product", on_delete=models.CASCADE, related_name="line_items"
    )
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    discount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"

    def save(self, *args, **kwargs):
        self.total_price = (self.unit_price * self.quantity) - self.discount
        super().save(*args, **kwargs)
