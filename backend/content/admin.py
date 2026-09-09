from django.contrib import admin
from django.utils.html import format_html

from . import models


@admin.register(models.SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Фестиваль', {
            'fields': ('event_date', 'event_time', 'event_place', 'event_description'),
        }),
        ('Олимпиады', {
            'fields': (
                'olympiad_dates', 'olympiad_format', 'olympiad_results_date',
                'show_olympiad_results', 'show_awards_ceremony', 'awards_ceremony_html',
            ),
        }),
        ('Контакты', {
            'fields': ('contact_person', 'contact_email', 'contact_phone', 'footer_copyright'),
        }),
        ('Персональные данные', {
            'fields': ('consent_text', 'privacy_policy_url'),
        }),
    )

    def has_add_permission(self, request):
        # Настройки всегда в единственном экземпляре.
        return not models.SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(models.RegistrationSection)
class RegistrationSectionAdmin(admin.ModelAdmin):
    list_display = ('get_slug_display', 'status_badge', 'opens_at', 'closes_at', 'force_closed')
    list_editable = ('force_closed',)
    readonly_fields = ('status_badge',)
    fields = (
        'slug', 'status_badge', 'opens_at', 'closes_at', 'force_closed',
        'closed_title', 'message_before', 'message_after',
    )

    @admin.display(description='Сейчас')
    def status_badge(self, obj):
        colors = {'before': '#b8860b', 'open': '#1a7f37', 'after': '#a40e26'}
        return format_html(
            '<b style="color:{}">{}</b>',
            colors.get(obj.status, '#333'),
            obj.get_status_display_ru(),
        )

    def has_add_permission(self, request):
        # Разделы создаёт seed; вручную добавлять новые не нужно.
        return models.RegistrationSection.objects.count() < len(models.RegistrationSection.SLUG_CHOICES)


@admin.register(models.ProgramItem)
class ProgramItemAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'href', 'ordering', 'is_visible')
    list_editable = ('ordering', 'is_visible')


@admin.register(models.Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'website', 'ordering', 'is_visible')
    list_editable = ('ordering', 'is_visible')


@admin.register(models.SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ('title', 'url', 'ordering', 'is_visible')
    list_editable = ('ordering', 'is_visible')


@admin.register(models.OlympiadResult)
class OlympiadResultAdmin(admin.ModelAdmin):
    list_display = ('year', 'is_published')
    list_editable = ('is_published',)


@admin.register(models.PageSeo)
class PageSeoAdmin(admin.ModelAdmin):
    list_display = ('get_slug_display', 'title')
