import re

filepath = 'backend/prospects/serializers.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """        fields = [
            'id', 'prospect', 'verification_status', 'pre_task_status',
            'qualification_status', 'qualification_score', 'lq_notes',
            'budget', 'authority', 'need', 'timeline',
            'created_at', 'updated_at'
        ]"""

replacement = """        fields = [
            'id', 'prospect', 'verification_status', 'pre_task_status',
            'qualification_status', 'qualification_score', 'lq_notes',
            'budget', 'authority', 'need', 'timeline',
            'verification_checklist',
            'created_at', 'updated_at'
        ]"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
