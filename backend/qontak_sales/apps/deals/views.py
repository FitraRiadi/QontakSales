from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.db.models import Q
from .models import Deal, ContactDeal, Product, LineItem
from .serializers import (
    DealSerializer, ContactDealSerializer,
    ProductSerializer, LineItemSerializer,
)


class DealViewSet(viewsets.ModelViewSet):
    serializer_class = DealSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Deal.objects.filter(company__company=user.company, is_archived=False)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(company__name__icontains=search) |
                Q(description__icontains=search)
            )

        stage = self.request.query_params.get("stage")
        if stage:
            qs = qs.filter(stage=stage)

        company_id = self.request.query_params.get("company_id")
        if company_id:
            qs = qs.filter(company_id=company_id)

        owner = self.request.query_params.get("owner")
        if owner:
            qs = qs.filter(owner_id=owner)

        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(expected_close_date__gte=date_from)
        if date_to:
            qs = qs.filter(expected_close_date__lte=date_to)

        ordering = self.request.query_params.get("ordering", "-created_at")
        allowed_orderings = [
            "name", "-name", "amount", "-amount", "stage", "-stage",
            "expected_close_date", "-expected_close_date",
            "created_at", "-created_at", "probability", "-probability",
        ]
        if ordering in allowed_orderings:
            qs = qs.order_by(ordering)

        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def move_stage(self, request, pk=None):
        deal = self.get_object()
        new_stage = request.data.get("stage")
        valid_stages = [s[0] for s in Deal.STAGE_CHOICES]
        if new_stage not in valid_stages:
            return Response({"error": "Invalid stage"}, status=400)

        deal.stage = new_stage
        if new_stage == "WON":
            deal.probability = 100
            from django.utils import timezone
            deal.actual_close_date = timezone.now().date()
        elif new_stage == "LOST":
            deal.probability = 0
            deal.lost_reason = request.data.get("lost_reason", "")
            deal.lost_notes = request.data.get("lost_notes", "")
            from django.utils import timezone
            deal.actual_close_date = timezone.now().date()
        elif new_stage == "QUALIFICATION":
            deal.probability = 10
        elif new_stage == "DISCOVERY":
            deal.probability = 30
        elif new_stage == "PROPOSAL":
            deal.probability = 50
        elif new_stage == "NEGOTIATION":
            deal.probability = 70
        elif new_stage == "CLOSING":
            deal.probability = 90

        deal.save()
        return Response(DealSerializer(deal).data)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        deal = self.get_object()
        deal.is_archived = True
        deal.save()
        return Response({"message": "Deal archived"})

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        deal = self.get_object()
        deal.is_archived = False
        deal.save()
        return Response({"message": "Deal restored"})

    @action(detail=False, methods=["get"])
    def pipeline(self, request):
        user = request.user
        deals = Deal.objects.filter(
            company__company=user.company, is_archived=False
        ).exclude(stage__in=["WON", "LOST"])

        pipeline_data = {}
        for stage_code, stage_name in Deal.STAGE_CHOICES:
            if stage_code in ["WON", "LOST"]:
                continue
            stage_deals = deals.filter(stage=stage_code)
            pipeline_data[stage_code] = {
                "label": stage_name,
                "deals": DealSerializer(stage_deals, many=True).data,
                "count": stage_deals.count(),
                "total_value": stage_deals.aggregate(total=models.Sum("amount"))["total"] or 0,
            }

        won_deals = Deal.objects.filter(
            company__company=user.company, is_archived=False, stage="WON"
        )
        lost_deals = Deal.objects.filter(
            company__company=user.company, is_archived=False, stage="LOST"
        )

        pipeline_data["WON"] = {
            "label": "Won",
            "deals": DealSerializer(won_deals, many=True).data,
            "count": won_deals.count(),
            "total_value": won_deals.aggregate(total=models.Sum("amount"))["total"] or 0,
        }
        pipeline_data["LOST"] = {
            "label": "Lost",
            "deals": DealSerializer(lost_deals, many=True).data,
            "count": lost_deals.count(),
            "total_value": lost_deals.aggregate(total=models.Sum("amount"))["total"] or 0,
        }

        return Response(pipeline_data)


class ContactDealViewSet(viewsets.ModelViewSet):
    serializer_class = ContactDealSerializer

    def get_queryset(self):
        qs = ContactDeal.objects.all()
        deal_id = self.request.query_params.get("deal_id")
        if deal_id:
            qs = qs.filter(deal_id=deal_id)
        contact_id = self.request.query_params.get("contact_id")
        if contact_id:
            qs = qs.filter(contact_id=contact_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Product.objects.filter(company=user.company)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(code__icontains=search) |
                Q(category__icontains=search)
            )

        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class LineItemViewSet(viewsets.ModelViewSet):
    serializer_class = LineItemSerializer

    def get_queryset(self):
        qs = LineItem.objects.all()
        deal_id = self.request.query_params.get("deal_id")
        if deal_id:
            qs = qs.filter(deal_id=deal_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()
        deal = serializer.instance.deal
        deal.amount = deal.line_items.aggregate(
            total=models.Sum("total_price")
        )["total"] or 0
        deal.save()

    def perform_update(self, serializer):
        serializer.save()
        deal = serializer.instance.deal
        deal.amount = deal.line_items.aggregate(
            total=models.Sum("total_price")
        )["total"] or 0
        deal.save()

    def perform_destroy(self, instance):
        deal = instance.deal
        instance.delete()
        deal.amount = deal.line_items.aggregate(
            total=models.Sum("total_price")
        )["total"] or 0
        deal.save()
