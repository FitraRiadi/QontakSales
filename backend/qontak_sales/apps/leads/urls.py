from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, dashboard_stats, dashboard_export, calendar_events

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="lead")

urlpatterns = [
    path("dashboard/stats/", dashboard_stats, name="dashboard-stats"),
    path("dashboard/export/", dashboard_export, name="dashboard-export"),
    path("calendar/events/", calendar_events, name="calendar-events"),
    path("", include(router.urls)),
]
