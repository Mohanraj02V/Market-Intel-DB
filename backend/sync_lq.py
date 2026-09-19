import django
import os
import sys

# Set up django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from prospects.models import Prospect, LeadQualification

# Create LeadQualification for any prospect that doesn't have one
prospects = Prospect.objects.all()
created_count = 0
for p in prospects:
    lq, created = LeadQualification.objects.get_or_create(prospect=p)
    if created:
        created_count += 1

print(f"Created {created_count} missing LeadQualification records.")
print(f"Total LeadQualification records: {LeadQualification.objects.count()}")
