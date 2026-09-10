from rest_framework import serializers

from .fields import RelativeFileField
from .models import (
    OlympiadResult,
    PageSeo,
    Partner,
    ProgramItem,
    RegistrationSection,
    SiteSettings,
    SocialLink,
)


class RegistrationSectionSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    message = serializers.CharField(read_only=True)

    class Meta:
        model = RegistrationSection
        fields = ['slug', 'status', 'is_open', 'closed_title', 'message', 'opens_at', 'closes_at']


class ProgramItemSerializer(serializers.ModelSerializer):
    image = RelativeFileField()

    class Meta:
        model = ProgramItem
        fields = ['id', 'title', 'image', 'href', 'ordering']


class PartnerSerializer(serializers.ModelSerializer):
    logo = RelativeFileField()

    class Meta:
        model = Partner
        fields = ['id', 'name', 'logo', 'website']


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'title', 'url']


class OlympiadResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = OlympiadResult
        fields = ['year', 'intro', 'body_html']


class PageSeoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageSeo
        fields = ['slug', 'title', 'description', 'og_title', 'og_description', 'keywords']


class SiteSettingsSerializer(serializers.ModelSerializer):
    event_time = serializers.TimeField(format='%H:%M')

    class Meta:
        model = SiteSettings
        fields = [
            'event_date', 'event_time', 'event_place', 'event_description',
            'olympiad_dates', 'olympiad_format', 'olympiad_results_date',
            'show_olympiad_results', 'show_awards_ceremony', 'awards_ceremony_html',
            'contact_person', 'contact_email', 'contact_phone', 'footer_copyright',
            'consent_text', 'privacy_policy_url',
        ]
