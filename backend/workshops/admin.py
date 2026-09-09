from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from . import models

# Register your models here.


@admin.register(models.Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ("name", "time", "room", "limit")
    ordering = ("ordering", "name", "time")
    
class ParticipantResource(resources.ModelResource):
    class Meta:
        model = models.Participant

@admin.register(models.Participant)
class ParticipantAdmin(ImportExportModelAdmin):
    list_display = ("name", 'class_number', "phone", 'email', "workshop", "created_at")
    ordering = ("workshop", "name",)
    list_filter = ("workshop",)
    resourse_classes = [ParticipantResource]    