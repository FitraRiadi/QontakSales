from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import BusinessAccount, Contact
from .serializers import BusinessAccountSerializer, BusinessAccountDetailSerializer, ContactSerializer


class BusinessAccountViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessAccountSerializer

    def get_queryset(self):
        user = self.request.user
        qs = BusinessAccount.objects.filter(company=user.company, is_archived=False)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(city__icontains=search)
            )

        industry = self.request.query_params.get("industry")
        if industry:
            qs = qs.filter(industry=industry)

        size = self.request.query_params.get("size")
        if size:
            qs = qs.filter(size=size)

        account_type = self.request.query_params.get("type")
        if account_type:
            qs = qs.filter(account_type=account_type)

        owner = self.request.query_params.get("owner")
        if owner:
            qs = qs.filter(owner_id=owner)

        ordering = self.request.query_params.get("ordering", "-created_at")
        if ordering in ["name", "-name", "created_at", "-created_at", "updated_at", "-updated_at"]:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BusinessAccountDetailSerializer
        return BusinessAccountSerializer

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, owner=self.request.user)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        account = self.get_object()
        account.is_archived = True
        account.save()
        return Response({"message": "Account archived"})

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        account = self.get_object()
        account.is_archived = False
        account.save()
        return Response({"message": "Account restored"})


class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Contact.objects.filter(account__company=user.company, is_archived=False)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(job_title__icontains=search)
            )

        account_id = self.request.query_params.get("account_id")
        if account_id:
            qs = qs.filter(account_id=account_id)

        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role_in_deal=role)

        ordering = self.request.query_params.get("ordering", "-created_at")
        if ordering in ["first_name", "-first_name", "last_name", "-last_name", "created_at", "-created_at"]:
            qs = qs.order_by(ordering)

        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        contact = self.get_object()
        contact.is_archived = True
        contact.save()
        return Response({"message": "Contact archived"})

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        contact = self.get_object()
        contact.is_archived = False
        contact.save()
        return Response({"message": "Contact restored"})
