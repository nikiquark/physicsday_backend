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
        fields = ['id', 'name',  'passport', 'email', 'phone', 'underages_count', 'underages', 'institute']