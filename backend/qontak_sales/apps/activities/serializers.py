from rest_framework import serializers
from django.utils import timezone
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(
        source="agent.get_full_name", read_only=True
    )
    deal_name = serializers.CharField(
        source="deal.name", read_only=True
    )
    activity_type_display = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ["id", "deal", "deal_name", "agent", "agent_name", "activity_type", "activity_type_display", "notes", "scheduled_at", "is_completed", "created_at"]
        read_only_fields = ["id", "agent", "created_at"]

    def get_activity_type_display(self, obj):
        return obj.get_activity_type_display()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.scheduled_at:
            data["scheduled_at"] = timezone.localtime(instance.scheduled_at).isoformat()
        if instance.created_at:
            data["created_at"] = timezone.localtime(instance.created_at).isoformat()
        return data
