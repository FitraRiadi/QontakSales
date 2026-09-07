from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DealViewSet, ContactDealViewSet, ProductViewSet, LineItemViewSet

router = DefaultRouter()
router.register(r"deals", DealViewSet, basename="deal")
router.register(r"contact-deals", ContactDealViewSet, basename="contact-deal")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"line-items", LineItemViewSet, basename="line-item")

urlpatterns = [
    path("", include(router.urls)),
]
