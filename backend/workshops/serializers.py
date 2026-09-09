from django.db import transaction
from rest_framework import serializers

from content.models import RegistrationSection
from content.registration import RegistrationWindowMixin, normalize_email, normalize_name

from .models import Participant, Workshop


class WorkshopSerializer(serializers.ModelSerializer):
    time = serializers.TimeField(format="%H:%M")

    class Meta:
        model = Workshop
        fields = ['id', 'name', 'limit', 'limit_left', 'time', 'image', 'restriction', 'room', 'ordering']


class ParticipantSerializer(RegistrationWindowMixin, serializers.ModelSerializer):
    registration_slug = RegistrationSection.WORKSHOPS

    class Meta:
        model = Participant
        fields = ['id', 'name', 'email', 'phone', 'city', 'school', 'class_number', 'workshop']

    def validate(self, attrs):
        """Один человек — один мастер-класс.

        Сравнение идёт по нормализованным ФИО и email, поэтому регистр,
        лишние пробелы и «ё» не создают второго участника. Родители часто
        указывают свой email на нескольких детей, поэтому одного email
        для блокировки недостаточно — нужна пара с ФИО.
        """
        attrs = super().validate(attrs)

        existing = (
            Participant.objects
            .filter(
                name_norm=normalize_name(attrs.get('name')),
                email_norm=normalize_email(attrs.get('email')),
            )
            .select_related('workshop')
            .first()
        )
        if existing:
            raise serializers.ValidationError({
                'non_field_errors': [
                    f'Вы уже зарегистрировались на «{existing.workshop.name} '
                    f'{existing.workshop.time:%H:%M}». Можно зарегистрироваться '
                    f'только на один мастер-класс.'
                ],
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        """Место занимается под блокировкой строки мастер-класса."""
        workshop = validated_data['workshop']
        locked = Workshop.objects.select_for_update().get(pk=workshop.pk)
        validated_data['workshop'] = locked

        if locked.limit_left <= 0:
            raise serializers.ValidationError({
                'non_field_errors': ['К сожалению, места на этот мастер-класс закончились.'],
            })

        return super().create(validated_data)
