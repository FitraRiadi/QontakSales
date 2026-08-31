from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import Broadcast, BroadcastLog
from .serializers import BroadcastSerializer, BroadcastCreateSerializer, BroadcastLogSerializer
from .services import BroadcastService
from qontak_sales.apps.leads.models import Lead


class BroadcastViewSet(viewsets.ModelViewSet):
    queryset = Broadcast.objects.all()
    serializer_class = BroadcastSerializer

    def get_queryset(self):
        return Broadcast.objects.filter(sent_by=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = BroadcastCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data["message"]
        lead_ids = serializer.validated_data["lead_ids"]

        leads = Lead.objects.filter(id__in=lead_ids)

        if request.user.role == "AGENT":
            leads = leads.filter(assigned_to=request.user)

        if not leads.exists():
            return Response({"error": "No leads found"}, status=status.HTTP_400_BAD_REQUEST)

        broadcast = Broadcast.objects.create(
            message=message,
            total_recipients=leads.count(),
            status="SENDING",
            sent_by=request.user,
        )

        logs = []
        for lead in leads:
            phone = lead.phone_number
            formatted_message = message.replace("{name}", lead.contact_name)
            formatted_message = formatted_message.replace("{phone}", lead.phone_number)
            formatted_message = formatted_message.replace("{company}", lead.company_source or "")
            formatted_message = formatted_message.replace("{value}", str(lead.potential_value))

            log = BroadcastLog.objects.create(
                broadcast=broadcast,
                lead=lead,
                phone_number=phone,
                status="PENDING",
            )
            logs.append({"log": log, "message": formatted_message, "phone": phone})

        service = BroadcastService()
        sent_count = 0
        failed_count = 0

        for item in logs:
            result = service.send_batch([item["phone"]], item["message"])
            log = item["log"]

            if result["results"][0]["status"] == "success":
                log.status = "SENT"
                log.sent_at = timezone.now()
                sent_count += 1
            else:
                log.status = "FAILED"
                log.error_message = result["results"][0].get("error", "Unknown error")
                failed_count += 1

            log.save()

        broadcast.total_sent = sent_count
        broadcast.total_failed = failed_count
        broadcast.status = "COMPLETED" if failed_count == 0 else "COMPLETED"
        broadcast.sent_at = timezone.now()
        broadcast.save()

        return Response(BroadcastSerializer(broadcast).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def history(self, request):
        broadcasts = Broadcast.objects.filter(sent_by=request.user)
        page = self.paginate_queryset(broadcasts)
        if page is not None:
            serializer = BroadcastSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = BroadcastSerializer(broadcasts, many=True)
        return Response(serializer.data)
