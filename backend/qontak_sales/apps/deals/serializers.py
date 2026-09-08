from rest_framework import serializers
from .models import Deal, ContactDeal, Product, LineItem


class LineItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_code = serializers.CharField(source="product.code", read_only=True)

    class Meta:
        model = LineItem
        fields = [
            "id", "deal", "product", "product_name", "product_code",
            "quantity", "unit_price", "discount", "total_price", "notes",
        ]
        read_only_fields = ["id", "total_price"]
        extra_kwargs = {
            "unit_price": {"required": True},
        }


class ContactDealSerializer(serializers.ModelSerializer):
    contact_name = serializers.SerializerMethodField()
    contact_email = serializers.CharField(source="contact.email", read_only=True, default="")
    contact_job_title = serializers.CharField(source="contact.job_title", read_only=True, default="")

    class Meta:
        model = ContactDeal
        fields = [
            "id", "contact", "contact_name", "contact_email", "contact_job_title",
            "deal", "role", "is_primary", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_contact_name(self, obj):
        return obj.contact.full_name


class DealSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True, default="")
    contact_count = serializers.SerializerMethodField()
    contacts = serializers.SerializerMethodField()
    line_items = LineItemSerializer(many=True, read_only=True)
    total_line_value = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True, default=0)

    class Meta:
        model = Deal
        fields = [
            "id", "company", "company_name", "name", "amount", "stage",
            "probability", "expected_close_date", "actual_close_date",
            "lost_reason", "lost_notes", "competitors", "description",
            "source", "owner", "owner_name",
            "contact_count", "contacts", "line_items", "total_line_value",
            "is_archived", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "amount": {"required": True},
            "expected_close_date": {"required": True},
        }

    def get_contact_count(self, obj):
        return obj.contact_deals.count()

    def get_contacts(self, obj):
        from qontak_sales.apps.companies.serializers import ContactSerializer
        contact_links = obj.contact_deals.select_related("contact")[:10]
        result = []
        for cd in contact_links:
            contact_data = ContactSerializer(cd.contact).data
            contact_data["role_in_deal"] = cd.role
            contact_data["is_primary"] = cd.is_primary
            result.append(contact_data)
        return result


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id", "name", "code", "description", "base_price", "cost",
            "category", "unit", "tax_rate", "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "code": {"required": True},
            "base_price": {"required": True},
            "unit": {"required": True},
        }
