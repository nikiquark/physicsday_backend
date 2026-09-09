from django.urls import path

from . import views

urlpatterns = [
    path('', views.SiteContentView.as_view(), name='site-content'),
]
