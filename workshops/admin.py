from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from . import models

# Register your models here.


@admin.register(models.Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ("name", "time", "limit")
    ordering = ("name", "time")
    
class ParticipantResource(resources.ModelResource):
    class Meta:
        model = models.Participant

@admin.register(models.Participant)
class ParticipantAdmin(ImportExportModelAdmin):
    list_display = ("name", 'class_number', "phone", 'email', "workshop",)
    ordering = ("workshop", "name",)
    list_filter = ("workshop",)
    resourse_classes = [ParticipantResource]    