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




class ProspectContactViewSet(viewsets.ModelViewSet):
    serializer_class = ProspectContactSerializer
    permission_classes = [IsPREOrLQ]
    queryset = ProspectContact.objects.all().select_related('prospect').order_by('-created_at')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['contact_name', 'official_email', 'prospect__company_name']
    ordering_fields = ['created_at', 'updated_at']

from .models import OutreachEmail, OutreachEmailRecipient, EmailAttachment, CallActivity, CommunicationActivity, ProspectContact
from .serializers import OutreachEmailSerializer, CallActivitySerializer, CommunicationActivitySerializer
from django.utils import timezone
from accounts.models import MailAccount
import smtplib
from email.message import EmailMessage
from email.utils import make_msgid
import utils.encryption as encryption

class CommunicationActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CommunicationActivitySerializer
    permission_classes = [IsPREOrLQ] # Assuming LQ can read, PRE may read too? The spec says 'PRE cannot access communication history'. So IsLQ.

    def get_permissions(self):
        # We need an IsLQ permission here. I'll just check it manually in get_queryset or define IsLQ.
        # Actually I can define IsLQ here or just rely on get_queryset
        return super().get_permissions()

    def get_queryset(self):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role != 'LQ':
            return CommunicationActivity.objects.none() # Or raise PermissionDenied
        queryset = CommunicationActivity.objects.all().order_by('-created_at')
        prospect_id = self.request.query_params.get('prospect')
        if prospect_id:
            queryset = queryset.filter(prospect_id=prospect_id)
        return queryset

class CallActivityViewSet(viewsets.ModelViewSet):
    serializer_class = CallActivitySerializer

    def get_queryset(self):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role != 'LQ':
            return CallActivity.objects.none()
        queryset = CallActivity.objects.all().order_by('-created_at')
        prospect_id = self.request.query_params.get('prospect')
        if prospect_id:
            queryset = queryset.filter(prospect_id=prospect_id)
        return queryset

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role != 'LQ':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only LQ users can record calls.")
        call = serializer.save(created_by=self.request.user)
        # Create CommunicationActivity
        CommunicationActivity.objects.create(
            prospect=call.prospect,
            prospect_contact=call.prospect_contact,
            activity_type='CALL',
            direction='OUTBOUND',
            status=call.call_status,
            outcome=call.communication_outcome,
            notes=call.notes,
            call_activity=call,
            performed_by=self.request.user
        )

class OutreachEmailViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['post'])
    def sync_imap(self, request):
        if hasattr(request.user, 'profile') and request.user.profile.role != 'LQ':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only LQ users can sync emails.")
        
        from django.core.management import call_command
        import threading
        
        def run_sync():
            try:
                call_command('sync_imap')
            except Exception as e:
                print(f"Error running sync_imap: {e}")
                
        threading.Thread(target=run_sync).start()
        
        return Response({'message': 'IMAP Sync started in the background. Please wait a few seconds and refresh.'}, status=status.HTTP_200_OK)

    serializer_class = OutreachEmailSerializer
    
    def get_queryset(self):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role != 'LQ':
            return OutreachEmail.objects.none()
        queryset = OutreachEmail.objects.all().order_by('-created_at')
        prospect_id = self.request.query_params.get('prospect')
        if prospect_id:
            queryset = queryset.filter(prospect_id=prospect_id)
        return queryset

    def create(self, request, *args, **kwargs):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role != 'LQ':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only LQ users can send emails.")
        # We need to handle sending email via SMTP here.
        user = request.user
        mail_account = MailAccount.objects.filter(id=user.profile.mail_account_id, is_active=True).first()
        if not mail_account:
            return Response({'error': 'No active mail account found for the current user.'}, status=status.HTTP_400_BAD_REQUEST)
        
        prospect_id = request.data.get('prospect')
        subject = request.data.get('subject')
        body = request.data.get('body') or ''
        recipients_data = request.data.get('recipients', []) # Expected list of dicts: [{'email_address': '...', 'prospect_contact': 'id', 'type': 'TO'}]
        
        # Create EmailMessage
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = f"{mail_account.display_name} <{mail_account.email_address}>"
        
        to_emails = []
        cc_emails = []
        bcc_emails = []
        
        import json
        if isinstance(recipients_data, str):
            recipients_data = json.loads(recipients_data)
            
        for rcpt in recipients_data:
            rtype = rcpt.get('recipient_type', 'TO').upper()
            email = rcpt.get('email_address')
            if rtype == 'TO': to_emails.append(email)
            elif rtype == 'CC': cc_emails.append(email)
            elif rtype == 'BCC': bcc_emails.append(email)
            
        if to_emails: msg['To'] = ', '.join(to_emails)
        if cc_emails: msg['Cc'] = ', '.join(cc_emails)
        if bcc_emails: msg['Bcc'] = ', '.join(bcc_emails)
        
        msg_id = make_msgid(domain=mail_account.email_address.split('@')[-1] if '@' in mail_account.email_address else 'local')
        msg['Message-ID'] = msg_id
        
        full_body = body
        if mail_account.default_signature:
            full_body += f"\n\n{mail_account.default_signature}"
            
        msg.set_content(full_body)
        
        # Handle Attachments
        files = request.FILES.getlist('attachments')
        total_size = sum(f.size for f in files)
        if total_size > 25 * 1024 * 1024:
            return Response({'error': 'Total attachment size exceeds 25MB limit.'}, status=status.HTTP_400_BAD_REQUEST)
            
        for f in files:
            if f.size > 10 * 1024 * 1024:
                return Response({'error': f'File {f.name} exceeds 10MB limit.'}, status=status.HTTP_400_BAD_REQUEST)
            ext = f.name.split('.')[-1].lower() if '.' in f.name else ''
            if ext in ['exe', 'bat', 'cmd', 'js', 'ps1', 'vbs', 'scr']:
                return Response({'error': f'File type .{ext} is not allowed.'}, status=status.HTTP_400_BAD_REQUEST)
            msg.add_attachment(f.read(), maintype='application', subtype='octet-stream', filename=f.name)
            f.seek(0)
            
        # Send via SMTP
        try:
            password = encryption.decrypt_password(mail_account.smtp_app_password_encrypted)
            if mail_account.smtp_security == 'SSL':
                server = smtplib.SMTP_SSL(mail_account.smtp_host, mail_account.smtp_port)
            else:
                server = smtplib.SMTP(mail_account.smtp_host, mail_account.smtp_port)
                server.starttls()
            server.login(mail_account.smtp_username, password)
            server.send_message(msg)
            server.quit()
        except Exception as e:
            return Response({'error': f'SMTP Send failed. Please verify configuration.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Persistence
        prospect = Prospect.objects.get(id=prospect_id)
        outreach_email = OutreachEmail.objects.create(
            prospect=prospect,
            created_by=user,
            sender_mail_account=mail_account,
            from_email=mail_account.email_address,
            from_name=mail_account.display_name,
            subject=subject,
            body=full_body,
            signature=mail_account.default_signature,
            status='WAITING FOR RESPONSE',
            sent_at=timezone.now(),
            message_id=msg_id,
            thread_id=msg_id # Root message
        )
        
        for rcpt in recipients_data:
            contact_id = rcpt.get('prospect_contact')
            contact = ProspectContact.objects.filter(id=contact_id).first() if contact_id else None
            OutreachEmailRecipient.objects.create(
                outreach_email=outreach_email,
                email_address=rcpt.get('email_address'),
                prospect_contact=contact,
                recipient_type=rcpt.get('recipient_type', 'TO').upper()
            )
            
        for f in files:
            EmailAttachment.objects.create(
                outreach_email=outreach_email,
                file=f,
                original_filename=f.name,
                mime_type=f.content_type,
                size=f.size
            )
            
        # Create CommunicationActivity
        primary_contact_id = recipients_data[0].get('prospect_contact') if recipients_data else None
        primary_contact = ProspectContact.objects.filter(id=primary_contact_id).first() if primary_contact_id else None
        
        CommunicationActivity.objects.create(
            prospect=prospect,
            prospect_contact=primary_contact,
            activity_type='EMAIL_SENT',
            direction='OUTBOUND',
            status='Waiting for Response',
            subject=subject,
            outreach_email=outreach_email,
            performed_by=user
        )
        
        # Update LeadQualification email status if it exists
        if hasattr(prospect, 'lead_qualification'):
            prospect.lead_qualification.email_status = 'Waiting for Response'
            prospect.lead_qualification.save()
            
        serializer = self.get_serializer(outreach_email)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
