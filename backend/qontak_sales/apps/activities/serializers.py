from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(
        source="agent.get_full_name", read_only=True
    )

    class Meta:
        model = ActivityLog
        fields = ["id", "lead", "agent", "agent_name", "notes", "created_at"]
        read_only_fields = ["id", "agent", "created_at"]
