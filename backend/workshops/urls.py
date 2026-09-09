from django.urls import path
from . import views

urlpatterns = [
    path('', views.WorkshopListView.as_view(), name='workshops'),
    path('participants', views.ParticipantCreateView.as_view(), name='participants'),
]