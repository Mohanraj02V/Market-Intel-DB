import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from prospects.models import Prospect
from prospects.views import apply_lq_distribution_filter

User = get_user_model()
print("All Users and Roles:")
for u in User.objects.all():
    role = u.profile.role if hasattr(u, 'profile') else 'No Profile'
    print(f"User: {u.username}, Role: {role}")

print("\n--- LQ Distribution ---")
lq_users = User.objects.filter(profile__role='LQ').order_by('id')
print(f"Total LQ users: {lq_users.count()}")

all_prospects = Prospect.objects.all().order_by('created_at', 'id')
print(f"Total Prospects: {all_prospects.count()}")
for p in all_prospects:
    print(f" - {p.company_name} (Created: {p.created_at})")

print("\n--- Filtered Querysets ---")
for u in lq_users:
    qs = Prospect.objects.all()
    filtered_qs = apply_lq_distribution_filter(qs, u, 'id__')
    print(f"User {u.username} can see: {list(filtered_qs.values_list('company_name', flat=True))}")
