from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from content.models import RegistrationSection
from content.registration import RegistrationWindowMixin, normalize_email, normalize_name

from .models import Institute, Participant

MONTHS_GENITIVE = (
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
)


class InstituteSerializer(serializers.ModelSerializer):
    # Фронтенд показывает одну строку вида «3 октября, 11:00», поэтому
    # дата и время собираются здесь, а не в вёрстке.
    time = serializers.SerializerMethodField()
    class Meta:
        model = Institute
        fields = ['id', 'name', 'limit', 'limit_left', 'time', 'starts_at', 'image', 'address', 'ordering']

    def get_time(self, obj):
        local = timezone.localtime(obj.starts_at)
        return f'{local.day} {MONTHS_GENITIVE[local.month - 1]}, {local:%H:%M}'


class ParticipantSerializer(RegistrationWindowMixin, serializers.ModelSerializer):
    registration_slug = RegistrationSection.EXCURSIONS

    class Meta:
        model = Participant
        fields = ['id', 'name', 'passport', 'email', 'phone', 'underages_count', 'underages', 'institute']

    def validate(self, attrs):
        """Один человек — одна экскурсия."""
        attrs = super().validate(attrs)

        existing = (
            Participant.objects
            .filter(
                name_norm=normalize_name(attrs.get('name')),
                email_norm=normalize_email(attrs.get('email')),
            )
            .select_related('institute')
            .first()
        )
        if existing:
            raise serializers.ValidationError({
                'non_field_errors': [
                    f'Вы уже записались на экскурсию в {existing.institute.name}. '
                    f'Можно записаться только на одну экскурсию.'
                ],
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        institute = validated_data['institute']
        locked = Institute.objects.select_for_update().get(pk=institute.pk)
        validated_data['institute'] = locked

        # Сопровождающий занимает место себе и каждому ребёнку.
        needed = 1 + (validated_data.get('underages_count') or 0)
        if locked.limit_left < needed:
            raise serializers.ValidationError({
                'non_field_errors': ['К сожалению, места в этот институт закончились.'],
            })

        return super().create(validated_data)
