from django.contrib import admin
from django.db.models import Count
from .models import MarketEvent, MarketEventParticipation

@admin.register(MarketEvent)
class MarketEventAdmin(admin.ModelAdmin):
    list_display = ('event_title', 'host_country', 'start_date', 'end_date', 'participant_count', 'created_at')
    search_fields = ('event_title', 'host_country')
    list_filter = ('host_country', 'start_date', 'end_date')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(participant_count=Count('participations', distinct=True))

    def participant_count(self, obj):
        return obj.participant_count
    participant_count.short_description = 'Participant Count'
    participant_count.admin_order_field = 'participant_count'


@admin.register(MarketEventParticipation)
class MarketEventParticipationAdmin(admin.ModelAdmin):
    list_display = ('market_event', 'prospect', 'created_at')
    search_fields = ('market_event__event_title', 'prospect__company_name')
    list_filter = ('market_event',)
