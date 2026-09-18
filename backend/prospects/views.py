from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from .models import Prospect, ProspectOffering, ProspectContact
from .serializers import ProspectSerializer

class ProspectViewSet(viewsets.ModelViewSet):
    serializer_class = ProspectSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['company_structure', 'operational_status', 'country_head_office', 'primary_offering_type']
    search_fields = ['company_name', 'country_head_office', 'primary_industries']
    ordering_fields = ['company_name', 'created_at', 'updated_at']

    def get_queryset(self):
        queryset = Prospect.objects.all().order_by('-updated_at')
        market_event = self.request.query_params.get('market_event')
        if market_event:
            queryset = queryset.filter(market_event_participations__market_event=market_event).distinct()
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("VALIDATION ERROR:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
