from django.contrib import admin
from .models import Prospect, ProspectOffering, ProspectContact

class ProspectOfferingInline(admin.TabularInline):
    model = ProspectOffering
    extra = 1

class ProspectContactInline(admin.TabularInline):
    model = ProspectContact
    extra = 1

@admin.register(Prospect)
class ProspectAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'country_head_office', 'company_structure', 'operational_status', 'primary_offering_type', 'created_at')
    list_filter = ('company_structure', 'operational_status', 'primary_offering_type')
    search_fields = ('company_name', 'country_head_office')
    inlines = [ProspectOfferingInline, ProspectContactInline]

admin.site.register(ProspectOffering)
admin.site.register(ProspectContact)
