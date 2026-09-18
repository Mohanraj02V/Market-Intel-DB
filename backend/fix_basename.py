import os

file_path = 'prospects/views.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "class ProspectViewSet(viewsets.ModelViewSet):"
replacement = "class ProspectViewSet(viewsets.ModelViewSet):\n    queryset = Prospect.objects.all().order_by('-updated_at')"

if "queryset = Prospect.objects.all().order_by('-updated_at')" not in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed basename issue")
