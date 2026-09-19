import re

filepath = 'backend/prospects/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add get_permissions to ProspectViewSet
permissions_override = """
    def get_permissions(self):
        if self.action in ['list']:
            permission_classes = [IsPREOrLQ]
        else:
            permission_classes = [IsPRE]
        return [permission() for permission in permission_classes]
"""

if "def get_permissions(self):" not in content:
    content = content.replace("permission_classes = [IsPREOrLQ]", "permission_classes = [IsPRE]\n" + permissions_override)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added get_permissions to ProspectViewSet")
