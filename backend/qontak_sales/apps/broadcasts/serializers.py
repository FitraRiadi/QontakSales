from rest_framework import serializers
from .models import Broadcast, BroadcastLog


class BroadcastLogSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source="lead.contact_name", read_only=True)
    company_name = serializers.CharField(source="lead.company_source", read_only=True)

    class Meta:
        model = BroadcastLog
        fields = [
            "id", "lead", "lead_name", "company_name", "phone_number",
            "status", "error_message", "sent_at",
        ]


class BroadcastSerializer(serializers.ModelSerializer):
    logs = BroadcastLogSerializer(many=True, read_only=True)
    sent_by_name = serializers.CharField(source="sent_by.get_full_name", read_only=True)
    sent_by_role = serializers.CharField(source="sent_by.role", read_only=True)

    class Meta:
        model = Broadcast
        fields = [
            "id", "message", "total_recipients", "total_sent", "total_failed",
            "status", "sent_by", "sent_by_name", "sent_by_role", "created_at", "sent_at", "logs",
        ]
        read_only_fields = ["id", "total_recipients", "total_sent", "total_failed", "status", "sent_at", "created_at"]


class BroadcastCreateSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4096)
    lead_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=100,
    )
