from django.utils import timezone
from rest_framework.decorators import action
from accounts.permissions import IsPRE, IsLQ, IsPREOrLQ
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from .models import Prospect, ProspectOffering, ProspectContact, LeadQualification, EmailVerification
from .serializers import ProspectSerializer, LeadQualificationSerializer, ProspectContactSerializer

def apply_lq_distribution_filter(queryset, user, prospect_field_prefix=''):
    """
    Applies the sequential batch distribution logic for LQ users.
    Distributes prospects in batches of 5 based on creation order.
    """
    if user.is_superuser or not hasattr(user, 'profile') or user.profile.role != 'LQ':
        return queryset
        
    from django.contrib.auth import get_user_model
    from django.db.models.expressions import RawSQL
    User = get_user_model()
    
    # Only include non-superusers in the distribution pool
    lq_users = list(User.objects.filter(profile__role='LQ', is_superuser=False).order_by('id').values_list('id', flat=True))
    
    if user.id in lq_users:
        N = len(lq_users)
        current_index = lq_users.index(user.id)
        query = f"""
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) - 1 as row_num
                FROM prospects_prospect
            ) as subquery
            WHERE MOD(CAST(FLOOR(row_num / 5) AS INTEGER), {N}) = {current_index}
        """
        filter_kwargs = {f"{prospect_field_prefix}in": RawSQL(query, [])}
        return queryset.filter(**filter_kwargs)
    return queryset.none()

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
        
        # Role-based filtering
        user = self.request.user
        if not user.is_superuser and hasattr(user, 'profile'):
            if user.profile.role == 'PRE':
                queryset = queryset.filter(created_by=user.username)
            elif user.profile.role == 'LQ':
                queryset = apply_lq_distribution_filter(queryset, user, 'id__')
            
        market_event = self.request.query_params.get('market_event')
        if market_event:
            queryset = queryset.filter(market_event_participations__market_event=market_event).distinct()
        return queryset

    def create(self, request, *args, **kwargs):
        # Duplicate validation by exact company name (case-insensitive)
        company_name = request.data.get('company_name')
        if company_name and Prospect.objects.filter(company_name__iexact=company_name.strip()).exists():
            return Response(
                {'error': 'A prospect with this company name has already been entered.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("VALIDATION ERROR:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.username)

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
    def get_queryset(self):
        queryset = LeadQualification.objects.all().select_related('prospect').order_by('-updated_at')
        user = self.request.user
        if not user.is_superuser and hasattr(user, 'profile'):
            if user.profile.role == 'PRE':
                queryset = queryset.filter(prospect__created_by=user.username)
            elif user.profile.role == 'LQ':
                queryset = apply_lq_distribution_filter(queryset, user, 'prospect_id__')
        return queryset


    def _evaluate_qualification_status(self, lq):
        from .models import CallActivity, ProspectContact, LeadQualification
        from django.utils import timezone
        import datetime
        
        contacts = ProspectContact.objects.filter(prospect=lq.prospect)
        if not contacts.exists():
            return
            
        all_lead_qualified = True
        all_not_interested = True
        latest_not_interested_date = None
        
        for contact in contacts:
            latest_call = CallActivity.objects.filter(prospect_contact=contact).order_by('-created_at').first()
            if not latest_call:
                all_lead_qualified = False
                all_not_interested = False
                break
                
            if latest_call.communication_outcome != 'Lead Qualified':
                all_lead_qualified = False
            if latest_call.communication_outcome != 'Not Interested':
                all_not_interested = False
            else:
                if latest_not_interested_date is None or latest_call.created_at > latest_not_interested_date:
                    latest_not_interested_date = latest_call.created_at

        updated = False
        if all_lead_qualified and lq.qualification_status != LeadQualification.QualificationStatus.LEAD_QUALIFIED:
            lq.qualification_status = LeadQualification.QualificationStatus.LEAD_QUALIFIED
            updated = True
            
        if all_not_interested and latest_not_interested_date:
            if timezone.now() >= latest_not_interested_date + datetime.timedelta(days=30):
                if lq.qualification_status != LeadQualification.QualificationStatus.BUDGET_FROZEN:
                    lq.qualification_status = LeadQualification.QualificationStatus.BUDGET_FROZEN
                    updated = True
        elif not all_not_interested and not all_lead_qualified:
            # Revert to UNQUALIFIED if consensus is broken
            if lq.qualification_status in [LeadQualification.QualificationStatus.LEAD_QUALIFIED, LeadQualification.QualificationStatus.BUDGET_FROZEN]:
                lq.qualification_status = LeadQualification.QualificationStatus.UNQUALIFIED
                updated = True

        if updated:
            lq.save(update_fields=['qualification_status'])

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        for lq in queryset:
            self._evaluate_qualification_status(lq)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        self._evaluate_qualification_status(instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

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
        queryset = CallbackReminder.objects.filter(is_completed=False).order_by('scheduled_datetime')
        user = self.request.user
        if not user.is_superuser and hasattr(user, 'profile') and user.profile.role == 'LQ':
            queryset = apply_lq_distribution_filter(queryset, user, 'prospect_id__')
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.username)

    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request):
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
    def get_queryset(self):
        queryset = ProspectContact.objects.all().select_related('prospect').order_by('-created_at')
        user = self.request.user
        if not user.is_superuser and hasattr(user, 'profile'):
            if user.profile.role == 'PRE':
                queryset = queryset.filter(prospect__created_by=user.username)
            elif user.profile.role == 'LQ':
                queryset = apply_lq_distribution_filter(queryset, user, 'prospect_id__')
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.username)


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
    permission_classes = [IsPREOrLQ]

    def get_queryset(self):
        queryset = CommunicationActivity.objects.all().order_by('-created_at')
        prospect_id = self.request.query_params.get('prospect')
        contact_id = self.request.query_params.get('contact')
        if prospect_id:
            queryset = queryset.filter(prospect_id=prospect_id)
        if contact_id:
            queryset = queryset.filter(prospect_contact_id=contact_id)
            
        user = self.request.user
        if not user.is_superuser and hasattr(user, 'profile') and user.profile.role == 'LQ':
            queryset = apply_lq_distribution_filter(queryset, user, 'prospect_id__')
            
        return queryset

