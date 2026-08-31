from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, dashboard_stats

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="lead")

urlpatterns = [
    path("dashboard/stats/", dashboard_stats, name="dashboard-stats"),
    path("", include(router.urls)),
]
