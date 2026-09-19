import re

filepath = 'backend/prospects/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "    permission_classes = [IsLQ]"
replacement = "    permission_classes = [IsPREOrLQ]"

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
