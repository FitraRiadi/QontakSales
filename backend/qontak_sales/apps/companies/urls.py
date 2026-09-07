from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BusinessAccountViewSet, ContactViewSet

router = DefaultRouter()
router.register(r"accounts", BusinessAccountViewSet, basename="account")
router.register(r"contacts", ContactViewSet, basename="contact")

urlpatterns = [
    path("", include(router.urls)),
]
