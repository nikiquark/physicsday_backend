from django.urls import path

from . import views

app_name = 'olympiads'

urlpatterns = [
    path('participants', views.ParticipantCreateView.as_view(), name='participants'),
]
