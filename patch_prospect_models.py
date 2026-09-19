import re

filepath = 'backend/prospects/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add LeadQualification model to the end of the file
lq_model = """
class LeadQualification(models.Model):
    class VerificationStatus(models.TextChoices):
        UNVERIFIED = 'Unverified', 'Unverified'
        IN_PROGRESS = 'In Progress', 'In Progress'
        VERIFIED = 'Verified', 'Verified'

    class QualificationStatus(models.TextChoices):
        UNQUALIFIED = 'Unqualified', 'Unqualified'
        HOT_LEAD = 'Hot Lead', 'Hot Lead'
        QUALIFIED = 'Qualified', 'Qualified'
        NURTURE = 'Nurture', 'Nurture'
        DISQUALIFIED = 'Disqualified', 'Disqualified'

    class PreTaskStatus(models.TextChoices):
        NONE = 'NONE', 'None'
        ISSUE_SENT_TO_PRE = 'ISSUE_SENT_TO_PRE', 'Issue Sent to PRE'
        PRE_UPDATED = 'PRE_UPDATED', 'PRE Updated Data'

    prospect = models.OneToOneField(Prospect, on_delete=models.CASCADE, related_name='lead_qualification')
    
    verification_status = models.CharField(max_length=50, choices=VerificationStatus.choices, default=VerificationStatus.UNVERIFIED)
    qualification_status = models.CharField(max_length=50, choices=QualificationStatus.choices, default=QualificationStatus.UNQUALIFIED)
    pre_task_status = models.CharField(max_length=50, choices=PreTaskStatus.choices, default=PreTaskStatus.NONE)
    
    qualification_score = models.IntegerField(default=0)
    lq_notes = models.TextField(blank=True, null=True)
    
    qualified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='qualifications_performed')
    qualified_at = models.DateTimeField(null=True, blank=True)
    
    # BANT Criteria
    budget = models.BooleanField(default=False)
    authority = models.BooleanField(default=False)
    need = models.BooleanField(default=False)
    timeline = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"LQ for {self.prospect.company_name}"
"""

if "class LeadQualification" not in content:
    content += lq_model
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added LeadQualification model to prospects/models.py")
else:
    print("LeadQualification model already exists")
