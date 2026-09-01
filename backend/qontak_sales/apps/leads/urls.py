from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, dashboard_stats, DashboardExportView

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="lead")

urlpatterns = [
    path("dashboard/stats/", dashboard_stats, name="dashboard-stats"),
    path("dashboard/export/", DashboardExportView.as_view(), name="dashboard-export"),
    path("", include(router.urls)),
]
