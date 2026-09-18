import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from prospects.serializers import ProspectSerializer

data = {
    "company_name": "Test",
    "country_head_office": "Test",
    "complete_address": "Test",
    "primary_industries": "Test",
    "company_structure": "Parent",
    "operational_status": "Active",
    "primary_offering_type": "Multiple",
    "parent_companies": [],
    "status_target": None,
    "key_contacts": [{"contact_name": "John Doe", "designation": "", "official_email": "", "phone_number": "", "linkedin_profile": ""}],
    "offerings_data": [{"name": "Product 1", "offering_type": "Product"}]
}

serializer = ProspectSerializer(data=data)
if not serializer.is_valid():
    print("ERRORS:", serializer.errors)
else:
    print("VALID")
