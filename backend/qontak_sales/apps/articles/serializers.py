from rest_framework import serializers

from .models import Article, Category, Tag


def _display_name(user):
    if not user:
        return "—"
    full = user.get_full_name().strip()
    return full or user.username


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


class ArticleListSerializer(serializers.ModelSerializer):
    # Single field for both directions: reads via model property,
    # writes are popped in create/update and resolved to a Category.
    category_name = serializers.CharField(
        max_length=120, required=False, allow_blank=True
    )
    author_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=60),
        write_only=True,
        required=False,
    )
    # Writable on create/update, but excluded from list responses (payload too big).
    content = serializers.CharField(write_only=True, required=False, allow_blank=True)
    is_live = serializers.ReadOnlyField()
    effective_published_at = serializers.ReadOnlyField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "cover_image",
            "cover_image_url",
            "content",
            "status",
            "visibility",
            "is_live",
            "category",
            "category_name",
            "tags",
            "tag_names",
            "author",
            "author_name",
            "updated_by",
            "updated_by_name",
            "view_count",
            "scheduled_publish_at",
            "published_at",
            "effective_published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "author",
            "updated_by",
            "view_count",
            "published_at",
            "created_at",
            "updated_at",
        ]

    def get_author_name(self, obj):
        return _display_name(obj.author)

    def get_updated_by_name(self, obj):
        return _display_name(obj.updated_by)

    def get_cover_image_url(self, obj):
        if not obj.cover_image:
            return None
        url = obj.cover_image.url
        request = self.context.get("request")
        if request:
            try:
                return request.build_absolute_uri(url)
            except Exception:
                pass
        return url

    def validate_category(self, value):
        request = self.context.get("request")
        if value and request and value.company_id != request.user.company_id:
            raise serializers.ValidationError("Category does not belong to your company.")
        return value

    def validate_cover_image(self, value):
        if value:
            content_type = getattr(value, "content_type", "") or ""
            if not content_type.startswith("image/"):
                raise serializers.ValidationError("Only image files are allowed.")
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Image must be smaller than 5MB.")
        return value

    def _sync_tags(self, article, tag_names):
        request = self.context.get("request")
        company = request.user.company if request else article.company
        tags = []
        for raw in tag_names or []:
            name = raw.strip()
            if not name:
                continue
            tag, _ = Tag.objects.get_or_create(company=company, name=name)
            tags.append(tag)
        article.tags.set(tags)

    def _resolve_category(self, validated_data):
        raw = validated_data.pop("category_name", None)
        name = (raw or "").strip()
        if not name:
            return
        request = self.context.get("request")
        company = request.user.company if request else None
        cat = Category.objects.filter(company=company, name=name.strip()).first()
        if not cat:
            if request and request.user.role != "MANAGER":
                raise serializers.ValidationError(
                    {"category_name": "Only managers can create new categories."}
                )
            cat = Category.objects.create(company=company, name=name.strip())
        validated_data["category"] = cat

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        self._resolve_category(validated_data)
        article = super().create(validated_data)
        self._sync_tags(article, tag_names)
        return article

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        self._resolve_category(validated_data)
        article = super().update(instance, validated_data)
        if tag_names is not None:
            self._sync_tags(article, tag_names)
        return article


class ArticleDetailSerializer(ArticleListSerializer):
    # Override: content is readable here (retrieve only).
    content = serializers.CharField(required=False, allow_blank=True)

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields
