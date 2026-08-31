from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "contact_name", "phone_number", "email", "company_source"]
    ordering_fields = ["name", "potential_value", "created_at", "stage", "tag"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        queryset = Lead.objects.filter(company=user.company)
        if user.role == "AGENT":
            queryset = queryset.filter(assigned_to=user)

        archived = self.request.query_params.get("archived")
        if archived == "true":
            queryset = queryset.filter(is_archived=True)
        else:
            queryset = queryset.filter(is_archived=False)

        stage = self.request.query_params.get("stage")
        tag = self.request.query_params.get("tag")
        assigned_to = self.request.query_params.get("assigned_to")
        if stage:
            queryset = queryset.filter(stage=stage)
        if tag:
            queryset = queryset.filter(tag=tag)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        return queryset

    def get_object(self):
        pk = self.kwargs.get("pk")
        return Lead.objects.get(pk=pk)

    def perform_create(self, serializer):
        lead = serializer.save(
            company=self.request.user.company,
            assigned_to=self.request.user,
        )
        from qontak_sales.apps.notifications.models import Notification
        Notification.objects.create(
            user=self.request.user,
            title="New Lead Created",
            message=f"Lead '{lead.name}' has been added to your pipeline.",
            link=f"/leads/{lead.id}",
        )

    def destroy(self, request, *args, **kwargs):
        if request.user.role == "AGENT":
            return Response({"error": "Agents cannot delete leads"}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        lead = self.get_object()
        if request.user.role == "AGENT" and lead.assigned_to != request.user:
            return Response({"error": "You can only archive your own leads"}, status=403)
        lead.is_archived = True
        lead.save()
        return Response({"message": "Lead archived", "lead": LeadSerializer(lead).data})

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        lead = self.get_object()
        if request.user.role == "AGENT" and lead.assigned_to != request.user:
            return Response({"error": "You can only restore your own leads"}, status=403)
        lead.is_archived = False
        lead.save()
        return Response({"message": "Lead restored", "lead": LeadSerializer(lead).data})

    @action(detail=True, methods=["post"])
    def move_stage(self, request, pk=None):
        lead = self.get_object()
        new_stage = request.data.get("stage")
        if new_stage not in dict(Lead.STAGE_CHOICES):
            return Response({"error": "Invalid stage"}, status=400)
        old_stage = lead.get_stage_display()
        lead.stage = new_stage
        lead.save()
        from qontak_sales.apps.notifications.models import Notification
        Notification.objects.create(
            user=request.user,
            title="Lead Stage Updated",
            message=f"'{lead.name}' moved from {old_stage} to {lead.get_stage_display()}.",
            link=f"/leads/{lead.id}",
        )
        return Response(LeadSerializer(lead).data)


@api_view(["GET"])
def dashboard_stats(request):
    user = request.user
    if user.role == "AGENT":
        leads = Lead.objects.filter(company=user.company, assigned_to=user, is_archived=False)
    else:
        leads = Lead.objects.filter(company=user.company, is_archived=False)
    total_revenue = leads.filter(stage="WON").aggregate(total=Sum("potential_value"))["total"] or 0
    total_leads = leads.count()
    won_count = leads.filter(stage="WON").count()
    lost_count = leads.filter(stage="LOST").count()
    closed_count = won_count + lost_count
    win_rate = round((won_count / closed_count * 100) if closed_count > 0 else 0, 1)
    active_leads = leads.exclude(stage__in=["WON", "LOST"]).count()

    stage_dist = []
    for stage_code, stage_label in Lead.STAGE_CHOICES:
        count = leads.filter(stage=stage_code).count()
        stage_dist.append({"stage": stage_label, "count": count})

    monthly_data = []
    from django.utils import timezone
    from django.db.models.functions import TruncMonth
    monthly = (
        leads.filter(stage="WON")
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(revenue=Sum("potential_value"), count=Count("id"))
        .order_by("month")[:12]
    )
    for m in monthly:
        monthly_data.append({
            "month": m["month"].strftime("%b %Y"),
            "revenue": float(m["revenue"]),
            "count": m["count"],
        })

    from django.contrib.auth import get_user_model
    User = get_user_model()
    agents = User.objects.filter(company=user.company, role="AGENT")
    leaderboard = []
    for agent in agents:
        agent_won = leads.filter(assigned_to=agent, stage="WON")
        agent_revenue = agent_won.aggregate(total=Sum("potential_value"))["total"] or 0
        leaderboard.append({
            "name": agent.get_full_name() or agent.username,
            "deals": agent_won.count(),
            "revenue": float(agent_revenue),
        })
    leaderboard.sort(key=lambda x: x["revenue"], reverse=True)

    return Response({
        "total_revenue": float(total_revenue),
        "win_rate": win_rate,
        "active_leads": active_leads,
        "total_leads": total_leads,
        "won_count": won_count,
        "lost_count": lost_count,
        "stage_distribution": stage_dist,
        "monthly_revenue": monthly_data,
        "leaderboard": leaderboard[:10],
    })
