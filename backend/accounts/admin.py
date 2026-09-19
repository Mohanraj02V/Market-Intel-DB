from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, MailAccount
from django import forms
from utils.encryption import encrypt_password

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profile'

class MailAccountForm(forms.ModelForm):
    smtp_app_password = forms.CharField(widget=forms.PasswordInput(render_value=False), required=False, help_text="Leave blank to keep existing password, or enter a new app password to update it.")
    imap_app_password = forms.CharField(widget=forms.PasswordInput(render_value=False), required=False, help_text="Leave blank to keep existing password, or enter a new app password to update it.")

    class Meta:
        model = MailAccount
        exclude = ('smtp_app_password_encrypted', 'imap_app_password_encrypted')

    def save(self, commit=True):
        instance = super().save(commit=False)
        smtp_pass = self.cleaned_data.get('smtp_app_password')
        if smtp_pass:
            instance.smtp_app_password_encrypted = encrypt_password(smtp_pass)
        
        imap_pass = self.cleaned_data.get('imap_app_password')
        if imap_pass:
            instance.imap_app_password_encrypted = encrypt_password(imap_pass)
            
        if commit:
            instance.save()
        return instance



class CustomUserCreationForm(forms.ModelForm):
    role = forms.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=False)
    
    class Meta:
        model = User
        fields = ('username', 'password')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
            role = self.cleaned_data.get('role')
            if role:
                user.profile.role = role
                user.profile.save()
        return user

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    
    add_form_template = None
    
    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            kwargs['form'] = CustomUserCreationForm
        return super().get_form(request, obj, **kwargs)
        
    def get_fieldsets(self, request, obj=None):
        if not obj:
            return (
                (None, {
                    'classes': ('wide',),
                    'fields': ('username', 'password', 'role'),
                }),
            )
        return super().get_fieldsets(request, obj)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(UserProfile)

class MailAccountAdmin(admin.ModelAdmin):
    form = MailAccountForm
    list_display = ('name', 'email_address', 'is_active', 'created_at')
    
admin.site.register(MailAccount, MailAccountAdmin)
