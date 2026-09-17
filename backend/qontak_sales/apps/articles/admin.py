from django.contrib import admin

from .models import Article, Category, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "created_at")
    list_filter = ("company",)
    search_fields = ("name",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "created_at")
    list_filter = ("company",)
    search_fields = ("name",)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "author",
        "status",
        "visibility",
        "view_count",
        "is_archived",
        "created_at",
    )
    list_filter = ("company", "status", "visibility", "is_archived")
    search_fields = ("title", "excerpt")
    prepopulated_fields = {"slug": ("title",)}
