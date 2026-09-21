from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('PRE', 'Prospect Research Engineer'),
        ('LQ', 'Lead Qualifier'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=3, choices=ROLE_CHOICES, default='PRE')
    mail_account = models.ForeignKey('MailAccount', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_users')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"



class MailAccount(models.Model):
    name = models.CharField(max_length=255, unique=True, help_text="e.g. Sales General Inbox")
    email_address = models.EmailField(unique=True)
    display_name = models.CharField(max_length=255)
    smtp_host = models.CharField(max_length=255)
    smtp_port = models.IntegerField(default=587)
    smtp_security = models.CharField(max_length=20, choices=(('TLS', 'TLS/STARTTLS'), ('SSL', 'SSL/TLS')), default='TLS')
    smtp_username = models.CharField(max_length=255)
    smtp_app_password_encrypted = models.TextField()
    smtp_status = models.CharField(max_length=20, choices=(('CONFIGURED', 'Configured'), ('VERIFIED', 'Verified'), ('FAILED', 'Failed')), default='CONFIGURED')
    imap_host = models.CharField(max_length=255)
    imap_port = models.IntegerField(default=993)
    imap_security = models.CharField(max_length=20, choices=(('TLS', 'TLS/STARTTLS'), ('SSL', 'SSL/TLS')), default='SSL')
    imap_username = models.CharField(max_length=255)
    imap_app_password_encrypted = models.TextField()
    imap_status = models.CharField(max_length=20, choices=(('CONFIGURED', 'Configured'), ('CONNECTED', 'Connected'), ('FAILED', 'Failed')), default='CONFIGURED')
    default_signature = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_imap_sync_at = models.DateTimeField(null=True, blank=True)
    last_sync_status = models.CharField(max_length=50, blank=True, null=True)
    last_sync_error = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.email_address})"
