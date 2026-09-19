from django.utils import timezone
from rest_framework.decorators import action
from accounts.permissions import IsPRE, IsLQ, IsPREOrLQ
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from .models import Prospect, ProspectOffering, ProspectContact, LeadQualification
from .serializers import ProspectSerializer, LeadQualificationSerializer, ProspectContactSerializer

class ProspectViewSet(viewsets.ModelViewSet):
    serializer_class = ProspectSerializer
    permission_classes = [IsPRE]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'add_contact']:
            permission_classes = [IsPREOrLQ]
        else:
            permission_classes = [IsPRE]
        return [permission() for permission in permission_classes]

    
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

    @action(detail=True, methods=['post'], url_path='add-contact')
    def add_contact(self, request, pk=None):
        prospect = self.get_object()
        contact_name = request.data.get('contact_name')
        designation = request.data.get('designation', '')
        official_email = request.data.get('official_email', '')
        phone_number = request.data.get('phone_number', '')

        if not contact_name or not contact_name.strip():
            return Response({'error': 'Contact name is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Duplicate prevention: check if same email or phone already exists for this prospect
        existing_qs = ProspectContact.objects.filter(prospect=prospect)
        if official_email and official_email.strip():
            if existing_qs.filter(official_email__iexact=official_email.strip()).exists():
                # Return the existing contact info instead of creating duplicate
                existing = existing_qs.filter(official_email__iexact=official_email.strip()).first()
                return Response({'status': 'duplicate', 'message': 'This contact already exists.', 'contact': {'id': str(existing.id), 'contact_name': existing.contact_name, 'designation': existing.designation, 'official_email': existing.official_email, 'phone_number': existing.phone_number}}, status=status.HTTP_200_OK)
        if phone_number and phone_number.strip():
            if existing_qs.filter(phone_number=phone_number.strip()).exists():
                existing = existing_qs.filter(phone_number=phone_number.strip()).first()
                return Response({'status': 'duplicate', 'message': 'This contact already exists.', 'contact': {'id': str(existing.id), 'contact_name': existing.contact_name, 'designation': existing.designation, 'official_email': existing.official_email, 'phone_number': existing.phone_number}}, status=status.HTTP_200_OK)

        ProspectContact.objects.create(
            prospect=prospect,
            contact_name=contact_name.strip(),
            designation=designation.strip() if designation else '',
            official_email=official_email.strip() if official_email else '',
            phone_number=phone_number.strip() if phone_number else ''
        )
        return Response({'status': 'contact added'}, status=status.HTTP_201_CREATED)

class LQPipelineViewSet(viewsets.ModelViewSet):
    serializer_class = LeadQualificationSerializer
    permission_classes = [IsPREOrLQ]
    queryset = LeadQualification.objects.all().select_related('prospect').order_by('-updated_at')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['verification_status', 'pre_task_status', 'qualification_status']
    search_fields = ['prospect__company_name', 'prospect__country_head_office', 'prospect__primary_industries']
    ordering_fields = ['created_at', 'updated_at', 'qualification_score']

    @action(detail=True, methods=['post'], url_path='report-issue')
    def report_issue(self, request, pk=None):
        lq = self.get_object()
        lq.pre_task_status = LeadQualification.PreTaskStatus.ISSUE_SENT_TO_PRE
        lq.issue_category = request.data.get('issue_category', '')
        lq.issue_details = request.data.get('issue_details', '')
        lq.verification_checklist = request.data.get('verification_checklist', lq.verification_checklist)
        lq.issue_reported_by = request.user
        lq.issue_reported_at = timezone.now()
        lq.save()
        return Response(self.get_serializer(lq).data)

    @action(detail=True, methods=['post'], url_path='complete-pre-task')
    def complete_pre_task(self, request, pk=None):
        lq = self.get_object()
        lq.pre_task_status = LeadQualification.PreTaskStatus.PRE_UPDATED
        lq.save()
        return Response(self.get_serializer(lq).data)

    @action(detail=True, methods=['post'], url_path='confirm-reverification')
    def confirm_reverification(self, request, pk=None):
        lq = self.get_object()
        lq.pre_task_status = LeadQualification.PreTaskStatus.NONE
        lq.save()
        return Response(self.get_serializer(lq).data)

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        lq = self.get_object()
        lq.verification_status = request.data.get('verification_status', lq.verification_status)
        lq.verification_checklist = request.data.get('verification_checklist', lq.verification_checklist)
        lq.save()
        return Response(self.get_serializer(lq).data)

    @action(detail=True, methods=['post'], url_path='qualification')
    def qualification(self, request, pk=None):
        lq = self.get_object()
        lq.qualification_status = request.data.get('qualification_status', lq.qualification_status)
        lq.qualification_score = request.data.get('qualification_score', lq.qualification_score)
        lq.lq_notes = request.data.get('lq_notes', lq.lq_notes)
        lq.budget = request.data.get('budget', lq.budget)
        lq.authority = request.data.get('authority', lq.authority)
        lq.need = request.data.get('need', lq.need)
        lq.timeline = request.data.get('timeline', lq.timeline)
        lq.qualified_by = request.user
        lq.qualified_at = timezone.now()
        lq.save()
        return Response(self.get_serializer(lq).data)

from .models import CallbackReminder
from .serializers import CallbackReminderSerializer

class CallbackReminderViewSet(viewsets.ModelViewSet):
    serializer_class = CallbackReminderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CallbackReminder.objects.filter(is_completed=False).order_by('scheduled_datetime')
        
    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request):
        now = timezone.now()
        # Get active reminders
        reminders = self.get_queryset()
        return Response(self.get_serializer(reminders, many=True).data)
        
    @action(detail=True, methods=['patch'], url_path='mark-notified')
    def mark_notified(self, request, pk=None):
        reminder = self.get_object()
        interval = request.data.get('interval')
        if interval == '30m':
            reminder.notified_30m = True
        elif interval == '15m':
            reminder.notified_15m = True
        elif interval == '5m':
            reminder.notified_5m = True
        reminder.save()
        return Response(self.get_serializer(reminder).data)

from .models import OutreachLog
from .serializers import OutreachLogSerializer

class OutreachLogViewSet(viewsets.ModelViewSet):
    serializer_class = OutreachLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = OutreachLog.objects.all().order_by('-created_at')
        prospect_id = self.request.query_params.get('prospect')
        if prospect_id:
            queryset = queryset.filter(prospect_id=prospect_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProspectContactViewSet(viewsets.ModelViewSet):
    serializer_class = ProspectContactSerializer
    permission_classes = [IsPREOrLQ]
    queryset = ProspectContact.objects.all().select_related('prospect').order_by('-created_at')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['contact_name', 'official_email', 'prospect__company_name']
    ordering_fields = ['created_at', 'updated_at']
