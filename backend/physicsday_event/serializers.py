from rest_framework import serializers

from content.models import RegistrationSection
from content.registration import RegistrationWindowMixin

from .models import Participant


class ParticipantSerializer(RegistrationWindowMixin, serializers.ModelSerializer):
    # Приём заявок закрывается по времени на сервере, а не только скрытием
    # формы: вкладка, открытая до закрытия, отправила бы заявку и после.
    registration_slug = RegistrationSection.PHYSICSDAY

    school = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    class_number = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Participant
        fields = ['id', 'role', 'name', 'email', 'phone', 'city', 'school', 'class_number']
