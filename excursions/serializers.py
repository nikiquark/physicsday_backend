# serializers.py
from django.db import transaction
from rest_framework import serializers
from .models import Institute, Participant

class InstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institute
        fields = ['id', 'name', 'limit', 'limit_left', 'time', 'image', 'adress', 'ordering']

    time = serializers.TimeField(format="%H:%M")


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ['id', 'name', 'passport', 'email', 'phone', 'underages_count', 'underages', 'institute']

    def validate(self, attrs):
        """
        Запретить повторную запись одного и того же человека (ФИО + email)
        в любой институт. Сообщить, куда он уже записан.
        """
        name = attrs.get('name')
        email = attrs.get('email')

        existing = (
            Participant.objects
            .filter(name=name, email=email)
            .select_related('institute')
            .first()
        )
        if existing:
            raise serializers.ValidationError({
                "non_field_errors": [
                    f"Вы уже записались на экскурсию в {existing.institute.name}. "
                    f"Можно записаться только на одну экскурсию."
                ]
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        """
        Проверка лимита мест под блокировкой строки института,
        затем создание участника.
        """
        institute = validated_data['institute']
        locked_institute = Institute.objects.select_for_update().get(pk=institute.pk)

        validated_data['institute'] = locked_institute

        if locked_institute.limit_left <= 0:
            raise serializers.ValidationError({
                "non_field_errors": ["К сожалению, места в этот институт закончились."]
            })

        return super().create(validated_data)
