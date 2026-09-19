from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, source='profile.role', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'username': {'required': False} # In case email is used as username
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        
        # Ensure username is set to email if not provided
        if 'email' in validated_data and not validated_data.get('username'):
            validated_data['username'] = validated_data['email']
            
        user = User.objects.create(**validated_data)
        
        if password:
            user.set_password(password)
            user.save()
            
        # The UserProfile is auto-created by the signal, so we just update it
        if 'role' in profile_data:
            user.profile.role = profile_data['role']
            user.profile.save()
            
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        if 'email' in validated_data and not validated_data.get('username'):
            validated_data['username'] = validated_data['email']

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        
        if 'role' in profile_data:
            instance.profile.role = profile_data['role']
            instance.profile.save()
            
        return instance

from .models import MailAccount
import utils.encryption as encryption

class MailAccountSerializer(serializers.ModelSerializer):
    smtp_app_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    imap_app_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = MailAccount
        fields = [
            'id', 'name', 'email_address', 'display_name',
            'smtp_host', 'smtp_port', 'smtp_security', 'smtp_username', 'smtp_app_password',
            'imap_host', 'imap_port', 'imap_security', 'imap_username', 'imap_app_password',
            'default_signature', 'is_active', 'last_imap_sync_at', 'last_sync_status', 'last_sync_error'
        ]
        read_only_fields = ['id', 'last_imap_sync_at', 'last_sync_status', 'last_sync_error']

    def create(self, validated_data):
        smtp_pw = validated_data.pop('smtp_app_password', None)
        imap_pw = validated_data.pop('imap_app_password', None)
        
        if smtp_pw:
            validated_data['smtp_app_password_encrypted'] = encryption.encrypt_password(smtp_pw)
        if imap_pw:
            validated_data['imap_app_password_encrypted'] = encryption.encrypt_password(imap_pw)
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        smtp_pw = validated_data.pop('smtp_app_password', None)
        imap_pw = validated_data.pop('imap_app_password', None)
        
        if smtp_pw:
            validated_data['smtp_app_password_encrypted'] = encryption.encrypt_password(smtp_pw)
        if imap_pw:
            validated_data['imap_app_password_encrypted'] = encryption.encrypt_password(imap_pw)
            
        return super().update(instance, validated_data)
