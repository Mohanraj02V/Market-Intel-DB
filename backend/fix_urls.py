import os

file_path = 'prospects/urls.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("router.register(r'prospects', ProspectViewSet)", "router.register(r'prospects', ProspectViewSet, basename='prospect')")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
