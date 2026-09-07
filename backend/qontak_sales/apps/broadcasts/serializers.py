from rest_framework import serializers
from .models import Broadcast, BroadcastLog


class BroadcastLogSerializer(serializers.ModelSerializer):
    contact_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = BroadcastLog
        fields = [
            "id", "contact", "contact_name", "company_name", "phone_number",
            "status", "error_message", "sent_at",
        ]

    def get_contact_name(self, obj):
        return f"{obj.contact.first_name} {obj.contact.last_name}" if obj.contact else ""

    def get_company_name(self, obj):
        return obj.contact.account.name if obj.contact and obj.contact.account else ""


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
    contact_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=100,
    )
