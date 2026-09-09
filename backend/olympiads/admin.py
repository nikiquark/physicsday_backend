from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from . import models

# Register your models here.

    
class ParticipantResource(resources.ModelResource):
    class Meta:
        model = models.Participant

@admin.register(models.Participant)
class ParticipantAdmin(ImportExportModelAdmin):
    list_display = ("name", 'class_number', "phone", 'email',)
    ordering = ("name",)
    resourse_classes = [ParticipantResource]    