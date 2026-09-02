from rest_framework import serializers
from django.utils import timezone
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(
        source="agent.get_full_name", read_only=True
    )
    lead_name = serializers.CharField(
        source="lead.name", read_only=True
    )

    class Meta:
        model = ActivityLog
        fields = ["id", "lead", "lead_name", "agent", "agent_name", "activity_type", "notes", "scheduled_at", "is_completed", "created_at"]
        read_only_fields = ["id", "agent", "created_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.scheduled_at:
            data["scheduled_at"] = timezone.localtime(instance.scheduled_at).isoformat()
        if instance.created_at:
            data["created_at"] = timezone.localtime(instance.created_at).isoformat()
        return data
