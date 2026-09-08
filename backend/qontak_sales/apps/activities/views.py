from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        user = self.request.user
        deal_id = self.request.query_params.get("deal_id")
        queryset = ActivityLog.objects.filter(deal__company=user.company)
        if deal_id:
            queryset = queryset.filter(deal_id=deal_id)
        return queryset

    def perform_create(self, serializer):
        activity = serializer.save(agent=self.request.user)
        # Notify managers about new activity
        from django.contrib.auth import get_user_model
        from qontak_sales.apps.notifications.views import create_notification
        User = get_user_model()
        managers = User.objects.filter(company=self.request.user.company, role="MANAGER")
        for mgr in managers:
            if mgr != self.request.user:
                create_notification(mgr, "New Activity Scheduled", f"{activity.get_activity_type_display()} for deal '{activity.deal.name}' scheduled by {self.request.user.get_full_name() or self.request.user.username}", f"/deals/{activity.deal.id}")

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        activity = self.get_object()
        activity.scheduled_at = None
        activity.save(update_fields=["scheduled_at"])
        return Response({"status": "cancelled"})
