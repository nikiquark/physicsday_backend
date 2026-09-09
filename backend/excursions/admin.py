from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from . import models

# Register your models here.


@admin.register(models.Institute)
class InstituteAdmin(admin.ModelAdmin):
    list_display = ("name", "starts_at", "address", "limit")
    ordering = ("ordering", "name")
    
class ParticipantResource(resources.ModelResource):
    class Meta:
        model = models.Participant

@admin.register(models.Participant)
class ParticipantAdmin(ImportExportModelAdmin):
    list_display = ("name", "phone", 'email', "institute", 'underages_count', "created_at")
    ordering = ("institute", "name",)
    list_filter = ("institute",)
    resourse_classes = [ParticipantResource]    