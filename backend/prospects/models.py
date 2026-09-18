import uuid
from django.db import models
from django.core.exceptions import ValidationError

class Prospect(models.Model):
    class Structure(models.TextChoices):
        PARENT = 'Parent', 'Parent Organization'
        BRANCH = 'Branch', 'Branch Office'
        SUBSIDIARY = 'Subsidiary', 'Subsidiary Company'

    class Status(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        INACTIVE = 'Inactive', 'Inactive'
        PERMANENTLY_CLOSED = 'Permanently Closed', 'Permanently Closed'
        ACQUIRED = 'Acquired', 'Acquired'
        MERGED = 'Merged', 'Merged'

    class OfferingType(models.TextChoices):
        PRODUCTS = 'Products', 'Products'
        SERVICES = 'Services', 'Services'
        SOLUTIONS = 'Solutions', 'Solutions'
        MULTIPLE = 'Multiple', 'Multiple'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255)
    country_head_office = models.CharField(max_length=255)
    complete_address = models.TextField()
    
    official_phone_number = models.CharField(max_length=255, blank=True, null=True)
    official_email_address = models.EmailField(blank=True, null=True)
    official_website_url = models.URLField(blank=True, null=True)
    linkedin_company_page = models.URLField(blank=True, null=True)
    
    primary_industries = models.CharField(max_length=255)

    company_structure = models.CharField(max_length=50, choices=Structure.choices)
    operational_status = models.CharField(max_length=50, choices=Status.choices)
    
    parent_companies = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='child_companies')
    status_target = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='acquired_or_merged_from')
    
    primary_offering_type = models.CharField(max_length=50, choices=OfferingType.choices)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=255, blank=True, null=True)
    updated_by = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.company_name

class ProspectOffering(models.Model):
    class OfferingTypeChoice(models.TextChoices):
        PRODUCT = 'Product', 'Product'
        SERVICE = 'Service', 'Service'
        SOLUTION = 'Solution', 'Solution'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name='offerings')
    offering_type = models.CharField(max_length=20, choices=OfferingTypeChoice.choices)
    name = models.CharField(max_length=255)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prospect.company_name} - {self.get_offering_type_display()} - {self.name}"

class ProspectContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name='key_contacts')
    contact_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, blank=True, null=True)
    official_email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    linkedin_profile = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.contact_name} ({self.prospect.company_name})"
