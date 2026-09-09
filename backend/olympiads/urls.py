from django.urls import path
from . import views

urlpatterns = [
    path('participants', views.ParticipantCreateView.as_view(), name='participants'),
]