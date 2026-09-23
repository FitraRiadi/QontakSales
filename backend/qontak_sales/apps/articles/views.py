from django.db.models import F, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from qontak_sales.apps.accounts.permissions import IsManagerOrReadOnly

from .models import Article, Category, Tag
from .permissions import IsAuthorOrManager
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    CategorySerializer,
    TagSerializer,
)

MANAGER_ONLY_ACTIONS = {"publish", "unpublish", "schedule"}
ORDERING_WHITELIST = [
    "created_at",
    "-created_at",
    "updated_at",
    "-updated_at",
    "published_at",
    "-published_at",
    "view_count",
    "-view_count",
    "title",
    "-title",
]


def live_filter(qs):
    now = timezone.now()
    return qs.filter(status="PUBLISHED").filter(
        Q(scheduled_publish_at__isnull=True) | Q(scheduled_publish_at__lte=now)
    )


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        qs = Category.objects.filter(company=self.request.user.company)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        qs = Tag.objects.filter(company=self.request.user.company)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class ArticleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthorOrManager]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ArticleDetailSerializer
        return ArticleListSerializer

    def get_queryset(self):
        user = self.request.user
        show_archived = self.request.query_params.get("archived", "false") == "true"
        qs = Article.objects.filter(company=user.company, is_archived=show_archived)
        qs = qs.select_related("category", "author", "updated_by").prefetch_related("tags")
        if user.role != "MANAGER":
            qs = qs.filter(author=user)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(excerpt__icontains=search)
                | Q(content__icontains=search)
            )

        status_param = self.request.query_params.get("status")
        if status_param in ("DRAFT", "PUBLISHED"):
            qs = qs.filter(status=status_param)

        visibility = self.request.query_params.get("visibility")
        if visibility in ("INTERNAL", "PUBLIC"):
            qs = qs.filter(visibility=visibility)

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category_id=category)

        tag = self.request.query_params.get("tag")
        if tag:
            qs = qs.filter(tags__name=tag)

        ordering = self.request.query_params.get("ordering", "-created_at")
        if ordering in ORDERING_WHITELIST:
            qs = qs.order_by(ordering)

        return qs.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        extra = {"company": user.company, "author": user}
        if user.role != "MANAGER":
            # Agents can only save drafts; publish decision belongs to managers.
            extra["status"] = "DRAFT"
            extra["scheduled_publish_at"] = None
            extra["published_at"] = None
        serializer.save(**extra)

    def perform_update(self, serializer):
        user = self.request.user
        validated = serializer.validated_data
        if user.role != "MANAGER":
            # Strip publish-related fields from agent writes.
            validated.pop("status", None)
            validated.pop("scheduled_publish_at", None)
            validated.pop("published_at", None)
        serializer.save(updated_by=user)

    def retrieve(self, request, *args, **kwargs):
        article = self.get_object()
        Article.objects.filter(pk=article.pk).update(view_count=F("view_count") + 1)
        article.refresh_from_db()
        serializer = self.get_serializer(article)
        return Response(serializer.data)

    def _require_manager(self, request):
        if request.user.role != "MANAGER":
            return Response(
                {"detail": "Only managers can publish articles."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        denied = self._require_manager(request)
        if denied:
            return denied
        article = self.get_object()
        article.status = "PUBLISHED"
        article.scheduled_publish_at = None
        article.published_at = timezone.now()
        article.updated_by = request.user
        article.save()
        return Response({"message": "Article published"})

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        denied = self._require_manager(request)
        if denied:
            return denied
        article = self.get_object()
        article.status = "DRAFT"
        article.scheduled_publish_at = None
        article.updated_by = request.user
        article.save()
        return Response({"message": "Article unpublished"})

    @action(detail=True, methods=["post"])
    def schedule(self, request, pk=None):
        denied = self._require_manager(request)
        if denied:
            return denied
        scheduled_at = request.data.get("scheduled_publish_at")
        if not scheduled_at:
            return Response(
                {"scheduled_publish_at": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        article = self.get_object()
        article.status = "PUBLISHED"
        article.scheduled_publish_at = scheduled_at
        article.published_at = None
        article.updated_by = request.user
        article.save()
        return Response({"message": "Article publish scheduled"})

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        article = self.get_object()
        article.is_archived = True
        article.updated_by = request.user
        article.save()
        return Response({"message": "Article archived"})

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        qs = Article.objects.filter(company=request.user.company, pk=pk)
        if request.user.role != "MANAGER":
            qs = qs.filter(author=request.user)
        article = qs.first()
        if not article:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        article.is_archived = False
        article.updated_by = request.user
        article.save()
        return Response({"message": "Article restored"})

    @action(
        detail=False,
        methods=["post"],
        parser_classes=[MultiPartParser, FormParser],
        url_path="upload-image",
    )
    def upload_image(self, request):
        image = request.data.get("image")
        if not image:
            return Response(
                {"image": ["No image file provided."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not image.content_type.startswith("image/"):
            return Response(
                {"image": ["Only image files are allowed."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if image.size > 5 * 1024 * 1024:
            return Response(
                {"image": ["Image must be smaller than 5MB."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from django.core.files.storage import default_storage

        path = default_storage.save(f"articles/content/{image.name}", image)
        url = default_storage.url(path)
        request_url = request.build_absolute_uri(url)
        return Response({"url": request_url}, status=status.HTTP_201_CREATED)


class PublicArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """Public blog: published + public + live articles across companies."""

    serializer_class = ArticleDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "list":
            return ArticleListSerializer
        return ArticleDetailSerializer

    def get_queryset(self):
        qs = live_filter(Article.objects.filter(visibility="PUBLIC", is_archived=False))
        qs = qs.select_related("category", "author").prefetch_related("tags")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(excerpt__icontains=search)
                | Q(content__icontains=search)
            )
        ordering = self.request.query_params.get("ordering", "-published_at")
        if ordering in ORDERING_WHITELIST:
            qs = qs.order_by(ordering)
        return qs.distinct()

    def retrieve(self, request, *args, **kwargs):
        article = self.get_object()
        Article.objects.filter(pk=article.pk).update(view_count=F("view_count") + 1)
        article.refresh_from_db()
        serializer = self.get_serializer(article)
        return Response(serializer.data)
