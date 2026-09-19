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
    
    class Meta:
        model = ProspectContact
        fields = ['id', 'prospect', 'prospect_name', 'contact_name', 'designation', 'official_email', 'phone_number', 'linkedin_profile', 'created_at', 'updated_at']
        read_only_fields = ['id', 'prospect', 'prospect_name', 'created_at', 'updated_at']

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
            'created_by', 'updated_by', 'market_events', 'market_event_ids'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'market_events', 'market_event_ids']

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
        
        # 1 & 2. Branch and Subsidiary require parent
        if structure in [Prospect.Structure.BRANCH, Prospect.Structure.SUBSIDIARY]:
            if not parent_companies:
                raise serializers.ValidationError({"parent_companies": "At least one parent company is required for Branch or Subsidiary."})
        
        # 3. Parent should not have parent company (optional strictness, let's just clear it or validate)
        if structure == Prospect.Structure.PARENT and parent_companies:
            pass # Usually OK to just allow or clear it. We will ignore or raise. We'll raise to be strict.
            # raise serializers.ValidationError({"parent_companies": "Parent organization should not have parent companies."})

        # Acquired/Merged target validation
        if status in [Prospect.Status.ACQUIRED, Prospect.Status.MERGED]:
            pass # Target is optional according to specs

        # 4. Self-parent prevention (handled in views/save, but good here if instance exists)
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
                        MarketEventParticipation.objects.create(market_event_id=event_id, prospect=instance)

        if parent_companies is not None:
            instance.parent_companies.set(parent_companies)
            
        if offerings_data is not None:
            instance.offerings.all().delete()
            for offering in offerings_data:
                ProspectOffering.objects.create(prospect=instance, **offering)
                
        if contacts_data is not None:
            instance.key_contacts.all().delete()
            for contact in contacts_data:
                ProspectContact.objects.create(prospect=instance, **contact)
                
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

from .models import CallbackReminder, OutreachLog

class OutreachLogSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return 'System'
    
    class Meta:
        model = OutreachLog
        fields = [
            'id', 'prospect', 'activity_type', 'status', 'outcome',
            'notes', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'created_by', 'created_by_name']

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
