from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Prefetch
from .models import MarketEvent, MarketEventParticipation
from .serializers import MarketEventSerializer

class MarketEventViewSet(viewsets.ModelViewSet):
    serializer_class = MarketEventSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['host_country']
    search_fields = ['event_title', 'host_country']
    ordering_fields = ['start_date', 'end_date', 'event_title', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        # Always annotate with the count of participating companies
        queryset = MarketEvent.objects.annotate(
            participating_companies_count=Count('participations', distinct=True)
        )
        
        # If it's a detail view, prefetch the participating prospects to avoid N+1
        if self.action == 'retrieve':
            prefetch = Prefetch(
                'participations',
                queryset=MarketEventParticipation.objects.select_related('prospect'),
                to_attr='prefetched_participations'
            )
            queryset = queryset.prefetch_related(prefetch)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.username)

    def perform_destroy(self, instance):
        # Constraints ensure cascade delete handles participation records safely
        instance.delete()
