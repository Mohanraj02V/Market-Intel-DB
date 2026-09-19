import re

filepath = 'backend/prospects/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

signal_code = """
@receiver(post_save, sender=Prospect)
def update_lead_qualification_on_edit(sender, instance, created, **kwargs):
    if not created:
        try:
            if instance.lead_qualification.pre_task_status == LeadQualification.PreTaskStatus.ISSUE_SENT_TO_PRE:
                instance.lead_qualification.pre_task_status = LeadQualification.PreTaskStatus.PRE_UPDATED
                instance.lead_qualification.save()
        except LeadQualification.DoesNotExist:
            pass
"""

if "def update_lead_qualification_on_edit" not in content:
    content += signal_code
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added update_lead_qualification_on_edit signal")
