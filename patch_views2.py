import re

filepath = 'backend/prospects/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update report_issue
target_report = "        lq.issue_reported_by = request.user"
replacement_report = "        lq.verification_checklist = request.data.get('verification_checklist', lq.verification_checklist)\n        lq.issue_reported_by = request.user"
content = content.replace(target_report, replacement_report)

# Update verify
target_verify = "        lq.verification_status = request.data.get('verification_status', lq.verification_status)"
replacement_verify = "        lq.verification_status = request.data.get('verification_status', lq.verification_status)\n        lq.verification_checklist = request.data.get('verification_checklist', lq.verification_checklist)"
content = content.replace(target_verify, replacement_verify)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
