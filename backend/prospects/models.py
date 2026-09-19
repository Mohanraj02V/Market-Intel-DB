from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
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
        BUDGET_FROZEN = 'Budget Frozen', 'Budget Frozen'
        PROSPECT_SELECTED = 'Prospect Selected', 'Prospect Selected'

    class PreTaskStatus(models.TextChoices):
        NONE = 'NONE', 'None'
        ISSUE_SENT_TO_PRE = 'ISSUE_SENT_TO_PRE', 'Issue Sent to PRE'
        PRE_UPDATED = 'PRE_UPDATED', 'PRE Updated Data'

    prospect = models.OneToOneField(Prospect, on_delete=models.CASCADE, related_name='lead_qualification')
    
    verification_status = models.CharField(max_length=50, choices=VerificationStatus.choices, default=VerificationStatus.UNVERIFIED)
    qualification_status = models.CharField(max_length=50, choices=QualificationStatus.choices, default=QualificationStatus.UNQUALIFIED)
    pre_task_status = models.CharField(max_length=50, choices=PreTaskStatus.choices, default=PreTaskStatus.NONE)
    verification_checklist = models.JSONField(default=dict, blank=True)
    email_status = models.CharField(max_length=50, default='Not Sent', blank=True, null=True)
    
    qualification_score = models.IntegerField(default=0)
    lq_notes = models.TextField(blank=True, null=True)
    
    qualified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='qualifications_performed')
    qualified_at = models.DateTimeField(null=True, blank=True)
    
    # BANT Criteria

    # Issue Reporting
    issue_category = models.CharField(max_length=255, blank=True, null=True)
    issue_details = models.TextField(blank=True, null=True)
    issue_reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues_reported')
    issue_reported_at = models.DateTimeField(null=True, blank=True)

    budget = models.BooleanField(default=False)
    authority = models.BooleanField(default=False)
    need = models.BooleanField(default=False)
    timeline = models.BooleanField(default=False)


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"LQ for {self.prospect.company_name}"

@receiver(post_save, sender=Prospect)
def create_lead_qualification(sender, instance, created, **kwargs):
    if created:
        LeadQualification.objects.create(prospect=instance)

@receiver(post_save, sender=Prospect)
def update_lead_qualification_on_edit(sender, instance, created, **kwargs):
    if not created:
        try:
            if instance.lead_qualification.pre_task_status == LeadQualification.PreTaskStatus.ISSUE_SENT_TO_PRE:
                instance.lead_qualification.pre_task_status = LeadQualification.PreTaskStatus.PRE_UPDATED
                instance.lead_qualification.save()
        except LeadQualification.DoesNotExist:
            pass

class CallbackReminder(models.Model):
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name='reminders')
    scheduled_datetime = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    
    # Tracking notification states
    notified_30m = models.BooleanField(default=False)
    notified_15m = models.BooleanField(default=False)
    notified_5m = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reminder for {self.prospect.company_name} at {self.scheduled_datetime}"

class OutreachLog(models.Model):
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name='outreach_logs')
    activity_type = models.CharField(max_length=50) # 'Call', 'Email'
    status = models.CharField(max_length=255, blank=True, null=True)
    outcome = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.activity_type} log for {self.prospect.company_name} at {self.created_at}"
