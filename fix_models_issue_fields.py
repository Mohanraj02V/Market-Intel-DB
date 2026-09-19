import re

filepath = 'backend/prospects/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

bad_injection = """
    # Issue Reporting
    issue_category = models.CharField(max_length=255, blank=True, null=True)
    issue_details = models.TextField(blank=True, null=True)
    issue_reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues_reported')
    issue_reported_at = models.DateTimeField(null=True, blank=True)
"""

content = content.replace(bad_injection, "")

# Now inject it safely into LeadQualification only.
target_line = "    budget = models.BooleanField(default=False)"
replacement = bad_injection + "\n" + target_line

content = content.replace(target_line, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed the global replace disaster in models.py")
