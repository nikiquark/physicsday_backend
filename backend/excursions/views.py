from rest_framework import generics
from .serializers import InstituteSerializer, ParticipantSerializer
from .models import Institute, Participant

class InstituteListView(generics.ListAPIView):
    queryset = Institute.objects.order_by('ordering', 'name')
    serializer_class = InstituteSerializer

class ParticipantCreateView(generics.CreateAPIView):
    queryset = Participant.objects.order_by('institute__name')
    serializer_class = ParticipantSerializer