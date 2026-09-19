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
import utils.encryption as encryption

class IsLQ(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'LQ')

class MailAccountViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MailAccountSerializer
    permission_classes = [IsLQ]

    def get_queryset(self):
        return MailAccount.objects.filter(assigned_users__user=self.request.user)
        
    @action(detail=False, methods=['post'], url_path='test-smtp')
    def test_smtp(self, request):
        mail_account = self.get_queryset().first()
        if not mail_account:
            return Response({'error': 'No mail account configured.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            password = encryption.decrypt_password(mail_account.smtp_app_password_encrypted)
            if mail_account.smtp_security == 'SSL':
                server = smtplib.SMTP_SSL(mail_account.smtp_host, mail_account.smtp_port)
            else:
                server = smtplib.SMTP(mail_account.smtp_host, mail_account.smtp_port)
                server.starttls()
                
            server.login(mail_account.smtp_username, password)
            server.quit()
            return Response({'message': 'SMTP connection successful.'})
        except Exception as e:
            return Response({'error': 'Unable to connect to SMTP server. Please verify the configuration.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='test-imap')
    def test_imap(self, request):
        mail_account = self.get_queryset().first()
        if not mail_account:
            return Response({'error': 'No mail account configured.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            password = encryption.decrypt_password(mail_account.imap_app_password_encrypted)
            if mail_account.imap_security == 'SSL':
                server = imaplib.IMAP4_SSL(mail_account.imap_host, mail_account.imap_port)
            else:
                server = imaplib.IMAP4(mail_account.imap_host, mail_account.imap_port)
                server.starttls()
                
            server.login(mail_account.imap_username, password)
            server.logout()
            return Response({'message': 'IMAP connection successful.'})
        except Exception as e:
            return Response({'error': 'Unable to connect to IMAP server. Please verify the configuration.'}, status=status.HTTP_400_BAD_REQUEST)
