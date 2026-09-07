from rest_framework import serializers
from .models import BusinessAccount, Contact


class ContactSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)
    full_name = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True, default="")

    class Meta:
        model = Contact
        fields = [
            "id", "account", "account_name", "first_name", "last_name", "full_name",
            "email", "phone", "job_title", "department", "role_in_deal",
            "linkedin_url", "notes", "owner", "owner_name", "is_archived",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_full_name(self, obj):
        return obj.full_name


class BusinessAccountSerializer(serializers.ModelSerializer):
    contacts_count = serializers.IntegerField(read_only=True, default=0)
    deals_count = serializers.IntegerField(read_only=True, default=0)
    total_deal_value = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True, default=0)
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True, default="")

    class Meta:
        model = BusinessAccount
        fields = [
            "id", "name", "industry", "size", "account_type", "website",
            "phone", "email", "address", "city", "country", "postal_code",
            "annual_revenue", "notes", "owner", "owner_name",
            "contacts_count", "deals_count", "total_deal_value",
            "is_archived", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class BusinessAccountDetailSerializer(serializers.ModelSerializer):
    contacts_count = serializers.IntegerField(read_only=True, default=0)
    deals_count = serializers.IntegerField(read_only=True, default=0)
    total_deal_value = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True, default=0)
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True, default="")
    contacts = serializers.SerializerMethodField()
    deals = serializers.SerializerMethodField()

    class Meta:
        model = BusinessAccount
        fields = [
            "id", "name", "industry", "size", "account_type", "website",
            "phone", "email", "address", "city", "country", "postal_code",
            "annual_revenue", "notes", "owner", "owner_name",
            "contacts_count", "deals_count", "total_deal_value",
            "contacts", "deals",
            "is_archived", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_contacts(self, obj):
        contacts = obj.contacts.filter(is_archived=False)[:10]
        return ContactSerializer(contacts, many=True).data

    def get_deals(self, obj):
        from qontak_sales.apps.deals.serializers import DealSerializer
        deals = obj.deals.filter(is_archived=False)[:10]
        return DealSerializer(deals, many=True).data
