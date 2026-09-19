import re

filepath = 'backend/accounts/urls.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

imports = """from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserMeView, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
"""

content = content.replace("from django.urls import path\nfrom rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView\nfrom .views import UserMeView", imports)

content = content.replace("urlpatterns = [", "urlpatterns = [\n    path('', include(router.urls)),")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
