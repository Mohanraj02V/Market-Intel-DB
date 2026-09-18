import os
import re

file_path = 'prospects/serializers.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add MarketEventSimpleSerializer import if not present
if "from market_events.serializers import MarketEventSimpleSerializer" not in content:
    content = "from market_events.serializers import MarketEventSimpleSerializer\n" + content
    
# Update fields
fields_str = "'created_by', 'updated_by'"
new_fields_str = "'created_by', 'updated_by', 'market_events', 'market_event_ids'"
content = content.replace(fields_str, new_fields_str)

# Add properties to class ProspectSerializer
props_str = "    # Internal writes for nested relationships"
new_props_str = """    market_events = serializers.SerializerMethodField(read_only=True)
    market_event_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )
    
    # Internal writes for nested relationships"""
content = content.replace(props_str, new_props_str)

# Add get_market_events method
get_methods_str = "    def get_products(self, obj):"
new_get_methods_str = """    def get_market_events(self, obj):
        events = [p.market_event for p in obj.market_event_participations.select_related('market_event')]
        return MarketEventSimpleSerializer(events, many=True).data

    def get_products(self, obj):"""
content = content.replace(get_methods_str, new_get_methods_str)

# Update create method
create_str = "        parent_companies = validated_data.pop('parent_companies', [])"
new_create_str = """        parent_companies = validated_data.pop('parent_companies', [])
        market_event_ids = validated_data.pop('market_event_ids', [])"""
content = content.replace(create_str, new_create_str)

create_save_str = "        if parent_companies:"
new_create_save_str = """        from django.db import transaction
        from market_events.models import MarketEventParticipation
        
        with transaction.atomic():
            if market_event_ids:
                market_event_ids = list(set(market_event_ids))
                for event_id in market_event_ids:
                    MarketEventParticipation.objects.create(market_event_id=event_id, prospect=prospect)
                    
        if parent_companies:"""
content = content.replace(create_save_str, new_create_save_str)

# Update update method
update_str = "        parent_companies = validated_data.pop('parent_companies', None)"
new_update_str = """        parent_companies = validated_data.pop('parent_companies', None)
        market_event_ids = validated_data.pop('market_event_ids', None)"""
content = content.replace(update_str, new_update_str)

update_save_str = "        if parent_companies is not None:"
new_update_save_str = """        from django.db import transaction
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

        if parent_companies is not None:"""
content = content.replace(update_save_str, new_update_save_str)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated serializers.py")
