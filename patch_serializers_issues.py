import re

filepath = 'backend/prospects/serializers.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = "prospect = ProspectSimpleSerializer(read_only=True)"
replacement1 = "prospect = ProspectSerializer(read_only=True)"
content = content.replace(target1, replacement1)

target2 = """            'budget', 'authority', 'need', 'timeline',
            'verification_checklist',
            'created_at', 'updated_at'"""
replacement2 = """            'budget', 'authority', 'need', 'timeline',
            'verification_checklist', 'issue_category', 'issue_details',
            'created_at', 'updated_at'"""
content = content.replace(target2, replacement2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
