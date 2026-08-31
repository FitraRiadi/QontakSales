from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(
        source="assigned_to.get_full_name", read_only=True
    )

    class Meta:
        model = Lead
        fields = [
            "id",
            "name",
            "contact_name",
            "phone_number",
            "email",
            "company_source",
            "potential_value",
            "stage",
            "tag",
            "assigned_to",
            "assigned_to_name",
            "address",
            "is_archived",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
