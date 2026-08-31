from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("qontak_sales.apps.accounts.urls")),
    path("api/", include("qontak_sales.apps.leads.urls")),
    path("api/", include("qontak_sales.apps.activities.urls")),
    path("api/", include("qontak_sales.apps.notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