class CallActivityViewSet(viewsets.ModelViewSet):
    serializer_class = CallActivitySerializer
    permission_classes = [IsPREOrLQ]

    def get_queryset(self):
        queryset = CallActivity.objects.all().order_by('-created_at')
        prospect_id = self.request.query_params.get('prospect')
        contact_id = self.request.query_params.get('contact')
        if prospect_id:
            queryset = queryset.filter(prospect_id=prospect_id)
        if contact_id:
            queryset = queryset.filter(prospect_contact_id=contact_id)
            
        user = self.request.user
        if not user.is_superuser and hasattr(user, 'profile') and user.profile.role == 'LQ':
            queryset = apply_lq_distribution_filter(queryset, user, 'prospect_id__')
            
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

        try:
            call_command('sync_imap')
            return Response({'message': 'IMAP Sync completed successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Error running sync_imap: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer_class = OutreachEmailSerializer

    def get_queryset(self):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role != 'LQ':
            return OutreachEmail.objects.none()
        queryset = OutreachEmail.objects.all().order_by('-created_at')
        prospect_id = self.request.query_params.get('prospect')
        if prospect_id:
            queryset = queryset.filter(prospect_id=prospect_id)
            
        user = self.request.user
        if not user.is_superuser and hasattr(user, 'profile') and user.profile.role == 'LQ':
            queryset = apply_lq_distribution_filter(queryset, user, 'prospect_id__')
            
        return queryset

    def create(self, request, *args, **kwargs):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role != 'LQ':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only LQ users can send emails.")
        user = request.user
        mail_account = MailAccount.objects.filter(id=user.profile.mail_account_id, is_active=True).first()
        if not mail_account:
            return Response({'error': 'No active mail account found for the current user.'}, status=status.HTTP_400_BAD_REQUEST)

        if mail_account.smtp_status != 'VERIFIED':
            return Response({'error': 'Sender SMTP account is not verified.'}, status=status.HTTP_400_BAD_REQUEST)

        prospect_id = request.data.get('prospect')
        subject = request.data.get('subject')
        body = request.data.get('body') or ''
        recipients_data = request.data.get('recipients', [])

        # Create EmailMessage
        from email.utils import formatdate
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = f"{mail_account.display_name} <{mail_account.email_address}>"
        msg['Reply-To'] = mail_account.email_address
        msg['Date'] = formatdate(localtime=True)

        to_emails = []
        cc_emails = []
        bcc_emails = []

        import json
        if isinstance(recipients_data, str):
            recipients_data = json.loads(recipients_data)

        # PRE-FLIGHT RECIPIENT CHECKS
        prospect = Prospect.objects.filter(id=prospect_id).first()
        if not prospect:
            return Response({'error': 'Prospect not found.'}, status=status.HTTP_400_BAD_REQUEST)

        for rcpt in recipients_data:
            email = rcpt.get('email_address')
            contact_id = rcpt.get('prospect_contact')

            # Verification check removed per user request

            rtype = rcpt.get('recipient_type', 'TO').upper()
            if rtype == 'TO': to_emails.append(email)
            elif rtype == 'CC': cc_emails.append(email)
            elif rtype == 'BCC': bcc_emails.append(email)

        if to_emails: msg['To'] = ', '.join(to_emails)
        if cc_emails: msg['Cc'] = ', '.join(cc_emails)
        if bcc_emails: msg['Bcc'] = ', '.join(bcc_emails)

        msg_id = make_msgid(domain=mail_account.email_address.split('@')[-1] if '@' in mail_account.email_address else 'local')
        msg['Message-ID'] = msg_id

        # Email open tracking
        import uuid
        from django.conf import settings
        import html
        tracking_token = uuid.uuid4()
        tracking_url = f"{settings.EMAIL_TRACKING_BASE_URL}/api/email-tracking/{tracking_token}/"

        full_body = body
        if mail_account.default_signature:
            full_body += f"\n\n{mail_account.default_signature}"

        msg.set_content(full_body)
        
        # HTML alternative with tracking pixel
        html_body = html.escape(body).replace('\n', '<br>')
        html_signature = ""
        if mail_account.default_signature:
            sig_safe = html.escape(mail_account.default_signature).replace('\n', '<br>')
            html_signature = f"\n<div>\n{sig_safe}\n</div>\n"

        html_content = f"""<html><body>
<div style="font-family: sans-serif;">{html_body}</div><br>{html_signature}
<img src="{tracking_url}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;">
</body></html>"""
        msg.add_alternative(html_content, subtype='html')

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
        except smtplib.SMTPRecipientsRefused as e:
            for rcpt_email, (code, msg_bytes) in e.recipients.items():
                if code >= 500:
                    verification = EmailVerification.objects.filter(prospect=prospect, email_address=rcpt_email).first()
                    if verification:
                        verification.verification_status = 'INVALID'
                        verification.reason = f'Permanent SMTP failure: {code} {msg_bytes.decode("utf-8", errors="ignore")}'
                        verification.save()

                        lq = prospect.lead_qualification
                        lq.pre_task_status = LeadQualification.PreTaskStatus.ISSUE_SENT_TO_PRE
                        lq.issue_category = 'Email Verification'
                        lq.issue_details = f"Email could not be delivered to {rcpt_email}. Verification updated to Invalid."
                        lq.save()
            return Response({'error': 'Email could not be delivered to one or more recipients. A verification task has been sent to PRE.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'SMTP Send failed. Please verify configuration.'}, status=status.HTTP_400_BAD_REQUEST)

        # Persistence
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
            thread_id=msg_id,
            tracking_token=tracking_token
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

from django.views import View
from django.http import HttpResponse

class EmailTrackingView(View):
    def get(self, request, tracking_token, *args, **kwargs):
        # 1x1 transparent GIF base64 decoded
        PIXEL_GIF_DATA = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'

        try:
            email = OutreachEmail.objects.filter(tracking_token=tracking_token).first()
            if email and not email.is_opened:
                email.is_opened = True
                email.opened_at = timezone.now()
                email.save(update_fields=['is_opened', 'opened_at'])
        except Exception:
            pass  # Fail silently to avoid leaking info or breaking the pixel

        return HttpResponse(PIXEL_GIF_DATA, content_type='image/gif')
