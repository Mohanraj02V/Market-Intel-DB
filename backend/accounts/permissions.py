from rest_framework import permissions

class IsPRE(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.role == 'PRE'
        )

class IsLQ(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.role == 'LQ'
        )

class IsPREOrLQ(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.role in ['PRE', 'LQ']
        )
