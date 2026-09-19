import re

filepath = 'backend/prospects/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we have post_save imported
if "from django.db.models.signals import post_save" not in content:
    content = "from django.db.models.signals import post_save\nfrom django.dispatch import receiver\n" + content

# Add the signal for creating LeadQualification
signal_code = """
@receiver(post_save, sender=Prospect)
def create_lead_qualification(sender, instance, created, **kwargs):
    if created:
        LeadQualification.objects.create(prospect=instance)
"""

if "def create_lead_qualification" not in content:
    content += signal_code
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added create_lead_qualification signal")
else:
    print("Signal already exists")
