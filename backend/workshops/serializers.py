from rest_framework import serializers
from .models import Workshop, Participant

class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = ['id', 'name', 'limit', 'limit_left', 'time', 'image', 'restriction', 'room', 'ordering']
        

    time = serializers.TimeField(format="%H:%M")

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ['id', 'name', 'email', 'phone', 'city', 'school', 'class_number', 'workshop']