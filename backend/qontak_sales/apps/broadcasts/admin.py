from django.contrib import admin
from .models import Broadcast, BroadcastLog


class BroadcastLogInline(admin.TabularInline):
    model = BroadcastLog
    extra = 0
    readonly_fields = ["lead", "phone_number", "status", "error_message", "sent_at"]


@admin.register(Broadcast)
class BroadcastAdmin(admin.ModelAdmin):
    list_display = ["id", "status", "total_recipients", "total_sent", "total_failed", "sent_by", "created_at"]
    list_filter = ["status", "created_at"]
    inlines = [BroadcastLogInline]


@admin.register(BroadcastLog)
class BroadcastLogAdmin(admin.ModelAdmin):
    list_display = ["id", "broadcast", "lead", "phone_number", "status", "sent_at"]
    list_filter = ["status"]
