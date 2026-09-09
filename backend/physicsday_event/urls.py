from django.urls import path

from . import views

app_name = 'physicsday_event'

urlpatterns = [
    path('participants', views.ParticipantCreateView.as_view(), name='participants'),
]
