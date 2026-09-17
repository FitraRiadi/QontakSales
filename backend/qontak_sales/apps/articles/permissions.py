from rest_framework.permissions import BasePermission


class IsAuthorOrManager(BasePermission):
    """Shared list scoping is done in get_queryset. Write only for author or manager."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == "MANAGER":
            return True
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return getattr(obj, "author", None) == request.user
