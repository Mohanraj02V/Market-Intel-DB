import re

filepath = 'backend/accounts/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import IsAdminUser
content = content.replace("from rest_framework.permissions import IsAuthenticated", "from rest_framework.permissions import IsAuthenticated, IsAdminUser")

# 2. Add is_superuser to UserMeView
content = content.replace("'role': getattr(user, 'profile', None) and user.profile.role or 'PRE',", "'role': getattr(user, 'profile', None) and user.profile.role or 'PRE',\n            'is_superuser': user.is_superuser,")

# 3. Change UserViewSet permission
content = content.replace("permission_classes = [IsPRE]", "permission_classes = [IsAdminUser]")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
