from rest_framework.routers import DefaultRouter
from django.urls import include, path

from .views import ArticleViewSet, CategoryViewSet, PublicArticleViewSet, TagViewSet

router = DefaultRouter()
router.register(r"articles", ArticleViewSet, basename="article")
router.register(r"article-categories", CategoryViewSet, basename="article-category")
router.register(r"article-tags", TagViewSet, basename="article-tag")
router.register(r"public-articles", PublicArticleViewSet, basename="public-article")

urlpatterns = [
    path("", include(router.urls)),
]
