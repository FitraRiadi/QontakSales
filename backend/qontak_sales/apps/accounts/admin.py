from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Company, CustomUser

admin.site.register(Company)
admin.site.register(CustomUser, UserAdmin)
