from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission

from rest_framework import viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from .permissions import IsPRE

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(user, 'profile', None) and user.profile.role or 'PRE',
            'is_superuser': user.is_superuser,
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]

from .models import MailAccount
from .serializers import MailAccountSerializer
from rest_framework.decorators import action
from rest_framework import status
import smtplib
import imaplib
import email
from email.header import decode_header
import utils.encryption as encryption

class IsLQ(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'LQ')

class MailAccountViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'])
    def fetch_emails(self, request):
        user = request.user
        if not hasattr(user, 'profile'):
            return Response({'error': 'No profile found.'}, status=status.HTTP_400_BAD_REQUEST)
        
        mail_account = MailAccount.objects.filter(id=user.profile.mail_account_id, is_active=True).first()
        if not mail_account:
            return Response({'error': 'No active mail account configured.'}, status=status.HTTP_400_BAD_REQUEST)
            
        folder = request.query_params.get('folder', 'INBOX')
        limit = int(request.query_params.get('limit', 20))
        
        try:
            password = encryption.decrypt_password(mail_account.imap_app_password_encrypted)
            if mail_account.imap_security == 'SSL':
                mail = imaplib.IMAP4_SSL(mail_account.imap_host, mail_account.imap_port)
            else:
                mail = imaplib.IMAP4(mail_account.imap_host, mail_account.imap_port)
                mail.starttls()
                
            mail.login(mail_account.imap_username, password)
            status_code, messages = mail.select(folder)
            
            if status_code != 'OK':
                return Response({'error': f'Failed to select folder {folder}'}, status=status.HTTP_400_BAD_REQUEST)
                
            status_code, response = mail.search(None, 'ALL')
            if status_code != 'OK':
                mail.logout()
                return Response({'error': 'Failed to search emails'}, status=status.HTTP_400_BAD_REQUEST)
                
            msg_nums = response[0].split()
            msg_nums = msg_nums[-limit:] # Get latest
            msg_nums.reverse() # Newest first
            
            emails = []
            for num in msg_nums:
                # Fetch headers only - very fast, no body download
                res_status, hdr_data = mail.fetch(num, '(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])')
                if res_status != 'OK':
                    continue

                subject = ''
                from_hdr = ''
                date_hdr = ''
                for part in hdr_data:
                    if isinstance(part, tuple):
                        hdr_msg = email.message_from_bytes(part[1])
                        raw_subject = hdr_msg.get('Subject', '')
                        decoded_hdr = decode_header(raw_subject)[0]
                        subject_bytes, enc = decoded_hdr
                        if isinstance(subject_bytes, bytes):
                            subject = subject_bytes.decode(enc or 'utf-8', errors='ignore')
                        else:
                            subject = subject_bytes or ''
                        from_hdr = hdr_msg.get('From', '')
                        date_hdr = hdr_msg.get('Date', '')

                emails.append({
                    'id': num.decode(),
                    'subject': subject,
                    'from': from_hdr,
                    'date': date_hdr,
                })
            
            mail.logout()
            return Response(emails, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def fetch_email_body(self, request):
        """Fetch the full body of a single email by ID. Called on-demand when user opens an email."""
        user = request.user
        if not hasattr(user, 'profile'):
            return Response({'error': 'No profile found.'}, status=status.HTTP_400_BAD_REQUEST)
        mail_account = MailAccount.objects.filter(id=user.profile.mail_account_id, is_active=True).first()
        if not mail_account:
            return Response({'error': 'No active mail account configured.'}, status=status.HTTP_400_BAD_REQUEST)

        folder = request.query_params.get('folder', 'INBOX')
        email_id = request.query_params.get('email_id')
        if not email_id:
            return Response({'error': 'email_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            password = encryption.decrypt_password(mail_account.imap_app_password_encrypted)
            if mail_account.imap_security == 'SSL':
                mail_conn = imaplib.IMAP4_SSL(mail_account.imap_host, mail_account.imap_port)
            else:
                mail_conn = imaplib.IMAP4(mail_account.imap_host, mail_account.imap_port)
                mail_conn.starttls()

            mail_conn.login(mail_account.imap_username, password)
            mail_conn.select(folder)

            res_status, msg_data = mail_conn.fetch(email_id.encode(), '(RFC822)')
            mail_conn.logout()

            if res_status != 'OK':
                return Response({'error': 'Failed to fetch email body.'}, status=status.HTTP_400_BAD_REQUEST)

            html_body = ''
            text_body = ''
            for part in msg_data:
                if isinstance(part, tuple):
                    msg = email.message_from_bytes(part[1])
                    if msg.is_multipart():
                        for mp in msg.walk():
                            content_type = mp.get_content_type()
                            disposition = str(mp.get('Content-Disposition', ''))
                            if 'attachment' in disposition:
                                continue
                            payload = mp.get_payload(decode=True)
                            if payload is None:
                                continue
                            charset = mp.get_content_charset() or 'utf-8'
                            decoded = payload.decode(charset, errors='ignore')
                            if content_type == 'text/html' and not html_body:
                                html_body = decoded
                            elif content_type == 'text/plain' and not text_body:
                                text_body = decoded
                    else:
                        payload = msg.get_payload(decode=True)
                        if payload:
                            charset = msg.get_content_charset() or 'utf-8'
                            decoded = payload.decode(charset, errors='ignore')
                            if msg.get_content_type() == 'text/html':
                                html_body = decoded
                            else:
                                text_body = decoded

            return Response({
                'html_body': html_body,
                'text_body': text_body,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer_class = MailAccountSerializer
    permission_classes = [IsLQ]

    def get_queryset(self):
        return MailAccount.objects.all()

    def perform_create(self, serializer):
        mail_account = serializer.save()
        profile = self.request.user.profile
        profile.mail_account = mail_account
        profile.save()

    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        mail_account = self.get_object()
        profile = request.user.profile
        profile.mail_account = mail_account
        profile.save()
        return Response({'status': 'default set'})

    @action(detail=True, methods=['post'], url_path='test-smtp')
    def test_smtp(self, request, pk=None):
        mail_account = self.get_object()
        try:
            password = encryption.decrypt_password(mail_account.smtp_app_password_encrypted)
            if mail_account.smtp_security == 'SSL':
                server = smtplib.SMTP_SSL(mail_account.smtp_host, mail_account.smtp_port)
            else:
                server = smtplib.SMTP(mail_account.smtp_host, mail_account.smtp_port)
                server.starttls()
            server.login(mail_account.smtp_username, password)
            server.quit()
            mail_account.smtp_status = 'VERIFIED'
            mail_account.save()
            return Response({'message': 'SMTP connection successful.'})
        except Exception as e:
            mail_account.smtp_status = 'FAILED'
            mail_account.save()
            return Response({'error': 'Unable to connect to SMTP server. Please verify the configuration.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='test-imap')
    def test_imap(self, request, pk=None):
        mail_account = self.get_object()
        try:
            password = encryption.decrypt_password(mail_account.imap_app_password_encrypted)
            if mail_account.imap_security == 'SSL':
                server = imaplib.IMAP4_SSL(mail_account.imap_host, mail_account.imap_port)
            else:
                server = imaplib.IMAP4(mail_account.imap_host, mail_account.imap_port)
                server.starttls()
            server.login(mail_account.imap_username, password)
            server.logout()
            mail_account.imap_status = 'CONNECTED'
            mail_account.save()
            return Response({'message': 'IMAP connection successful.'})
        except Exception as e:
            mail_account.imap_status = 'FAILED'
            mail_account.save()
            return Response({'error': 'Unable to connect to IMAP server. Please verify the configuration.'}, status=status.HTTP_400_BAD_REQUEST)
