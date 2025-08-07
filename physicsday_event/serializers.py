from rest_framework import serializers
from .models import Participant

class ParticipantSerializer(serializers.ModelSerializer):
    school = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    class_number = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Participant
        fields = ['id', 'role', 'name', 'email', 'phone', 'city', 'school', 'class_number']