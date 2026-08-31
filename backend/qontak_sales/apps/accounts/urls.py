from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, ProfileView, AgentViewSet, SettingsView,
    ChangePasswordView, SwitchAccountView, TeamMembersView, EmailTokenObtainPairView,
)

router = DefaultRouter()
router.register(r"agents", AgentViewSet, basename="agent")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path("auth/settings/", SettingsView.as_view(), name="settings"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("auth/switch-account/", SwitchAccountView.as_view(), name="switch-account"),
    path("auth/team/", TeamMembersView.as_view(), name="team-members"),
    path("", include(router.urls)),
]
