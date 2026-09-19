from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile
from django import forms

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profile'

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
