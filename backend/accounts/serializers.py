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
