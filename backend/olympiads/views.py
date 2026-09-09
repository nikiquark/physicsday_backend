from rest_framework import generics
from .serializers import ParticipantSerializer
from .models import Participant

class ParticipantCreateView(generics.CreateAPIView):
    serializer_class = ParticipantSerializer