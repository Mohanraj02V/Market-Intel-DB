import re

filepath = 'backend/accounts/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(user, 'profile', None) and user.profile.role or 'PRE',
        })"""

content = re.sub(r"        return Response\(\{.*?'last_name': user\.last_name,\s*\}\)", replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated accounts/views.py")
