import re

filepath = 'backend/prospects/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

issue_fields = """
    # Issue Reporting
    issue_category = models.CharField(max_length=255, blank=True, null=True)
    issue_details = models.TextField(blank=True, null=True)
    issue_reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues_reported')
    issue_reported_at = models.DateTimeField(null=True, blank=True)
"""

if "issue_category =" not in content:
    # Insert before created_at
    content = content.replace("    created_at = models.DateTimeField(auto_now_add=True)", issue_fields + "\n    created_at = models.DateTimeField(auto_now_add=True)")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added issue reporting fields")
