from rest_framework.permissions import BasePermission


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "MANAGER"


class IsManagerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == "MANAGER"


class IsOwnerOrManager(BasePermission):
    """Object-level: agent can only modify objects they own. Managers can modify any."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == "MANAGER":
            return True
        owner = getattr(obj, "owner", None) or getattr(obj, "agent", None) or getattr(obj, "sent_by", None)
        return owner == request.user
