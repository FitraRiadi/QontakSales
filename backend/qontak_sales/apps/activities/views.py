from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        user = self.request.user
        lead_id = self.request.query_params.get("lead_id")
        queryset = ActivityLog.objects.filter(lead__company=user.company)
        if lead_id:
            queryset = queryset.filter(lead_id=lead_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        activity = self.get_object()
        activity.scheduled_at = None
        activity.save(update_fields=["scheduled_at"])
        return Response({"status": "cancelled"})
