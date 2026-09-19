from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission

from rest_framework import viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from .permissions import IsPRE

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(user, 'profile', None) and user.profile.role or 'PRE',
            'is_superuser': user.is_superuser,
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]
