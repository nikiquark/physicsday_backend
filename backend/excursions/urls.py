from django.urls import path

from . import views

app_name = 'excursions'

urlpatterns = [
    path('', views.InstituteListView.as_view(), name='list'),
    path('participants', views.ParticipantCreateView.as_view(), name='participants'),
]
