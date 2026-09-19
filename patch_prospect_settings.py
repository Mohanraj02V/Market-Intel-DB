filepath = 'backend/prospects/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "from django.conf import settings" not in content:
    content = "from django.conf import settings\n" + content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Imported settings")
