from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from qontak_sales.apps.accounts.models import Company


class Category(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="article_categories")
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("company", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Tag(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="article_tags")
    name = models.CharField(max_length=60)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("company", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Article(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("PUBLISHED", "Published"),
    ]
    VISIBILITY_CHOICES = [
        ("INTERNAL", "Internal"),
        ("PUBLIC", "Public"),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="articles")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="articles"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="articles"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="articles")

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    excerpt = models.CharField(max_length=300, blank=True)
    cover_image = models.ImageField(upload_to="articles/covers/", blank=True, null=True)
    content = models.TextField(blank=True, default="")

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="DRAFT")
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default="INTERNAL")
    scheduled_publish_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    view_count = models.PositiveIntegerField(default=0)

    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("company", "slug")
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def is_live(self):
        """Effectively published right now (scheduled time has passed, no cron needed)."""
        if self.status != "PUBLISHED":
            return False
        if self.scheduled_publish_at and self.scheduled_publish_at > timezone.now():
            return False
        return True

    @property
    def effective_published_at(self):
        return self.scheduled_publish_at or self.published_at

    def _generate_unique_slug(self):
        base = slugify(self.title) or "article"
        slug = base
        counter = 2
        while (
            Article.objects.filter(company=self.company, slug=slug)
            .exclude(pk=self.pk)
            .exists()
        ):
            slug = f"{base}-{counter}"
            counter += 1
        return slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)
