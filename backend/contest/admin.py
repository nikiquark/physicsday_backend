from django.contrib import admin
from django.utils.html import format_html
from import_export import resources
from import_export.fields import Field
from import_export.admin import ImportExportModelAdmin

from . import models


class AgeRangeFilter(admin.SimpleListFilter):
    """Возраст по условиям конкурса или мимо них.

    Фильтр по самому числу бесполезен: жюри интересует ровно один
    вопрос — попадает работа в рамки 5–17 лет или нет.
    """

    title = 'Возраст'
    parameter_name = 'age_range'

    def lookups(self, request, model_admin):
        return [
            ('in', f'{models.MIN_AGE}–{models.MAX_AGE} лет (по условиям)'),
            ('out', 'Вне условий конкурса'),
        ]

    def queryset(self, request, queryset):
        if self.value() == 'in':
            return queryset.filter(age__gte=models.MIN_AGE, age__lte=models.MAX_AGE)
        if self.value() == 'out':
            return queryset.exclude(age__gte=models.MIN_AGE, age__lte=models.MAX_AGE)
        return queryset


class ArtworkResource(resources.ModelResource):
    photo_url = Field(column_name='Ссылка на файл')

    class Meta:
        model = models.Artwork
        fields = (
            'id', 'author_name', 'age', 'city', 'school', 'class_number',
            'title', 'parent_name', 'email', 'phone', 'photo_url',
            'is_published', 'moderation_note', 'created_at',
        )
        export_order = fields

    def dehydrate_photo_url(self, artwork):
        return artwork.photo.url if artwork.photo else ''


@admin.register(models.Artwork)
class ArtworkAdmin(ImportExportModelAdmin):
    resource_classes = [ArtworkResource]

    list_display = (
        'thumbnail', 'author_name', 'age_badge', 'city', 'class_display',
        'title', 'created_at', 'is_published',
    )
    list_display_links = ('thumbnail', 'author_name')
    list_editable = ('is_published',)
    list_filter = (AgeRangeFilter, 'is_published', 'city')
    search_fields = ('author_name', 'email', 'city', 'parent_name', 'title')
    date_hierarchy = 'created_at'
    readonly_fields = ('preview', 'created_at')

    fieldsets = (
        ('Работа', {
            'fields': ('preview', 'photo', 'title'),
        }),
        ('Автор', {
            'fields': ('author_name', 'age', 'city', 'school', 'class_number'),
        }),
        ('Контакты', {
            'fields': ('parent_name', 'email', 'phone', 'publication_consent'),
        }),
        ('Работа с заявкой', {
            'fields': ('is_published', 'moderation_note', 'created_at'),
        }),
    )

    @admin.display(description='Работа')
    def thumbnail(self, obj):
        if not obj.photo:
            return '—'
        if obj.has_preview:
            return format_html(
                '<img src="{}" style="width:80px;height:80px;object-fit:cover;'
                'border-radius:6px" />',
                obj.photo.url,
            )
        # HEIC браузер не рисует, поэтому вместо картинки — ссылка на файл.
        return format_html(
            '<a href="{}" download style="display:inline-block;width:80px;'
            'height:80px;line-height:80px;text-align:center;background:#eee;'
            'border-radius:6px;font-size:11px">{}</a>',
            obj.photo.url,
            obj.photo_extension.lstrip('.').upper() or 'файл',
        )

    @admin.display(description='Возраст', ordering='age')
    def age_badge(self, obj):
        if obj.age_out_of_range:
            return format_html(
                '<b style="color:#a40e26" title="Вне условий конкурса">{}</b>', obj.age,
            )
        return obj.age

    @admin.display(description='Класс', ordering='class_number')
    def class_display(self, obj):
        if obj.class_number is None:
            return '—'
        return 'Дошкольник' if obj.class_number == 0 else obj.class_number

    @admin.display(description='Просмотр')
    def preview(self, obj):
        if not obj.photo:
            return '—'
        if obj.has_preview:
            return format_html(
                '<div><a href="{0}" target="_blank"><img src="{0}" '
                'style="max-width:100%;max-height:600px;border-radius:8px" /></a>'
                '<p><a href="{0}" download>Скачать оригинал</a></p></div>',
                obj.photo.url,
            )
        return format_html(
            '<div><p>Формат {}: браузер не показывает такие файлы.</p>'
            '<p><a href="{}" download>Скачать оригинал</a></p></div>',
            obj.photo_extension.lstrip('.').upper(),
            obj.photo.url,
        )
