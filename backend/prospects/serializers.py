from market_events.serializers import MarketEventSimpleSerializer
from rest_framework import serializers
from .models import Prospect, ProspectOffering, ProspectContact

class ProspectOfferingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProspectOffering
        fields = ['id', 'offering_type', 'name', 'display_order', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProspectContactSerializer(serializers.ModelSerializer):
    prospect_name = serializers.CharField(source='prospect.company_name', read_only=True)
    latest_call_status = serializers.SerializerMethodField()
    latest_communication_outcome = serializers.SerializerMethodField()
    email_verification_status = serializers.SerializerMethodField()
    email_verification_id = serializers.SerializerMethodField()

    def get_latest_call_status(self, obj):
        latest = obj.call_activities.order_by('-created_at').first()
        return latest.call_status if latest else None

    def get_latest_communication_outcome(self, obj):
        latest = obj.call_activities.order_by('-created_at').first()
        return latest.communication_outcome if latest else None

    def get_email_verification_status(self, obj):
        verification = obj.prospect.email_verifications.filter(email_address=obj.official_email).order_by('-updated_at').first()
        return verification.verification_status if verification else None

    def get_email_verification_id(self, obj):
        verification = obj.prospect.email_verifications.filter(email_address=obj.official_email).order_by('-updated_at').first()
        return str(verification.id) if verification else None

    class Meta:
        model = ProspectContact
        fields = ['id', 'prospect', 'prospect_name', 'contact_name', 'designation', 'official_email', 'phone_number', 'linkedin_profile', 'latest_call_status', 'latest_communication_outcome', 'email_verification_status', 'email_verification_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'prospect', 'prospect_name', 'latest_call_status', 'latest_communication_outcome', 'email_verification_status', 'email_verification_id', 'created_at', 'updated_at']

class ProspectSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prospect
        fields = ['id', 'company_name', 'country_head_office', 'primary_industries', 'company_structure', 'operational_status']

class ProspectSerializer(serializers.ModelSerializer):
    parent_companies_detail = ProspectSimpleSerializer(source='parent_companies', many=True, read_only=True)
    child_companies_detail = ProspectSimpleSerializer(source='child_companies', many=True, read_only=True)
    products = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    solutions = serializers.SerializerMethodField()
    key_contacts = ProspectContactSerializer(many=True, required=False)
    company_email_verification_status = serializers.SerializerMethodField()
    qualification_status = serializers.SerializerMethodField()

    def get_qualification_status(self, obj):
        if hasattr(obj, 'lead_qualification'):
            return obj.lead_qualification.qualification_status
        return None

    market_events = serializers.SerializerMethodField(read_only=True)
    market_event_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    # Internal writes for nested relationships
    offerings_data = ProspectOfferingSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Prospect
        fields = [
            'id', 'company_name', 'country_head_office', 'complete_address',
            'official_phone_number', 'official_email_address', 'official_website_url',
            'linkedin_company_page', 'primary_industries', 'company_structure',
            'operational_status', 'parent_companies', 'parent_companies_detail', 'child_companies_detail', 'status_target',
            'primary_offering_type', 'products', 'services', 'solutions',
            'offerings_data', 'key_contacts', 'created_at', 'updated_at',
            'created_by', 'updated_by', 'market_events', 'market_event_ids', 'company_email_verification_status', 'qualification_status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'market_events', 'market_event_ids', 'company_email_verification_status', 'qualification_status']

    def get_company_email_verification_status(self, obj):
        if not obj.official_email_address:
            return None
        verification = obj.email_verifications.filter(email_address=obj.official_email_address).order_by('-updated_at').first()
        return verification.verification_status if verification else None

    def get_market_events(self, obj):
        events = [p.market_event for p in obj.market_event_participations.select_related('market_event')]
        return MarketEventSimpleSerializer(events, many=True).data

    def get_products(self, obj):
        offerings = obj.offerings.filter(offering_type=ProspectOffering.OfferingTypeChoice.PRODUCT)
        return ProspectOfferingSerializer(offerings, many=True).data

    def get_services(self, obj):
        offerings = obj.offerings.filter(offering_type=ProspectOffering.OfferingTypeChoice.SERVICE)
        return ProspectOfferingSerializer(offerings, many=True).data

    def get_solutions(self, obj):
        offerings = obj.offerings.filter(offering_type=ProspectOffering.OfferingTypeChoice.SOLUTION)
        return ProspectOfferingSerializer(offerings, many=True).data

    def validate(self, data):
        structure = data.get('company_structure')
        parent_companies = data.get('parent_companies', [])
        status = data.get('operational_status')
        status_target = data.get('status_target')

        # Branch and Subsidiary require parent
        if structure in [Prospect.Structure.BRANCH, Prospect.Structure.SUBSIDIARY]:
            if not parent_companies:
                raise serializers.ValidationError({"parent_companies": "At least one parent company is required for Branch or Subsidiary."})

        # Acquired/Merged target validation
        if status in [Prospect.Status.ACQUIRED, Prospect.Status.MERGED]:
            pass  # Target is optional

        # Self-parent prevention
        if self.instance and self.instance in parent_companies:
            raise serializers.ValidationError({"parent_companies": "A prospect cannot be its own parent."})

        return data

    def create(self, validated_data):
        offerings_data = validated_data.pop('offerings_data', [])
        contacts_data = validated_data.pop('key_contacts', [])
        parent_companies = validated_data.pop('parent_companies', [])
        market_event_ids = validated_data.pop('market_event_ids', [])

        prospect = Prospect.objects.create(**validated_data)

        from django.db import transaction
        from market_events.models import MarketEventParticipation

        with transaction.atomic():
            if market_event_ids:
                market_event_ids = list(set(market_event_ids))
                for event_id in market_event_ids:
                    from market_events.models import MarketEvent
                    event = MarketEvent.objects.filter(id=event_id).first()
                    if not event:
                        raise serializers.ValidationError(f"MarketEvent {event_id} does not exist.")
                    MarketEventParticipation.objects.create(market_event_id=event_id, prospect=prospect)

        if parent_companies:
            prospect.parent_companies.set(parent_companies)

        for offering in offerings_data:
            ProspectOffering.objects.create(prospect=prospect, **offering)

        for contact in contacts_data:
            ProspectContact.objects.create(prospect=prospect, **contact)

        return prospect

    def update(self, instance, validated_data):
        offerings_data = validated_data.pop('offerings_data', None)
        contacts_data = validated_data.pop('key_contacts', None)
        parent_companies = validated_data.pop('parent_companies', None)
        market_event_ids = validated_data.pop('market_event_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        from django.db import transaction
        from market_events.models import MarketEventParticipation

        if market_event_ids is not None:
            with transaction.atomic():
                market_event_ids = list(set(market_event_ids))
                existing_participations = MarketEventParticipation.objects.filter(prospect=instance)
                existing_event_ids = list(existing_participations.values_list('market_event_id', flat=True))

                # Delete removed ones
                existing_participations.exclude(market_event_id__in=market_event_ids).delete()

                # Add new ones
                for event_id in market_event_ids:
                    if event_id not in existing_event_ids:
                        from market_events.models import MarketEvent
                        event = MarketEvent.objects.filter(id=event_id).first()
                        if not event:
                            raise serializers.ValidationError(f"MarketEvent {event_id} does not exist.")
                        MarketEventParticipation.objects.create(market_event_id=event_id, prospect=instance)

        if parent_companies is not None:
            instance.parent_companies.set(parent_companies)

        if offerings_data is not None:
            instance.offerings.all().delete()
            for offering in offerings_data:
                ProspectOffering.objects.create(prospect=instance, **offering)

        if contacts_data is not None:
            raw_contacts = self.initial_data.get('key_contacts', [])
            existing_contacts = {str(c.id): c for c in instance.key_contacts.all()}
            seen_ids = []

            for i, contact_data in enumerate(contacts_data):
                raw_id = None
                if i < len(raw_contacts) and isinstance(raw_contacts[i], dict):
                    raw_id = str(raw_contacts[i].get('id', ''))

                if raw_id and raw_id in existing_contacts:
                    c_inst = existing_contacts[raw_id]
                    for k, v in contact_data.items():
                        setattr(c_inst, k, v)
                    c_inst.save()
                    seen_ids.append(raw_id)
                else:
                    new_c = ProspectContact.objects.create(prospect=instance, **contact_data)
                    seen_ids.append(str(new_c.id))

            for c_id, c_inst in existing_contacts.items():
                if c_id not in seen_ids:
                    c_inst.delete()

        return instance

from .models import LeadQualification

class LeadQualificationSerializer(serializers.ModelSerializer):
    prospect = ProspectSerializer(read_only=True)

    class Meta:
        model = LeadQualification
        fields = [
            'id', 'prospect', 'verification_status', 'pre_task_status',
            'qualification_status', 'qualification_score', 'lq_notes',
            'email_status', 'budget', 'authority', 'need', 'timeline',
            'verification_checklist', 'issue_category', 'issue_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'prospect', 'pre_task_status', 'created_at', 'updated_at']

from .models import CallbackReminder


class CallbackReminderSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='prospect.company_name', read_only=True)

    class Meta:
        model = CallbackReminder
        fields = [
            'id', 'prospect', 'company_name', 'scheduled_datetime',
            'description', 'is_completed', 'notified_30m',
            'notified_15m', 'notified_5m', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

from .models import OutreachEmail, OutreachEmailRecipient, EmailAttachment, CallActivity, CommunicationActivity

class EmailAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAttachment
        fields = ['id', 'original_filename', 'mime_type', 'size', 'created_at']

class OutreachEmailRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutreachEmailRecipient
        fields = ['id', 'email_address', 'prospect_contact', 'recipient_type']

class OutreachEmailSerializer(serializers.ModelSerializer):
    recipients = OutreachEmailRecipientSerializer(many=True, read_only=True)
    attachments = EmailAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = OutreachEmail
        fields = [
            'id', 'prospect', 'created_by', 'sender_mail_account', 'from_email', 'from_name',
            'subject', 'body', 'signature', 'status', 'sent_at', 'message_id', 'thread_id',
            'in_reply_to', 'references', 'created_at', 'updated_at', 'recipients', 'attachments',
            'is_opened', 'opened_at'
        ]
        read_only_fields = ['id', 'created_by', 'sender_mail_account', 'status', 'sent_at', 'message_id', 'thread_id', 'in_reply_to', 'references', 'created_at', 'updated_at', 'is_opened', 'opened_at']

class CallActivitySerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return 'System'

    class Meta:
        model = CallActivity
        fields = [
            'id', 'prospect', 'prospect_contact', 'created_by', 'created_by_name',
            'company_phone', 'ivr_extension', 'call_status', 'communication_outcome',
            'notes', 'call_started_at', 'call_ended_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at']

class CommunicationActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()
    outreach_email_detail = OutreachEmailSerializer(source='outreach_email', read_only=True)
    call_activity_detail = CallActivitySerializer(source='call_activity', read_only=True)
    contact_name = serializers.CharField(source='prospect_contact.contact_name', read_only=True, allow_null=True)

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return obj.performed_by.get_full_name() or obj.performed_by.username
        return 'System'

    class Meta:
        model = CommunicationActivity
        fields = [
            'id', 'prospect', 'prospect_contact', 'contact_name', 'activity_type', 'direction',
            'status', 'outcome', 'subject', 'notes', 'outreach_email', 'outreach_email_detail',
            'call_activity', 'call_activity_detail', 'performed_by', 'performed_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'performed_by', 'performed_by_name', 'created_at']
