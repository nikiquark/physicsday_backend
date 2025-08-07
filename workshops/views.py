from rest_framework import generics
from .serializers import WorkshopSerializer, ParticipantSerializer
from .models import Workshop, Participant

class WorkshopListView(generics.ListAPIView):
    queryset = Workshop.objects.order_by('ordering', 'name')
    serializer_class = WorkshopSerializer

class ParticipantCreateView(generics.CreateAPIView):
    queryset = Participant.objects.order_by('workshop__name')
    serializer_class = ParticipantSerializer