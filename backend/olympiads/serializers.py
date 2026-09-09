from rest_framework import serializers

from content.models import RegistrationSection
from content.registration import RegistrationWindowMixin

from .models import Participant


class ParticipantSerializer(RegistrationWindowMixin, serializers.ModelSerializer):
    # Приём заявок закрывается по времени на сервере: вкладка, открытая
    # до 10:00, не должна отправить заявку в 10:05.
    registration_slug = RegistrationSection.OLYMPIADS

    class Meta:
        model = Participant
        fields = ['id', 'name', 'email', 'phone', 'city', 'school', 'class_number']
