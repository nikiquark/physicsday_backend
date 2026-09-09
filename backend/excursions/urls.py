from django.urls import path
from . import views

urlpatterns = [
    path('', views.InstituteListView.as_view(), name='institutes'),
    path('participants', views.ParticipantCreateView.as_view(), name='i_participants'),
]