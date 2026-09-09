from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from qontak_sales.apps.accounts.permissions import IsOwnerOrManager


class ActivityLogViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsOwnerOrManager]

    def get_queryset(self):
        user = self.request.user
        deal_id = self.request.query_params.get("deal_id")
        account_id = self.request.query_params.get("account_id")
        queryset = ActivityLog.objects.filter(deal__company__company=user.company)
        if user.role == "AGENT":
            queryset = queryset.filter(agent=user)
        if deal_id:
            queryset = queryset.filter(deal_id=deal_id)
        if account_id:
            queryset = queryset.filter(deal__company_id=account_id)
        return queryset

    def perform_create(self, serializer):
        activity = serializer.save(agent=self.request.user)
        from django.contrib.auth import get_user_model
        from qontak_sales.apps.notifications.views import create_notification
        User = get_user_model()
        managers = User.objects.filter(company=self.request.user.company, role="MANAGER")
        for mgr in managers:
            if mgr != self.request.user:
                create_notification(mgr, "New Activity Scheduled", f"{activity.get_activity_type_display()} for deal '{activity.deal.name}' scheduled by {self.request.user.get_full_name() or self.request.user.username}", f"/deals/{activity.deal.id}")
        if activity.deal.owner and activity.deal.owner != self.request.user:
            create_notification(activity.deal.owner, "New Activity Scheduled", f"{activity.get_activity_type_display()} for deal '{activity.deal.name}' scheduled by {self.request.user.get_full_name() or self.request.user.username}", f"/deals/{activity.deal.id}")

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        activity = self.get_object()
        activity.scheduled_at = None
        activity.save(update_fields=["scheduled_at"])
        return Response({"status": "cancelled"})
