from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'slug', 'is_active', 'created_at')
    search_fields = ('name', 'code', 'slug')
    list_filter = ('is_active',)
    prepopulated_fields = {'slug': ('name',)}
