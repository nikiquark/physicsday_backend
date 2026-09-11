from django.urls import path

from . import views

app_name = 'contest'

urlpatterns = [
    path('works', views.ArtworkCreateView.as_view(), name='works'),
]
