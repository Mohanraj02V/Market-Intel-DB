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
        LEAD_QUALIFIED = 'Lead Qualified', 'Lead Qualified'

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

    notified_30m = models.BooleanField(default=False)
    notified_15m = models.BooleanField(default=False)
    notified_5m = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reminder for {self.prospect.company_name} at {self.scheduled_datetime}"

class OutreachEmail(models.Model):
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name='outreach_emails')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    sender_mail_account = models.ForeignKey('accounts.MailAccount', on_delete=models.SET_NULL, null=True, blank=True)
    from_email = models.CharField(max_length=255)
    from_name = models.CharField(max_length=255, blank=True, null=True)
    subject = models.CharField(max_length=512)
    body = models.TextField()
    signature = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=(('NOT SENT', 'Not Sent'), ('SENT', 'Sent'), ('WAITING FOR RESPONSE', 'Waiting for Response'), ('RECEIVED RESPONSE', 'Received Response'), ('FAILED', 'Failed')), default='NOT SENT')
    sent_at = models.DateTimeField(null=True, blank=True)
    message_id = models.CharField(max_length=255, blank=True, null=True)
    thread_id = models.CharField(max_length=255, blank=True, null=True)
    in_reply_to = models.CharField(max_length=255, blank=True, null=True)
    references = models.TextField(blank=True, null=True)
    # Email open tracking
    tracking_token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True, editable=False)
    is_opened = models.BooleanField(default=False)
    opened_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OutreachEmailRecipient(models.Model):
    outreach_email = models.ForeignKey(OutreachEmail, on_delete=models.CASCADE, related_name='recipients')
    email_address = models.EmailField()
    prospect_contact = models.ForeignKey(ProspectContact, on_delete=models.SET_NULL, null=True, blank=True)
    recipient_type = models.CharField(max_length=10, choices=(('TO', 'TO'), ('CC', 'CC'), ('BCC', 'BCC')))

class EmailAttachment(models.Model):
    outreach_email = models.ForeignKey(OutreachEmail, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=255)
    size = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class CallActivity(models.Model):
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name='call_activities')
    prospect_contact = models.ForeignKey(ProspectContact, on_delete=models.SET_NULL, null=True, blank=True, related_name='call_activities')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    company_phone = models.CharField(max_length=255, blank=True, null=True)
    ivr_extension = models.CharField(max_length=50, blank=True, null=True)
    call_status = models.CharField(max_length=100)
    communication_outcome = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    call_started_at = models.DateTimeField(null=True, blank=True)
    call_ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class CommunicationActivity(models.Model):
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name='communication_timeline')
    prospect_contact = models.ForeignKey(ProspectContact, on_delete=models.SET_NULL, null=True, blank=True, related_name='communication_timeline')
    activity_type = models.CharField(max_length=50, choices=(('EMAIL_SENT', 'Email Sent'), ('EMAIL_RECEIVED', 'Email Received'), ('CALL', 'Call')))
    direction = models.CharField(max_length=20, choices=(('OUTBOUND', 'Outbound'), ('INBOUND', 'Inbound')), default='OUTBOUND')
    status = models.CharField(max_length=255, blank=True, null=True)
    outcome = models.CharField(max_length=255, blank=True, null=True)
    subject = models.CharField(max_length=512, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    outreach_email = models.ForeignKey(OutreachEmail, on_delete=models.SET_NULL, null=True, blank=True)
    call_activity = models.ForeignKey(CallActivity, on_delete=models.SET_NULL, null=True, blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class EmailVerification(models.Model):
    class VerificationStatus(models.TextChoices):
        UNVERIFIED = 'UNVERIFIED', 'Unverified'
        VALID = 'VALID', 'Valid'
        INVALID = 'INVALID', 'Invalid'
        UNKNOWN = 'UNKNOWN', 'Unknown'

    class VerificationMethod(models.TextChoices):
        SYNTAX = 'SYNTAX', 'Syntax'
        DNS = 'DNS', 'DNS'
        MX = 'MX', 'MX'
        SMTP = 'SMTP', 'SMTP'
        COMBINED = 'COMBINED', 'Combined'
        MANUAL_CONFIRMATION = 'MANUAL_CONFIRMATION', 'Manual Confirmation'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prospect = models.ForeignKey(Prospect, on_delete=models.CASCADE, related_name='email_verifications')
    prospect_contact = models.ForeignKey(ProspectContact, on_delete=models.CASCADE, null=True, blank=True, related_name='email_verifications')
    email_address = models.EmailField()
    verification_status = models.CharField(max_length=50, choices=VerificationStatus.choices, default=VerificationStatus.UNVERIFIED)
    verification_method = models.CharField(max_length=50, choices=VerificationMethod.choices, default=VerificationMethod.COMBINED)

    syntax_valid = models.BooleanField(default=False)
    domain_valid = models.BooleanField(default=False)
    mx_found = models.BooleanField(default=False)
    smtp_checked = models.BooleanField(default=False)
    smtp_valid = models.BooleanField(default=False)

    is_disposable = models.BooleanField(default=False)
    is_role_account = models.BooleanField(default=False)
    is_catch_all = models.BooleanField(default=False)

    reason = models.TextField(blank=True, null=True)

    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verifications_performed')

    confirmed_by_lq = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verifications_confirmed')
    confirmed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['prospect', 'prospect_contact', 'email_address'], name='unique_prospect_contact_email_verification')
        ]

    def __str__(self):
        return f"{self.email_address} - {self.verification_status}"
