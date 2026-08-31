from rest_framework import viewsets, permissions
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
