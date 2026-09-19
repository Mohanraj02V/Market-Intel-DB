import re

filepath = 'backend/prospects/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will add verification_checklist = models.JSONField(default=dict, blank=True)
target = "    pre_task_status = models.CharField(max_length=50, choices=PreTaskStatus.choices, default=PreTaskStatus.NONE)"
replacement = target + "\n    verification_checklist = models.JSONField(default=dict, blank=True)"

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
