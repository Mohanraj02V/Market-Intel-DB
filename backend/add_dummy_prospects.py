import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from prospects.models import Prospect
from django.contrib.auth import get_user_model

User = get_user_model()
pre_user = User.objects.filter(profile__role='PRE').first()

count = Prospect.objects.count()
to_add = 20 - count

if to_add > 0:
    for i in range(to_add):
        Prospect.objects.create(
            company_name=f'Dummy Company {i+1}',
            country_head_office='USA',
            primary_industries='Software',
            company_structure='Parent',
            operational_status='Active',
            primary_offering_type='Products',
            created_by=pre_user.username if pre_user else 'admin'
        )
    print(f"Added {to_add} dummy prospects.")
else:
    print("Already have 20 or more prospects.")
